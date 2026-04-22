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
  const isLongPress = React.useRef(false); // Flag untuk mencegah klik setelah hold

  const handleAction = (e) => {
    if (activePopup || isLongPress.current) {
      isLongPress.current = false; // Reset flag
      return; 
    }

    const path = e.target.closest('[id]');
    const markersOnPart = Object.values(markers).filter(m => m.pathId === path?.id && m.view === view).length;
    
    if (markersOnPart >= 4) {
      alert(`Maksimal 4 tanda pada bagian ${path.id.toUpperCase()} diperbolehkan.`);
      return;
    }

    // Selalu buat tanda baru jika klik di area kosong mobil
    const svg = path.ownerSVGElement;
    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    const transformedPoint = point.matrixTransform(svg.getScreenCTM().inverse());

    const newId = Date.now();
    setMarkers(prev => ({
      ...prev,
      [newId]: { 
        id: newId, view, type: 'tick', x: transformedPoint.x, y: transformedPoint.y, 
        note: "", pathId: path.id, partName: path.id.replace(/-/g, ' ').toUpperCase() 
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

      setMarkers(prev => {
        const markersOnPart = Object.values(prev).filter(m => m.pathId === path?.id && m.view === view).length;
        if (markersOnPart >= 4) {
          alert(`Maksimal 4 tanda pada bagian ${path.id.toUpperCase()} diperbolehkan.`);
          return prev;
        }

        const newId = Date.now();
        const partName = path.id.replace(/-/g, ' ').toUpperCase();
        
        setActivePopup({ id: newId, x: transformedPoint.x, y: transformedPoint.y, partName });
        isLongPress.current = true;
        
        return { 
          ...prev, 
          [newId]: { id: newId, view, type: 'tick', x: transformedPoint.x, y: transformedPoint.y, note: "", pathId: path.id, partName } 
        };
      });
    }, 600);
  };

  const handlePointerUp = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  };

  const cycleMarker = (e, key) => {
    e.stopPropagation();
    setMarkers(prev => {
      const currentMarker = prev[key];
      if (!currentMarker) return prev;

      const newMarkers = { ...prev };
      // Toggle antara Tick <-> Cross (Agar catatan tidak hilang)
      newMarkers[key] = { 
        ...currentMarker, 
        type: currentMarker.type === 'tick' ? 'cross' : 'tick' 
      };
      return newMarkers;
    });
  };

  const openPopup = (e, markerId) => {
    if (e) e.stopPropagation();
    const m = markers[markerId];
    if (m) {
      setActivePopup({ id: markerId, x: m.x, y: m.y, partName: m.partName });
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
      <p className="subtitle">Klik: Ganti ✓/✕ | Tahan (Hold): Catatan & Hapus</p>

      <div className="main-stage">
        <button className="btn-nav" onClick={() => setView(v => v === 'front' ? 'back' : 'front')}>❮</button>

        <div className="car-card">
          <div className="badge">{view === 'front' ? 'FRONT PANEL' : 'REAR PANEL'}</div>

          <div 
          className="svg-container" 
          onContextMenu={(e) => e.preventDefault()}
        >
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
                      openPopup(e, id);
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
                    {/* Ikon/Balon Catatan (Toggle Show/Hide) dengan Smart Positioning */}
                    {m.note && (
                      <g 
                        transform={`translate(0, ${m.y < 50 ? 40 : -40})`} 
                        onClick={(e) => {
                          e.stopPropagation();
                          setMarkers(prev => ({
                            ...prev,
                            [id]: { ...prev[id], showNote: !prev[id].showNote }
                          }));
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        {!m.showNote ? (
                          // Tampilan Ikon Amplop saat disembunyikan
                          <g>
                            <circle r="10" fill="#3182ce" />
                            <text fill="white" fontSize="8" textAnchor="middle" dominantBaseline="middle">✉️</text>
                          </g>
                        ) : (
                          // Tampilan Teks Lengkap saat diklik
                          <g>
                            <rect
                              x={-(m.note.length * 3.5 + 10)}
                              y="-12"
                              width={m.note.length * 7 + 20}
                              height="22"
                              rx="6"
                              fill="rgba(0,0,0,0.9)"
                            />
                            <text
                              fill="white"
                              fontSize="10"
                              fontWeight="600"
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              {m.note}
                            </text>
                          </g>
                        )}
                      </g>
                    )}
                  </g>
                );
              })}

            </svg>

            {/* Pop-up Cepat (Quick Action) - Sekarang di Luar SVG agar tidak terpotong & bisa diklik */}
            {activePopup && (
              <>
                <div
                  className="popup-overlay"
                  onClick={() => setActivePopup(null)}
                />
                <div
                  className="quick-popup"
                  style={{
                    position: 'absolute',
                    left: `${(activePopup.x / (view === 'front' ? 700.72 : 674.58)) * 100}%`,
                    top: `${(activePopup.y / (view === 'front' ? 568.24 : 595.24)) * 100}%`,
                    transform: `translate(-50%, ${activePopup.y < 180 ? '20px' : '-110%'})`,
                    zIndex: 100
                  }}
                >
                  <div className="popup-header">
                    <span>{activePopup.partName}</span>
                    <button onClick={() => setActivePopup(null)}>✕</button>
                  </div>
                  <div className="popup-body">
                    {/* Pilih Status Langsung di Pop-up */}
                    <div className="popup-status-selector">
                      <button
                        className={`status-btn tick ${markers[activePopup.id]?.type === 'tick' ? 'active' : ''}`}
                        onClick={() => setMarkers(prev => ({ ...prev, [activePopup.id]: { ...prev[activePopup.id], type: 'tick' } }))}
                      >✓ LULUS</button>
                      <button
                        className={`status-btn cross ${markers[activePopup.id]?.type === 'cross' ? 'active' : ''}`}
                        onClick={() => setMarkers(prev => ({ ...prev, [activePopup.id]: { ...prev[activePopup.id], type: 'cross' } }))}
                      >✕ CACAT</button>
                    </div>

                    <div className="part-info">
                      <span className="info-label">KOORDINAT:</span>
                      <span className="info-value">X: {Math.round(activePopup.x)}, Y: {Math.round(activePopup.y)}</span>
                    </div>

                    {/* Quick Tags untuk Mempercepat Kerja User */}
                    <div className="quick-tags">
                      {["Lecet", "Penyok", "Pecah", "Kusam", "Hilang"].map(tag => (
                        <button
                          key={tag}
                          className="tag-btn"
                          onClick={() => {
                            const currentNote = markers[activePopup.id]?.note || "";
                            const newNote = currentNote ? `${currentNote}, ${tag}` : tag;
                            handleNoteChange(activePopup.id, newNote);
                          }}
                        >
                          +{tag}
                        </button>
                      ))}
                    </div>

                    <textarea
                      className="popup-textarea"
                      placeholder="Tulis catatan tambahan di sini..."
                      value={markers[activePopup.id]?.note || ""}
                      onChange={(e) => handleNoteChange(activePopup.id, e.target.value)}
                      autoFocus
                    />

                    <div className="popup-footer">
                      <button
                        className="popup-delete-btn"
                        onClick={() => {
                          setMarkers(prev => {
                            const n = { ...prev };
                            delete n[activePopup.id];
                            return n;
                          });
                          setActivePopup(null);
                        }}
                      >🗑 Hapus Tanda</button>
                      <button
                        className="popup-save-btn"
                        onClick={() => setActivePopup(null)}
                      >SIMPAN</button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <button className="btn-nav" onClick={() => setView(v => v === 'front' ? 'back' : 'front')}>❯</button>
      </div>

      <div className="info-bar">
        <span>BAGIAN: <strong>{hoverName || "PILIH BAGIAN MOBIL"}</strong></span>
        <span className="legend">Klik: Ganti ✓/✕ | Tahan (Hold): Catatan & Hapus</span>
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
                  <div className="note-text-display">
                    {m.note || <span style={{ color: '#ccc', fontStyle: 'italic' }}>Tidak ada catatan...</span>}
                  </div>
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