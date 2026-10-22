import React, { Suspense, useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, ContactShadows } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useTranslation } from 'react-i18next';
import {
  FaMicrochip, FaMemory, FaHdd, FaWifi, FaWindows, FaBolt,
  FaFan, FaLayerGroup, FaCube, FaGamepad,
  FaTimes, FaSearchPlus, FaSearchMinus, FaMousePointer,
  FaCheckCircle, FaExpand, FaCompress
} from 'react-icons/fa';
import cpuImage from '../../assets/components/cpu.jpg';
import gpuImage from '../../assets/components/gpu.jpg';
import moboImage from '../../assets/components/motherboard.jpg';
import ramImage from '../../assets/components/ram.jpg';
import storageImage from '../../assets/components/storage.jpg';
import coolerImage from '../../assets/components/cooler.jpg';
import psuImage from '../../assets/components/psu.jpg';
import caseImage from '../../assets/components/case.jpg';
import wirelessImage from '../../assets/components/wireless.jpg';
import windowsImage from '../../assets/components/windows.jpg';
import './PCBuild.css';

// Assembled vs exploded offsets. Bright readable materials.
const COMPONENTS = [
  {
    id: 'cpu',
    icon: <FaMicrochip />,
    color: '#38bdf8',
    image: cpuImage,
    position: [-0.25, 0.55, -0.35],
    explode: [-1.8, 1.4, 0.8],
    size: [0.5, 0.08, 0.5],
    hotspot: [-0.25, 0.85, -0.1],
  },
  {
    id: 'cooler',
    icon: <FaFan />,
    color: '#67e8f9',
    image: coolerImage,
    position: [-0.25, 0.95, -0.35],
    explode: [-1.8, 2.4, 0.8],
    size: [0.65, 0.55, 0.55],
    hotspot: [-0.25, 1.35, -0.05],
  },
  {
    id: 'motherboard',
    icon: <FaLayerGroup />,
    color: '#4ade80',
    image: moboImage,
    position: [0, 0.35, -0.55],
    explode: [0, 0.4, -1.8],
    size: [2.0, 2.4, 0.06],
    hotspot: [0.85, 1.0, -0.55],
  },
  {
    id: 'ram',
    icon: <FaMemory />,
    color: '#22d3ee',
    image: ramImage,
    position: [0.45, 0.7, -0.35],
    explode: [1.6, 1.5, 0.6],
    size: [0.28, 0.85, 0.12],
    hotspot: [0.45, 1.25, -0.2],
  },
  {
    id: 'gpu',
    icon: <FaGamepad />,
    color: '#a3e635',
    image: gpuImage,
    position: [0, -0.35, -0.15],
    explode: [0, -0.2, 1.6],
    size: [1.9, 0.4, 0.85],
    hotspot: [0.7, -0.35, 0.35],
  },
  {
    id: 'storage',
    icon: <FaHdd />,
    color: '#34d399',
    image: storageImage,
    position: [-0.65, -0.1, -0.48],
    explode: [-2.0, -0.4, 0.4],
    size: [0.55, 0.05, 0.14],
    hotspot: [-0.65, 0.05, -0.35],
  },
  {
    id: 'psu',
    icon: <FaBolt />,
    color: '#fbbf24',
    image: psuImage,
    position: [0, -1.45, -0.2],
    explode: [0, -2.4, 0.4],
    size: [2.2, 0.5, 1.1],
    hotspot: [0.85, -1.45, 0.35],
  },
  {
    id: 'case',
    icon: <FaCube />,
    color: '#e2e8f0',
    image: caseImage,
    position: [0, 0, 0],
    explode: [2.4, 0, -0.6],
    size: null,
    hotspot: [1.25, 1.85, 0.85],
  },
  {
    id: 'wireless',
    icon: <FaWifi />,
    color: '#38bdf8',
    image: wirelessImage,
    position: [0.75, 1.45, -0.55],
    explode: [1.9, 2.3, -0.8],
    size: [0.05, 0.55, 0.05],
    hotspot: [0.75, 1.9, -0.55],
  },
  {
    id: 'os',
    icon: <FaWindows />,
    color: '#60a5fa',
    image: windowsImage,
    position: [0, 0.2, 0.92],
    explode: [0, 0.2, 2.2],
    size: [2.3, 2.8, 0.03],
    hotspot: [0, 0.2, 1.05],
  },
];

function lerpVec(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

function CaseFrame({ explodeT }) {
  // Slide glass panel out when exploding
  const glassX = 1.25 + explodeT * 1.4;
  const leftX = -1.25 - explodeT * 0.4;
  const opacity = 1 - explodeT * 0.55;

  return (
    <group>
      {/* Left metal panel */}
      <mesh position={[leftX, 0, 0]}>
        <boxGeometry args={[0.06, 3.8, 1.9]} />
        <meshStandardMaterial color="#2a3038" metalness={0.75} roughness={0.35} transparent opacity={opacity} />
      </mesh>

      {/* Right tempered glass */}
      <mesh position={[glassX, 0, 0]}>
        <boxGeometry args={[0.04, 3.7, 1.85]} />
        <meshPhysicalMaterial
          color="#7dd3fc"
          metalness={0.05}
          roughness={0.05}
          transmission={0.7}
          transparent
          opacity={0.35}
          thickness={0.4}
        />
      </mesh>

      {/* Top */}
      <mesh position={[0, 1.95, 0]}>
        <boxGeometry args={[2.55, 0.08, 1.9]} />
        <meshStandardMaterial color="#1e2430" metalness={0.8} roughness={0.3} transparent opacity={opacity} />
      </mesh>

      {/* Bottom */}
      <mesh position={[0, -1.95, 0]}>
        <boxGeometry args={[2.55, 0.08, 1.9]} />
        <meshStandardMaterial color="#1e2430" metalness={0.8} roughness={0.3} transparent opacity={opacity} />
      </mesh>

      {/* Back */}
      <mesh position={[0, 0, -0.95]}>
        <boxGeometry args={[2.55, 3.9, 0.06]} />
        <meshStandardMaterial color="#151920" metalness={0.7} roughness={0.4} transparent opacity={opacity} />
      </mesh>

      {/* Front mesh grille */}
      <mesh position={[0, 0, 0.95]}>
        <boxGeometry args={[2.55, 3.9, 0.05]} />
        <meshStandardMaterial color="#0f141c" metalness={0.4} roughness={0.55} transparent opacity={0.75 * opacity} />
      </mesh>

      {/* Front ARGB fans — bright and readable */}
      {[-1.1, 0, 1.1].map((y, i) => {
        const colors = ['#2dd4bf', '#38bdf8', '#fb923c'];
        return (
          <group key={`fan-${i}`} position={[0, y, 0.93]}>
            <mesh>
              <torusGeometry args={[0.32, 0.04, 12, 32]} />
              <meshStandardMaterial
                color={colors[i]}
                emissive={colors[i]}
                emissiveIntensity={1.8}
                toneMapped={false}
              />
            </mesh>
            <mesh>
              <cylinderGeometry args={[0.1, 0.1, 0.04, 20]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function InnerParts({ onPick, activeId, hoveredId, setHoveredId, explodeT }) {
  const makeInteractive = (c) => ({
    onClick: (e) => { e.stopPropagation(); onPick(c.id); },
    onPointerOver: (e) => { e.stopPropagation(); setHoveredId(c.id); document.body.style.cursor = 'pointer'; },
    onPointerOut: () => { setHoveredId(null); document.body.style.cursor = 'default'; },
  });

  const glow = (id, color) => ({
    emissive: activeId === id || hoveredId === id ? color : '#000000',
    emissiveIntensity: activeId === id ? 0.9 : hoveredId === id ? 0.45 : 0,
  });

  const pos = (c) => lerpVec(c.position, c.explode, explodeT);

  return (
    <group>
      {/* Motherboard */}
      {(() => {
        const c = COMPONENTS.find((x) => x.id === 'motherboard');
        const g = glow('motherboard', c.color);
        return (
          <group key="mobo" position={pos(c)} {...makeInteractive(c)}>
            <mesh>
              <boxGeometry args={c.size} />
              <meshStandardMaterial color="#166534" metalness={0.25} roughness={0.55} {...g} />
            </mesh>
            {/* Gold traces hint */}
            <mesh position={[0, 0.6, 0.04]}>
              <boxGeometry args={[1.6, 0.03, 0.01]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[0.5, -0.3, 0.04]}>
              <boxGeometry args={[0.03, 1.2, 0.01]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Chipset heatsink */}
            <mesh position={[-0.5, -0.65, 0.08]}>
              <boxGeometry args={[0.4, 0.35, 0.12]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.25} />
            </mesh>
            {/* PCIe slot */}
            <mesh position={[0, -0.4, 0.05]}>
              <boxGeometry args={[1.5, 0.08, 0.04]} />
              <meshStandardMaterial color="#0f172a" metalness={0.5} roughness={0.4} />
            </mesh>
          </group>
        );
      })()}

      {/* CPU */}
      {(() => {
        const c = COMPONENTS.find((x) => x.id === 'cpu');
        const g = glow('cpu', c.color);
        return (
          <group key="cpu" position={pos(c)} {...makeInteractive(c)}>
            <mesh>
              <boxGeometry args={c.size} />
              <meshStandardMaterial color="#0ea5e9" metalness={0.6} roughness={0.3} {...g} />
            </mesh>
            <mesh position={[0, 0.05, 0]}>
              <boxGeometry args={[0.35, 0.02, 0.35]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.15} />
            </mesh>
          </group>
        );
      })()}

      {/* Cooler */}
      {(() => {
        const c = COMPONENTS.find((x) => x.id === 'cooler');
        const g = glow('cooler', c.color);
        return (
          <group key="cooler" position={pos(c)} {...makeInteractive(c)}>
            <mesh>
              <boxGeometry args={[0.55, 0.35, 0.55]} />
              <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} {...g} />
            </mesh>
            <mesh position={[0, 0.22, 0]}>
              <cylinderGeometry args={[0.22, 0.22, 0.08, 28]} />
              <meshStandardMaterial color="#67e8f9" emissive="#67e8f9" emissiveIntensity={1.4} toneMapped={false} />
            </mesh>
          </group>
        );
      })()}

      {/* RAM sticks */}
      {(() => {
        const c = COMPONENTS.find((x) => x.id === 'ram');
        const g = glow('ram', c.color);
        return (
          <group key="ram" position={pos(c)} {...makeInteractive(c)}>
            {[-0.1, 0.1].map((dx, i) => (
              <group key={i} position={[dx, 0, 0]}>
                <mesh>
                  <boxGeometry args={[0.1, 0.85, 0.1]} />
                  <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.4} {...g} />
                </mesh>
                <mesh position={[0, 0.38, 0.055]}>
                  <boxGeometry args={[0.08, 0.08, 0.02]} />
                  <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={1.5} toneMapped={false} />
                </mesh>
              </group>
            ))}
          </group>
        );
      })()}

      {/* GPU */}
      {(() => {
        const c = COMPONENTS.find((x) => x.id === 'gpu');
        const g = glow('gpu', c.color);
        return (
          <group key="gpu" position={pos(c)} {...makeInteractive(c)}>
            <mesh>
              <boxGeometry args={c.size} />
              <meshStandardMaterial color="#14532d" metalness={0.55} roughness={0.35} {...g} />
            </mesh>
            {/* Brand stripe */}
            <mesh position={[0, 0.21, 0]}>
              <boxGeometry args={[1.7, 0.04, 0.82]} />
              <meshStandardMaterial color="#a3e635" emissive="#a3e635" emissiveIntensity={0.6} toneMapped={false} />
            </mesh>
            {[-0.5, 0.5].map((dx, i) => (
              <mesh key={i} position={[dx, 0.22, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.18, 0.18, 0.03, 24]} />
                <meshStandardMaterial color="#e2e8f0" metalness={0.8} roughness={0.25} />
              </mesh>
            ))}
          </group>
        );
      })()}

      {/* Storage */}
      {(() => {
        const c = COMPONENTS.find((x) => x.id === 'storage');
        const g = glow('storage', c.color);
        return (
          <mesh key="storage" position={pos(c)} {...makeInteractive(c)}>
            <boxGeometry args={c.size} />
            <meshStandardMaterial color="#34d399" metalness={0.5} roughness={0.4} {...g} />
          </mesh>
        );
      })()}

      {/* PSU */}
      {(() => {
        const c = COMPONENTS.find((x) => x.id === 'psu');
        const g = glow('psu', c.color);
        return (
          <group key="psu" position={pos(c)} {...makeInteractive(c)}>
            <mesh>
              <boxGeometry args={c.size} />
              <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.35} {...g} />
            </mesh>
            <mesh position={[0.7, 0, 0.56]}>
              <boxGeometry args={[0.5, 0.2, 0.02]} />
              <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.8} toneMapped={false} />
            </mesh>
          </group>
        );
      })()}

      {/* Wireless antenna */}
      {(() => {
        const c = COMPONENTS.find((x) => x.id === 'wireless');
        const g = glow('wireless', c.color);
        return (
          <mesh key="wireless" position={pos(c)} {...makeInteractive(c)}>
            <cylinderGeometry args={[0.035, 0.035, 0.55, 12]} />
            <meshStandardMaterial color="#38bdf8" metalness={0.6} roughness={0.3} {...g} />
          </mesh>
        );
      })()}

      {/* OS glass marker — only visible when exploded a bit */}
      {(() => {
        const c = COMPONENTS.find((x) => x.id === 'os');
        if (explodeT < 0.15) return null;
        return (
          <mesh key="os" position={pos(c)} {...makeInteractive(c)}>
            <boxGeometry args={c.size} />
            <meshStandardMaterial
              color="#60a5fa"
              emissive="#60a5fa"
              emissiveIntensity={0.5}
              transparent
              opacity={0.35}
              toneMapped={false}
            />
          </mesh>
        );
      })()}
    </group>
  );
}

function Hotspots({ onPick, activeId, hoveredId, setHoveredId, explodeT, t }) {
  return (
    <group>
      {COMPONENTS.map((c) => {
        const isActive = activeId === c.id;
        const isHov = hoveredId === c.id;
        const p = lerpVec(c.hotspot, c.explode.map((v, i) => v + (i === 1 ? 0.4 : 0.2)), explodeT);
        return (
          <group key={`hs-${c.id}`} position={p}>
            <mesh>
              <sphereGeometry args={[isActive || isHov ? 0.11 : 0.08, 20, 20]} />
              <meshBasicMaterial color={c.color} transparent opacity={0.25} depthWrite={false} />
            </mesh>
            <mesh
              onClick={(e) => { e.stopPropagation(); onPick(c.id); }}
              onPointerOver={(e) => { e.stopPropagation(); setHoveredId(c.id); document.body.style.cursor = 'pointer'; }}
              onPointerOut={() => { setHoveredId(null); document.body.style.cursor = 'default'; }}
            >
              <sphereGeometry args={[isActive || isHov ? 0.065 : 0.048, 20, 20]} />
              <meshStandardMaterial
                color={c.color}
                emissive={c.color}
                emissiveIntensity={isActive ? 2.8 : isHov ? 2 : 1.5}
                toneMapped={false}
              />
            </mesh>
            {isHov && (
              <Html center distanceFactor={6} style={{ pointerEvents: 'none' }}>
                <div className="pc__hs-tag" style={{ '--tag': c.color }}>
                  <span className="pc__hs-tag-cat">{t(`pc.components.${c.id}.category`)}</span>
                  <span className="pc__hs-tag-model">{t(`pc.components.${c.id}.model`)}</span>
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}

function Scene({ onPick, activeId, hoveredId, setHoveredId, explodeT, t }) {
  return (
    <>
      <color attach="background" args={['#0e1116']} />
      <ambientLight intensity={0.85} />
      <directionalLight position={[4, 7, 5]} intensity={1.6} />
      <directionalLight position={[-4, 3, -2]} intensity={0.7} color="#fb923c" />
      <pointLight position={[1.5, 0.5, 2]} intensity={1.1} color="#22d3ee" />
      <pointLight position={[-1, -1, 1]} intensity={0.5} color="#a3e635" />

      <Suspense fallback={null}>
        <group rotation={[0, 0.4, 0]} position={[0, -0.1, 0]}>
          <CaseFrame explodeT={explodeT} />
          <InnerParts
            onPick={onPick}
            activeId={activeId}
            hoveredId={hoveredId}
            setHoveredId={setHoveredId}
            explodeT={explodeT}
          />
          <Hotspots
            onPick={onPick}
            activeId={activeId}
            hoveredId={hoveredId}
            setHoveredId={setHoveredId}
            explodeT={explodeT}
            t={t}
          />
        </group>
        <ContactShadows position={[0, -2.15, 0]} opacity={0.45} scale={12} blur={2.5} />
      </Suspense>

      <OrbitControls
        enablePan={false}
        minDistance={3.8}
        maxDistance={10}
        autoRotate={false}
        enableDamping
        dampingFactor={0.08}
      />
    </>
  );
}

const PCBuild = ({ embedded = false }) => {
  const { t } = useTranslation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0,
    rootMargin: '0px 0px -80px 0px',
  });

  const [selectedId, setSelectedId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [imageZoom, setImageZoom] = useState(1);
  const [exploded, setExploded] = useState(false);
  const [explodeT, setExplodeT] = useState(0);

  // Smooth explode animation
  React.useEffect(() => {
    let raf;
    const target = exploded ? 1 : 0;
    const step = () => {
      setExplodeT((prev) => {
        const next = prev + (target - prev) * 0.08;
        if (Math.abs(next - target) < 0.005) return target;
        raf = requestAnimationFrame(step);
        return next;
      });
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [exploded]);

  const selected = useMemo(
    () => COMPONENTS.find((c) => c.id === selectedId) || null,
    [selectedId]
  );

  const openComponent = (id) => {
    setSelectedId(id);
    setImageZoom(1);
  };

  const closeModal = () => {
    setSelectedId(null);
    setImageZoom(1);
  };

  const Wrapper = embedded ? 'div' : 'section';
  const wrapperProps = embedded
    ? { id: 'pc', className: 'pc pc--embedded', ref }
    : { id: 'pc', className: 'pc section', ref };

  return (
    <Wrapper {...wrapperProps}>
      <div className={embedded ? 'pc__inner' : 'container'}>
        <motion.div
          className="pc__content"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
        >
          <div className="pc__header">
            <span className="stencil-tag">{t('pc.tag')}</span>
            <h2 className={embedded ? 'pc__title' : 'section__title'}>{t('pc.title')}</h2>
            <p className={embedded ? 'pc__subtitle' : 'section__subtitle'}>{t('pc.subtitle')}</p>
          </div>

          <div className="pc__toolbar">
            <div className="pc__hint">
              <span className="pc__hint-item"><FaMousePointer /> {t('pc.hints.rotate')}</span>
              <span className="pc__hint-item"><FaSearchPlus /> {t('pc.hints.zoom')}</span>
              <span className="pc__hint-item"><FaCheckCircle /> {t('pc.hints.click')}</span>
            </div>
            <button
              type="button"
              className={`pc__explode-btn ${exploded ? 'pc__explode-btn--on' : ''}`}
              onClick={() => setExploded((v) => !v)}
            >
              {exploded ? <FaCompress /> : <FaExpand />}
              {exploded ? t('pc.assemble') : t('pc.explode')}
            </button>
          </div>

          <div className="pc__stage">
            <div className="pc__canvas-wrap">
              <Canvas
                camera={{ position: [4.8, 2.2, 5.2], fov: 42 }}
                dpr={[1, 1.75]}
                gl={{ antialias: true, alpha: false }}
              >
                <Scene
                  onPick={openComponent}
                  activeId={selectedId}
                  hoveredId={hoveredId}
                  setHoveredId={setHoveredId}
                  explodeT={explodeT}
                  t={t}
                />
              </Canvas>
            </div>

            <aside className="pc__legend">
              <h3 className="pc__legend-title">{t('pc.legendTitle')}</h3>
              <div className="pc__legend-list">
                {COMPONENTS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`pc__legend-item ${selectedId === c.id ? 'pc__legend-item--active' : ''}`}
                    onClick={() => openComponent(c.id)}
                    style={{ '--dot': c.color }}
                    onMouseEnter={() => setHoveredId(c.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <span className="pc__legend-icon" style={{ color: c.color }}>{c.icon}</span>
                    <div className="pc__legend-text">
                      <span className="pc__legend-cat">{t(`pc.components.${c.id}.category`)}</span>
                      <span className="pc__legend-model">{t(`pc.components.${c.id}.model`)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </aside>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            className="pc__modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="pc__modal"
              initial={{ scale: 0.94, opacity: 0, y: 28 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 28 }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
              style={{ '--accent': selected.color }}
            >
              <button className="pc__modal-close" onClick={closeModal} aria-label="Close">
                <FaTimes />
              </button>

              <div className="pc__modal-photo-wrap">
                <div className="pc__modal-photo-frame">
                  <img
                    src={selected.image}
                    alt={t(`pc.components.${selected.id}.model`)}
                    style={{ transform: `scale(${imageZoom})` }}
                  />
                </div>
                <div className="pc__modal-zoom-controls">
                  <button type="button" className="pc__zoom-btn" onClick={() => setImageZoom((z) => Math.max(1, +(z - 0.25).toFixed(2)))}>
                    <FaSearchMinus />
                  </button>
                  <span className="pc__zoom-level">{Math.round(imageZoom * 100)}%</span>
                  <button type="button" className="pc__zoom-btn" onClick={() => setImageZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))}>
                    <FaSearchPlus />
                  </button>
                </div>
              </div>

              <div className="pc__modal-body">
                <div className="pc__modal-cat">
                  <span className="pc__modal-icon" style={{ color: selected.color }}>{selected.icon}</span>
                  <span>{t(`pc.components.${selected.id}.category`)}</span>
                </div>
                <h3 className="pc__modal-model">{t(`pc.components.${selected.id}.model`)}</h3>
                <p className="pc__modal-spec">{t(`pc.components.${selected.id}.spec`)}</p>
                <div className="pc__modal-why">
                  <h4>{t('pc.whyTitle')}</h4>
                  <ul>
                    {(t(`pc.components.${selected.id}.whyLong`, { returnObjects: true }) || []).map((line, i) => (
                      <li key={i}>
                        <FaCheckCircle className="pc__modal-check" style={{ color: selected.color }} />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Wrapper>
  );
};

export default PCBuild;
