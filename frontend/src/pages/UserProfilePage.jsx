import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { UserPlus, UserCheck, Settings, Users } from "lucide-react";
import api from "../Utils/api";
import { useAuth } from "../Context/AuthContext";
import { useToast } from "../Context/ToastContext";
import PollCard from "../components/PollCard";
import { userProfileStyles as s, uiElementStyles as ui } from "../assets/dummyStyles";

export default function UserProfilePage() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/users/${username}`);
      setProfileData(data);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (username) fetchProfile();
  }, [username]);

  const handleFollowToggle = async () => {
    if (!profileData) return;
    setFollowLoading(true);
    try {
      const { data } = await api.post(`/users/${username}/follow`);
      setProfileData((prev) => ({
        ...prev,
        isFollowing: data.following,
        stats: {
          ...prev.stats,
          followers: data.followers,
        },
      }));
      showToast(data.following ? `Following @${username}` : `Unfollowed @${username}`);
    } catch (err) {
      showToast("Failed to update follow status", "error");
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-xs text-zinc-500">Loading profile...</div>;
  }

  if (error || !profileData) {
    return <div className={s.errorContainer}>User @{username} not found.</div>;
  }

  const { user, isFollowing, isMe, stats = {}, polls = [] } = profileData;

  return (
    <div className="space-y-5">
      {/* Profile Header Card */}
      <div className={s.profileCard}>
        <div className={s.bannerContainer}>
          <div className={s.bannerGlow} />
        </div>

        <div className={s.profileBody}>
          <div className={s.avatarRow}>
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

            {isMe ? (
              <Link
                to="/settings"
                className={`${ui.btnBase} ${ui.btnGhost} ${s.followButton}`}
              >
                <Settings size={14} /> Edit Profile
              </Link>
            ) : (
              <button
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={`${ui.btnBase} ${
                  isFollowing ? ui.btnGhost : ui.btnPrimary
                } ${s.followButton}`}
              >
                {isFollowing ? (
                  <>
                    <UserCheck size={14} /> Following
                  </>
                ) : (
                  <>
                    <UserPlus size={14} /> Follow
                  </>
                )}
              </button>
            )}
          </div>

          <div className={s.userInfo}>
            <h1 className={s.userName}>{user.name}</h1>
            <p className={s.userUsername}>@{user.username}</p>
            {user.bio && <p className={s.userBio}>{user.bio}</p>}
          </div>

          <div className={s.statsRow}>
            <div>
              <div className={s.statNumber}>{stats.created || 0}</div>
              <div className={s.statLabel}>Polls</div>
            </div>
            <div>
              <div className={s.statNumber}>{stats.voted || 0}</div>
              <div className={s.statLabel}>Votes</div>
            </div>
            <Link
              to={`/u/${user.username}/connections?tab=followers`}
              className={s.statClickable}
            >
              <div className={s.statNumber}>{stats.followers || 0}</div>
              <div className={`${s.statLabel} ${s.statLabelHighlight}`}>
                Followers
              </div>
            </Link>
            <Link
              to={`/u/${user.username}/connections?tab=following`}
              className={s.statClickable}
            >
              <div className={s.statNumber}>{stats.following || 0}</div>
              <div className={`${s.statLabel} ${s.statLabelHighlight}`}>
                Following
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* User's Polls */}
      <div>
        <h2 className={s.pollsHeading}>Polls Created by {user.name}</h2>
        {polls.length === 0 ? (
          <div className={s.emptyPolls}>This user hasn't published any polls yet.</div>
        ) : (
          <div>
            {polls.map((poll) => (
              <PollCard key={poll._id} poll={poll} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
