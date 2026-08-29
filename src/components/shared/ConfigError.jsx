export default function ConfigError() {
  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>Configuration Error</h1>
      <p>
        <code>VITE_API_URL</code> is not set. Copy <code>.env.example</code> to{" "}
        <code>.env</code> and set the correct backend URL, then restart the dev
        server.
      </p>
    </div>
  );
}
