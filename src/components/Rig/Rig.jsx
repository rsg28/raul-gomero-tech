import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useTranslation } from 'react-i18next';
import {
  FaMicrochip, FaMemory, FaHdd, FaWifi, FaWindows, FaBolt,
  FaSnowflake, FaLayerGroup, FaCube, FaTimes, FaCheckCircle,
  FaGamepad
} from 'react-icons/fa';
import './Rig.css';

const Rig = () => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(null);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const components = [
    { id: 'cpu',         icon: <FaMicrochip />,   color: '#0071C5', accent: 'rgba(0,113,197,0.18)' },
    { id: 'gpu',         icon: <FaGamepad />,     color: '#76B900', accent: 'rgba(118,185,0,0.18)' },
    { id: 'motherboard', icon: <FaLayerGroup />,  color: '#A78BFA', accent: 'rgba(167,139,250,0.18)' },
    { id: 'ram',         icon: <FaMemory />,      color: '#22D3EE', accent: 'rgba(34,211,238,0.18)' },
    { id: 'storage',     icon: <FaHdd />,         color: '#34D399', accent: 'rgba(52,211,153,0.18)' },
    { id: 'cooler',      icon: <FaSnowflake />,   color: '#60A5FA', accent: 'rgba(96,165,250,0.18)' },
    { id: 'psu',         icon: <FaBolt />,        color: '#F59E0B', accent: 'rgba(245,158,11,0.18)' },
    { id: 'case',        icon: <FaCube />,        color: '#94A3B8', accent: 'rgba(148,163,184,0.18)' },
    { id: 'wireless',    icon: <FaWifi />,        color: '#38BDF8', accent: 'rgba(56,189,248,0.18)' },
    { id: 'os',          icon: <FaWindows />,     color: '#0078D4', accent: 'rgba(0,120,212,0.18)' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { delayChildren: 0.2, staggerChildren: 0.08 } }
  };
  const itemVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 90 } }
  };
  const cardVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 110 } }
  };

  return (
    <section id="rig" className="rig section" ref={ref}>
      <div className="container">
        <motion.div
          className="rig__content"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          <motion.div className="rig__header" variants={itemVariants}>
            <h2 className="section__title">{t('rig.title')}</h2>
            <p className="section__subtitle">{t('rig.subtitle')}</p>
          </motion.div>

          {/* Build Hero */}
          <motion.div className="rig__hero" variants={itemVariants}>
            <div className="rig__hero-glow" />
            <div className="rig__hero-inner">
              <div className="rig__hero-left">
                <span className="rig__hero-tag">{t('rig.buildTag')}</span>
                <h3 className="rig__hero-name">{t('rig.buildName')}</h3>
                <h4 className="rig__hero-story-title">{t('rig.story.title')}</h4>
                <p className="rig__hero-story-text">{t('rig.story.text')}</p>
              </div>
              <div className="rig__hero-right">
                <span className="rig__hero-stats-title">{t('rig.story.quickStats')}</span>
                <div className="rig__hero-stats">
                  {components.map((c) => (
                    <div
                      key={c.id}
                      className="rig__stat"
                      style={{ borderColor: c.accent }}
                    >
                      <span className="rig__stat-icon" style={{ color: c.color, background: c.accent }}>{c.icon}</span>
                      <div className="rig__stat-text">
                        <span className="rig__stat-label">{t(`rig.components.${c.id}.category`)}</span>
                        <span className="rig__stat-value">{t(`rig.components.${c.id}.model`)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.p className="rig__click-prompt" variants={itemVariants}>
            <span className="rig__click-prompt-dot" />
            {t('rig.story.clickPrompt')}
          </motion.p>

          {/* Component Cards */}
          <motion.div className="rig__grid" variants={itemVariants}>
            {components.map((c) => (
              <motion.button
                key={c.id}
                type="button"
                className="rig__card"
                variants={cardVariants}
                whileHover={{ y: -6, scale: 1.02 }}
                onClick={() => setSelected(c)}
                style={{ '--rig-card-color': c.color, '--rig-card-accent': c.accent }}
              >
                <div className="rig__card-top">
                  <span className="rig__card-icon">{c.icon}</span>
                  <span className="rig__card-category">{t(`rig.components.${c.id}.category`)}</span>
                </div>
                <h4 className="rig__card-model">{t(`rig.components.${c.id}.model`)}</h4>
                <p className="rig__card-spec">{t(`rig.components.${c.id}.spec`)}</p>
                <p className="rig__card-why">{t(`rig.components.${c.id}.whyShort`)}</p>
                <span className="rig__card-cta">{t('rig.modal.whyTitle')} →</span>
              </motion.button>
            ))}
          </motion.div>
        </motion.div>

        {/* Modal */}
        <AnimatePresence>
          {selected && (
            <motion.div
              className="rig__modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
            >
              <motion.div
                className="rig__modal"
                initial={{ y: 40, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 40, opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                onClick={(e) => e.stopPropagation()}
                style={{ '--rig-card-color': selected.color, '--rig-card-accent': selected.accent }}
              >
                <button
                  type="button"
                  className="rig__modal-close"
                  onClick={() => setSelected(null)}
                  aria-label={t('rig.modal.closeLabel')}
                >
                  <FaTimes />
                </button>

                <div className="rig__modal-head">
                  <span className="rig__modal-icon">{selected.icon}</span>
                  <div>
                    <span className="rig__modal-category">{t(`rig.components.${selected.id}.category`)}</span>
                    <h3 className="rig__modal-title">{t(`rig.components.${selected.id}.model`)}</h3>
                    <p className="rig__modal-spec">
                      <strong>{t('rig.modal.specLabel')}: </strong>
                      {t(`rig.components.${selected.id}.spec`)}
                    </p>
                  </div>
                </div>

                <h4 className="rig__modal-why-title">{t('rig.modal.whyTitle')}</h4>
                <ul className="rig__modal-why-list">
                  {(t(`rig.components.${selected.id}.whyLong`, { returnObjects: true }) || []).map((reason, idx) => (
                    <li key={idx} className="rig__modal-why-item">
                      <FaCheckCircle className="rig__modal-check" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Rig;
