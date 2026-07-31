import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Send, Trash2, CornerDownRight } from "lucide-react";
import api from "../Utils/api";
import { useAuth } from "../Context/AuthContext";
import { useToast } from "../Context/ToastContext";
import { commentsStyles as s, uiElementStyles as ui } from "../assets/dummyStyles";

export default function CommentsThread({ pollId }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mainText, setMainText] = useState("");
  const [replyParentId, setReplyParentId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async () => {
    try {
      const { data } = await api.get(`/comment/${pollId}`);
      setComments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading comments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pollId) fetchComments();
  }, [pollId]);

  const handleCreateComment = async (e, parentId = null) => {
    e?.preventDefault();
    const textToSend = parentId ? replyText : mainText;
    if (!textToSend.trim()) return;

    setSubmitting(true);
    try {
      const payload = { text: textToSend.trim() };
      if (parentId) payload.parent = parentId;

      await api.post(`/comment/${pollId}`, payload);
      showToast("Comment posted");
      if (parentId) {
        setReplyText("");
        setReplyParentId(null);
      } else {
        setMainText("");
      }
      fetchComments();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to post comment", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/comment/${commentId}`);
      showToast("Comment deleted");
      fetchComments();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete comment", "error");
    }
  };

  // Organize comments into top-level and replies
  const topComments = comments.filter((c) => !c.parent);
  const getReplies = (parentId) =>
    comments.filter(
      (c) =>
        c.parent === parentId ||
        (typeof c.parent === "object" && c.parent?._id === parentId)
    );

  return (
    <div className={s.commentsContainer}>
      {/* Main Comment Input Form */}
      <form onSubmit={(e) => handleCreateComment(e, null)} className={s.mainForm}>
        <input
          type="text"
          value={mainText}
          onChange={(e) => setMainText(e.target.value)}
          placeholder="Write a comment..."
          className={s.mainInput}
        />
        <button
          type="submit"
          disabled={submitting || !mainText.trim()}
          className={s.mainSubmit}
        >
          <Send size={14} />
        </button>
      </form>

      {/* Comment List */}
      {loading ? (
        <div className="py-4 text-center text-xs text-zinc-600">Loading comments...</div>
      ) : topComments.length === 0 ? (
        <div className={s.emptyText}>No comments yet. Be the first to comment!</div>
      ) : (
        <div className={s.commentList}>
          {topComments.map((comment) => {
            const replies = getReplies(comment._id);
            const isOwner = user?._id === comment.user?._id;

            return (
              <div key={comment._id} className="space-y-2">
                <div className={s.commentItem}>
                  {comment.user?.avatar ? (
                    <img
                      src={comment.user.avatar}
                      alt={comment.user.name}
                      className={`${s.avatarSmall} ${ui.avatarImg}`}
                    />
                  ) : (
                    <div className={`${s.avatarSmall} ${ui.avatarPlaceholder}`}>
                      {comment.user?.name ? comment.user.name[0].toUpperCase() : "U"}
                    </div>
                  )}

                  <div className={s.commentContent}>
                    <div className={s.commentBubble}>
                      <div className={s.commentHeader}>
                        <Link
                          to={`/u/${comment.user?.username}`}
                          className={s.usernameLink}
                        >
                          {comment.user?.name || "User"}
                        </Link>
                        <span className={s.timestamp}>
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className={s.commentText}>{comment.text}</p>
                    </div>

                    <div className={s.commentActions}>
                      <button
                        onClick={() =>
                          setReplyParentId(
                            replyParentId === comment._id ? null : comment._id
                          )
                        }
                        className={s.replyButton}
                      >
                        Reply
                      </button>
                      {isOwner && (
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className={s.deleteButton}
                        >
                          <Trash2 size={10} /> Delete
                        </button>
                      )}
                    </div>

                    {/* Inline Reply Form */}
                    {replyParentId === comment._id && (
                      <form
                        onSubmit={(e) => handleCreateComment(e, comment._id)}
                        className={s.replyForm}
                      >
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={`Reply to ${comment.user?.name}...`}
                          className={s.replyInput}
                          autoFocus
                        />
                        <button
                          type="submit"
                          disabled={submitting || !replyText.trim()}
                          className={s.replySubmit}
                        >
                          <Send size={12} />
                        </button>
                      </form>
                    )}

                    {/* Nested Replies */}
                    {replies.length > 0 && (
                      <div className={s.repliesContainer}>
                        {replies.map((reply) => {
                          const isReplyOwner = user?._id === reply.user?._id;
                          return (
                            <div key={reply._id} className={s.replyItem}>
                              <CornerDownRight
                                size={12}
                                className={s.replyIndent}
                              />
                              {reply.user?.avatar ? (
                                <img
                                  src={reply.user.avatar}
                                  alt={reply.user.name}
                                  className={`${s.avatarTiny} ${ui.avatarImg}`}
                                />
                              ) : (
                                <div
                                  className={`${s.avatarTiny} ${ui.avatarPlaceholder}`}
                                >
                                  {reply.user?.name
                                    ? reply.user.name[0].toUpperCase()
                                    : "U"}
                                </div>
                              )}
                              <div className={s.replyBubble}>
                                <div className={s.replyHeader}>
                                  <Link
                                    to={`/u/${reply.user?.username}`}
                                    className={s.replyUsername}
                                  >
                                    {reply.user?.name || "User"}
                                  </Link>
                                  <span className={s.replyTimestamp}>
                                    {new Date(reply.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className={s.replyText}>{reply.text}</p>
                                {isReplyOwner && (
                                  <button
                                    onClick={() => handleDeleteComment(reply._id)}
                                    className={s.replyDelete}
                                  >
                                    <Trash2 size={9} /> Delete
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
