import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, CheckCheck } from "lucide-react";
import api from "../Utils/api";
import { useToast } from "../Context/ToastContext";
import { notificationStyles as s } from "../assets/dummyStyles";

export default function NotificationsPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/notification");
      setItems(data.items || []);
      setUnread(data.unread || 0);
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.patch("/notification/read");
      setUnread(0);
      setItems((prev) => prev.map((item) => ({ ...item, read: true })));
      showToast("All notifications marked as read");
    } catch (err) {
      showToast("Failed to mark notifications as read", "error");
    }
  };

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={20} className="text-emerald-400" />
          <h1 className="text-xl font-bold text-white">Notifications</h1>
        </div>

        {unread > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
          >
            <CheckCheck size={14} /> Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-zinc-500">Loading notifications...</div>
      ) : items.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center text-sm text-zinc-600">
          No notifications yet.
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden divide-y divide-zinc-800/60">
          {items.map((item) => (
            <Link
              key={item._id}
              to={item.poll?._id ? `/poll/${item.poll._id}` : "#"}
              className={`${s.notificationLink} ${
                !item.read ? s.notificationUnread : ""
              }`}
            >
              <div className="flex justify-between items-start gap-2">
                <div>
                  <span className={s.actorName}>{item.actor?.name || "Someone"}</span>{" "}
                  <span className={s.notificationText}>
                    {item.type === "vote" ? "voted on your poll" : "commented on your poll"}
                  </span>{" "}
                  <span className={s.pollPreview}>
                    "{item.poll?.question || "a poll"}"
                  </span>
                </div>
                <span className="text-[10px] text-zinc-600 shrink-0">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
