import { useEffect, useState } from "react";

function App() {
  const [status, setStatus] = useState<string>("checking...");

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => setStatus(data.status))
      .catch(() => setStatus("error"));
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-2">
      <h1 className="text-3xl font-bold">Helpdesk</h1>
      <p className="text-muted-foreground">
        API status: <span className="font-medium text-foreground">{status}</span>
      </p>
    </div>
  );
}

export default App;
