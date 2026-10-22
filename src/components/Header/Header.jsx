import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FaCode } from 'react-icons/fa';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import './Header.css';

const Header = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const navItems = [
    { name: t('nav.home'), to: '/' },
    { name: t('nav.about'), to: '/about' },
    { name: t('nav.skills'), to: '/skills' },
    { name: t('nav.experience'), to: '/experience' },
    { name: t('nav.personal'), to: '/personal' },
    { name: t('nav.projects'), to: '/projects' },
    { name: t('nav.contact'), to: '/contact' },
  ];

  return (
    <motion.header
      className={`header ${isScrolled ? 'header--scrolled' : ''}`}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55 }}
    >
      <div className="container">
        <nav className="nav">
          <Link to="/" className="nav__logo">
            <span className="nav__logo-icon"><FaCode /></span>
            <span>RG</span>
          </Link>

          <ul className={`nav__menu ${isMobileMenuOpen ? 'nav__menu--open' : ''}`}>
            {navItems.map((item) => (
              <li key={item.to} className="nav__item">
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) => `nav__link ${isActive ? 'nav__link--active' : ''}`}
                >
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="nav__actions">
            <LanguageSwitcher />
            <button
              type="button"
              className={`nav__burger ${isMobileMenuOpen ? 'nav__burger--open' : ''}`}
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              aria-label="Menu"
            >
              <span /><span /><span />
            </button>
          </div>
        </nav>
      </div>
    </motion.header>
  );
};

export default Header;
