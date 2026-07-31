import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../Utils/api";
import PollCard from "../components/PollCard";
import { singlePollPageStyles as s, uiElementStyles as ui } from "../assets/dummyStyles";

export default function SinglePollPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api
      .get(`/poll/${id}`)
      .then(({ data }) => {
        if (isMounted) setPoll(data);
      })
      .catch((err) => {
        if (isMounted) setError(true);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <div className="space-y-4">
      <button onClick={() => navigate(-1)} className={s.backButton}>
        <ArrowLeft size={14} /> Back
      </button>

      {loading ? (
        <div className={ui.skeletonContainer}>
          <div className={ui.skeletonCard}>
            <div className="flex items-center gap-2 mb-3">
              <div className={ui.skeletonAvatar} />
              <div className={ui.skeletonName} />
            </div>
            <div className={ui.skeletonQuestion} />
            <div className={ui.skeletonOptions}>
              <div className={ui.skeletonOption1} />
              <div className={ui.skeletonOption2} />
            </div>
          </div>
        </div>
      ) : error || !poll ? (
        <div className={s.errorContainer}>
          Poll not found or may have been deleted.
        </div>
      ) : (
        <PollCard poll={poll} onPollDeleted={() => navigate("/dashboard")} />
      )}
    </div>
  );
}
