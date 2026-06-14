import InvitationsPanel from "@/Features/invitations/InvitationsPanel";

export default function InvitationsPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Invitations</h1>
        <h2 className="text-muted-foreground">
          Review organization invitations sent to your account
        </h2>
      </div>

      <InvitationsPanel />
    </div>
  );
}
