import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import Layout from "../components/Layout";

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
    <Layout title="Admin" subtitle="View all videos, bookmarks, and annotations">
      <Link to="/" className="navLink">← Back</Link>

      {err && <div className="alertError" style={{ marginTop: 12 }}>{err}</div>}

      <div className="row" style={{ marginTop: 14 }}>
        <div className="card col">
          <div className="cardHeader">
            <div style={{ fontWeight: 800 }}>All Videos</div>
            <span className="badge">{videos.length}</span>
          </div>
          <div className="cardBody">
            {videos.length === 0 ? (
              <p className="muted">No videos found.</p>
            ) : (
              <ul className="list">
                {videos.map((v) => (
                  <li key={v.id} className="listItem">
                    <div style={{ display: "grid" }}>
                      <strong>#{v.id} — {v.title}</strong>
                      <span className="muted" style={{ fontSize: 12 }}>
                        uploader: {v.uploadedBy?.email || "unknown"}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="card col">
          <div className="cardHeader">
            <div style={{ fontWeight: 800 }}>All Bookmarks</div>
            <span className="badge">{items.bookmarks?.length || 0}</span>
          </div>
          <div className="cardBody">
            {items.bookmarks?.length === 0 ? (
              <p className="muted">No bookmarks found.</p>
            ) : (
              <ul className="list">
                {items.bookmarks?.map((b) => (
                  <li key={b.id} className="listItem">
                    <div style={{ display: "grid" }}>
                      <span>
                        video {b.video?.id} — <strong>{b.title}</strong> @{" "}
                        {Number(b.timestamp).toFixed(1)}s
                      </span>
                      <span className="muted" style={{ fontSize: 12 }}>
                        by {b.createdBy?.email || "unknown"}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="cardHeader">
          <div style={{ fontWeight: 800 }}>All Annotations</div>
          <span className="badge">{items.annotations?.length || 0}</span>
        </div>
        <div className="cardBody">
          {items.annotations?.length === 0 ? (
            <p className="muted">No annotations found.</p>
          ) : (
            <ul className="list">
              {items.annotations?.map((a) => (
                <li key={a.id} className="listItem">
                  <div style={{ display: "grid" }}>
                    <span>
                      video {a.video?.id} — <strong>{a.description}</strong> @{" "}
                      {Number(a.timestamp).toFixed(1)}s
                    </span>
                    <span className="muted" style={{ fontSize: 12 }}>
                      by {a.createdBy?.email || "unknown"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Layout>
  );
}