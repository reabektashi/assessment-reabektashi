import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../api";
import Layout from "../components/Layout";

function formatTime(seconds) {
  const s = Math.floor(Number(seconds) || 0);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}


function clearCanvas(canvas) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawShape(ctx, shape, w, h) {
  if (!shape) return;

  ctx.lineWidth = 3;
  ctx.strokeStyle = "red";
  ctx.fillStyle = "rgba(255,0,0,0.10)";

  if (shape.type === "rect") {
    const x = shape.x * w;
    const y = shape.y * h;
    const rw = shape.w * w;
    const rh = shape.h * h;
    ctx.strokeRect(x, y, rw, rh);
    ctx.fillRect(x, y, rw, rh);
  }

  if (shape.type === "freehand") {
    const pts = shape.points || [];
    if (pts.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(pts[0].x * w, pts[0].y * h);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x * w, pts[i].y * h);
    }
    ctx.stroke();
  }
}

export default function VideoPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [video, setVideo] = useState(null);

  const [bookmarks, setBookmarks] = useState([]);
  const [annotations, setAnnotations] = useState([]);

  const [bmTitle, setBmTitle] = useState("");
  const [annDesc, setAnnDesc] = useState("");

  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");


  const [drawMode, setDrawMode] = useState("none"); 
  const [draftShape, setDraftShape] = useState(null); 
  const isDrawingRef = useRef(false);
  const startPointRef = useRef(null); 
  const freehandPointsRef = useRef([]); 

  
  const [activeAnnIds, setActiveAnnIds] = useState([]);

  const activeAnnotations = useMemo(() => {
    const setIds = new Set(activeAnnIds);
    return annotations.filter((a) => setIds.has(a.id));
  }, [activeAnnIds, annotations]);

  async function loadVideoAndLists() {
    setErr("");
    setMsg("");
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

  
  function syncCanvasSize() {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const rect = wrapper.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;


    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);

   
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    
    redrawOverlay();
  }

  useEffect(() => {
    syncCanvasSize();
    window.addEventListener("resize", syncCanvasSize);
    return () => window.removeEventListener("resize", syncCanvasSize);
    
  }, [video, annotations, activeAnnIds, draftShape]);

  function currentTime() {
    return videoRef.current ? videoRef.current.currentTime : 0;
  }

  function seekTo(t) {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Number(t) || 0;
    videoRef.current.play();
  }

  async function refreshBookmarks() {
    const bms = await api.get(`/videos/${id}/bookmarks`);
    setBookmarks(bms.data);
  }

  async function refreshAnnotations() {
    const anns = await api.get(`/videos/${id}/annotations`);
    setAnnotations(anns.data);
  }

  // ====== BOOKMARKS ======
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
      await refreshBookmarks();
    } catch (error) {
      setErr(error?.response?.data?.message || "Failed to add bookmark");
    }
  }

  async function deleteBookmark(bookmarkId) {
    setErr("");
    setMsg("");
    try {
      await api.delete(`/videos/${id}/bookmarks/${bookmarkId}`);
      await refreshBookmarks();
      setMsg("Bookmark deleted");
    } catch (error) {
      setErr(error?.response?.data?.message || "Failed to delete bookmark");
    }
  }

  async function updateBookmark(bookmark) {
    setErr("");
    setMsg("");

    const newTitle = prompt("New bookmark title:", bookmark.title);
    if (newTitle === null) return;

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
      await refreshBookmarks();
      setMsg("Bookmark updated");
    } catch (error) {
      setErr(error?.response?.data?.message || "Failed to update bookmark");
    }
  }

  
  async function addAnnotationFromDraft() {
    setErr("");
    setMsg("");

    const description = annDesc.trim();
    if (!description) return setErr("Annotation description required");

    const t = currentTime();

    
    const dataJson = draftShape ? draftShape : { type: "note" };

    try {
      await api.post(`/videos/${id}/annotations`, {
        timestamp: t,
        description,
        dataJson,
      });
      setAnnDesc("");
      setDraftShape(null);
      setDrawMode("none");
      setMsg("Annotation added");
      await refreshAnnotations();
    } catch (error) {
      setErr(error?.response?.data?.message || "Failed to add annotation");
    }
  }

  async function deleteAnnotation(annotationId) {
    setErr("");
    setMsg("");
    try {
      await api.delete(`/videos/${id}/annotations/${annotationId}`);
      await refreshAnnotations();
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
        dataJson: annotation.dataJson, 
      });
      await refreshAnnotations();
      setMsg("Annotation updated");
    } catch (error) {
      setErr(error?.response?.data?.message || "Failed to update annotation");
    }
  }


  function onTimeUpdate() {
    if (!videoRef.current) return;
    const t = videoRef.current.currentTime;

 
    const visible = annotations.filter((a) => Math.abs(Number(a.timestamp) - t) < 0.5);
    setActiveAnnIds(visible.map((x) => x.id));

    
    if (drawMode === "none") redrawOverlay(visible);
  }

  function redrawOverlay(forcedVisible = null) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    clearCanvas(canvas);

    const ctx = canvas.getContext("2d");
    const w = canvas.clientWidth || wrapperRef.current?.getBoundingClientRect().width || 0;
    const h = canvas.clientHeight || wrapperRef.current?.getBoundingClientRect().height || 0;

    const toDraw = forcedVisible || activeAnnotations;

    
    toDraw.forEach((a) => {
      const shape = a.dataJson;
      if (shape && (shape.type === "rect" || shape.type === "freehand")) {
        drawShape(ctx, shape, w, h);
      }
    });

    
    if (draftShape && (draftShape.type === "rect" || draftShape.type === "freehand")) {
     
      ctx.lineWidth = 3;
      ctx.strokeStyle = "lime";
      ctx.fillStyle = "rgba(0,255,0,0.10)";
      drawShape(ctx, draftShape, w, h);
    }
  }

  
  function getNormalizedPoint(e) {
    const wrapper = wrapperRef.current;
    if (!wrapper) return { x: 0, y: 0 };

    const rect = wrapper.getBoundingClientRect();
    const xPx = e.clientX - rect.left;
    const yPx = e.clientY - rect.top;

    const x = Math.min(1, Math.max(0, xPx / rect.width));
    const y = Math.min(1, Math.max(0, yPx / rect.height));
    return { x, y };
  }

  function onCanvasDown(e) {
    if (drawMode === "none") return;

    isDrawingRef.current = true;

    if (drawMode === "rect") {
      const p = getNormalizedPoint(e);
      startPointRef.current = p;
      setDraftShape({ type: "rect", x: p.x, y: p.y, w: 0, h: 0 });
    }

    if (drawMode === "freehand") {
      const p = getNormalizedPoint(e);
      freehandPointsRef.current = [p];
      setDraftShape({ type: "freehand", points: [p] });
    }
  }

  function onCanvasMove(e) {
    if (!isDrawingRef.current) return;
    if (drawMode === "none") return;

    if (drawMode === "rect") {
      const start = startPointRef.current;
      if (!start) return;

      const p = getNormalizedPoint(e);

      const x = Math.min(start.x, p.x);
      const y = Math.min(start.y, p.y);
      const w = Math.abs(p.x - start.x);
      const h = Math.abs(p.y - start.y);

      setDraftShape({ type: "rect", x, y, w, h });
    }

    if (drawMode === "freehand") {
      const p = getNormalizedPoint(e);
      const pts = freehandPointsRef.current;
      pts.push(p);
      freehandPointsRef.current = pts;
      setDraftShape({ type: "freehand", points: [...pts] });
    }
  }

  function onCanvasUp() {
    if (drawMode === "none") return;
    isDrawingRef.current = false;
    startPointRef.current = null;
   
  }

  
  useEffect(() => {
    redrawOverlay();
    
  }, [draftShape, activeAnnIds, annotations]);

  const canDraw = drawMode !== "none";

  return (
    <Layout title={`Video #${id}`} subtitle="Play video, add bookmarks & annotations">
      <Link to="/" className="navLink">← Back</Link>

      {loading && <p className="muted">Loading…</p>}
      {err && <div className="alertError">{err}</div>}
      {msg && <div className="alertOk">{msg}</div>}

      {!loading && !video ? <p className="muted">Video not found.</p> : null}

      {!loading && video ? (
        <>
          <p className="muted" style={{ marginTop: 10 }}>{video.title}</p>

          {/* VIDEO + CANVAS OVERLAY */}
          <div ref={wrapperRef} style={{ position: "relative", width: "100%", maxWidth: 1000 }}>
            <video
              ref={videoRef}
              controls
              onTimeUpdate={onTimeUpdate}
              onLoadedMetadata={syncCanvasSize}
              style={{ width: "100%", maxHeight: 520, background: "#000", borderRadius: 10 }}
              src={video.fileUrl}  computed fileUrl
            />

            <canvas
              ref={canvasRef}
              onMouseDown={onCanvasDown}
              onMouseMove={onCanvasMove}
              onMouseUp={onCanvasUp}
              onMouseLeave={onCanvasUp}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: "100%",
                height: "100%",
                pointerEvents: canDraw ? "auto" : "none",
                cursor: canDraw ? "crosshair" : "default",
              }}
            />
          </div>

          {/* Drawing Controls */}
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            <button
              className={`btn btnSmall ${drawMode === "freehand" ? "btnPrimary" : ""}`}
              onClick={() => {
                setDraftShape(null);
                setDrawMode(drawMode === "freehand" ? "none" : "freehand");
              }}
            >
              {drawMode === "freehand" ? "Stop Freehand" : "Draw Freehand"}
            </button>

            <button
              className={`btn btnSmall ${drawMode === "rect" ? "btnPrimary" : ""}`}
              onClick={() => {
                setDraftShape(null);
                setDrawMode(drawMode === "rect" ? "none" : "rect");
              }}
            >
              {drawMode === "rect" ? "Stop Rectangle" : "Draw Rectangle"}
            </button>

            <button
              className="btn btnSmall"
              onClick={() => {
                setDraftShape(null);
                setDrawMode("none");
                redrawOverlay();
              }}
            >
              Clear Draft
            </button>

            <span className="muted" style={{ alignSelf: "center" }}>
              Tip: pause at a moment → draw → type description → Save Annotation
            </span>
          </div>

          <div style={{ display: "flex", gap: 24, marginTop: 18, flexWrap: "wrap" }}>
            {/* Bookmarks */}
            <div style={{ flex: 1, minWidth: 320 }}>
              <h3>Bookmarks</h3>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  className="input"
                  style={{ flex: 1 }}
                  placeholder="Bookmark title"
                  value={bmTitle}
                  onChange={(e) => setBmTitle(e.target.value)}
                />
                <button className="btn btnSmall" onClick={addBookmark}>Add</button>
              </div>

              <ul className="list" style={{ marginTop: 10 }}>
                {bookmarks.map((b) => (
                  <li key={b.id} className="listItem">
                    <button className="linkBtn" onClick={() => seekTo(b.timestamp)}>
                      {b.title} — {formatTime(b.timestamp)}
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
            <div style={{ flex: 1, minWidth: 320 }}>
              <h3>Annotations</h3>

              <div style={{ display: "flex", gap: 8 }}>
                <input
                  className="input"
                  style={{ flex: 1 }}
                  placeholder="Annotation description"
                  value={annDesc}
                  onChange={(e) => setAnnDesc(e.target.value)}
                />
                <button className="btn btnSmall" onClick={addAnnotationFromDraft}>
                  Save
                </button>
              </div>

              <div className="muted" style={{ marginTop: 8, fontSize: 13 }}>
                Saves at current video time: <b>{formatTime(currentTime())}</b>
              </div>

              <ul className="list" style={{ marginTop: 10 }}>
                {annotations.map((a) => (
                  <li key={a.id} className="listItem">
                    <button className="linkBtn" onClick={() => seekTo(a.timestamp)}>
                      {a.description} — {formatTime(a.timestamp)}
                    </button>

                    <div className="actions">
                      <button className="btnSmall" onClick={() => updateAnnotation(a)}>Edit</button>
                      <button className="btnSmall danger" onClick={() => deleteAnnotation(a.id)}>Delete</button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="muted" style={{ marginTop: 8, fontSize: 12 }}>
                Note: Drawings appear automatically when playback reaches the timestamp.
              </div>
            </div>
          </div>
        </>
      ) : null}
    </Layout>
  );
}