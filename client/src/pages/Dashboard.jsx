import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

export default function Dashboard() {
  const [videos, setVideos] = useState([]);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  async function loadVideos() {
    const res = await api.get("/videos");
    setVideos(res.data);
  }

  useEffect(() => {
    loadVideos().catch(() => setErr("Failed to load videos"));
  }, []);

  function logout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  async function onUpload(e) {
    e.preventDefault();
    setErr("");
    setMsg("");

    if (!title.trim()) return setErr("Title is required");
    if (!file) return setErr("Choose a file");

    const form = new FormData();
    form.append("title", title);
    form.append("video", file);

    try {
      await api.post("/videos", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setTitle("");
      setFile(null);
      setMsg("Uploaded!");
      await loadVideos();
    } catch (error) {
      setErr(error?.response?.data?.message || "Upload failed");
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "30px auto", fontFamily: "Arial" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Dashboard</h2>
        <div>
          <Link to="/admin" style={{ marginRight: 12 }}>
            Admin
          </Link>
          <button onClick={logout}>Logout</button>
        </div>
      </div>

      <h3>Upload video</h3>
      <form onSubmit={onUpload} style={{ display: "flex", gap: 8 }}>
        <input
          style={{ flex: 1, padding: 8 }}
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <button type="submit">Upload</button>
      </form>

      {err && <p style={{ color: "crimson" }}>{err}</p>}
      {msg && <p style={{ color: "green" }}>{msg}</p>}

      <h3 style={{ marginTop: 24 }}>Your videos</h3>
      {videos.length === 0 ? (
        <p>No videos yet.</p>
      ) : (
        <ul>
          {videos.map((v) => (
            <li key={v.id}>
              <Link to={`/videos/${v.id}`}>{v.title}</Link>
              <span style={{ color: "#666" }}> (id: {v.id})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}