import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useTranslation } from 'react-i18next';
import './Experience.css';

const START_YEAR = 2020;
const END_YEAR = 2026;
const YEARS = [2020, 2021, 2022, 2023, 2024, 2025, 2026];
const TOTAL_MONTHS = (END_YEAR - START_YEAR + 1) * 12; // 84

const EVENTS = [
  // Education pinned at the top so the early years read as school + first projects
  { id: 'sfu',                category: 'education', start: '2020-09', end: '2025-06' },
  { id: 'comptia',            category: 'education', start: '2025-06', end: '2026-08' },
  // Early hackathon + coursework projects fill 2022–2024
  { id: 'mountainMadness',    category: 'hackathon', start: '2022-11', end: '2022-11' },
  { id: 'surge',              category: 'work',      start: '2023-01', end: '2024-05' },
  { id: 'canineXray',         category: 'education', start: '2024-02', end: '2024-04' },
  { id: 'personalAutomation', category: 'personal',  start: '2024-01', end: '2026-08' },
  // 2025
  { id: 'spikeConnect',       category: 'hackathon', start: '2025-02', end: '2025-02' },
  { id: 'grupoFj',            category: 'work',      start: '2025-01', end: '2025-05' },
  { id: 'elContador',         category: 'work',      start: '2025-03', end: '2025-07' },
  { id: 'ganpi',              category: 'hackathon', start: '2025-10', end: '2025-10' },
  { id: 'pcBuild',            category: 'personal',  start: '2025-06', end: '2026-08' },
  // 2026 — current gigs + shipped studio projects
  { id: 'tuSalud',            category: 'work',      start: '2026-01', end: '2026-08' },
  { id: 'secuApp',            category: 'work',      start: '2026-02', end: '2026-08' },
  { id: 'lineCook',           category: 'work',      start: '2026-03', end: '2026-08' },
  { id: 'pcWatchdog',         category: 'personal',  start: '2026-05', end: '2026-08' },
  { id: 'jarvis',             category: 'personal',  start: '2024-01', end: '2026-08' },
];

const monthsFromStart = (dateStr) => {
  const [y, m] = dateStr.split('-').map(Number);
  return (y - START_YEAR) * 12 + (m - 1);
};

const barStyle = (e) => {
  const startM = monthsFromStart(e.start);
  const endM = monthsFromStart(e.end) + 1;
  const durationM = endM - startM;
  const left = (startM / TOTAL_MONTHS) * 100;
  const width = (durationM / TOTAL_MONTHS) * 100;
  return {
    left: `${left}%`,
    width: `${Math.max(width, 1.2)}%`,
    isPoint: durationM <= 1,
  };
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { delayChildren: 0.2, staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 }
  }
};

const Experience = () => {
  const { t } = useTranslation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0,
    rootMargin: '0px 0px -100px 0px',
  });

  return (
    <section id="experience" className="experience section page-shell" ref={ref}>
      <div className="container">
        <motion.div
          className="experience__content"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          <motion.div className="experience__header" variants={itemVariants}>
            <h2 className="section__title">{t('experience.title')}</h2>
            <p className="section__subtitle">{t('experience.subtitle')}</p>
          </motion.div>

          <motion.div className="experience__panel" variants={itemVariants}>
            <div className="experience__legend">
              <span className="experience__legend-item experience__legend-item--work">{t('experience.types.work')}</span>
              <span className="experience__legend-item experience__legend-item--hackathon">{t('experience.types.hackathon')}</span>
              <span className="experience__legend-item experience__legend-item--education">{t('experience.types.education')}</span>
              <span className="experience__legend-item experience__legend-item--personal">{t('experience.types.personal')}</span>
            </div>

            <div className="experience__gantt">
              <div className="experience__gantt-axis">
                <div aria-hidden="true"></div>
                <div className="experience__gantt-axis-years">
                  {YEARS.map((y) => (
                    <div key={y} className="experience__gantt-year">{y}</div>
                  ))}
                </div>
              </div>

              <div className="experience__gantt-rows">
                {EVENTS.map((e) => {
                  const s = barStyle(e);
                  return (
                    <motion.div
                      key={e.id}
                      className={`experience__gantt-row experience__gantt-row--${e.category}`}
                      variants={itemVariants}
                      whileHover={{ x: 3 }}
                    >
                      <div className="experience__gantt-label">
                        <span className="experience__gantt-tag">{t(`experience.types.${e.category}`)}</span>
                        <h4 className="experience__gantt-role">{t(`experience.entries.${e.id}Role`)}</h4>
                        <p className="experience__gantt-org">{t(`experience.entries.${e.id}Org`)}</p>
                        <p className="experience__gantt-dates">{t(`experience.entries.${e.id}Dates`)}</p>
                      </div>
                      <div className="experience__gantt-track">
                        {YEARS.map((y) => (
                          <div
                            key={y}
                            className="experience__gantt-gridline"
                            style={{ left: `${((y - START_YEAR) / YEARS.length) * 100}%` }}
                          />
                        ))}
                        <div
                          className={`experience__gantt-bar ${s.isPoint ? 'experience__gantt-bar--point' : ''}`}
                          style={{ left: s.left, width: s.width }}
                          title={t(`experience.entries.${e.id}Dates`)}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Experience;
