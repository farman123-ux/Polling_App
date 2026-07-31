import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import api from "../Utils/api";
import { notificationStyles as s } from "../assets/dummyStyles";
import useClickOutside from "../hooks/UseClickOutside";

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const dropdownRef = useRef(null);

  useClickOutside(dropdownRef, () => setOpen(false), open);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get("/notification");
      setItems(data.items || []);
      setUnread(data.unread || 0);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleToggle = async () => {
    const nextState = !open;
    setOpen(nextState);
    if (nextState && unread > 0) {
      try {
        await api.patch("/notification/read");
        setUnread(0);
        setItems((prev) => prev.map((item) => ({ ...item, read: true })));
      } catch (err) {
        console.error("Failed to mark notifications read", err);
      }
    }
  };

  return (
    <div className={s.container} ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className={s.bellButton}
        title="Notifications"
      >
        <Bell size={18} />
        {unread > 0 && <span className={s.badgeDot} />}
      </button>

      {open && (
        <div className={s.dropdown}>
          <div className={s.header}>
            <span className={s.headerText}>Notifications</span>
          </div>

          {items.length === 0 ? (
            <div className={s.emptyText}>No notifications yet</div>
          ) : (
            <div>
              {items.map((item) => (
                <Link
                  key={item._id}
                  to={item.poll?._id ? `/poll/${item.poll._id}` : "#"}
                  onClick={() => setOpen(false)}
                  className={`${s.notificationLink} ${
                    !item.read ? s.notificationUnread : ""
                  }`}
                >
                  <span className={s.actorName}>{item.actor?.name || "Someone"}</span>{" "}
                  <span className={s.notificationText}>
                    {item.type === "vote" ? "voted on" : "commented on"}
                  </span>{" "}
                  <span className={s.pollPreview}>
                    "{item.poll?.question || "a poll"}"
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
