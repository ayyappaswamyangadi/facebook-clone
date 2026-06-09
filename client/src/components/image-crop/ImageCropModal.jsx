import { useEffect, useRef, useState } from "react";
import "./image-crop-modal.scss";

const ImageCropModal = ({ imageSrc, aspect, title, onCrop, onCancel }) => {
  const CONTAINER_W = 480;
  const CONTAINER_H = Math.round(CONTAINER_W / aspect);

  const imgRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [applying, setApplying] = useState(false);

  const dragging = useRef(false);
  const dragStart = useRef({ mx: 0, my: 0, ox: 0, oy: 0 });

  // Compute layout fresh on every render so apply always has current values
  const getLayout = () => {
    const img = imgRef.current;
    if (!loaded || !img || !img.naturalWidth) return null;
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    const base = Math.max(CONTAINER_W / nw, CONTAINER_H / nh);
    const scale = base * zoom;
    const w = nw * scale;
    const h = nh * scale;
    const maxOX = Math.max(0, (w - CONTAINER_W) / 2);
    const maxOY = Math.max(0, (h - CONTAINER_H) / 2);
    const ox = Math.min(maxOX, Math.max(-maxOX, offset.x));
    const oy = Math.min(maxOY, Math.max(-maxOY, offset.y));
    return { left: (CONTAINER_W - w) / 2 + ox, top: (CONTAINER_H - h) / 2 + oy, w, h, maxOX, maxOY };
  };

  const layout = getLayout();

  const clampOffset = (ox, oy, lo) => {
    if (!lo) return { x: ox, y: oy };
    return {
      x: Math.min(lo.maxOX, Math.max(-lo.maxOX, ox)),
      y: Math.min(lo.maxOY, Math.max(-lo.maxOY, oy)),
    };
  };

  const getXY = (e) =>
    e.touches ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY };

  const onMouseDown = (e) => {
    e.preventDefault();
    const { x, y } = getXY(e);
    dragging.current = true;
    dragStart.current = { mx: x, my: y, ox: offset.x, oy: offset.y };
  };

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return;
      const { x, y } = getXY(e);
      const rawOX = dragStart.current.ox + (x - dragStart.current.mx);
      const rawOY = dragStart.current.oy + (y - dragStart.current.my);
      setOffset(() => {
        const lo = getLayout();
        return clampOffset(rawOX, rawOY, lo);
      });
    };
    const onUp = () => { dragging.current = false; };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [loaded, zoom, offset]); // eslint-disable-line react-hooks/exhaustive-deps

  const onZoomChange = (e) => {
    const newZoom = Number(e.target.value);
    setZoom(newZoom);
    // re-clamp offset after zoom changes
    setOffset((prev) => {
      const img = imgRef.current;
      if (!img || !img.naturalWidth) return prev;
      const base = Math.max(CONTAINER_W / img.naturalWidth, CONTAINER_H / img.naturalHeight);
      const scale = base * newZoom;
      const maxOX = Math.max(0, (img.naturalWidth * scale - CONTAINER_W) / 2);
      const maxOY = Math.max(0, (img.naturalHeight * scale - CONTAINER_H) / 2);
      return {
        x: Math.min(maxOX, Math.max(-maxOX, prev.x)),
        y: Math.min(maxOY, Math.max(-maxOY, prev.y)),
      };
    });
  };

  const onApply = () => {
    const lo = getLayout();
    if (!lo || !imgRef.current) return;
    setApplying(true);
    const canvas = document.createElement("canvas");
    canvas.width = CONTAINER_W;
    canvas.height = CONTAINER_H;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, CONTAINER_W, CONTAINER_H);
    ctx.drawImage(imgRef.current, lo.left, lo.top, lo.w, lo.h);
    canvas.toBlob((blob) => onCrop(blob), "image/jpeg", 0.92);
  };

  return (
    <div className="crop-overlay" onClick={onCancel}>
      <div className="crop-modal" onClick={(e) => e.stopPropagation()}>
        <div className="crop-modal-header">
          <h3>{title || "Crop Image"}</h3>
        </div>

        <div
          className="crop-container"
          style={{ width: CONTAINER_W, height: CONTAINER_H }}
          onMouseDown={onMouseDown}
          onTouchStart={onMouseDown}
        >
          {!loaded && (
            <div className="crop-loading">Loading image…</div>
          )}
          <img
            ref={imgRef}
            src={imageSrc}
            alt=""
            draggable={false}
            onLoad={() => setLoaded(true)}
            style={{
              position: "absolute",
              userSelect: "none",
              pointerEvents: "none",
              display: loaded && layout ? "block" : "none",
              left: layout ? layout.left : 0,
              top: layout ? layout.top : 0,
              width: layout ? layout.w : 0,
              height: layout ? layout.h : 0,
            }}
          />
          <div className="crop-grid" />
        </div>

        <div className="crop-controls">
          <label className="crop-zoom-label">Zoom</label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={onZoomChange}
            className="crop-zoom-slider"
          />
        </div>

        <div className="crop-modal-actions">
          <button className="crop-btn-cancel" onClick={onCancel} disabled={applying}>
            Cancel
          </button>
          <button className="crop-btn-apply" onClick={onApply} disabled={applying || !loaded}>
            {applying ? "Applying…" : "Apply Crop"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropModal;
