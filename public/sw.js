// Service worker for Web Push. It only shows notifications sent by the
// backend (arrival/departure alerts); it does no caching and no offline work.

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    // A payload that isn't JSON still gets a generic notification below.
  }

  // The OS renders these as plain text, never HTML.
  const title = typeof data.title === "string" && data.title ? data.title : "ECCD SmartTrack";
  const body = typeof data.body === "string" ? data.body : "";

  event.waitUntil(self.registration.showNotification(title, { body }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      // Reuse an open tab of the app instead of piling up new ones.
      const open = windows.find((client) => "focus" in client);
      return open ? open.focus() : self.clients.openWindow("/");
    }),
  );
});
