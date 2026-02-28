import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import Layout from "../components/Layout";

export default function Dashboard() {
  const [videos, setVideos] = useState([]);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);

  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  async function loadVideos() {
    setErr("");
    setLoading(true);
    try {
      const res = await api.get("/videos");
      setVideos(res.data);
    } catch (error) {
      const status = error?.response?.status;
      if (status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
      setErr(error?.response?.data?.message || "Failed to load videos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVideos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onUpload(e) {
    e.preventDefault();
    setErr("");
    setMsg("");

    if (!title.trim()) return setErr("Title is required");
    if (!file) return setErr("Choose a video file");

    const form = new FormData();
    form.append("title", title.trim());
    form.append("video", file);

    try {
    
      await api.post("/videos", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setTitle("");
      setFile(null);
      setMsg("Uploaded successfully");
      await loadVideos();
    } catch (error) {
      setErr(error?.response?.data?.message || "Upload failed");
    }
  }

  return (
    <Layout title="Dashboard" subtitle="Upload and manage your videos">
      {err && <div className="alertError">{err}</div>}
      {msg && <div className="alertOk">{msg}</div>}

      <div className="row">
        {/* Upload card */}
        <div className="card col">
          <div className="cardHeader">
            <div>
              <div style={{ fontWeight: 800 }}>Upload video</div>
              <div className="muted" style={{ fontSize: 13 }}>
                Add a title and choose a file
              </div>
            </div>
            <span className="badge">Auth-only</span>
          </div>

          <div className="cardBody">
            <form onSubmit={onUpload} style={{ display: "grid", gap: 10 }}>
              <div>
                <label className="muted">Title</label>
                <input
                  className="input"
                  placeholder="e.g. CT Scan - Sample"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="muted">File</label>
                <input
                  className="input"
                  type="file"
                  accept="video/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  required
                />
              </div>

              <button className="btn btnPrimary" type="submit">
                Upload
              </button>
            </form>
          </div>
        </div>

        {/* Videos card */}
        <div className="card col">
          <div className="cardHeader">
            <div>
              <div style={{ fontWeight: 800 }}>Videos</div>
              <div className="muted" style={{ fontSize: 13 }}>
                Click one to open bookmarks & annotations
              </div>
            </div>
            <span className="badge">{videos.length} total</span>
          </div>

          <div className="cardBody">
            {loading ? (
              <p className="muted">Loading…</p>
            ) : videos.length === 0 ? (
              <p className="muted">No videos yet. Upload one to get started.</p>
            ) : (
              <ul className="list">
                {videos.map((v) => (
                  <li key={v.id} className="listItem">
                    <div style={{ display: "grid" }}>
                      <span style={{ fontWeight: 700 }}>{v.title}</span>
                      <span className="muted" style={{ fontSize: 12 }}>
                        ID: {v.id}
                      </span>
                    </div>

                    <Link className="btn btnSmall" to={`/videos/${v.id}`}>
                      Open
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}