import React, { useState } from 'react';
import './Vector.css';
import FrontSVG from './assets/suv-front.svg?react';
import BackSVG from './assets/suv-back.svg?react';

const Vector = () => {
  const [view, setView] = useState('front');
  const [markers, setMarkers] = useState(() => {
    try {
      const saved = localStorage.getItem('vehicle_markers');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.error("Failed to load markers:", e);
      return {};
    }
  });
  const [hoverName, setHoverName] = useState("");
  const [activePopup, setActivePopup] = useState(null); // { id, x, y }
  const [showDataView, setShowDataView] = useState(false);
  const [copyStatus, setCopyStatus] = useState("Copy JSON");
  const [dataTab, setDataTab] = useState('table'); // 'table' | 'json'

  // Fitur Baru
  const [activeTool, setActiveTool] = useState('tick'); // 'tick' | 'cross' | 'delete'
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedMarkerId, setSelectedMarkerId] = useState(null);

  const [selectedMarkerId, setSelectedMarkerId] = useState(null);

  // Save to localStorage
  React.useEffect(() => {
    localStorage.setItem('vehicle_markers', JSON.stringify(markers));
  }, [markers]);

  const handleAction = (e) => {
    if (activePopup) return; 
    
    if (activeTool === 'delete') return; // Klik di area kosong tidak melakukan apa-apa jika alat hapus aktif

    const path = e.target.closest('[id]');
    const markersOnPart = Object.values(markers).filter(m => m.pathId === path?.id && m.view === view).length;
    
    if (markersOnPart >= 4) {
      alert(`Maksimal 4 tanda pada bagian ${path.id.toUpperCase()} diperbolehkan.`);
      return;
    }

    const svg = path.ownerSVGElement;
    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    const transformedPoint = point.matrixTransform(svg.getScreenCTM().inverse());

    const newId = Date.now();
    setMarkers(prev => ({
      ...prev,
      [newId]: { 
        id: newId, view, type: activeTool, x: transformedPoint.x, y: transformedPoint.y, 
        note: "", pathId: path.id, partName: path.id.replace(/-/g, ' ').toUpperCase() 
      }
    }));
    setSelectedMarkerId(newId);
  };

  const handlePointerUp = () => {};
  const handlePointerDown = () => {};

  const handleActionOnMarker = (e, id) => {
    e.stopPropagation();
    if (activeTool === 'delete') {
      setMarkers(prev => {
        const n = { ...prev };
        delete n[id];
        return n;
      });
      if (selectedMarkerId === id) setSelectedMarkerId(null);
    } else {
      // Update status penanda sesuai alat yang aktif (✓ atau ✕)
      setMarkers(prev => ({
        ...prev,
        [id]: { ...prev[id], type: activeTool }
      }));
      setSelectedMarkerId(id);
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
      <style>
        {Object.keys(partStatus).map(pathId => {
          const status = partStatus[pathId];
          const color = status === 'tick' ? '#3182ce' : '#e53e3e';
          const bgColor = status === 'tick' ? 'rgba(49, 130, 206, 0.15)' : 'rgba(229, 62, 62, 0.15)';
          return `
            #${pathId}, #${pathId} path, #${pathId} polyline, #${pathId} polygon { 
              fill: ${bgColor} !important; 
              stroke: ${color} !important;
              stroke-width: 5px !important;
              transition: all 0.3s ease;
            }
          `;
        }).join('')}
      </style>

      <h2 className="title">Vehicle Inspection System</h2>
      <p className="subtitle">Pilih Alat (✓/✕/🗑) lalu klik pada bagian mobil</p>

      <div className="main-stage">
        <div className="zoom-controls">
          <button className="zoom-btn" onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 3))}>+</button>
          <button className="zoom-btn" onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 1))}>-</button>
        </div>

        <button className="btn-nav" onClick={() => setView(v => v === 'front' ? 'back' : 'front')}>❮</button>

        <div className="car-card">
          <div className="badge">{view === 'front' ? 'FRONT PANEL' : 'REAR PANEL'}</div>

          <div 
          className="svg-container" 
          style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.2s' }}
          onContextMenu={(e) => e.preventDefault()}
        >
            <CurrentSVG
              className="car-svg"
              onClick={handleAction}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              onMouseOver={handleHover}
            />

            <svg viewBox={viewBox} className="marker-overlay">
              {Object.keys(markers).map(id => {
                const m = markers[id];
                if (m.view !== view) return null;
                return (
                  <g
                    key={id}
                    transform={`translate(${m.x}, ${m.y})`}
                    onClick={(e) => handleActionOnMarker(e, id)}
                    className={`marker-group ${selectedMarkerId === id ? 'selected' : ''}`}
                  >
                    {selectedMarkerId === id && (
                      <circle className="marker-glow" r="30" fill="rgba(255, 107, 107, 0.4)" />
                    )}
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
                    {/* Indikator Pesan/Catatan (Balon Kecil) */}
                    {m.note && (
                      <g transform="translate(15, -15)">
                        <circle r="8" fill="#3182ce" stroke="white" strokeWidth="1.5" />
                        <text fill="white" fontSize="8" textAnchor="middle" dominantBaseline="middle">✉</text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
            
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
                    <div className="notes-input-group">
                      <label className="notes-label">📩 ISI CATATAN:</label>
                      <textarea
                        className="popup-textarea"
                        value={markers[activePopup.id]?.note || ""}
                        onChange={(e) => handleNoteChange(activePopup.id, e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div className="popup-footer">
                      <button className="popup-save-btn" onClick={() => setActivePopup(null)}>SIMPAN</button>
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
      </div>

      <div className="tools-panel">
        <button className={`tool-btn tick ${activeTool === 'tick' ? 'active' : ''}`} onClick={() => setActiveTool('tick')}>✓</button>
        <button className={`tool-btn cross ${activeTool === 'cross' ? 'active' : ''}`} onClick={() => setActiveTool('cross')}>✕</button>
        <button className={`tool-btn delete ${activeTool === 'delete' ? 'active' : ''}`} onClick={() => setActiveTool('delete')}>🗑</button>
      </div>

      <div className="inspection-form-container">
        <div className="form-header-badge">BAGIAN MOBIL</div>
        {(() => {
          const grouped = {};
          Object.values(markers).forEach(m => {
            if (!grouped[m.pathId]) grouped[m.pathId] = { name: m.partName, items: [] };
            grouped[m.pathId].items.push(m);
          });
          
          const panels = Object.values(grouped);
          if (panels.length === 0) return <div className="empty-form">Belum ada bagian yang ditandai.</div>;

          return panels.map((panel, idx) => (
            <div key={idx} className="panel-group-card">
              <div className="panel-header">{panel.name}</div>
              <div className="markers-list">
                {panel.items.map((item, i) => (
                  <div key={item.id} className={`marker-item-row ${selectedMarkerId === item.id ? 'active' : ''}`}>
                    <div className="marker-main-info" onClick={() => setSelectedMarkerId(item.id === selectedMarkerId ? null : item.id)}>
                      <span className="marker-index">{i + 1}.</span>
                      <span className={`marker-type-icon ${item.type}`}>{item.type === 'tick' ? '✓' : '✕'}</span>
                      <span className="marker-coords">COORD: {Math.round(item.x)}, {Math.round(item.y)}</span>
                    </div>
                    {selectedMarkerId === item.id && (
                      <div className="marker-note-input-wrapper">
                        <textarea 
                          placeholder="Tambahkan catatan khusus untuk bagian ini..."
                          value={item.note}
                          onChange={(e) => handleNoteChange(item.id, e.target.value)}
                          className="marker-textarea"
                          autoFocus
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ));
        })()}
      </div>

      <div className="wireframe-footer">
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
            // Simulasi pengiriman data
            console.log("Exporting markers:", markers);
            alert("✅ Laporan Inspeksi Berhasil Dikirim!");
          }}>
            📩 KIRIM / EXPORT DATA
          </button>
        </div>
      </div>

      {/* MODAL DATA VIEW */}
      {showDataView && (
        <div className="data-view-overlay" onClick={(e) => {
          if (e.target.className === 'data-view-overlay') setShowDataView(false);
        }}>
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
                        <th>Posisi (%)</th>
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
                              sumX: 0,
                              sumY: 0,
                              notes: [] 
                            };
                          }
                          grouped[m.pathId].count++;
                          grouped[m.pathId].sumX += m.relX;
                          grouped[m.pathId].sumY += m.relY;
                          if (m.type === 'cross') grouped[m.pathId].type = 'cross';
                          if (m.note) grouped[m.pathId].notes.push(m.note);
                        });

                        const rows = Object.values(grouped).map(g => ({
                          ...g,
                          avgPos: {
                            x: Math.round(g.sumX / g.count),
                            y: Math.round(g.sumY / g.count)
                          }
                        }));
                        if (rows.length === 0) {
                          return (
                            <tr>
                              <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>
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
                            <td className="coord-cell">
                              {/* Menampilkan rata-rata posisi jika ada banyak tanda, atau tanda pertama */}
                              {panel.avgPos.x}%, {panel.avgPos.y}%
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