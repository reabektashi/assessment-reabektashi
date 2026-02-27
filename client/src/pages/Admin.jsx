import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

export default function Admin() {
  const [videos, setVideos] = useState([]);
  const [items, setItems] = useState({ bookmarks: [], annotations: [] });
  const [err, setErr] = useState("");

  useEffect(() => {
    async function load() {
      setErr("");
      try {
        const v = await api.get("/admin/videos");
        setVideos(v.data);

        const it = await api.get("/admin/items");
        setItems(it.data);
      } catch (error) {
        setErr(error?.response?.data?.message || "Admin access failed");
      }
    }
    load();
  }, []);

  return (
    <div style={{ maxWidth: 1000, margin: "20px auto", fontFamily: "Arial" }}>
      <Link to="/">← Back</Link>
      <h2 style={{ marginTop: 10 }}>Admin</h2>

      {err && <p style={{ color: "crimson" }}>{err}</p>}

      <h3>All Videos</h3>
      <ul>
        {videos.map((v) => (
          <li key={v.id}>
            #{v.id} — {v.title} — uploader: {v.uploadedBy?.email}
          </li>
        ))}
      </ul>

      <h3>All Bookmarks</h3>
      <ul>
        {items.bookmarks?.map((b) => (
          <li key={b.id}>
            video {b.video?.id} — {b.title} @ {b.timestamp}s — by{" "}
            {b.createdBy?.email}
          </li>
        ))}
      </ul>

      <h3>All Annotations</h3>
      <ul>
        {items.annotations?.map((a) => (
          <li key={a.id}>
            video {a.video?.id} — {a.description} @ {a.timestamp}s — by{" "}
            {a.createdBy?.email}
          </li>
        ))}
      </ul>
    </div>
  );
}