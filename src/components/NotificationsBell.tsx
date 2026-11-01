import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Bell } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function timeAgo(timestamp: number): string {
  const minutes = Math.floor((Date.now() - timestamp) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

/** Notification bell with a dropdown panel of recent events. */
export function NotificationsBell() {
  const notifications = useQuery(api.notifications.listOwn);
  const markAllRead = useMutation(api.notifications.markAllRead);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const items = notifications ?? [];
  const unread = items.filter((n) => !n.read).length;

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && unread > 0) void markAllRead().catch(() => {});
  };

  const handleClick = (link?: string) => {
    setOpen(false);
    if (link) navigate(link);
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ""}`}
          className="relative flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
        >
          <Bell className="size-4" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-accent-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <span className="text-xs font-semibold tracking-wide uppercase">
            Notifications
          </span>
          {unread > 0 && (
            <span className="text-[10px] text-muted-foreground">
              {unread} new
            </span>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {items.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              Nothing yet. Application updates and reminders land here.
            </p>
          ) : (
            items.slice(0, 10).map((notification) => (
              <button
                key={notification._id}
                type="button"
                onClick={() => handleClick(notification.link)}
                className="block w-full border-b border-border px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-muted/60"
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">
                    {notification.title}
                  </span>
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    {timeAgo(notification.createdAt)}
                  </span>
                </span>
                <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                  {notification.body}
                </span>
              </button>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
