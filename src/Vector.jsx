import React, { useState } from 'react';
import './Vector.css';
import FrontSVG from './assets/suv-front.svg?react';
import BackSVG from './assets/suv-back.svg?react';

const Vector = () => {
  const [view, setView] = useState('front');
  const [markers, setMarkers] = useState({});
  const [hoverName, setHoverName] = useState("");

  const handleAction = (e) => {
    const path = e.target.closest('[id]');
    const excludedIds = ["SUV", "suv-front", "suv-back", "base", "items", "utilities", "base-body", "rear-body"];
    
    if (!path || excludedIds.includes(path.id)) return;

    const svg = path.ownerSVGElement;
    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    const transformedPoint = point.matrixTransform(svg.getScreenCTM().inverse());

    // BUAT TANDA BARU (Setiap klik buat tanda baru dengan ID unik)
    const newId = Date.now();
    setMarkers(prev => ({
      ...prev,
      [newId]: { 
        id: newId,
        view: view, // Simpan view agar tanda tidak muncul di sisi lain
        type: 'tick', 
        x: transformedPoint.x, 
        y: transformedPoint.y, 
        note: "", 
        partName: path.id.replace(/-/g, ' ').toUpperCase() 
      }
    }));
  };

  const cycleMarker = (e, markerId) => {
    e.stopPropagation(); // Mencegah klik tembus ke mobil (biar tidak buat tanda baru)
    
    setMarkers(prev => {
      const m = prev[markerId];
      if (!m) return prev;

      const newMarkers = { ...prev };
      if (m.type === 'tick') {
        newMarkers[markerId] = { ...m, type: 'cross' };
      } else {
        delete newMarkers[markerId];
      }
      return newMarkers;
    });
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
                const m = markers[id];
                if (m.view !== view) return null;
                return (
                  <g 
                    key={id} 
                    transform={`translate(${m.x}, ${m.y})`}
                    onClick={(e) => cycleMarker(e, id)}
                    className="marker-group"
                  >
                    <circle r="18" fill="white" stroke={m.type === 'tick' ? '#28a745' : '#dc3545'} strokeWidth="2" />
                    <text 
                      className={`symbol ${m.type}`}
                      textAnchor="middle" 
                      dominantBaseline="middle"
                      dy=".1em" 
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
                  <div className="note-label-group">
                    <span className="note-label">{m.partName}</span>
                    <span className="note-coords">X: {Math.round(m.x)}, Y: {Math.round(m.y)}</span>
                  </div>
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