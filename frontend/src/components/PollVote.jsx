import React, { useState } from "react";
import { Star, Check } from "lucide-react";
import { pollVoteStyles as s, uiElementStyles as ui } from "../assets/dummyStyles";

export default function PollVote({ poll, onVote, isSubmitting }) {
  const [selectedValue, setSelectedValue] = useState(
    poll.myVote !== null && poll.myVote !== undefined ? poll.myVote : null
  );
  const [openAnswer, setOpenAnswer] = useState(
    typeof poll.myVote === "string" ? poll.myVote : ""
  );

  const handleVoteSubmit = (val) => {
    if (val === null || val === undefined) return;
    onVote(val);
  };

  // 1. YES / NO
  if (poll.type === "yesno") {
    return (
      <div className={s.yesNoGrid}>
        <button
          onClick={() => handleVoteSubmit(0)}
          disabled={isSubmitting}
          className={`${s.yesNoButtonBase} ${
            selectedValue === 0 ? s.yesNoButtonYesActive : s.yesNoButtonYesInactive
          }`}
        >
          {selectedValue === 0 && <Check size={16} />}
          <span>Yes</span>
        </button>
        <button
          onClick={() => handleVoteSubmit(1)}
          disabled={isSubmitting}
          className={`${s.yesNoButtonBase} ${
            selectedValue === 1 ? s.yesNoButtonNoActive : s.yesNoButtonNoInactive
          }`}
        >
          {selectedValue === 1 && <Check size={16} />}
          <span>No</span>
        </button>
      </div>
    );
  }

  // 2. SINGLE CHOICE
  if (poll.type === "single") {
    return (
      <div className={s.singleContainer}>
        {poll.options.map((opt, idx) => {
          const isSelected = selectedValue === idx;
          return (
            <button
              key={idx}
              onClick={() => handleVoteSubmit(idx)}
              disabled={isSubmitting}
              className={`${s.singleOptionBase} ${
                isSelected ? s.singleOptionActive : s.singleOptionInactive
              }`}
            >
              <div
                className={`${s.singleOptionCircleBase} ${
                  isSelected
                    ? s.singleOptionCircleActive
                    : s.singleOptionCircleInactive
                }`}
              >
                {isSelected ? <Check size={12} /> : idx + 1}
              </div>
              <span className="flex-1">{opt.text}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // 3. RATING (1-5 Stars)
  if (poll.type === "rating") {
    const activeRating = selectedValue || 0;
    return (
      <div className="space-y-2">
        <div className={s.ratingContainer}>
          <div className={s.ratingStars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setSelectedValue(star)}
                className={s.ratingStarButton}
              >
                <Star
                  size={24}
                  className={star <= activeRating ? s.ratingStarFilled : s.ratingStarEmpty}
                />
              </button>
            ))}
          </div>
          {selectedValue ? (
            <button
              onClick={() => handleVoteSubmit(selectedValue)}
              disabled={isSubmitting}
              className={s.ratingSubmit}
            >
              Submit ({selectedValue} Star{selectedValue > 1 ? "s" : ""})
            </button>
          ) : (
            <span className={s.ratingHint}>Tap a star to rate</span>
          )}
        </div>
      </div>
    );
  }

  // 4. IMAGE PICK
  if (poll.type === "image") {
    return (
      <div className="space-y-3">
        <div className={s.imageGrid}>
          {poll.options.map((opt, idx) => {
            const isSelected = selectedValue === idx;
            return (
              <div
                key={idx}
                onClick={() => setSelectedValue(idx)}
                className={`${s.imageItemBase} cursor-pointer ${
                  isSelected ? s.imageItemActive : s.imageItemInactive
                }`}
              >
                <img src={opt.image} alt={`Option ${idx + 1}`} className={s.imageThumb} />
                {opt.text && (
                  <div className="p-2 bg-zinc-900/90 text-xs font-semibold text-zinc-200">
                    {opt.text}
                  </div>
                )}
                {isSelected && (
                  <div className={s.imageCheck}>
                    <Check size={14} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {selectedValue !== null && (
          <button
            onClick={() => handleVoteSubmit(selectedValue)}
            disabled={isSubmitting}
            className={s.imageSubmit}
          >
            Submit Image Vote
          </button>
        )}
      </div>
    );
  }

  // 5. OPEN ENDED
  if (poll.type === "open") {
    return (
      <div className="space-y-2">
        <textarea
          value={openAnswer}
          onChange={(e) => setOpenAnswer(e.target.value)}
          placeholder="Write your answer..."
          className={`${ui.inputCls} ${s.openTextarea}`}
          maxLength={300}
        />
        <div className={s.openFooter}>
          <span className={s.openCharCount}>{openAnswer.length}/300</span>
          <button
            onClick={() => handleVoteSubmit(openAnswer.trim())}
            disabled={isSubmitting || !openAnswer.trim()}
            className={s.openSubmit}
          >
            Submit Response
          </button>
        </div>
      </div>
    );
  }

  return null;
}
