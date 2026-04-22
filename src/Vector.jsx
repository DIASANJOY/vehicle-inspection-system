import React, { useState } from 'react';
import './Vector.css';
import FrontSVG from './assets/suv-front.svg?react';
import BackSVG from './assets/suv-back.svg?react';

const Vector = () => {
  const [view, setView] = useState('front');
  const [markers, setMarkers] = useState({});
  const [hoverName, setHoverName] = useState("");
  const [activePopup, setActivePopup] = useState(null); // { id, x, y }
  
  // Timer untuk deteksi Long Press
  const pressTimer = React.useRef(null);

  const handleAction = (e) => {
    if (activePopup) return; // Jangan buat tanda baru kalau pop-up lagi buka
    
    const path = e.target.closest('[id]');
    const excludedIds = ["SUV", "suv-front", "suv-back", "base", "items", "utilities", "base-body", "rear-body"];
    
    if (!path || excludedIds.includes(path.id)) return;

    const svg = path.ownerSVGElement;
    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    const transformedPoint = point.matrixTransform(svg.getScreenCTM().inverse());

    // BUAT TANDA BARU
    const newId = Date.now();
    setMarkers(prev => ({
      ...prev,
      [newId]: { 
        id: newId,
        view: view,
        type: 'tick', 
        x: transformedPoint.x, 
        y: transformedPoint.y, 
        note: "", 
        pathId: path.id,
        partName: path.id.replace(/-/g, ' ').toUpperCase() 
      }
    }));
  };

  const handlePointerDown = (e) => {
    const x = e.clientX;
    const y = e.clientY;
    const target = e.target;

    pressTimer.current = setTimeout(() => {
      const path = target.closest('[id]');
      const excludedIds = ["SUV", "suv-front", "suv-back", "base", "items", "utilities", "base-body", "rear-body"];
      if (!path || excludedIds.includes(path.id)) return;

      const svg = path.ownerSVGElement;
      const point = svg.createSVGPoint();
      point.x = x;
      point.y = y;
      const transformedPoint = point.matrixTransform(svg.getScreenCTM().inverse());

      const newId = Date.now();
      const partName = path.id.replace(/-/g, ' ').toUpperCase();

      setMarkers(prev => ({
        ...prev,
        [newId]: { 
          id: newId, view, type: 'tick', x: transformedPoint.x, y: transformedPoint.y, 
          note: "", pathId: path.id, partName 
        }
      }));
      setActivePopup({ id: newId, x: transformedPoint.x, y: transformedPoint.y, partName });
    }, 600); // 0.6 detik untuk Hold
  };

  const handlePointerUp = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
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

  // Kelompokkan status per bagian (ID)
  const partStatus = {};
  Object.values(markers).forEach(m => {
    if (!partStatus[m.pathId] || m.type === 'cross') {
      partStatus[m.pathId] = m.type; // Cross menang atas Tick
    }
  });

  return (
    <div className="app-wrapper">
      {/* Style Dinamis untuk Highlighting Bagian yang Terinspeksi */}
      <style>
        {Object.keys(partStatus).map(id => {
          const type = partStatus[id];
          const color = type === 'tick' ? '#3182ce' : '#dc3545'; // Biru untuk Lulus
          const bg = type === 'tick' ? 'rgba(49, 130, 206, 0.15)' : 'rgba(220, 53, 69, 0.15)';
          return `
            #${id} { 
              stroke: ${color} !important;
              stroke-width: 5px !important; 
              fill: ${bg} !important;
              transition: all 0.3s ease;
            }
          `;
        }).join('')}
      </style>

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
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
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
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setActivePopup({ id, x: m.x, y: m.y, partName: m.partName });
                    }}
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

              {/* Pop-up Cepat (Quick Action) dengan Smart Positioning */}
              {activePopup && (
                <foreignObject 
                  x={activePopup.x - 100} 
                  y={activePopup.y < 180 ? activePopup.y + 30 : activePopup.y - 170} 
                  width="200" 
                  height="160"
                  style={{ overflow: 'visible' }}
                >
                  <div className="quick-popup">
                    <div className="popup-header">
                      <span>{activePopup.partName}</span>
                      <button onClick={() => setActivePopup(null)}>✕</button>
                    </div>
                    <div className="popup-actions">
                      <button 
                        className={`action-btn tick ${markers[activePopup.id]?.type === 'tick' ? 'active' : ''}`}
                        onClick={() => setMarkers(prev => ({ ...prev, [activePopup.id]: { ...prev[activePopup.id], type: 'tick' }}))}
                      >✓</button>
                      <button 
                        className={`action-btn cross ${markers[activePopup.id]?.type === 'cross' ? 'active' : ''}`}
                        onClick={() => setMarkers(prev => ({ ...prev, [activePopup.id]: { ...prev[activePopup.id], type: 'cross' }}))}
                      >✕</button>
                      <button 
                        className="action-btn delete"
                        onClick={() => {
                          setMarkers(prev => {
                            const n = { ...prev };
                            delete n[activePopup.id];
                            return n;
                          });
                          setActivePopup(null);
                        }}
                      >🗑</button>
                    </div>
                    <input 
                      type="text" 
                      className="popup-input"
                      placeholder="Tulis catatan kerusakan..."
                      value={markers[activePopup.id]?.note || ""}
                      onChange={(e) => handleNoteChange(activePopup.id, e.target.value)}
                      autoFocus
                    />
                    <button 
                      className="popup-save-btn"
                      onClick={() => setActivePopup(null)}
                    >
                      SIMPAN & KEMBALI
                    </button>
                  </div>
                </foreignObject>
              )}
            </svg>

            {/* Overlay untuk menutup pop-up jika klik di luar */}
            {activePopup && (
              <div 
                className="popup-overlay" 
                onClick={() => setActivePopup(null)}
              />
            )}
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