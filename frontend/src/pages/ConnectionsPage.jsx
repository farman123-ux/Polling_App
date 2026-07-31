import React, { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { Users } from "lucide-react";
import api from "../Utils/api";
import { connectionsStyles as s, uiElementStyles as ui } from "../assets/dummyStyles";

export default function ConnectionsPage() {
  const { username } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") === "following" ? "following" : "followers";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [connections, setConnections] = useState({ followers: [], following: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api
      .get(`/users/${username}/connection`)
      .then(({ data }) => {
        if (isMounted) setConnections(data);
      })
      .catch((err) => console.error("Failed to load connections", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [username]);

  const list = connections[activeTab] || [];

  return (
    <div className={s.container}>
      <div className="flex items-center gap-2 mb-2">
        <Users size={18} className="text-emerald-400" />
        <h1 className="text-base font-bold text-white">Connections for @{username}</h1>
      </div>

      <div className={s.tabContainer}>
        <button
          onClick={() => {
            setActiveTab("followers");
            setSearchParams({ tab: "followers" });
          }}
          className={`${s.tabButtonBase} ${
            activeTab === "followers" ? s.tabButtonActive : s.tabButtonInactive
          }`}
        >
          Followers ({connections.followers.length})
        </button>
        <button
          onClick={() => {
            setActiveTab("following");
            setSearchParams({ tab: "following" });
          }}
          className={`${s.tabButtonBase} ${
            activeTab === "following" ? s.tabButtonActive : s.tabButtonInactive
          }`}
        >
          Following ({connections.following.length})
        </button>
      </div>

      {loading ? (
        <div className="py-6 text-center text-xs text-zinc-500">Loading connections...</div>
      ) : list.length === 0 ? (
        <div className={s.emptyText}>
          No {activeTab} found for @{username}.
        </div>
      ) : (
        <div className={s.userList}>
          {list.map((u) => (
            <Link key={u._id} to={`/u/${u.username}`} className={s.userLink}>
              {u.avatar ? (
                <img
                  src={u.avatar}
                  alt={u.name}
                  className={`${s.userAvatar} ${ui.avatarImg}`}
                />
              ) : (
                <div className={`${s.userAvatar} ${ui.avatarPlaceholder}`}>
                  {u.name ? u.name[0].toUpperCase() : "U"}
                </div>
              )}
              <div className={s.userInfo}>
                <div className={s.userName}>{u.name}</div>
                <div className={s.userUsername}>@{u.username}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
