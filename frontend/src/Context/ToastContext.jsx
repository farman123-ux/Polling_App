import React, { createContext, useContext, useState, useCallback } from "react";
import { toastStyles as s } from "../assets/dummyStyles";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div className={s.container}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`${s.toastBase} ${
              toast.type === "error" ? s.toastError : s.toastSuccess
            }`}
          >
            {toast.type === "error" ? (
              <AlertCircle size={16} className="shrink-0 text-rose-400" />
            ) : (
              <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
            )}
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
