import { Injectable, Logger } from '@nestjs/common';
import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Thrown when a script (or a whole scan) is aborted via cancellation rather
 * than failing on its own. Lets callers distinguish a deliberate cancel from a
 * genuine script failure so they don't mislabel the scan as FAILED.
 */
export class ScanCancelledError extends Error {
  constructor(scanId?: string) {
    super(scanId ? `Scan ${scanId} cancelled` : 'Scan cancelled');
    this.name = 'ScanCancelledError';
  }
}

interface ScriptResult {
  vulnerability: string;
  severity: string;
  location: string;
  evidence: string;
  category: string;
  cve_id: string | null;
  raw_details: Record<string, unknown>;
  [key: string]: unknown;
}

@Injectable()
export class ScriptRunnerService {
  private readonly logger = new Logger(ScriptRunnerService.name);
  // Track all active PIDs per scan (scans run many scripts in parallel)
  private readonly activePids = new Map<string, Set<number>>();
  // One AbortController per scan. Aborting it rejects every in-flight script
  // and prevents new ones from spawning, so cancellation propagates promptly.
  private readonly controllers = new Map<string, AbortController>();

  /**
   * Returns the cancellation signal for a scan, creating the controller on
   * first use. The orchestrator grabs this once at the start of a scan and
   * passes it into every runScript() call, and checks it between phases.
   */
  getSignal(scanId: string): AbortSignal {
    let controller = this.controllers.get(scanId);
    if (!controller) {
      controller = new AbortController();
      this.controllers.set(scanId, controller);
    }
    return controller.signal;
  }

  /**
   * Drops the controller for a finished scan so the map doesn't leak entries.
   * Safe to call for an unknown scanId.
   */
  clearSignal(scanId: string): void {
    this.controllers.delete(scanId);
  }

  async runScript(
    scriptName: string,
    args: string[],
    scanId?: string,
    timeout: number = 120000,
  ): Promise<ScriptResult[]> {
    // Resolve the scan's cancellation signal (if any). When it aborts, the
    // child is killed and this call rejects with ScanCancelledError.
    const signal = scanId ? this.controllers.get(scanId)?.signal : undefined;

    // Fail fast if the scan was already cancelled before this script started.
    if (signal?.aborted) {
      throw new ScanCancelledError(scanId);
    }

    // Track the PID of this specific script so we can kill only it on timeout,
    // rather than calling killScan() which would terminate ALL parallel scripts.
    let scriptPid: number | undefined;
    const onPidRegistered = (pid: number) => {
      scriptPid = pid;
    };

    const scriptPromise = this._executeScript(
      scriptName,
      args,
      scanId,
      onPidRegistered,
      signal,
    );

    // Promise that rejects as soon as the scan is cancelled, so an abort during
    // the timeout race unblocks runScript without waiting for the child's close.
    const abortPromise = new Promise<ScriptResult[]>((_, reject) => {
      if (!signal) return;
      signal.addEventListener(
        'abort',
        () => reject(new ScanCancelledError(scanId)),
        { once: true },
      );
    });

    // Race between the script execution, the cancellation signal, and a timeout
    return Promise.race([
      scriptPromise,
      abortPromise,
      new Promise<ScriptResult[]>((_, reject) =>
        setTimeout(() => {
          // Only kill THIS specific script — not all scripts for the scan
          if (scriptPid !== undefined) {
            try {
              process.kill(scriptPid, 'SIGTERM');
              if (scanId) {
                this.activePids.get(scanId)?.delete(scriptPid);
              }
              this.logger.log(
                `Script ${scriptName} timed out — killed PID ${scriptPid}`,
              );
            } catch {
              // Process may have already exited
            }
          }
          reject(
            new Error(
              `Script ${scriptName} timed out after ${timeout / 1000}s`,
            ),
          );
        }, timeout),
      ),
    ]);
  }

  private _executeScript(
    scriptName: string,
    args: string[],
    scanId?: string,
    onPidRegistered?: (pid: number) => void,
    signal?: AbortSignal,
  ): Promise<ScriptResult[]> {
    return new Promise((resolve, reject) => {
      if (signal?.aborted) {
        reject(new ScanCancelledError(scanId));
        return;
      }

      const pythonPath = process.env['PYTHON_PATH'] || 'python3';
      // In Docker and locally: scripts are at /backend/scripts/
      const localPath = path.join(process.cwd(), 'scripts', scriptName);
      const dockerPath = path.join(process.cwd(), 'scripts', scriptName);
      const scriptPath = fs.existsSync(dockerPath) ? dockerPath : localPath;

      // Sanitize args: only allow specific patterns
      const sanitizedArgs = args.map((arg) => arg.replace(/[;&|`$]/g, ''));

      this.logger.log(
        `Running ${scriptName} with args: ${sanitizedArgs.join(' ')}`,
      );

      const proc: ChildProcess = spawn(
        pythonPath,
        [scriptPath, ...sanitizedArgs],
        {
          env: {
            ...process.env,
            SCAN_MOCK_MODE: process.env['SCAN_MOCK_MODE'] || 'false',
          },
        },
      );

      // Notify caller of this script's PID so targeted timeout kills are possible
      if (proc.pid !== undefined) {
        onPidRegistered?.(proc.pid);
      }

      // Kill the child and reject if the scan is cancelled mid-flight. The
      // listener is removed on close/error so it never leaks or fires late.
      const onAbort = () => {
        try {
          proc.kill('SIGTERM');
        } catch {
          // Process may have already exited
        }
        if (scanId && proc.pid !== undefined) {
          this.activePids.get(scanId)?.delete(proc.pid);
        }
        reject(new ScanCancelledError(scanId));
      };
      signal?.addEventListener('abort', onAbort, { once: true });
      const detachAbort = () => signal?.removeEventListener('abort', onAbort);

      let stdout = '';
      let stderr = '';

      proc.stdout?.on('data', (data: Buffer) => {
        stdout += data.toString();
      });

      proc.stderr?.on('data', (data: Buffer) => {
        stderr += data.toString();
      });

      proc.on('close', (code: number | null) => {
        detachAbort();
        // Remove only this specific PID from the set (other scripts may still be running)
        if (scanId && proc.pid !== undefined) {
          this.activePids.get(scanId)?.delete(proc.pid);
        }

        if (code !== 0) {
          this.logger.error(
            `Script ${scriptName} exited with code ${code}: ${stderr}`,
          );
          reject(new Error(`Script ${scriptName} failed: ${stderr}`));
          return;
        }

        try {
          const result: unknown = JSON.parse(stdout);

          if (
            result !== null &&
            typeof result === 'object' &&
            !Array.isArray(result) &&
            'error' in result
          ) {
            // Log the error but resolve with empty findings
            // so one script failure doesn't break the entire scan
            this.logger.warn(
              `Script ${scriptName} reported error: ${(result as { error: string }).error}`,
            );
            resolve([]);
            return;
          }

          resolve(Array.isArray(result) ? (result as ScriptResult[]) : []);
        } catch {
          this.logger.error(
            `Invalid JSON from ${scriptName}: ${stdout.substring(0, 200)}`,
          );
          reject(new Error(`Invalid JSON from ${scriptName}: ${stdout}`));
        }
      });

      proc.on('error', (err: Error) => {
        detachAbort();
        if (scanId && proc.pid !== undefined) {
          this.activePids.get(scanId)?.delete(proc.pid);
        }
        this.logger.error(`Failed to start ${scriptName}: ${err.message}`);
        reject(new Error(`Failed to start ${scriptName}: ${err.message}`));
      });

      // Store PID for cancellation support
      if (scanId && proc.pid !== undefined) {
        if (!this.activePids.has(scanId)) {
          this.activePids.set(scanId, new Set());
        }
        this.activePids.get(scanId)!.add(proc.pid);
      }
    });
  }

  // Synchronous: aborting and signalling are in-memory operations. Callers may
  // still `await` it (await on a non-promise resolves immediately).
  killScan(scanId: string): void {
    // 1. Abort the scan's signal. This rejects every in-flight runScript() with
    //    ScanCancelledError and stops the orchestrator from spawning more, so
    //    the Bull worker unwinds promptly and releases its job lock.
    const controller = this.controllers.get(scanId);
    if (controller && !controller.signal.aborted) {
      controller.abort();
      this.logger.log(`Aborted scan ${scanId}`);
    }
    this.controllers.delete(scanId);

    // 2. SIGTERM any PIDs still tracked, in case a child outlives its abort
    //    handler (belt and suspenders — the abort listener also kills them).
    const pids = this.activePids.get(scanId);
    if (pids && pids.size > 0) {
      for (const pid of pids) {
        try {
          process.kill(pid, 'SIGTERM');
          this.logger.log(`Sent SIGTERM to PID ${pid} for scan ${scanId}`);
        } catch (error) {
          this.logger.warn(
            `Failed to kill PID ${pid}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
        }
      }
      this.activePids.delete(scanId);
    }
  }

  isRunning(scanId: string): boolean {
    const pids = this.activePids.get(scanId);
    return pids !== undefined && pids.size > 0;
  }
}
