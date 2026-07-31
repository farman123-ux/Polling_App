import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Image as ImageIcon, AlertCircle, Star, Check } from "lucide-react";
import api from "../Utils/api";
import { useAuth } from "../Context/AuthContext";
import { useToast } from "../Context/ToastContext";
import { createPollStyles as s, uiElementStyles as ui } from "../assets/dummyStyles";

const TYPES = [
  { id: "single", label: "Single Choice" },
  { id: "yesno", label: "Yes / No" },
  { id: "rating", label: "1-5 Star Rating" },
  { id: "image", label: "Image Poll" },
  { id: "open", label: "Open Ended" },
];

const CATEGORIES = [
  "General",
  "Tech",
  "Gaming",
  "Entertainment",
  "Sports",
  "Lifestyle",
  "Business",
];

export default function CreatePollPage() {
  const { showToast } = useToast();
  const { refresh } = useAuth();
  const navigate = useNavigate();

  const [question, setQuestion] = useState("");
  const [type, setType] = useState("single");
  const [category, setCategory] = useState("General");
  const [customCategory, setCustomCategory] = useState("");

  // Single choice options
  const [options, setOptions] = useState([{ text: "" }, { text: "" }]);

  // Image poll files & previews
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Single option helpers
  const handleAddOption = () => {
    if (options.length >= 6) {
      showToast("Maximum 6 options allowed for single choice", "error");
      return;
    }
    setOptions([...options, { text: "" }]);
  };

  const handleRemoveOption = (index) => {
    if (options.length <= 2) {
      showToast("Single choice poll requires at least 2 options", "error");
      return;
    }
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index, value) => {
    const next = [...options];
    next[index].text = value;
    setOptions(next);
  };

  // Image option helpers
  const handleImagesSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const total = imageFiles.length + files.length;
    if (total > 4) {
      showToast("Maximum 4 images allowed per poll", "error");
      return;
    }

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImageFiles([...imageFiles, ...files]);
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const handleRemoveImage = (index) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) {
      setError("Poll question is required.");
      return;
    }

    const finalCategory = customCategory.trim() || category;

    // Validation per type
    if (type === "single") {
      const validOpts = options.filter((o) => o.text.trim().length > 0);
      if (validOpts.length < 2) {
        setError("Single choice poll requires at least 2 non-empty options.");
        return;
      }
    }

    if (type === "image") {
      if (imageFiles.length < 2 || imageFiles.length > 4) {
        setError("Image poll requires between 2 and 4 image uploads.");
        return;
      }
    }

    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("question", question.trim());
      formData.append("type", type);
      formData.append("category", finalCategory);

      if (type === "single") {
        const optionStrings = options
          .map((o) => o.text.trim())
          .filter((t) => t.length > 0);
        formData.append("options", JSON.stringify(optionStrings));
      }

      if (type === "image") {
        imageFiles.forEach((file) => {
          formData.append("image", file);
        });
      }

      await api.post("/poll", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showToast("Poll created successfully!");
      refresh();
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create poll.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <h1 className={s.heading}>Create a New Poll</h1>

      {error && (
        <div className={s.errorBox}>
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className={s.form}>
        {/* Type Selection */}
        <div>
          <label className={s.label}>Poll Type</label>
          <div className="flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                className={`${s.typeButtonBase} ${
                  type === t.id ? s.typeButtonActive : s.typeButtonInactive
                }`}
              >
                {type === t.id && <Check size={12} />}
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Question */}
        <div>
          <label className={s.label}>Question</label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a clear question (e.g. Which framework is best in 2026?)..."
            className={`${ui.inputCls} ${s.textarea}`}
            required
          />
        </div>

        {/* Dynamic Fields Per Type */}
        {type === "single" && (
          <div>
            <label className={s.label}>Options (Min 2)</label>
            <div className={s.optionsContainer}>
              {options.map((opt, idx) => (
                <div key={idx} className={s.optionInputWrapper}>
                  <input
                    type="text"
                    value={opt.text}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Option ${idx + 1}`}
                    className={ui.inputCls}
                    required
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      className={`${ui.btnBase} ${ui.btnDanger} ${s.optionDeleteButton}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {options.length < 6 && (
              <button
                type="button"
                onClick={handleAddOption}
                className={`${ui.btnBase} ${ui.btnGhost} ${s.addOptionButton} mt-2 w-full`}
              >
                <Plus size={14} /> Add Option
              </button>
            )}
          </div>
        )}

        {type === "image" && (
          <div>
            <label className={s.label}>Upload Images (2 to 4 Images Required)</label>
            <div className={s.imageGrid}>
              {imagePreviews.map((src, idx) => (
                <div key={idx} className={s.imageItem}>
                  <img src={src} alt={`Preview ${idx + 1}`} className={s.imageThumb} />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className={s.imageRemoveButton}
                  >
                    ×
                  </button>
                </div>
              ))}

              {imageFiles.length < 4 && (
                <label className={s.imageAddLabel}>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImagesSelect}
                    className="hidden"
                  />
                  <div className={s.imageAddContent}>
                    <ImageIcon size={20} />
                    <span className="text-[10px] font-semibold">Add Image</span>
                  </div>
                </label>
              )}
            </div>
            <p className={s.imageHint}>Select 2 to 4 high-res images to compare.</p>
          </div>
        )}

        {type === "yesno" && (
          <div className="p-3 bg-zinc-800/40 border border-zinc-800 rounded-xl text-xs text-zinc-400">
            Yes / No option buttons will be automatically generated.
          </div>
        )}

        {type === "rating" && (
          <div className="p-3 bg-zinc-800/40 border border-zinc-800 rounded-xl text-xs text-zinc-400 flex items-center gap-2">
            <Star size={16} className="text-amber-400 fill-amber-400" />
            Voters can give a rating from 1 to 5 stars.
          </div>
        )}

        {type === "open" && (
          <div className="p-3 bg-zinc-800/40 border border-zinc-800 rounded-xl text-xs text-zinc-400">
            Voters can submit open text responses to your prompt.
          </div>
        )}

        {/* Category */}
        <div>
          <label className={s.label}>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={ui.inputCls}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="bg-zinc-900 text-zinc-200">
                {cat}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`${ui.authButton} ${s.submitButton}`}
        >
          {loading ? "Publishing Poll..." : "Publish Poll"}
        </button>
      </form>
    </div>
  );
}
