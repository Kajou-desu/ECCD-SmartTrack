import { useCallback, useState } from "react";
import { Toast } from "@components/ui/Toast";
import { ToastContext } from "./toastContextObject.js";

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const showToast = useCallback((type, message) => setToast({ type, message }), []);
  const dismissToast = useCallback(() => setToast(null), []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast && <Toast {...toast} onClose={dismissToast} />}
    </ToastContext.Provider>
  );
}