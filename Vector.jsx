import React, { useState } from 'react';
import './Vector.css';
import FrontSVG from './suv-front.svg?react';
import BackSVG from './suv-back.svg?react';

const Vector = () => {
  const [view, setView] = useState('front');
  const [markers, setMarkers] = useState({});
  const [hoverName, setHoverName] = useState("");

  const handleAction = (e, type) => {
    // Cari elemen terdekat yang punya ID
    const path = e.target.closest('[id]');
    const excludedIds = ["SUV", "suv-front", "suv-back", "base", "items", "utilities", "base-body", "rear-body"];
    
    if (!path || excludedIds.includes(path.id)) return;

    // Ambil root SVG untuk kalkulasi point
    const svg = path.ownerSVGElement;
    const point = svg.createSVGPoint();
    
    // Dapatkan bounding box lokal
    const bbox = path.getBBox();
    point.x = bbox.x + bbox.width / 2;
    point.y = bbox.y + bbox.height / 2;

    // KONVERSI: Mengubah koordinat lokal menjadi koordinat root SVG
    // Ini akan menghitung otomatis semua 'translate' atau 'transform' yang ada di file SVG
    const transformedPoint = point.matrixTransform(path.getCTM());

    const key = `${view}-${path.id}`;
    setMarkers(prev => ({
      ...prev,
      [key]: { type, x: transformedPoint.x, y: transformedPoint.y }
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
      <p className="subtitle">Klik 1x: ✓ LULUS | Klik 2x: ✕ CACAT</p>

      <div className="main-stage">
        <button className="btn-nav" onClick={() => setView(v => v === 'front' ? 'back' : 'front')}>❮</button>

        <div className="car-card">
          <div className="badge">{view === 'front' ? 'FRONT PANEL' : 'REAR PANEL'}</div>
          
          <div className="svg-container">
            {/* Gambar Mobil (SVG yang di-import) */}
            <CurrentSVG 
              className="car-svg"
              onClick={(e) => handleAction(e, 'tick')}
              onDoubleClick={(e) => handleAction(e, 'cross')}
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
    </div>
  );
};

export default Vector;