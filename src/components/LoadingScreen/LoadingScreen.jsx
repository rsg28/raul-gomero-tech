import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './LoadingScreen.css';

const LINES = [
  { text: 'ARMOURY BIOS v1.0 — Copyright (C) 2026 Raul Gomero', delay: 0 },
  { text: 'CPU: Intel Core Ultra 7 265KF @ 5.50GHz', delay: 280 },
  { text: 'Memory Test: 32768MB OK', delay: 560 },
  { text: 'Storage: 2TB NVMe SSD detected', delay: 820 },
  { text: 'GPU: NVIDIA GeForce RTX 5060 Ti', delay: 1080 },
  { text: 'Network: Wi-Fi 7 + Bluetooth 5.4', delay: 1320 },
  { text: 'CompTIA A+ Core 1 study profile loaded', delay: 1580 },
  { text: 'Booting Windows 11 Pro...', delay: 1840 },
  { text: 'Portfolio READY.', delay: 2200 },
];

const LoadingScreen = ({ onLoadingComplete }) => {
  const [visibleCount, setVisibleCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const timers = LINES.map((line, i) =>
      setTimeout(() => setVisibleCount(i + 1), line.delay)
    );
    const done = setTimeout(() => {
      setIsComplete(true);
      setTimeout(onLoadingComplete, 500);
    }, 2800);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(done);
    };
  }, [onLoadingComplete]);

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          className="bios"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="bios__scanlines" aria-hidden="true" />
          <div className="bios__panel">
            <p className="bios__brand">RG SYSTEMS</p>
            <div className="bios__lines">
              {LINES.slice(0, visibleCount).map((line, i) => (
                <p key={i} className={`bios__line ${i === LINES.length - 1 ? 'bios__line--ok' : ''}`}>
                  {i < LINES.length - 2 ? (
                    <>
                      <span className="bios__ok">[OK]</span> {line.text}
                    </>
                  ) : (
                    line.text
                  )}
                </p>
              ))}
              {visibleCount < LINES.length && (
                <span className="bios__cursor" aria-hidden="true">█</span>
              )}
            </div>
            <p className="bios__hint">Press any key to skip · POST in progress</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
