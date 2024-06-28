"use client";

import { FC } from "react";
import { observer } from "mobx-react";
import { ArchiveRestore } from "lucide-react";
import { ArchiveIcon, TOAST_TYPE, setToast } from "@plane/ui";
// components
import { NotificationItemOptionButton } from "@/components/workspace-notifications";
// constants
import { NOTIFICATION_ARCHIVED } from "@/constants/event-tracker";
// hooks
import { useEventTracker, useWorkspaceNotifications } from "@/hooks/store";
// store
import { INotification } from "@/store/notifications/notification";

type TNotificationItemArchiveOption = {
  workspaceSlug: string;
  notification: INotification;
};

export const NotificationItemArchiveOption: FC<TNotificationItemArchiveOption> = observer((props) => {
  const { workspaceSlug, notification: notificationStore } = props;
  // hooks
  const { captureEvent } = useEventTracker();
  const { currentNotificationTab } = useWorkspaceNotifications();
  const { asJson: notification, archiveNotification, unArchiveNotification } = notificationStore;

  const handleNotificationUpdate = async () => {
    try {
      const request = notification.archived_at ? unArchiveNotification : archiveNotification;
      await request(workspaceSlug);
      captureEvent(NOTIFICATION_ARCHIVED, {
        issue_id: notification?.data?.issue?.id,
        tab: currentNotificationTab,
        state: "SUCCESS",
      });
      setToast({
        title: notification.archived_at ? "Notification un-archived" : "Notification archived",
        type: TOAST_TYPE.SUCCESS,
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <NotificationItemOptionButton
      tooltipContent={notification.read_at ? "Mark as unread" : "Mark as read"}
      callBack={handleNotificationUpdate}
    >
      {notification.archived_at ? (
        <ArchiveRestore className="h-3 w-3 text-custom-text-300" />
      ) : (
        <ArchiveIcon className="h-3 w-3 text-custom-text-300" />
      )}
    </NotificationItemOptionButton>
  );
});
