"use client";

import { useNotifications } from "./useNotifications";
import { useMarkAllAsRead } from "./useNotificationMutations";
import { NotificationColumns } from "./NotificationColumns";
import { DataTable } from "@/components/dataTable/DataTable";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import type { Notification } from "@/types";
import { useNotificationNavigation } from "./useNotificationNavigation";

export default function NotificationsTable() {
  const { items: notifications, isPending, error, isError } = useNotifications();
  const openNotification = useNotificationNavigation();

  function handleRowClick(notification: Notification) {
    void openNotification(notification);
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700">
      <DataTable
        tableName="NotificationsTable"
        columns={NotificationColumns}
        data={notifications}
        isPending={isPending}
        error={isError ? error : undefined}
        onRowClick={handleRowClick}
        cardsLayout={true}
        disablePagination={true}
        toolbar={{
          search: true,
          export: false,
          filter: true,
          viewOptions: false,
        }}
        extraActions={<MarkAllAsReadButton />}
      />
    </div>
  );
}

function MarkAllAsReadButton() {
  const { mutate: markAllReadApi, isPending: isMarkAllReadPending } = useMarkAllAsRead();
  const { unreadCount } = useNotifications();
  if (!unreadCount) return null;
  return (
    <Button
      onClick={() => markAllReadApi()}
      disabled={isMarkAllReadPending}
      className="flex-1 transition-none"
    >
      {isMarkAllReadPending ? (
        <Spinner className="size-4" />
      ) : (
        <Check className="size-4" />
      )}
      Mark all as read
    </Button>
  );
}
