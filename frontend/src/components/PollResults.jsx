import React from "react";
import { Check, RotateCcw, Star } from "lucide-react";
import { pollResultsStyles as s } from "../assets/dummyStyles";

export default function PollResults({ poll, onReVote }) {
  const { results = [], totalVotes = 0, myVote, closed } = poll;

  const canReVote = !closed && onReVote;

  // 1. YES / NO VERSUS BAR
  if (poll.type === "yesno") {
    const yesResult = results.find((r) => r.index === 0) || { percent: 0, count: 0 };
    const noResult = results.find((r) => r.index === 1) || { percent: 0, count: 0 };

    return (
      <div className="space-y-2">
        {totalVotes === 0 ? (
          <div className={s.versusEmpty}>No votes recorded yet</div>
        ) : (
          <div>
            <div className={s.versusBarContainer}>
              <div
                className={s.versusYesBase}
                style={{ width: `${yesResult.percent}%` }}
              >
                {yesResult.percent > 0 && `${yesResult.percent}%`}
              </div>
              <div className={s.versusNoBase}>
                {noResult.percent > 0 && `${noResult.percent}%`}
              </div>
            </div>

            <div className={s.versusLabels}>
              <span
                className={`${s.versusLabelYesBase} ${
                  myVote === 0 ? s.versusLabelYesActive : s.versusLabelYesInactive
                }`}
              >
                {myVote === 0 && <Check size={12} />} Yes ({yesResult.count})
              </span>
              <span
                className={`${s.versusLabelNoBase} ${
                  myVote === 1 ? s.versusLabelNoActive : s.versusLabelNoInactive
                }`}
              >
                {myVote === 1 && <Check size={12} />} No ({noResult.count})
              </span>
            </div>
          </div>
        )}

        {canReVote && (
          <div className="pt-1 flex justify-between items-center text-xs">
            <span className={s.totalVotesText}>{totalVotes} Total Votes</span>
            <button
              onClick={onReVote}
              className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
            >
              <RotateCcw size={12} />
              Change Vote
            </button>
          </div>
        )}
      </div>
    );
  }

  // 2. RATING SUMMARY + STARS BAR
  if (poll.type === "rating") {
    let totalScore = 0;
    results.forEach((r) => {
      totalScore += (r.star || 0) * (r.count || 0);
    });
    const avg = totalVotes > 0 ? (totalScore / totalVotes).toFixed(1) : "0.0";

    return (
      <div className="space-y-3">
        <div className={s.ratingSummary}>
          <div className={s.ratingAverage}>{avg}</div>
          <div>
            <div className={s.ratingStars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  className={star <= Math.round(avg) ? s.starFilled : s.starEmpty}
                />
              ))}
            </div>
            <div className={s.ratingCount}>Average out of {totalVotes} ratings</div>
          </div>
        </div>

        <div className="space-y-1.5">
          {[5, 4, 3, 2, 1].map((starNum) => {
            const item = results.find((r) => r.star === starNum) || {
              count: 0,
              percent: 0,
            };
            const isMyRating = Number(myVote) === starNum;

            return (
              <div key={starNum} className="flex items-center gap-2 text-xs">
                <span className="w-12 text-zinc-500 font-medium flex items-center gap-1">
                  {starNum} <Star size={10} className="fill-amber-400 text-amber-400" />
                </span>
                <div className="flex-1 h-3 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isMyRating ? "bg-amber-400" : "bg-zinc-600"
                    }`}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
                <span className="w-10 text-right font-semibold text-zinc-400 tabular-nums">
                  {item.percent}%
                </span>
              </div>
            );
          })}
        </div>

        {canReVote && (
          <div className="pt-1 flex justify-end text-xs">
            <button
              onClick={onReVote}
              className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
            >
              <RotateCcw size={12} />
              Change Rating
            </button>
          </div>
        )}
      </div>
    );
  }

  // 3. IMAGE POLL RESULTS
  if (poll.type === "image") {
    return (
      <div className="space-y-3">
        <div className={s.imageGrid}>
          {results.map((r) => {
            const isMyVote = myVote === r.index;
            return (
              <div
                key={r.index}
                className={`${s.imageItemBase} ${
                  isMyVote ? s.imageItemActive : s.imageItemInactive
                }`}
              >
                <img src={r.image} alt={r.text} className={s.imageThumb} />
                <div className="p-2 bg-zinc-900 flex justify-between items-center text-xs">
                  <span className="text-zinc-300 truncate">{r.text || `Option ${r.index + 1}`}</span>
                  <span className="font-bold text-emerald-400">{r.percent}%</span>
                </div>
                {isMyVote && (
                  <div className={s.imageBadge}>
                    <Check size={14} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {canReVote && (
          <div className="flex justify-between items-center text-xs">
            <span className={s.totalVotesText}>{totalVotes} Total Votes</span>
            <button
              onClick={onReVote}
              className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
            >
              <RotateCcw size={12} />
              Change Vote
            </button>
          </div>
        )}
      </div>
    );
  }

  // 4. OPEN ENDED RESULTS
  if (poll.type === "open") {
    return (
      <div className={s.openContainer}>
        <div className={s.openHeader}>Responses ({results.length})</div>
        {results.length === 0 ? (
          <div className={s.openEmpty}>No responses submitted yet</div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {results.map((r, idx) => (
              <div key={idx} className={s.openResponse}>
                {r.text}
              </div>
            ))}
          </div>
        )}

        {canReVote && (
          <div className="pt-1 flex justify-end text-xs">
            <button
              onClick={onReVote}
              className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
            >
              <RotateCcw size={12} />
              Submit Another Answer
            </button>
          </div>
        )}
      </div>
    );
  }

  // 5. SINGLE CHOICE RESULT BARS
  const maxPercent = Math.max(...results.map((r) => r.percent || 0), 0);

  return (
    <div className="space-y-2">
      {results.map((r) => {
        const isMyVote = myVote === r.index;
        const isWinner = maxPercent > 0 && r.percent === maxPercent;

        return (
          <div
            key={r.index}
            className={`${s.resultBarBase} ${
              isMyVote ? s.resultBarHighlight : s.resultBarDefault
            }`}
            onClick={canReVote ? onReVote : undefined}
          >
            <div
              className={`${s.resultBarFill} ${
                isMyVote
                  ? s.resultBarFillHighlight
                  : isWinner
                  ? s.resultBarFillWinner
                  : s.resultBarFillDefault
              }`}
              style={{ width: `${r.percent}%` }}
            />
            <div className={s.resultBarContent}>
              <span
                className={`${s.resultBarLabelBase} ${
                  isMyVote ? s.resultBarLabelHighlight : s.resultBarLabelDefault
                }`}
              >
                {isMyVote && <Check size={14} className={s.resultBarCheck} />}
                {r.text}
              </span>
              <span
                className={`${s.resultBarPercentBase} ${
                  isMyVote
                    ? s.resultBarPercentHighlight
                    : s.resultBarPercentDefault
                }`}
              >
                {r.percent}% ({r.count})
              </span>
            </div>
          </div>
        );
      })}

      {canReVote && (
        <div className="pt-1 flex justify-between items-center text-xs">
          <span className={s.totalVotesText}>{totalVotes} Total Votes</span>
          <button
            onClick={onReVote}
            className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
          >
            <RotateCcw size={12} />
            Change Vote
          </button>
        </div>
      )}
    </div>
  );
}
