import { useContext } from "react";
import { ToastContext } from "@context/toastContextObject.js";

export function useToast() {
  const showToast = useContext(ToastContext);
  return showToast ?? (() => {});
}