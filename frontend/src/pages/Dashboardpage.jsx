import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PlusSquare, Inbox } from "lucide-react";
import { useAuth } from "../Context/AuthContext";
import api from "../Utils/api";
import FilterBar from "../components/FilterBar";
import PollCard from "../components/PollCard";
import { dashboardStyles as s, uiElementStyles as ui } from "../assets/dummyStyles";

export default function Dashboardpage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [feed, setFeed] = useState("all");

  const fetchPolls = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedType && selectedType !== "all") params.type = selectedType;
      if (selectedCategory && selectedCategory !== "All") params.category = selectedCategory;
      if (feed === "following") params.feed = "following";

      const { data } = await api.get("/poll", { params });
      setPolls(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load polls", err);
      setPolls([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, [selectedType, selectedCategory, feed]);

  // Client-side search filter
  const filteredPolls = polls.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.question.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.creator?.name?.toLowerCase().includes(q) ||
      p.creator?.username?.toLowerCase().includes(q)
    );
  });

  const handlePollDeleted = (deletedId) => {
    setPolls((prev) => prev.filter((p) => p._id !== deletedId));
  };

  return (
    <div className={s.container}>
      {/* Greeting & Header */}
      <div className={s.greetingRow}>
        <div>
          <h1 className={s.greetingHeading}>
            Hello, {user?.name?.split(" ")[0] || "Voter"} 👋
          </h1>
          <p className={s.greetingSub}>
            Explore public opinion and vote on active community polls
          </p>
        </div>
      </div>

      {/* Composer Banner */}
      <div className={s.composer}>
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className={`${s.composerAvatar} ${ui.avatarImg}`}
          />
        ) : (
          <div className={`${s.composerAvatar} ${ui.avatarPlaceholder}`}>
            {user?.name ? user.name[0].toUpperCase() : "U"}
          </div>
        )}
        <Link to="/create-poll" className={s.composerInput}>
          Ask a question or create a poll...
        </Link>
        <Link to="/create-poll" className={s.composerButton} title="Create Poll">
          <PlusSquare size={18} />
        </Link>
      </div>

      {/* Filter Bar */}
      <FilterBar
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        feed={feed}
        onFeedChange={setFeed}
      />

      {/* Feed List */}
      {loading ? (
        <div className={ui.skeletonContainer}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={ui.skeletonCard}>
              <div className="flex items-center gap-2 mb-3">
                <div className={ui.skeletonAvatar} />
                <div className={ui.skeletonName} />
                <div className={ui.skeletonCategory} />
              </div>
              <div className={ui.skeletonQuestion} />
              <div className={ui.skeletonOptions}>
                <div className={ui.skeletonOption1} />
                <div className={ui.skeletonOption2} />
              </div>
            </div>
          ))}
        </div>
      ) : filteredPolls.length === 0 ? (
        <div className={s.emptyContainer}>
          <div className={s.emptyIcon}>
            <Inbox size={28} />
          </div>
          <h3 className={s.emptyTitle}>No Polls Found</h3>
          <p className={s.emptyDesc}>
            {searchQuery
              ? `No polls matching "${searchQuery}"`
              : feed === "following"
              ? "No polls from users you follow yet."
              : "Be the first to ask a question to the community!"}
          </p>
          <Link to="/create-poll" className={s.emptyButton}>
            <PlusSquare size={16} /> Create Poll
          </Link>
        </div>
      ) : (
        <div>
          {filteredPolls.map((poll) => (
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
