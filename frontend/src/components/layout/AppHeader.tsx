"use client";

import {
  Bell,
  Search,
  LogOut,
  Settings,
  Menu,
  Check,
  ArrowRightLeft,
  CheckCircle,
  XCircle,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAppSidebar } from "@/Contexts/AppSidebarContext";
import { useAuth } from "@/hooks/useAuth";
import { useOrg } from "@/hooks/useOrg";
import { ModeToggle } from "./ModeToggle";
import { TraceLogo } from "./TraceLogo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/Features/notifications/useNotifications";
import { useNotificationNavigation } from "@/Features/notifications/useNotificationNavigation";
import type { Notification, NotificationType } from "@/types";
import { cn, formatRelativeTime } from "@/lib/utils";

const NOTIFICATION_ICONS: Record<NotificationType, LucideIcon> = {
  SCAN_COMPLETE: CheckCircle,
  SCAN_FAILED: XCircle,
  AI_ANALYSIS_READY: Sparkles,
  CRITICAL_VULN: AlertTriangle,
};

// ─────────────────────────────────────────────────────────
// AppHeader — transparent / same-bg-as-app, floating feel
// ─────────────────────────────────────────────────────────
function AppHeader() {
  const { toggle } = useAppSidebar();
  const { user, logout } = useAuth();
  const { organizations, activeOrgId, switchOrg } = useOrg();
  const router = useRouter();
  const {
    items: notifications,
    unreadCount,
    isPending: isNotificationsPending,
  } = useNotifications();
  const openNotification = useNotificationNavigation();

  const handleSwitchOrganization = (orgId: string) => {
    requestAnimationFrame(() => switchOrg(orgId));
  };

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "VS";

  return (
    <header className="flex h-14 items-center justify-between pr-3 bg-background shrink-0 z-50">
      {/* ── Left: hamburger + logo ── */}
      <div className="flex items-center shrink-0">
        <div className="w-[72px] flex items-center justify-center shrink-0">
          <button
            onClick={toggle}
            className="flex items-center justify-center size-9 rounded-full text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
            aria-label="Toggle sidebar"
          >
            <Menu className="size-5" />
          </button>
        </div>

        <Link
          href="/overview"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity sm:ml-4 "
        >
          <TraceLogo />
        </Link>
      </div>

      {/* ── Center: search (desktop) ── */}
      <div className="hidden md:block flex-1 max-w-xl">
        <button
          onClick={() =>
            document.dispatchEvent(
              new KeyboardEvent("keydown", { key: "k", ctrlKey: true }),
            )
          }
          className="group flex items-center w-full gap-2.5 h-9 px-4  bg-muted/60 border border-border/50 hover:bg-muted hover:border-border transition-all cursor-text text-left"
        >
          <Search className="size-4 text-muted-foreground shrink-0 transition-colors" />
          <span className="flex-1 text-sm text-muted-foreground">Search…</span>
          <div className="flex items-center gap-1 shrink-0">
            <kbd className="inline-flex h-5 items-center rounded bg-background/80 px-1.5 font-mono text-[10px] text-muted-foreground border border-border/50">
              Ctrl
            </kbd>
            <kbd className="inline-flex h-5 items-center rounded bg-background/80 px-1.5 font-mono text-[10px] text-muted-foreground border border-border/50">
              K
            </kbd>
          </div>
        </button>
      </div>

      {/* ── Right: actions ── */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Mobile: search icon */}
        <button
          onClick={() =>
            document.dispatchEvent(
              new KeyboardEvent("keydown", { key: "k", ctrlKey: true }),
            )
          }
          className="flex md:hidden items-center justify-center size-9 rounded-full text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
          aria-label="Search"
        >
          <Search className="size-5" />
        </button>

        {/* Theme toggle */}
        <ModeToggle />

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative flex items-center justify-center size-9 rounded-full text-muted-foreground hover:bg-muted transition-colors cursor-pointer">
              <Bell className="size-5" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex min-w-4 h-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold leading-none text-primary-foreground">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-80 p-0 rounded-xl border border-border bg-popover shadow-xl"
          >
            <div className="flex items-center p-4 border-b border-border">
              <h3 className="font-semibold text-sm text-foreground">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="ml-auto text-[11px] font-bold text-primary">
                  {unreadCount} unread
                </span>
              )}
            </div>
            {isNotificationsPending ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <Bell className="size-8 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  No notifications yet
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  You&apos;re all caught up!
                </p>
              </div>
            ) : (
              <>
                <ScrollArea className="max-h-80">
                  <div className="p-2">
                    {notifications.slice(0, 6).map((notification) => (
                      <HeaderNotificationItem
                        key={notification.id}
                        notification={notification}
                        onOpen={() => void openNotification(notification)}
                      />
                    ))}
                  </div>
                </ScrollArea>
                <div className="border-t border-border p-2">
                  <button
                    onClick={() => router.push("/notifications")}
                    className="h-8 w-full rounded-lg text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    View all notifications
                  </button>
                </div>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User avatar */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center justify-center size-9 rounded-full bg-primary/10 text-[11px] font-bold text-primary ring-1 ring-primary/20 hover:ring-primary/40 hover:bg-primary/20 transition-all cursor-pointer ml-1 outline-none">
              {userInitials}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-60 rounded-xl border border-border bg-popover p-2 shadow-xl mt-1"
          >
            <div className="px-2 py-2 mb-1">
              <p className="text-[13px] font-semibold text-foreground truncate">
                {user?.name ?? "User"}
              </p>
              <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                {user?.email ?? ""}
              </p>
            </div>

            <DropdownMenuSeparator className="my-1" />

            {/* Organization Switcher */}
            <div className="px-2 pt-1 pb-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1.5">
              <ArrowRightLeft className="size-3" /> Switch Organization
            </div>
            <ScrollArea className="h-32 my-1">
              <div className="space-y-0.5">
                {(organizations ?? []).map((org) => (
                  <DropdownMenuItem
                    key={org.id}
                    className="p-0 focus:bg-transparent"
                    onClick={() => handleSwitchOrganization(org.id)}
                  >
                    <div className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 cursor-pointer hover:bg-muted transition-colors">
                      <div className="flex size-7 items-center justify-center rounded-lg bg-muted text-[10px] font-bold text-primary border border-border shrink-0">
                        {org.name[0].toUpperCase()}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="truncate text-xs font-semibold text-foreground">
                          {org.name}
                        </p>
                        <p className="truncate text-[10px] text-muted-foreground">
                          {org.role}
                        </p>
                      </div>
                      {activeOrgId === org.id && (
                        <Check className="size-3.5 text-primary shrink-0" />
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
            </ScrollArea>

            <DropdownMenuSeparator className="my-1" />

            <DropdownMenuItem
              className="gap-2 text-xs rounded-lg px-2 py-2 text-muted-foreground hover:text-foreground cursor-pointer"
              onClick={() => router.push("/settings")}
            >
              <Settings className="size-3.5" /> Workspace Settings
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1" />

            <DropdownMenuItem
              className="gap-2 text-xs rounded-lg px-2 py-2 text-red-500 hover:bg-red-500/5 hover:text-red-600 focus:bg-red-500/5 cursor-pointer"
              onClick={logout}
            >
              <LogOut className="size-3.5" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default AppHeader;

function HeaderNotificationItem({
  notification,
  onOpen,
}: {
  notification: Notification;
  onOpen: () => void;
}) {
  const Icon = NOTIFICATION_ICONS[notification.type] ?? Bell;
  const isUnread = !notification.isRead;

  return (
    <button
      onClick={onOpen}
      className={cn(
        "flex w-full items-start gap-3 rounded-lg px-2.5 py-2.5 text-left transition-colors",
        isUnread ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted",
      )}
    >
      <div
        className={cn(
          "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md",
          notification.type === "CRITICAL_VULN"
            ? "bg-red-500/10 text-red-500"
            : "bg-muted text-muted-foreground",
        )}
      >
        <Icon className="size-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p
            className={cn(
              "truncate text-xs leading-5",
              isUnread
                ? "font-bold text-foreground"
                : "font-medium text-muted-foreground",
            )}
          >
            {notification.type.replace(/_/g, " ")}
          </p>
          {isUnread && <span className="size-1.5 rounded-full bg-primary" />}
        </div>
        <p className="line-clamp-2 text-xs leading-4 text-muted-foreground">
          {notification.message}
        </p>
        <time className="mt-1 block text-[10px] font-medium text-muted-foreground/60">
          {formatRelativeTime(notification.createdAt)}
        </time>
      </div>
    </button>
  );
}
