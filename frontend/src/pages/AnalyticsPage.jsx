import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Vote, Eye, MessageSquare, Bookmark, BarChart2 } from "lucide-react";
import api from "../Utils/api";
import { useToast } from "../Context/ToastContext";
import PollResults from "../components/PollResults";
import { analyticsStyles as s } from "../assets/dummyStyles";

export default function AnalyticsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api
      .get(`/poll/${id}/anaytics`)
      .then(({ data }) => {
        if (isMounted) setPoll(data);
      })
      .catch((err) => {
        if (isMounted) {
          if (err.response?.status === 403) {
            showToast("Access denied. Analytics are creator-only.", "error");
            navigate("/dashboard", { replace: true });
          } else {
            setError(true);
          }
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return <div className="py-12 text-center text-xs text-zinc-500">Loading analytics...</div>;
  }

  if (error || !poll) {
    return (
      <div className={s.errorContainer}>
        Failed to load analytics for this poll.
      </div>
    );
  }

  return (
    <div className={s.container}>
      <button onClick={() => navigate(-1)} className={s.backButton}>
        <ArrowLeft size={14} /> Back
      </button>

      <div>
        <h1 className={s.heading}>{poll.question}</h1>
        <p className={s.subtitle}>
          Created on {new Date(poll.createdAt).toLocaleDateString()} • Type:{" "}
          <span className="capitalize text-zinc-300">{poll.type}</span>
        </p>
      </div>

      {/* Stats Cards */}
      <div className={s.statsGrid}>
        <div className={s.statCard}>
          <div className={`${s.statIcon} bg-emerald-500/10 text-emerald-400`}>
            <Vote size={18} />
          </div>
          <div className={s.statValue}>{poll.totalVotes || 0}</div>
          <div className={s.statLabel}>Total Votes</div>
        </div>

        <div className={s.statCard}>
          <div className={`${s.statIcon} bg-teal-500/10 text-teal-400`}>
            <Eye size={18} />
          </div>
          <div className={s.statValue}>{poll.views || 0}</div>
          <div className={s.statLabel}>Total Views</div>
        </div>

        <div className={s.statCard}>
          <div className={`${s.statIcon} bg-amber-500/10 text-amber-400`}>
            <MessageSquare size={18} />
          </div>
          <div className={s.statValue}>{poll.comments || 0}</div>
          <div className={s.statLabel}>Comments</div>
        </div>

        <div className={s.statCard}>
          <div className={`${s.statIcon} bg-purple-500/10 text-purple-400`}>
            <Bookmark size={18} />
          </div>
          <div className={s.statValue}>{poll.saves || 0}</div>
          <div className={s.statLabel}>Saves</div>
        </div>
      </div>

      {/* Breakdown Visualization */}
      <div className={s.resultsContainer}>
        <div className={s.resultsHeading}>Results Breakdown</div>
        <PollResults poll={poll} />
      </div>
    </div>
  );
}
