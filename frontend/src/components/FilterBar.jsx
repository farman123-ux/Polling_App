import React from "react";
import { Users, Sparkles, Filter, X } from "lucide-react";
import { filterBarStyles as s } from "../assets/dummyStyles";

const POLL_TYPES = [
  { id: "all", label: "All Types" },
  { id: "single", label: "Single Choice" },
  { id: "yesno", label: "Yes / No" },
  { id: "rating", label: "Rating" },
  { id: "image", label: "Image Poll" },
  { id: "open", label: "Open Ended" },
];

const CATEGORIES = [
  "All",
  "General",
  "Tech",
  "Gaming",
  "Entertainment",
  "Sports",
  "Lifestyle",
  "Business",
];

export default function FilterBar({
  selectedType,
  onTypeChange,
  selectedCategory,
  onCategoryChange,
  feed,
  onFeedChange,
}) {
  const hasFilters =
    selectedType !== "all" ||
    (selectedCategory && selectedCategory !== "All") ||
    feed === "following";

  return (
    <div className="space-y-3 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-3.5 mb-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Following / Global Feed toggle */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => onFeedChange("all")}
            className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              feed !== "following"
                ? "bg-zinc-800 text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Sparkles size={12} />
            Explore
          </button>
          <button
            onClick={() => onFeedChange("following")}
            className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              feed === "following"
                ? "bg-emerald-500/15 border border-emerald-500/20 text-emerald-400"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Users size={12} />
            Following
          </button>
        </div>

        {/* Clear Filters */}
        {hasFilters && (
          <button
            onClick={() => {
              onTypeChange("all");
              onCategoryChange("All");
              onFeedChange("all");
            }}
            className={s.clearButton}
          >
            <X size={12} />
            Clear Filters
          </button>
        )}
      </div>

      {/* Type buttons */}
      <div className={s.container}>
        {POLL_TYPES.map((t) => (
          <button
            key={t.id}
            onClick={() => onTypeChange(t.id)}
            className={`${s.filterButtonBase} ${
              selectedType === t.id ? s.filterButtonActive : s.filterButtonInactive
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        <Filter size={12} className="text-zinc-600 shrink-0 ml-1" />
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-colors cursor-pointer ${
              selectedCategory === cat || (cat === "All" && !selectedCategory)
                ? "bg-zinc-800 text-emerald-400 border border-zinc-700"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
