import React, { useState, useEffect, useRef } from 'react';

// Coordonnées du tracé ferroviaire officiel Avignon Centre - Narbonne
// Passant par les gares principales : Tarascon, Arles, Nîmes, Montpellier, Sète, Agde, Béziers
const railwayPath = [
  { lat: 43.9420, lng: 4.8057, name: "Avignon Centre" },
  { lat: 43.8059, lng: 4.6600, name: "Tarascon" },
  { lat: 43.6766, lng: 4.6314, name: "Arles" },
  { lat: 43.8328, lng: 4.3642, name: "Nîmes" },
  { lat: 43.6760, lng: 4.1378, name: "Lunel" },
  { lat: 43.6047, lng: 3.8807, name: "Montpellier" },
  { lat: 43.4096, lng: 3.6962, name: "Sète" },
  { lat: 43.3110, lng: 3.4758, name: "Agde" },
  { lat: 43.3447, lng: 3.2170, name: "Béziers" },
  { lat: 43.1858, lng: 2.9967, name: "Narbonne" }
];

// Convertir lat/lng en coordonnées SVG (projection simple pour cette région)
const projectToSVG = (lat, lng, bounds, width, height) => {
  const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * width;
  const y = height - ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * height;
  return { x, y };
};

export default function TrainRouteAnimation() {
  const [progress, setProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const svgRef = useRef(null);
  
  const width = 900;
  const height = 500;
  const padding = 60;
  
  // Calculer les limites de la carte avec padding
  const bounds = {
    minLat: Math.min(...railwayPath.map(p => p.lat)) - 0.15,
    maxLat: Math.max(...railwayPath.map(p => p.lat)) + 0.15,
    minLng: Math.min(...railwayPath.map(p => p.lng)) - 0.2,
    maxLng: Math.max(...railwayPath.map(p => p.lng)) + 0.2
  };
  
  // Projeter tous les points
  const projectedPoints = railwayPath.map(point => ({
    ...projectToSVG(point.lat, point.lng, bounds, width - padding * 2, height - padding * 2),
    name: point.name
  })).map(p => ({ ...p, x: p.x + padding, y: p.y + padding }));
  
  // Créer le path SVG
  const pathD = projectedPoints.reduce((acc, point, i) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    return `${acc} L ${point.x} ${point.y}`;
  }, '');
  
  // Calculer la longueur totale du chemin
  const [pathLength, setPathLength] = useState(1500);
  
  useEffect(() => {
    if (svgRef.current) {
      const path = svgRef.current.querySelector('.railway-line');
      if (path) {
        setPathLength(path.getTotalLength());
      }
    }
  }, []);
  
  // Animation
  useEffect(() => {
    if (!isAnimating) return;
    
    const duration = 4000;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(elapsed / duration, 1);
      setProgress(newProgress);
      
      if (newProgress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [isAnimating]);
  
  const resetAnimation = () => {
    setProgress(0);
    setIsAnimating(false);
    setTimeout(() => setIsAnimating(true), 100);
  };
  
  // Point animé le long du tracé
  const currentPointIndex = Math.floor(progress * (projectedPoints.length - 1));
  const nextPointIndex = Math.min(currentPointIndex + 1, projectedPoints.length - 1);
  const localProgress = (progress * (projectedPoints.length - 1)) % 1;
  
  const trainX = projectedPoints[currentPointIndex].x + 
    (projectedPoints[nextPointIndex].x - projectedPoints[currentPointIndex].x) * localProgress;
  const trainY = projectedPoints[currentPointIndex].y + 
    (projectedPoints[nextPointIndex].y - projectedPoints[currentPointIndex].y) * localProgress;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fef9f3 0%, #fdf6ee 50%, #fef3e8 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: "'Crimson Text', Georgia, serif"
    }}>
      {/* Titre */}
      <div style={{
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '400',
          color: '#3d3d3d',
          letterSpacing: '0.1em',
          marginBottom: '0.5rem',
          textTransform: 'uppercase'
        }}>
          Ligne Ferroviaire
        </h1>
        <p style={{
          fontSize: '1.2rem',
          color: '#8b7355',
          fontStyle: 'italic',
          letterSpacing: '0.05em'
        }}>
          Avignon Centre — Narbonne
        </p>
      </div>
      
      {/* Carte */}
      <div style={{
        background: '#fdfbf7',
        borderRadius: '8px',
        boxShadow: '0 4px 30px rgba(139, 115, 85, 0.15)',
        padding: '1.5rem',
        position: 'relative',
        border: '1px solid #ebe4d8'
      }}>
        <svg
          ref={svgRef}
          width={width}
          height={height}
          style={{ display: 'block' }}
        >
          {/* Fond de carte pastel */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e8e2d5" strokeWidth="0.5"/>
            </pattern>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#c73b3b"/>
              <stop offset="100%" stopColor="#a02828"/>
            </linearGradient>
          </defs>
          
          {/* Fond */}
          <rect width={width} height={height} fill="#fdfbf7"/>
          <rect width={width} height={height} fill="url(#grid)" opacity="0.6"/>
          
          {/* Zones géographiques stylisées (Méditerranée en bas) */}
          <ellipse 
            cx={width / 2} 
            cy={height + 150} 
            rx={width * 0.8} 
            ry={200} 
            fill="#d4e5ed" 
            opacity="0.4"
          />
          
          {/* Ligne de tracé (fond gris pour montrer le chemin complet) */}
          <path
            d={pathD}
            fill="none"
            stroke="#d9d4cb"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Ligne animée rouge */}
          <path
            className="railway-line"
            d={pathD}
            fill="none"
            stroke="url(#redGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={pathLength}
            strokeDashoffset={pathLength * (1 - progress)}
            filter="url(#glow)"
          />
          
          {/* Gares intermédiaires (petits points) */}
          {projectedPoints.slice(1, -1).map((point, i) => (
            <g key={i}>
              <circle
                cx={point.x}
                cy={point.y}
                r="5"
                fill={progress > (i + 1) / (projectedPoints.length - 1) ? '#c73b3b' : '#d9d4cb'}
                stroke="#fdfbf7"
                strokeWidth="2"
                style={{
                  transition: 'fill 0.3s ease'
                }}
              />
              <text
                x={point.x}
                y={point.y - 12}
                textAnchor="middle"
                fill="#8b7355"
                fontSize="11"
                fontFamily="'Crimson Text', Georgia, serif"
                opacity={progress > (i + 1) / (projectedPoints.length - 1) ? 1 : 0.4}
                style={{
                  transition: 'opacity 0.3s ease'
                }}
              >
                {point.name}
              </text>
            </g>
          ))}
          
          {/* Gare de départ - Avignon Centre */}
          <g>
            <circle
              cx={projectedPoints[0].x}
              cy={projectedPoints[0].y}
              r="12"
              fill="#c73b3b"
              stroke="#fdfbf7"
              strokeWidth="3"
              filter="url(#glow)"
            />
            <circle
              cx={projectedPoints[0].x}
              cy={projectedPoints[0].y}
              r="5"
              fill="#fdfbf7"
            />
            <text
              x={projectedPoints[0].x}
              y={projectedPoints[0].y - 20}
              textAnchor="middle"
              fill="#3d3d3d"
              fontSize="14"
              fontWeight="600"
              fontFamily="'Crimson Text', Georgia, serif"
            >
              Avignon Centre
            </text>
          </g>
          
          {/* Gare d'arrivée - Narbonne */}
          <g>
            <circle
              cx={projectedPoints[projectedPoints.length - 1].x}
              cy={projectedPoints[projectedPoints.length - 1].y}
              r="12"
              fill={progress >= 1 ? '#c73b3b' : '#d9d4cb'}
              stroke="#fdfbf7"
              strokeWidth="3"
              filter={progress >= 1 ? 'url(#glow)' : 'none'}
              style={{
                transition: 'fill 0.5s ease'
              }}
            />
            <circle
              cx={projectedPoints[projectedPoints.length - 1].x}
              cy={projectedPoints[projectedPoints.length - 1].y}
              r="5"
              fill="#fdfbf7"
            />
            <text
              x={projectedPoints[projectedPoints.length - 1].x}
              y={projectedPoints[projectedPoints.length - 1].y - 20}
              textAnchor="middle"
              fill="#3d3d3d"
              fontSize="14"
              fontWeight="600"
              fontFamily="'Crimson Text', Georgia, serif"
            >
              Narbonne
            </text>
          </g>
          
          {/* Train animé */}
          {progress < 1 && (
            <g>
              <circle
                cx={trainX}
                cy={trainY}
                r="8"
                fill="#a02828"
                filter="url(#glow)"
              >
                <animate
                  attributeName="r"
                  values="7;9;7"
                  dur="0.8s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle
                cx={trainX}
                cy={trainY}
                r="4"
                fill="#fdfbf7"
              />
            </g>
          )}
          
          {/* Légende */}
          <g transform={`translate(${width - 140}, ${height - 80})`}>
            <rect
              x="-10"
              y="-10"
              width="130"
              height="70"
              fill="#fdfbf7"
              stroke="#ebe4d8"
              rx="4"
              opacity="0.9"
            />
            <circle cx="10" cy="12" r="6" fill="#c73b3b"/>
            <text x="25" y="16" fill="#5c5c5c" fontSize="11" fontFamily="'Crimson Text', Georgia, serif">
              Gare principale
            </text>
            <line x1="5" y1="35" x2="35" y2="35" stroke="#c73b3b" strokeWidth="3"/>
            <text x="45" y="39" fill="#5c5c5c" fontSize="11" fontFamily="'Crimson Text', Georgia, serif">
              Tracé TER
            </text>
          </g>
        </svg>
      </div>
      
      {/* Bouton de replay */}
      <button
        onClick={resetAnimation}
        style={{
          marginTop: '2rem',
          padding: '0.8rem 2rem',
          fontSize: '1rem',
          fontFamily: "'Crimson Text', Georgia, serif",
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          background: progress >= 1 ? '#c73b3b' : 'transparent',
          color: progress >= 1 ? '#fff' : '#8b7355',
          border: progress >= 1 ? 'none' : '1px solid #8b7355',
          borderRadius: '4px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          opacity: progress >= 1 ? 1 : 0.6
        }}
        onMouseOver={(e) => {
          if (progress >= 1) {
            e.target.style.background = '#a02828';
          }
        }}
        onMouseOut={(e) => {
          if (progress >= 1) {
            e.target.style.background = '#c73b3b';
          }
        }}
      >
        {progress >= 1 ? '↻ Rejouer l\'animation' : 'En cours...'}
      </button>
      
      {/* Information sur le trajet */}
      <p style={{
        marginTop: '1.5rem',
        color: '#8b7355',
        fontSize: '0.95rem',
        fontStyle: 'italic',
        textAlign: 'center',
        maxWidth: '500px'
      }}>
        Ligne TER Occitanie • Environ 160 km • 9 gares desservies
      </p>
    </div>
  );
}
