import { useCallback, useEffect, useState } from "react";
import { isIosSafari, isStandalone, rememberDismissed, wasDismissedRecently } from "@utils/installPrompt.js";

// Returns { mode, install, dismiss }.
//   mode "install"  — the browser can install the app (Chrome/Edge/Android):
//                     install() shows the browser's own confirmation.
//   mode "ios"      — Safari on iPhone/iPad: show the Share > Add to Home Screen steps.
//   mode null       — nothing to offer (installed already, dismissed lately,
//                     or the browser can't install).
export default function useInstallPrompt() {
  const [deferred, setDeferred] = useState(null);
  const [hidden, setHidden] = useState(() => isStandalone() || wasDismissedRecently());

  useEffect(() => {
    const onPrompt = (event) => {
      // Hold the event so the popup, not the browser's mini-bar, decides when to ask.
      event.preventDefault();
      setDeferred(event);
    };
    const onInstalled = () => {
      setDeferred(null);
      setHidden(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const dismiss = useCallback(() => {
    rememberDismissed();
    setHidden(true);
  }, []);

  const install = useCallback(async () => {
    if (!deferred) return;
    try {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      if (outcome !== "accepted") rememberDismissed();
    } finally {
      // The event can be used once.
      setDeferred(null);
      setHidden(true);
    }
  }, [deferred]);

  const mode = hidden ? null : deferred ? "install" : isIosSafari() ? "ios" : null;
  return { mode, install, dismiss };
}
