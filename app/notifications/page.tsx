import { format, formatDistanceToNow } from "date-fns";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { getNotifications } from "@/lib/db/notifications";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "./actions";

function formatNotificationTime(dateStr: string) {
  const date = new Date(dateStr);
  const distance = formatDistanceToNow(date, { addSuffix: true });

  if (Date.now() - date.getTime() < 24 * 60 * 60 * 1000) {
    return distance;
  }

  return format(date, "MMM d, yyyy 'at' h:mm a");
}

export default async function NotificationsPage() {
  const notifications = await getNotifications();
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
              : "You're all caught up"}
          </p>
        </div>

        {unreadCount > 0 && (
          <form action={markAllNotificationsRead}>
            <Button type="submit" variant="outline" size="sm">
              Mark all as read
            </Button>
          </form>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={
            <svg
              className="h-10 w-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          }
          title="No notifications yet"
          description="Alerts about fees, messages, and school updates will appear here."
        />
      ) : (
        <ul className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-700 dark:bg-slate-900">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={`px-4 py-4 sm:px-5 ${
                notification.is_read
                  ? "bg-white dark:bg-slate-900"
                  : "bg-indigo-50/60 dark:bg-indigo-950/20"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {!notification.is_read && (
                      <span
                        className="h-2 w-2 shrink-0 rounded-full bg-indigo-600"
                        aria-hidden="true"
                      />
                    )}
                    <p className="font-medium text-slate-900 dark:text-white">
                      {notification.title}
                    </p>
                  </div>
                  {notification.body && (
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      {notification.body}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-slate-400">
                    {formatNotificationTime(notification.created_at)}
                  </p>
                </div>

                {!notification.is_read && (
                  <form action={markNotificationRead.bind(null, notification.id)}>
                    <Button type="submit" variant="ghost" size="sm">
                      Mark read
                    </Button>
                  </form>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
