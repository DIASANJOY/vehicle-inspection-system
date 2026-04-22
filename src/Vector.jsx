import React, { useState } from 'react';
import './Vector.css';
import FrontSVG from './assets/suv-front.svg?react';
import BackSVG from './assets/suv-back.svg?react';

const Vector = () => {
  const [view, setView] = useState('front');
  const [markers, setMarkers] = useState(() => {
    const saved = localStorage.getItem('vehicle_markers');
    return saved ? JSON.parse(saved) : {};
  });
  const [hoverName, setHoverName] = useState("");
  const [activePopup, setActivePopup] = useState(null); // { id, x, y }
  const [showDataView, setShowDataView] = useState(false);
  const [copyStatus, setCopyStatus] = useState("Copy JSON");
  const [dataTab, setDataTab] = useState('table'); // 'table' | 'json'

  // Timer untuk deteksi Long Press
  const pressTimer = React.useRef(null);
  const isLongPress = React.useRef(false); // Flag untuk mencegah klik setelah hold

  // Save to localStorage
  React.useEffect(() => {
    localStorage.setItem('vehicle_markers', JSON.stringify(markers));
  }, [markers]);

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
        {Object.keys(markers).map(id => {
          const m = markers[id];
          const color = m.type === 'tick' ? '#3182ce' : '#e53e3e';
          return `
            #${m.pathId}, #${m.pathId} path, #${m.pathId} polyline, #${m.pathId} polygon { 
              fill: ${m.type === 'tick' ? 'rgba(49, 130, 206, 0.15)' : 'rgba(229, 62, 62, 0.15)'} !important; 
              stroke: ${color} !important;
              stroke-width: 5px !important;
              transition: all 0.3s ease;
            }
          `;
        }).join('')}
      </style>

      <h2 className="title">Vehicle Inspection System</h2>
      <p className="subtitle">Klik: Ganti ✓/✕ | KLIK KANAN / Tahan (Hold): Catatan & Hapus</p>

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
                    <circle r="22" fill="white" stroke={m.type === 'tick' ? '#28a745' : '#dc3545'} strokeWidth="3" />
                    <text
                      className={`symbol ${m.type}`}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      dy=".1em"
                      fontSize="18px"
                      fontWeight="bold"
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
                          // Tampilan Ikon Amplop saat disembunyikan (UKURAN JUMBO)
                          <g>
                            <circle r="20" fill="#3182ce" stroke="white" strokeWidth="2" />
                            <text fill="white" fontSize="20" textAnchor="middle" dominantBaseline="middle">✉️</text>
                          </g>
                        ) : (
                          // Tampilan Teks Lengkap saat diklik
                          <g>
                            <rect
                              x={-(m.note.length * 6 + 20)}
                              y="-20"
                              width={m.note.length * 12 + 40}
                              height="40"
                              rx="10"
                              fill="rgba(0,0,0,0.95)"
                            />
                            <text
                              fill="white"
                              fontSize="18"
                              fontWeight="bold"
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
                    transform: `translate(-50%, ${activePopup.y < 300 ? '25px' : '-105%'})`,
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

                    <div className="notes-input-group">
                      <label className="notes-label">📩 ISI CATATAN / KOMPLAIN:</label>
                      <textarea
                        className="popup-textarea"
                        placeholder="Tulis catatan tambahan di sini..."
                        value={markers[activePopup.id]?.note || ""}
                        onChange={(e) => handleNoteChange(activePopup.id, e.target.value)}
                        autoFocus
                      />
                    </div>

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

      {/* Footer Berdasarkan Sketsa User: Dua Baris Horizontal */}
      <div className="wireframe-footer">
        {/* Baris 1: Ringkasan Stats */}
        <div className="footer-bar stats-bar">
          <div className="stat-item"><span className="dot tick"></span> <strong>{Object.values(markers).filter(m => m.type === 'tick').length}</strong> LULUS</div>
          <div className="stat-item"><span className="dot cross"></span> <strong>{Object.values(markers).filter(m => m.type === 'cross').length}</strong> CACAT</div>
        </div>

        {/* Baris 2: Tombol Aksi */}
        <div className="footer-actions">
          <button className="footer-bar data-btn" onClick={() => setShowDataView(!showDataView)}>
            {showDataView ? "📊 KEMBALI KE VISUAL" : "📋 LIHAT DATA TABLE"}
          </button>
          <button className="footer-bar submit-bar" onClick={() => {
            setShowDataView(true);
            setTimeout(() => {
              alert("Data siap untuk diekspor! Silakan salin JSON atau download file.");
            }, 500);
          }}>
            📩 KIRIM / EXPORT DATA
          </button>
        </div>
      </div>

      {/* MODAL DATA VIEW */}
      {showDataView && (
        <div className="data-view-overlay">
          <div className="data-view-content">
            <div className="data-view-header">
              <div className="header-main-title">
                <h3>DATA HASIL INSPEKSI</h3>
                {Object.values(markers).length > 0 && (
                  <span className={`overall-badge ${Object.values(markers).some(m => m.type === 'cross') ? 'failed' : 'passed'}`}>
                    KESIMPULAN: {Object.values(markers).some(m => m.type === 'cross') ? 'CACAT (PERLU PERBAIKAN)' : 'LULUS (KONDISI BAIK)'}
                  </span>
                )}
              </div>
              <div className="header-buttons">
                <div className="tab-buttons">
                  <button 
                    className={`tab-btn ${dataTab === 'table' ? 'active' : ''}`}
                    onClick={() => setDataTab('table')}
                  >📊 TABLE</button>
                  <button 
                    className={`tab-btn ${dataTab === 'json' ? 'active' : ''}`}
                    onClick={() => setDataTab('json')}
                  >{"{ }"} JSON</button>
                </div>
                <div className="action-buttons">
                <button className="export-btn reset" onClick={() => {
                  if (window.confirm("Hapus semua data inspeksi?")) {
                    setMarkers({});
                    localStorage.removeItem('vehicle_markers');
                  }
                }} style={{ background: '#fff5f5', color: '#c53030', border: '1px solid #feb2b2' }}>Reset</button>
                
                <button className="export-btn copy" onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(markers, null, 2));
                  setCopyStatus("Copied! ✅");
                  setTimeout(() => setCopyStatus("Copy JSON"), 2000);
                }} style={{ background: '#ebf8ff', color: '#2b6cb0', border: '1px solid #bee3f8' }}>
                  {copyStatus}
                </button>

                <button className="export-btn json" onClick={() => {
                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(markers, null, 2));
                  const downloadAnchorNode = document.createElement('a');
                  downloadAnchorNode.setAttribute("href",     dataStr);
                  downloadAnchorNode.setAttribute("download", "inspection_data.json");
                  document.body.appendChild(downloadAnchorNode);
                  downloadAnchorNode.click();
                  downloadAnchorNode.remove();
                }}>Download JSON</button>
                <button className="close-data-btn" onClick={() => setShowDataView(false)}>✕</button>
                </div>
              </div>
            </div>
            
            <div className="data-view-body">
              {dataTab === 'table' ? (
                <div className="data-table-container">
                  <table className="inspection-table">
                    <thead>
                      <tr>
                        <th>Panel / Bagian</th>
                        <th>View</th>
                        <th>Status Akhir</th>
                        <th>Jumlah Tanda</th>
                        <th>Catatan Terakumulasi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const grouped = {};
                        Object.values(markers).forEach(m => {
                          if (!grouped[m.pathId]) {
                            grouped[m.pathId] = { 
                              partName: m.partName, 
                              view: m.view, 
                              type: 'tick', 
                              count: 0, 
                              notes: [] 
                            };
                          }
                          grouped[m.pathId].count++;
                          if (m.type === 'cross') grouped[m.pathId].type = 'cross';
                          if (m.note) grouped[m.pathId].notes.push(m.note);
                        });

                        const rows = Object.values(grouped);
                        if (rows.length === 0) {
                          return (
                            <tr>
                              <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>
                                Belum ada data inspeksi.
                              </td>
                            </tr>
                          );
                        }

                        return rows.map((panel, idx) => (
                          <tr key={idx}>
                            <td className="part-cell">{panel.partName}</td>
                            <td>{panel.view.toUpperCase()}</td>
                            <td>
                              <span className={`status-badge ${panel.type}`}>
                                {panel.type === 'tick' ? 'LULUS' : 'CACAT'}
                              </span>
                            </td>
                            <td>{panel.count} tanda</td>
                            <td className="note-cell">
                              {panel.notes.length > 0 ? panel.notes.join(" | ") : "-"}
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="json-preview-section">
                  <div className="json-header">
                    <h4>JSON Output (Backend Ready)</h4>
                    <button className="copy-json-inline" onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(markers, null, 2));
                      setCopyStatus("Copied! ✅");
                      setTimeout(() => setCopyStatus("Copy JSON"), 2000);
                    }}>{copyStatus}</button>
                  </div>
                  <pre className="json-preview full-height">
                    {JSON.stringify(markers, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vector;