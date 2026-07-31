import React, { useState, useEffect } from "react";
import { PenLine, CheckCircle2, Bookmark, Inbox } from "lucide-react";
import api from "../Utils/api";
import PollCard from "../components/PollCard";
import { pollListPageStyles as s, uiElementStyles as ui } from "../assets/dummyStyles";

export default function PollListPage({ type }) {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  const config = {
    mine: {
      title: "My Polls",
      icon: PenLine,
      endpoint: "/poll/mine",
      emptyMsg: "You haven't created any polls yet.",
    },
    votes: {
      title: "Voted Polls",
      icon: CheckCircle2,
      endpoint: "/poll/votes",
      emptyMsg: "You haven't voted on any polls yet.",
    },
    bookmarks: {
      title: "Saved Polls",
      icon: Bookmark,
      endpoint: "/poll/bookmarks",
      emptyMsg: "You haven't saved any polls yet.",
    },
  }[type] || {
    title: "Polls",
    icon: Inbox,
    endpoint: "/poll/mine",
    emptyMsg: "No polls found.",
  };

  const IconComponent = config.icon;

  const fetchPolls = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(config.endpoint);
      setPolls(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch poll list", err);
      setPolls([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, [type]);

  const handlePollDeleted = (deletedId) => {
    setPolls((prev) => prev.filter((p) => p._id !== deletedId));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <IconComponent size={20} className="text-emerald-400" />
        <h1 className={s.heading}>{config.title}</h1>
      </div>

      {loading ? (
        <div className={ui.skeletonContainer}>
          {[1, 2].map((i) => (
            <div key={i} className={ui.skeletonCard}>
              <div className="flex items-center gap-2 mb-3">
                <div className={ui.skeletonAvatar} />
                <div className={ui.skeletonName} />
              </div>
              <div className={ui.skeletonQuestion} />
              <div className={ui.skeletonOptions}>
                <div className={ui.skeletonOption1} />
              </div>
            </div>
          ))}
        </div>
      ) : polls.length === 0 ? (
        <div className={s.emptyContainer}>
          <div className={s.emptyIconWrapper}>
            <IconComponent size={24} />
          </div>
          <h3 className={s.emptyTitle}>No Polls</h3>
          <p className={s.emptyText}>{config.emptyMsg}</p>
        </div>
      ) : (
        <div>
          {polls.map((poll) => (
            <PollCard
              key={poll._id}
              poll={poll}
              onPollDeleted={handlePollDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
}
