import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useTranslation } from 'react-i18next';
import { FaDownload } from 'react-icons/fa';

import profileImage from '../../assets/profile.webp';
import './About.css';

const CornerWeb = ({ className }) => (
  <svg className={className} viewBox="0 0 220 220" fill="none" aria-hidden="true">
    <path
      d="M0 0 L220 0 M0 0 L0 220 M0 0 L200 48 M0 0 L180 90 M0 0 L140 140 M0 0 L90 180 M0 0 L48 200"
      stroke="currentColor"
      strokeWidth="1.1"
      opacity="0.55"
    />
    <path
      d="M28 0 Q42 42 0 28 M56 0 Q78 78 0 56 M88 0 Q118 118 0 88 M124 0 Q158 158 0 124 M164 0 Q192 192 0 164"
      stroke="currentColor"
      strokeWidth="1.15"
      fill="none"
      opacity="0.85"
    />
    <circle cx="0" cy="0" r="4" fill="currentColor" opacity="0.7" />
    <circle cx="56" cy="18" r="2.2" fill="currentColor" opacity="0.55" />
    <circle cx="22" cy="64" r="2" fill="currentColor" opacity="0.5" />
    <circle cx="108" cy="42" r="1.8" fill="currentColor" opacity="0.45" />
  </svg>
);

const About = () => {
  const { t } = useTranslation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.12,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 28, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 110, damping: 18 },
    },
  };

  const highlights = t('about.highlights', { returnObjects: true });
  const highlightList = Array.isArray(highlights) ? highlights : [];

  return (
    <section id="about" className="about section page-shell page-shell--compact" ref={ref}>
      <CornerWeb className="about__web about__web--tl" />
      <CornerWeb className="about__web about__web--tr" />
      <CornerWeb className="about__web about__web--bl" />
      <CornerWeb className="about__web about__web--br" />

      <div className="container">
        <motion.div
          className="about__content"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          <motion.div className="about__header" variants={itemVariants}>
            <span className="stencil-tag">{t('about.tag')}</span>
            <h2 className="section__title">{t('about.title')}</h2>
            <p className="section__subtitle about__subtitle">{t('about.subtitle')}</p>
          </motion.div>

          <div className="about__main">
            <motion.div className="about__portrait" variants={itemVariants}>
              <div className="about__image">
                <img src={profileImage} alt="Raul Gomero" />
                <div className="about__image-frame" aria-hidden="true" />
              </div>
              <p className="about__image-caption">{t('about.imageText')}</p>
            </motion.div>

            <div className="about__copy">
              <motion.p variants={itemVariants}>{t('about.description1')}</motion.p>
              <motion.p variants={itemVariants}>{t('about.description2')}</motion.p>
              <motion.p variants={itemVariants}>{t('about.description3')}</motion.p>

              {highlightList.length > 0 && (
                <motion.ul className="about__highlights" variants={itemVariants}>
                  {highlightList.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </motion.ul>
              )}

              <motion.div className="about__actions" variants={itemVariants}>
                <a
                  className="btn btn--primary about__cv-btn"
                  href="/Raul_Gomero_IT_Resume.pdf"
                  download="Raul_Gomero_IT_Resume.pdf"
                >
                  <FaDownload aria-hidden="true" />
                  {t('about.downloadCv')}
                </a>
                <span className="about__cv-note">{t('about.downloadCvNote')}</span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
