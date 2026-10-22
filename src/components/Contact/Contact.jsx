import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useTranslation } from 'react-i18next';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaLinkedin, FaGithub, FaInstagram } from 'react-icons/fa';
import './Contact.css';

const Contact = () => {
  const { t } = useTranslation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const blocks = [
    {
      icon: <FaEnvelope />,
      label: t('contact.contactInfo.email'),
      value: 'rgomero05@gmail.com',
      href: 'mailto:rgomero05@gmail.com',
      accent: '#2dd4bf',
    },
    {
      icon: <FaPhone />,
      label: t('contact.contactInfo.phone'),
      value: '+1 (778) 318-3933',
      href: 'tel:+17783183933',
      accent: '#fb923c',
    },
    {
      icon: <FaMapMarkerAlt />,
      label: t('contact.contactInfo.location'),
      value: t('contact.locationValue'),
      href: null,
      accent: '#fbbf24',
    },
  ];

  const socials = [
    { icon: <FaLinkedin />, name: 'LinkedIn', url: 'https://www.linkedin.com/in/raul-gomero-51579630a/', color: '#0A66C2' },
    { icon: <FaGithub />, name: 'GitHub', url: 'https://github.com/rsg28', color: '#f4f1ea' },
    { icon: <FaInstagram />, name: 'Instagram', url: 'https://www.instagram.com/raulsgc/', color: '#E1306C' },
  ];

  return (
    <section className="contact page-shell page-shell--compact" ref={ref}>
      <div className="contact__noise" aria-hidden="true" />
      <div className="container">
        <motion.div
          className="contact__poster"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <div className="contact__stamp">{t('contact.stamp')}</div>
          <span className="stencil-tag">{t('contact.tag')}</span>
          <h1 className="contact__mega">{t('contact.title')}</h1>
          <p className="contact__lead">{t('contact.subtitle')}</p>
          <p className="contact__copy">{t('contact.infoDescription')}</p>

          <div className="contact__blocks">
            {blocks.map((b) => {
              const inner = (
                <>
                  <span className="contact__block-icon" style={{ color: b.accent }}>{b.icon}</span>
                  <div>
                    <span className="contact__block-label">{b.label}</span>
                    <span className="contact__block-value">{b.value}</span>
                  </div>
                </>
              );
              return b.href ? (
                <a key={b.label} href={b.href} className="contact__block" style={{ '--a': b.accent }}>
                  {inner}
                </a>
              ) : (
                <div key={b.label} className="contact__block" style={{ '--a': b.accent }}>
                  {inner}
                </div>
              );
            })}
          </div>

          <div className="contact__social-row">
            <span className="contact__social-label">{t('contact.followMe')}</span>
            <div className="contact__socials">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact__social"
                  style={{ '--s': s.color }}
                  aria-label={s.name}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <p className="contact__closing">{t('contact.closing')}</p>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
