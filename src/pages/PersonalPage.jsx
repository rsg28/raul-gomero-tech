import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useTranslation } from 'react-i18next';
import {
  FaFilm, FaFistRaised, FaUtensils, FaGamepad,
  FaDumbbell, FaServer, FaMicrochip, FaGuitar
} from 'react-icons/fa';
import './PersonalPage.css';

// Icon per card
const ICONS = {
  movies: <FaFilm />,
  boxing: <FaFistRaised />,
  kitchen: <FaUtensils />,
  gaming: <FaGamepad />,
  training: <FaDumbbell />,
  homelab: <FaServer />,
  learning: <FaMicrochip />,
  music: <FaGuitar />,
};

/**
 * Marvel Rivals-style card animations. Each card has its own signature
 * motion so hovering feels alive and character-specific.
 */
const CARD_MOTION = {
  movies: {
    // Film reel spool — icon spins gently, thin stripe wipes across
    icon: { rotate: [0, 360] },
    iconT: { duration: 3.4, repeat: Infinity, ease: 'linear' },
    stripe: 'reel',
  },
  boxing: {
    // Dempsey roll — icon weaves left/right, shadow throws jab
    icon: { x: [-4, 6, -6, 4, 0], rotate: [-8, 6, -4, 2, 0] },
    iconT: { duration: 1.1, repeat: Infinity, ease: 'easeInOut' },
    stripe: 'jab',
  },
  kitchen: {
    // Sizzle flame — icon jitters slightly, flame glow flickers
    icon: { y: [0, -2, 1, -1, 0], rotate: [0, 3, -2, 2, 0] },
    iconT: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' },
    stripe: 'flame',
  },
  gaming: {
    // Combo counter — icon pulses like a rapid input, glitch shift
    icon: { scale: [1, 1.15, 0.95, 1.1, 1], rotate: [0, -6, 5, -3, 0] },
    iconT: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' },
    stripe: 'combo',
  },
  training: {
    // Rep counter — icon lifts and drops like a rep
    icon: { y: [0, -8, 0, -6, 0] },
    iconT: { duration: 1.3, repeat: Infinity, ease: 'easeInOut' },
    stripe: 'rep',
  },
  homelab: {
    // Server rack — LEDs blink in rhythm, icon subtly hums
    icon: { scale: [1, 1.05, 1] },
    iconT: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' },
    stripe: 'led',
  },
  learning: {
    // Debug cursor — icon has a pulsing halo, chip taps
    icon: { rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] },
    iconT: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
    stripe: 'chip',
  },
  music: {
    // Strum — icon rocks gently like being played
    icon: { rotate: [0, -6, 4, -3, 0] },
    iconT: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' },
    stripe: 'strings',
  },
};

const stripeContent = (kind) => {
  switch (kind) {
    case 'reel':
      return <span className="personal__stripe personal__stripe--reel" aria-hidden="true" />;
    case 'speed':
      return (
        <span className="personal__stripe personal__stripe--speed" aria-hidden="true">
          <i /><i /><i /><i />
        </span>
      );
    case 'jab':
      return <span className="personal__stripe personal__stripe--jab" aria-hidden="true" />;
    case 'flame':
      return (
        <span className="personal__stripe personal__stripe--flame" aria-hidden="true">
          <i /><i /><i />
        </span>
      );
    case 'combo':
      return (
        <span className="personal__stripe personal__stripe--combo" aria-hidden="true">
          <b>×3</b><b>×5</b><b>×8</b>
        </span>
      );
    case 'rep':
      return (
        <span className="personal__stripe personal__stripe--rep" aria-hidden="true">
          <b>1</b><b>2</b><b>3</b><b>4</b>
        </span>
      );
    case 'led':
      return (
        <span className="personal__stripe personal__stripe--led" aria-hidden="true">
          <i /><i /><i /><i /><i />
        </span>
      );
    case 'chip':
      return <span className="personal__stripe personal__stripe--chip" aria-hidden="true" />;
    case 'strings':
      return (
        <span className="personal__stripe personal__stripe--strings" aria-hidden="true">
          <i /><i /><i /><i /><i /><i />
        </span>
      );
    default:
      return null;
  }
};

const PersonalCard = ({ card, i, inView }) => {
  const [hovered, setHovered] = useState(false);
  const motionSpec = CARD_MOTION[card.id] || {};
  const icon = ICONS[card.icon] || <FaFilm />;

  return (
    <motion.article
      className={`personal__card personal__card--${card.id}`}
      style={{ '--accent': card.color || '#2dd4bf' }}
      initial={{ opacity: 0, y: 26 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: 0.06 * i, duration: 0.45 }}
      whileHover={{
        y: -6,
        boxShadow: `10px 12px 0 rgba(0,0,0,0.5), 0 0 32px ${card.color}55`,
      }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <div className="personal__card-ambient" aria-hidden="true" />
      <div className="personal__card-header">
        <span className="personal__card-idx">{String(i + 1).padStart(2, '0')}</span>
        <motion.div
          className="personal__card-icon"
          animate={hovered ? motionSpec.icon : {}}
          transition={hovered ? motionSpec.iconT : { duration: 0.2 }}
        >
          {icon}
        </motion.div>
      </div>

      <h3 className="personal__card-title">{card.title}</h3>
      <p className="personal__card-body">{card.body}</p>

      <AnimatePresence>
        {hovered && (
          <motion.div
            className="personal__card-fx"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {stripeContent(motionSpec.stripe)}
          </motion.div>
        )}
      </AnimatePresence>

      <span className="personal__card-corner" aria-hidden="true" />
    </motion.article>
  );
};

const PersonalPage = () => {
  const { t } = useTranslation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.05 });
  const cards = t('personal.cards', { returnObjects: true }) || [];

  return (
    <div className="personal page-shell" ref={ref}>
      <div className="container">
        <motion.header
          className="personal__header"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
        >
          <span className="stencil-tag">{t('personal.tag')}</span>
          <h1 className="section__title">{t('personal.title')}</h1>
          <p className="section__subtitle">{t('personal.subtitle')}</p>
        </motion.header>

        <div className="personal__grid">
          {(Array.isArray(cards) ? cards : []).map((card, i) => (
            <PersonalCard key={card.id || i} card={card} i={i} inView={inView} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PersonalPage;
