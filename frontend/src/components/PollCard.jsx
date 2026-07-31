import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bookmark,
  MessageSquare,
  Share2,
  BarChart3,
  Lock,
  Unlock,
  Trash2,
  Edit2,
  Check,
  X,
  Vote,
} from "lucide-react";
import { useAuth } from "../Context/AuthContext";
import { useToast } from "../Context/ToastContext";
import api from "../Utils/api";
import PollVote from "./PollVote";
import PollResults from "./PollResults";
import CommentsThread from "./CommentsThread";
import { pollCardStyles as s, uiElementStyles as ui } from "../assets/dummyStyles";

export default function PollCard({ poll: initialPoll, onPollDeleted }) {
  const { user, refresh } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [poll, setPoll] = useState(initialPoll);
  const [showComments, setShowComments] = useState(false);
  const [showVoteMode, setShowVoteMode] = useState(
    poll.myVote === null || poll.myVote === undefined
  );

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editQuestion, setEditQuestion] = useState(poll.question);
  const [editCategory, setEditCategory] = useState(poll.category || "General");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCreator = user?._id === poll.creator?._id;
  const isVoted = poll.myVote !== null && poll.myVote !== undefined;

  // Refetch poll helper
  const refetchPoll = async () => {
    try {
      const { data } = await api.get(`/poll/${poll._id}?noview=true`);
      setPoll(data);
    } catch (err) {
      console.error("Failed to refetch poll", err);
    }
  };

  // Vote handler
  const handleVote = async (value) => {
    setIsSubmitting(true);
    try {
      await api.post(`/poll/${poll._id}/vote`, { value });
      showToast("Vote recorded!");
      await refetchPoll();
      setShowVoteMode(false);
      refresh(); // update auth context stats
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to submit vote", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Bookmark handler
  const handleBookmark = async () => {
    try {
      const { data } = await api.post(`/poll/${poll._id}/bookmark`);
      setPoll((prev) => ({
        ...prev,
        isBookmarked: data.bookmarked,
        saves: data.bookmarked ? (prev.saves || 0) + 1 : Math.max(0, (prev.saves || 0) - 1),
      }));
      showToast(data.bookmarked ? "Saved to bookmarks" : "Removed from bookmarks");
      refresh();
    } catch (err) {
      showToast("Failed to bookmark poll", "error");
    }
  };

  // Toggle Close / Reopen
  const handleToggleClose = async () => {
    try {
      await api.patch(`/poll/${poll._id}/close`);
      showToast(poll.closed ? "Poll reopened" : "Poll closed");
      await refetchPoll();
    } catch (err) {
      showToast("Failed to update poll status", "error");
    }
  };

  // Delete poll
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this poll?")) return;
    try {
      await api.delete(`/poll/${poll._id}`);
      showToast("Poll deleted");
      if (onPollDeleted) onPollDeleted(poll._id);
      refresh();
    } catch (err) {
      showToast("Failed to delete poll", "error");
    }
  };

  // Edit poll submission
  const handleSaveEdit = async () => {
    if (!editQuestion.trim()) return;
    setIsSubmitting(true);
    try {
      await api.patch(`/poll/${poll._id}`, {
        question: editQuestion.trim(),
        category: editCategory,
      });
      showToast("Poll updated");
      setPoll((prev) => ({
        ...prev,
        question: editQuestion.trim(),
        category: editCategory,
      }));
      setIsEditing(false);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to edit poll", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Share link
  const handleShare = () => {
    const url = `${window.location.origin}/poll/${poll._id}`;
    navigator.clipboard.writeText(url);
    showToast("Poll link copied to clipboard!");
  };

  return (
    <div className={`${s.card} p-4 sm:p-5`}>
      {/* Header */}
      <div className={s.header}>
        {poll.creator?.avatar ? (
          <img
            src={poll.creator.avatar}
            alt={poll.creator.name}
            className={`${s.avatar} ${ui.avatarImg}`}
          />
        ) : (
          <div className={`${s.avatar} ${ui.avatarPlaceholder}`}>
            {poll.creator?.name ? poll.creator.name[0].toUpperCase() : "U"}
          </div>
        )}

        <div className={s.userInfo}>
          <div className={s.userInfoInner}>
            <Link
              to={`/u/${poll.creator?.username}`}
              className={s.userNameLink}
            >
              {poll.creator?.name || "User"}
            </Link>
            <span className={s.dot}>•</span>
            <span className={s.username}>@{poll.creator?.username}</span>
            <span className={s.dot}>•</span>
            <span className={s.timestamp}>
              {new Date(poll.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          {poll.closed && <span className={s.closedBadge}>Closed</span>}
          <span
            className={`${s.categoryTagBase} bg-zinc-800 border-zinc-700 text-zinc-400`}
          >
            {poll.category || "General"}
          </span>
        </div>
      </div>

      {/* Owner Controls Banner */}
      {isCreator && (
        <div className={s.ownerControls}>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={s.ownerButton}
          >
            <Edit2 size={12} /> {isEditing ? "Cancel Edit" : "Edit"}
          </button>
          <button onClick={handleToggleClose} className={s.ownerButton}>
            {poll.closed ? <Unlock size={12} /> : <Lock size={12} />}
            {poll.closed ? "Reopen" : "Close"}
          </button>
          <button
            onClick={() => navigate(`/poll/${poll._id}/analytics`)}
            className={s.ownerAnalytics}
          >
            <BarChart3 size={12} /> Analytics
          </button>
          <button onClick={handleDelete} className={s.ownerDelete}>
            <Trash2 size={12} /> Delete
          </button>
        </div>
      )}

      {/* Question Text / Edit Input */}
      {isEditing ? (
        <div className="space-y-3 mb-4">
          <textarea
            value={editQuestion}
            onChange={(e) => setEditQuestion(e.target.value)}
            className={`${ui.inputCls} ${s.editTextarea}`}
            placeholder="Edit question..."
          />
          <div className="flex gap-2">
            <input
              type="text"
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
              placeholder="Category"
              className={ui.inputCls}
            />
            <button
              onClick={handleSaveEdit}
              disabled={isSubmitting || !editQuestion.trim()}
              className={`${ui.btnBase} ${ui.btnPrimary}`}
            >
              <Check size={14} /> Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className={`${ui.btnBase} ${ui.btnGhost}`}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ) : (
        <Link to={`/poll/${poll._id}`}>
          <h2 className={s.question}>{poll.question}</h2>
        </Link>
      )}

      {/* Voting or Results */}
      <div className="my-3">
        {showVoteMode && !isVoted && !poll.closed ? (
          <PollVote poll={poll} onVote={handleVote} isSubmitting={isSubmitting} />
        ) : (
          <PollResults
            poll={poll}
            onReVote={
              !poll.closed ? () => setShowVoteMode(!showVoteMode) : undefined
            }
          />
        )}
      </div>

      {/* Footer Actions */}
      <div className={s.footer}>
        <div className={s.totalVotes}>
          <Vote size={14} />
          <span>{poll.totalVotes || 0} Votes</span>
        </div>

        <button
          onClick={() => setShowComments(!showComments)}
          className={s.action}
        >
          <MessageSquare size={14} />
          <span>{poll.comments || 0}</span>
        </button>

        <button
          onClick={handleBookmark}
          className={`${s.action} ${
            poll.isBookmarked ? s.actionActive : ""
          }`}
        >
          <Bookmark
            size={14}
            className={poll.isBookmarked ? s.saveIconFill : ""}
          />
          <span>{poll.saves || 0}</span>
        </button>

        <button onClick={handleShare} className={s.action} title="Share poll">
          <Share2 size={14} />
        </button>
      </div>

      {/* Inline Comments Thread */}
      {showComments && <CommentsThread pollId={poll._id} />}
    </div>
  );
}
