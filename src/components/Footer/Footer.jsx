import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FaHeart, FaLinkedin, FaGithub, FaInstagram, FaArrowUp } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  const { t } = useTranslation();

  const socialLinks = [
    { icon: <FaLinkedin />, name: 'LinkedIn', url: 'https://www.linkedin.com/in/raul-gomero-51579630a/' },
    { icon: <FaGithub />, name: 'GitHub', url: 'https://github.com/rsg28' },
    { icon: <FaInstagram />, name: 'Instagram', url: 'https://www.instagram.com/raulsgc/' },
  ];

  const quickLinks = [
    { name: t('nav.home'), to: '/' },
    { name: t('nav.about'), to: '/about' },
    { name: t('nav.skills'), to: '/skills' },
    { name: t('nav.experience'), to: '/experience' },
    { name: t('nav.personal'), to: '/personal' },
    { name: t('nav.projects'), to: '/projects' },
    { name: t('nav.contact'), to: '/contact' },
  ];

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__content">
          <div className="footer__main">
            <motion.div className="footer__brand" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h3 className="footer__logo highlight-text">Raul Gomero</h3>
              <p className="footer__tagline">{t('footer.tagline')}</p>
              <div className="footer__social">
                {socialLinks.map((social) => (
                  <a key={social.name} href={social.url} target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label={social.name}>
                    {social.icon}
                  </a>
                ))}
              </div>
            </motion.div>

            <div className="footer__links">
              <h4 className="footer__links-title">{t('footer.quickLinks')}</h4>
              <ul className="footer__links-list">
                {quickLinks.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="footer__link">{link.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="footer__bottom">
            <p>
              {t('footer.madeWith')} <FaHeart className="footer__heart" /> {t('footer.andCoffee')}
            </p>
            <button type="button" className="footer__scroll-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Top">
              <FaArrowUp />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
