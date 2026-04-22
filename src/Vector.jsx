import React, { useState } from 'react';
import './Vector.css';
import FrontSVG from './suv-front.svg?react';
import BackSVG from './suv-back.svg?react';

const Vector = () => {
  const [view, setView] = useState('front');
  const [markers, setMarkers] = useState({});
  const [hoverName, setHoverName] = useState("");

  const handleAction = (e) => {
    const path = e.target.closest('[id]');
    const excludedIds = ["SUV", "suv-front", "suv-back", "base", "items", "utilities", "base-body", "rear-body"];
    
    if (!path || excludedIds.includes(path.id)) return;

    const key = `${view}-${path.id}`;
    const currentMarker = markers[key];

    // SIKLUS: Klik 1 (Tick) -> Klik 2 (Cross) -> Klik 3 (Hapus)
    if (!currentMarker) {
      // Ambil root SVG untuk kalkulasi point
      const svg = path.ownerSVGElement;
      const point = svg.createSVGPoint();
      const bbox = path.getBBox();
      point.x = bbox.x + bbox.width / 2;
      point.y = bbox.y + bbox.height / 2;
      const transformedPoint = point.matrixTransform(path.getCTM());

      setMarkers(prev => ({
        ...prev,
        [key]: { type: 'tick', x: transformedPoint.x, y: transformedPoint.y, note: "", partName: path.id.replace(/-/g, ' ').toUpperCase() }
      }));
    } else if (currentMarker.type === 'tick') {
      setMarkers(prev => ({
        ...prev,
        [key]: { ...prev[key], type: 'cross' }
      }));
    } else {
      // Klik ke-3: Hapus
      const newMarkers = { ...markers };
      delete newMarkers[key];
      setMarkers(newMarkers);
    }
  };

  const handleNoteChange = (id, note) => {
    setMarkers(prev => ({
      ...prev,
      [id]: { ...prev[id], note }
    }));
  };

  const handleHover = (e) => {
    const path = e.target.closest('[id]');
    const excludedIds = ["SUV", "suv-front", "suv-back", "base", "items", "utilities", "base-body", "rear-body"];
    if (path && !excludedIds.includes(path.id)) {
      setHoverName(path.id.replace(/-/g, ' ').toUpperCase());
    } else {
      setHoverName("");
    }
  };

  const CurrentSVG = view === 'front' ? FrontSVG : BackSVG;
  const viewBox = view === 'front' ? "0 0 700.72 568.24" : "0 0 674.58 595.24";

  return (
    <div className="app-wrapper">
      <h2 className="title">Vehicle Inspection System</h2>
      <p className="subtitle">Klik 1x: ✓ LULUS | Klik 2x: ✕ CACAT | Klik 3x: HAPUS</p>

      <div className="main-stage">
        <button className="btn-nav" onClick={() => setView(v => v === 'front' ? 'back' : 'front')}>❮</button>

        <div className="car-card">
          <div className="badge">{view === 'front' ? 'FRONT PANEL' : 'REAR PANEL'}</div>
          
          <div className="svg-container">
            {/* Gambar Mobil (SVG yang di-import) */}
            <CurrentSVG 
              className="car-svg"
              onClick={handleAction}
              onMouseOver={handleHover}
            />

            {/* Overlay Penanda (SVG transparan dengan viewBox yang sama) */}
            <svg viewBox={viewBox} className="marker-overlay">
              {Object.keys(markers).map(id => {
                if (!id.startsWith(view)) return null;
                const m = markers[id];
                return (
                  <g key={id} transform={`translate(${m.x}, ${m.y})`}>
                    <circle r="18" fill="white" stroke={m.type === 'tick' ? '#28a745' : '#dc3545'} strokeWidth="2" />
                    <text 
                      className={`symbol ${m.type}`}
                      textAnchor="middle" 
                      dominantBaseline="central"
                    >
                      {m.type === 'tick' ? '✓' : '✕'}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        <button className="btn-nav" onClick={() => setView(v => v === 'front' ? 'back' : 'front')}>❯</button>
      </div>

      <div className="info-bar">
        <span>BAGIAN: <strong>{hoverName || "PILIH BAGIAN MOBIL"}</strong></span>
      </div>

      {/* Panel Catatan/Komplain */}
      {Object.keys(markers).some(id => markers[id].type === 'cross') && (
        <div className="notes-container">
          <h3 className="notes-title">Catatan Komplain (Cacat)</h3>
          <div className="notes-list">
            {Object.keys(markers).map(id => {
              const m = markers[id];
              if (m.type !== 'cross') return null;
              return (
                <div key={id} className="note-item">
                  <span className="note-label">{m.partName}</span>
                  <input 
                    type="text" 
                    placeholder="Masukkan komplain/catatan di sini..."
                    value={m.note}
                    onChange={(e) => handleNoteChange(id, e.target.value)}
                    className="note-input"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Vector;