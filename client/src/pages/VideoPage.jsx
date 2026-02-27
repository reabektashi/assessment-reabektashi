import { useEffect, useRef, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../api";
import Layout from "../components/Layout";

export default function VideoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [video, setVideo] = useState(null);

  const [bookmarks, setBookmarks] = useState([]);
  const [annotations, setAnnotations] = useState([]);

  const [bmTitle, setBmTitle] = useState("");
  const [annDesc, setAnnDesc] = useState("");

  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const baseURL = "http://localhost:4000";

  async function loadVideoAndLists() {
    setErr("");
    setLoading(true);
    try {
      const vids = await api.get("/videos");
      const found = vids.data.find((v) => String(v.id) === String(id));
      setVideo(found || null);

   
      if (found) {
        const [bms, anns] = await Promise.all([
          api.get(`/videos/${id}/bookmarks`),
          api.get(`/videos/${id}/annotations`),
        ]);
        setBookmarks(bms.data);
        setAnnotations(anns.data);
      } else {
        setBookmarks([]);
        setAnnotations([]);
      }
    } catch (error) {
      const status = error?.response?.status;

      
      if (status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      setErr(error?.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVideoAndLists();
   
  }, [id]);

  function currentTime() {
    return videoRef.current ? videoRef.current.currentTime : 0;
  }

  function seekTo(t) {
    if (!videoRef.current) return;
    videoRef.current.currentTime = t;
 
    videoRef.current.play();
  }

  async function addBookmark() {
    setErr("");
    setMsg("");

    const title = bmTitle.trim();
    if (!title) return setErr("Bookmark title required");

    const t = currentTime();

    try {
      await api.post(`/videos/${id}/bookmarks`, { title, timestamp: t });
      setBmTitle("");
      setMsg("Bookmark added");
      const bms = await api.get(`/videos/${id}/bookmarks`);
      setBookmarks(bms.data);
    } catch (error) {
      setErr(error?.response?.data?.message || "Failed to add bookmark");
    }
  }

  async function addAnnotation() {
    setErr("");
    setMsg("");

    const description = annDesc.trim();
    if (!description) return setErr("Annotation description required");

    const t = currentTime();
    const dataJson = { type: "note", text: description };

    try {
      await api.post(`/videos/${id}/annotations`, {
        timestamp: t,
        description,
        dataJson,
      });
      setAnnDesc("");
      setMsg("Annotation added");
      const anns = await api.get(`/videos/${id}/annotations`);
      setAnnotations(anns.data);
    } catch (error) {
      setErr(error?.response?.data?.message || "Failed to add annotation");
    }
  }
async function deleteBookmark(bookmarkId) {
  setErr("");
  setMsg("");
  try {
    await api.delete(`/videos/${id}/bookmarks/${bookmarkId}`);
    const bms = await api.get(`/videos/${id}/bookmarks`);
    setBookmarks(bms.data);
    setMsg("Bookmark deleted");
  } catch (error) {
    setErr(error?.response?.data?.message || "Failed to delete bookmark");
  }
}

async function updateBookmark(bookmark) {
  setErr("");
  setMsg("");

  const newTitle = prompt("New bookmark title:", bookmark.title);
  if (newTitle === null) return; // cancelled
  const newTimestampStr = prompt("New timestamp (seconds):", String(bookmark.timestamp));
  if (newTimestampStr === null) return;

  const newTimestamp = Number(newTimestampStr);
  if (!newTitle.trim()) return setErr("Title required");
  if (Number.isNaN(newTimestamp)) return setErr("Invalid timestamp");

  try {
    await api.patch(`/videos/${id}/bookmarks/${bookmark.id}`, {
      title: newTitle.trim(),
      timestamp: newTimestamp,
    });
    const bms = await api.get(`/videos/${id}/bookmarks`);
    setBookmarks(bms.data);
    setMsg("Bookmark updated");
  } catch (error) {
    setErr(error?.response?.data?.message || "Failed to update bookmark");
  }
}

async function deleteAnnotation(annotationId) {
  setErr("");
  setMsg("");
  try {
    await api.delete(`/videos/${id}/annotations/${annotationId}`);
    const anns = await api.get(`/videos/${id}/annotations`);
    setAnnotations(anns.data);
    setMsg("Annotation deleted");
  } catch (error) {
    setErr(error?.response?.data?.message || "Failed to delete annotation");
  }
}

async function updateAnnotation(annotation) {
  setErr("");
  setMsg("");

  const newDesc = prompt("New annotation description:", annotation.description);
  if (newDesc === null) return;
  const newTimestampStr = prompt("New timestamp (seconds):", String(annotation.timestamp));
  if (newTimestampStr === null) return;

  const newTimestamp = Number(newTimestampStr);
  if (!newDesc.trim()) return setErr("Description required");
  if (Number.isNaN(newTimestamp)) return setErr("Invalid timestamp");

  try {
    await api.patch(`/videos/${id}/annotations/${annotation.id}`, {
      description: newDesc.trim(),
      timestamp: newTimestamp,
      // keep dataJson the same (optional)
      dataJson: annotation.dataJson,
    });
    const anns = await api.get(`/videos/${id}/annotations`);
    setAnnotations(anns.data);
    setMsg("Annotation updated");
  } catch (error) {
    setErr(error?.response?.data?.message || "Failed to update annotation");
  }
}
  return (
    <div style={{ maxWidth: 1000, margin: "20px auto", fontFamily: "Arial" }}>
      <Link to="/">← Back</Link>
      <h2 style={{ marginTop: 10 }}>Video #{id}</h2>

      {loading && <p>Loading...</p>}
      {err && <p style={{ color: "crimson" }}>{err}</p>}
      {msg && <p style={{ color: "green" }}>{msg}</p>}

      {!loading && !video ? (
        <p>Video not found in your list.</p>
      ) : null}

      {!loading && video ? (
        <>
          <p style={{ color: "#666" }}>{video.title}</p>

          <video
            ref={videoRef}
            controls
            style={{ width: "100%", maxHeight: 500, background: "#000" }}
            src={`${baseURL}/uploads/${video.filePath}`}
          />

          <div style={{ display: "flex", gap: 24, marginTop: 18 }}>
            {/* Bookmarks */}
            <div style={{ flex: 1 }}>
              <h3>Bookmarks</h3>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  style={{ flex: 1, padding: 8 }}
                  placeholder="Bookmark title"
                  value={bmTitle}
                  onChange={(e) => setBmTitle(e.target.value)}
                />
                <button onClick={addBookmark}>Add</button>
              </div>

              <ul>
                {bookmarks.map((b) => (
                <li key={b.id} className="listItem">
             <button className="linkBtn" onClick={() => seekTo(b.timestamp)}>
               {b.title} — {Number(b.timestamp).toFixed(1)}s
             </button>

  <div className="actions">
    <button className="btnSmall" onClick={() => updateBookmark(b)}>Edit</button>
    <button className="btnSmall danger" onClick={() => deleteBookmark(b.id)}>Delete</button>
  </div>
</li>
                ))}
              </ul>
            </div>

            {/* Annotations */}
            <div style={{ flex: 1 }}>
              <h3>Annotations</h3>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  style={{ flex: 1, padding: 8 }}
                  placeholder="Annotation description"
                  value={annDesc}
                  onChange={(e) => setAnnDesc(e.target.value)}
                />
                <button onClick={addAnnotation}>Add</button>
              </div>

              <ul>
                {annotations.map((a) => (
             <li key={a.id} className="listItem">
               <button className="linkBtn" onClick={() => seekTo(a.timestamp)}>
                  {a.description} — {Number(a.timestamp).toFixed(1)}s
              </button>

  <div className="actions">
    <button className="btnSmall" onClick={() => updateAnnotation(a)}>Edit</button>
    <button className="btnSmall danger" onClick={() => deleteAnnotation(a.id)}>Delete</button>
  </div>
</li>
                ))}
              </ul>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}