import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, Flame } from "lucide-react";
import { useAuth } from "../Context/AuthContext";
import api from "../Utils/api";
import { sidebarStyles as s, uiElementStyles as ui } from "../assets/dummyStyles";

export function ProfileCard() {
  const { user, stats } = useAuth();

  if (!user) return null;

  return (
    <div className={s.profileCard}>
      <div className={s.glowBlob} />
      <div className={s.profileInner}>
        <div className={s.avatarWrapper}>
          <div className={s.avatarGlow} />
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className={`${s.avatarClass} ${ui.avatarImg}`}
            />
          ) : (
            <div className={`${s.avatarClass} ${ui.avatarPlaceholder}`}>
              {user.name ? user.name[0].toUpperCase() : "U"}
            </div>
          )}
        </div>
        <Link to={`/u/${user.username}`} className={s.userNameLink}>
          {user.name}
        </Link>
        <span className={s.usernameText}>@{user.username}</span>
      </div>

      <div className={s.statsContainer}>
        <div className={s.statBox}>
          <div className={s.statNumber}>{stats?.created ?? 0}</div>
          <div className={s.statLabel}>Created</div>
        </div>
        <div className={s.statBox}>
          <div className={s.statNumber}>{stats?.voted ?? stats?.Voted ?? 0}</div>
          <div className={s.statLabel}>Voted</div>
        </div>
        <div className={s.statBox}>
          <div className={s.statNumber}>{stats?.bookmarked ?? stats?.Bookmark ?? 0}</div>
          <div className={s.statLabel}>Saved</div>
        </div>
      </div>

      <Link to={`/u/${user.username}`} className={s.viewProfileLink}>
        View Profile
      </Link>
    </div>
  );
}

export function TrendingWidget() {
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    let isMounted = true;
    api
      .get("/poll/trending")
      .then(({ data }) => {
        if (isMounted) setTrending(Array.isArray(data) ? data : []);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const total = trending.reduce((acc, curr) => acc + (curr.count || 0), 0) || 1;

  const typeLabels = {
    single: "Single Choice",
    yesno: "Yes / No",
    rating: "Rating Polls",
    image: "Image Polls",
    open: "Open Ended",
  };

  return (
    <div className={s.trendingCard}>
      <div className={s.trendingHeading}>
        <Flame size={14} className={s.trendingIcon} />
        <span>Trending Poll Types</span>
      </div>
      <div className={s.trendingList}>
        {trending.map((item) => {
          const pct = Math.round(((item.count || 0) / total) * 100);
          return (
            <div key={item.type} className={s.trendingItem}>
              <div className={s.trendingItemRow}>
                <span className={s.trendingItemLabel}>
                  <TrendingUp size={12} className={s.trendingItemIcon} />
                  {typeLabels[item.type] || item.type}
                </span>
                <span className={s.trendingItemCount}>{item.count}</span>
              </div>
              <div className={s.trendingBarTrack}>
                <div
                  className={`${s.trendingBarFillBase} bg-emerald-500`}
                  style={{ width: `${Math.max(pct, 5)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
