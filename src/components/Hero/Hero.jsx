import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Typed from 'typed.js';
import './Hero.css';

const Hero = () => {
  const { t, i18n } = useTranslation();
  const canvasRef = useRef(null);
  const typedRef = useRef(null);
  const typedInstance = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    const particles = Array.from({ length: 70 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.45 + 0.2,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = i % 2 ? '#2dd4bf' : '#fb923c';
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  useEffect(() => {
    if (!typedRef.current) return;
    if (typedInstance.current) {
      typedInstance.current.destroy();
      typedInstance.current = null;
    }
    typedRef.current.textContent = '';
    const strings = t('hero.rolesList', { returnObjects: true });
    const list = Array.isArray(strings) && strings.length
      ? strings
      : [
          t('hero.roles.builder'),
          t('hero.roles.volleyball'),
          t('hero.roles.trilingual'),
          t('hero.roles.boxer'),
          t('hero.roles.kitchen'),
          t('hero.roles.systems'),
        ];

    typedInstance.current = new Typed(typedRef.current, {
      strings: list,
      typeSpeed: 55,
      backSpeed: 35,
      backDelay: 1800,
      startDelay: 200,
      loop: true,
      smartBackspace: true,
      showCursor: true,
      cursorChar: '|',
    });

    return () => {
      if (typedInstance.current) {
        typedInstance.current.destroy();
        typedInstance.current = null;
      }
    };
  }, [t, i18n.language]);

  useEffect(() => {
    const onMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <section className="hero">
      <canvas ref={canvasRef} className="hero__canvas" />
      <div className="hero__shapes" aria-hidden="true">
        <motion.div
          className="hero__shape hero__shape--circle"
          animate={{ x: mousePosition.x * 0.02, y: mousePosition.y * 0.02 }}
        />
        <motion.div
          className="hero__shape hero__shape--square"
          animate={{ x: mousePosition.x * -0.012, y: mousePosition.y * -0.012 }}
        />
      </div>

      <div className="container">
        <motion.div
          className="hero__content"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="hero__eyebrow stencil-tag">{t('hero.eyebrow')}</p>
          <h1 className="hero__title">
            <span className="highlight-text">{t('hero.name')}</span>
          </h1>

          <div className="hero__subtitle">
            <span className="hero__ima">{t('hero.imA')} </span>
            <span ref={typedRef} className="hero__typed" />
          </div>

          <p className="hero__description">{t('hero.description')}</p>

          <div className="hero__buttons">
            <Link to="/skills" className="btn btn--primary">{t('hero.viewSkills')}</Link>
            <Link to="/experience" className="btn btn--secondary">{t('hero.viewExperience')}</Link>
            <Link to="/projects" className="btn btn--ghost">{t('hero.viewProjects')}</Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
