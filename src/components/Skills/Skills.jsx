import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useTranslation } from 'react-i18next';
import {
  FaReact, FaJs, FaHtml5, FaNode, FaAws, FaDocker,
  FaPython, FaDatabase, FaCode, FaPlug, FaBrain, FaWindows,
  FaLinux, FaNetworkWired, FaGithub, FaLanguage, FaMicrochip, FaTerminal
} from 'react-icons/fa';
import {
  SiTypescript, SiNextdotjs, SiTailwindcss, SiPostgresql, SiFirebase,
  SiTensorflow, SiCplusplus, SiC, SiExpress, SiMongodb, SiVmware
} from 'react-icons/si';
import './Skills.css';

const Skills = () => {
  const { t } = useTranslation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.05,
  });

  const [animated, setAnimated] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);

  const skills = [
    { name: 'Python', icon: <FaPython />, color: '#3776AB', descriptionKey: 'python' },
    { name: 'JavaScript', icon: <FaJs />, color: '#F7DF1E', descriptionKey: 'javascript' },
    { name: 'TypeScript', icon: <SiTypescript />, color: '#3178C6', descriptionKey: 'typescript' },
    { name: 'C++', icon: <SiCplusplus />, color: '#00599C', descriptionKey: 'cpp' },
    { name: 'C', icon: <SiC />, color: '#A8B9CC', descriptionKey: 'c' },
    { name: 'SQL', icon: <FaDatabase />, color: '#336791', descriptionKey: 'sql' },
    { name: 'Node.js', icon: <FaNode />, color: '#339933', descriptionKey: 'nodejs' },
    { name: 'Express.js', icon: <SiExpress />, color: '#94A3B8', descriptionKey: 'expressjs' },
    { name: 'REST APIs', icon: <FaPlug />, color: '#22D3EE', descriptionKey: 'restApis' },
    { name: 'PostgreSQL', icon: <SiPostgresql />, color: '#336791', descriptionKey: 'postgresql' },
    { name: 'MongoDB', icon: <SiMongodb />, color: '#47A248', descriptionKey: 'mongodb' },
    { name: 'Firebase', icon: <SiFirebase />, color: '#FFCA28', descriptionKey: 'firebase' },
    { name: 'React', icon: <FaReact />, color: '#61DAFB', descriptionKey: 'react' },
    { name: 'React Native', icon: <FaReact />, color: '#61DAFB', descriptionKey: 'reactNative' },
    { name: 'Next.js', icon: <SiNextdotjs />, color: '#E2E8F0', descriptionKey: 'nextjs' },
    { name: 'HTML / CSS', icon: <FaHtml5 />, color: '#E34F26', descriptionKey: 'htmlcss' },
    { name: 'Tailwind CSS', icon: <SiTailwindcss />, color: '#06B6D4', descriptionKey: 'tailwindcss' },
    { name: 'AWS (EC2, S3, Route 53, IAM)', icon: <FaAws />, color: '#FF9900', descriptionKey: 'aws' },
    { name: 'Docker', icon: <FaDocker />, color: '#2496ED', descriptionKey: 'docker' },
    { name: 'Git & GitHub', icon: <FaGithub />, color: '#F4F1EA', descriptionKey: 'git' },
    { name: 'CI/CD Basics', icon: <FaTerminal />, color: '#22D3EE', descriptionKey: 'cicd' },
    { name: 'Windows 11 (Pro / BIOS / UEFI)', icon: <FaWindows />, color: '#0078D4', descriptionKey: 'windows' },
    { name: 'Linux (CLI, scripting)', icon: <FaLinux />, color: '#FCC624', descriptionKey: 'linux' },
    { name: 'PC Hardware & Build', icon: <FaMicrochip />, color: '#FB923C', descriptionKey: 'hardware' },
    { name: 'Virtualization (VMware, VirtualBox)', icon: <SiVmware />, color: '#94A3B8', descriptionKey: 'virtualization' },
    { name: 'Networking Basics (Wi-Fi 7, TCP/IP)', icon: <FaNetworkWired />, color: '#38BDF8', descriptionKey: 'networking' },
    { name: 'CompTIA A+ Core 1 (in study)', icon: <FaCode />, color: '#F97316', descriptionKey: 'comptia' },
    { name: 'TensorFlow / ML', icon: <SiTensorflow />, color: '#FF6F00', descriptionKey: 'tensorflow' },
    { name: 'OpenAI / Gemini APIs', icon: <FaBrain />, color: '#A78BFA', descriptionKey: 'openaiApis' },
    { name: 'English', icon: <FaLanguage />, color: '#F87171', descriptionKey: 'english', isLanguage: true },
    { name: 'French', icon: <FaLanguage />, color: '#60A5FA', descriptionKey: 'french', isLanguage: true },
    { name: 'Spanish', icon: <FaLanguage />, color: '#FBBF24', descriptionKey: 'spanish', isLanguage: true },
  ];

  const categoryOrder = [
    'programmingLanguages',
    'backendApis',
    'frontendMobile',
    'cloudDevops',
    'itSystems',
    'aiMl',
    'languages',
  ];

  const categories = {
    programmingLanguages: ['Python', 'JavaScript', 'TypeScript', 'C++', 'C', 'SQL'],
    backendApis: ['Node.js', 'Express.js', 'REST APIs', 'PostgreSQL', 'MongoDB', 'Firebase'],
    frontendMobile: ['React', 'React Native', 'Next.js', 'HTML / CSS', 'Tailwind CSS'],
    cloudDevops: ['AWS (EC2, S3, Route 53, IAM)', 'Docker', 'Git & GitHub', 'CI/CD Basics'],
    itSystems: ['Windows 11 (Pro / BIOS / UEFI)', 'Linux (CLI, scripting)', 'PC Hardware & Build', 'Virtualization (VMware, VirtualBox)', 'Networking Basics (Wi-Fi 7, TCP/IP)', 'CompTIA A+ Core 1 (in study)'],
    aiMl: ['TensorFlow / ML', 'OpenAI / Gemini APIs'],
    languages: ['English', 'French', 'Spanish'],
  };

  useEffect(() => {
    if (inView) setAnimated(true);
  }, [inView]);

  const openSkill = (skill) => {
    if (!skill) return;
    setSelectedSkill(skill);
  };

  return (
    <section id="skills" className="skills section page-shell" ref={ref}>
      <div className="skills__glow" aria-hidden="true" />
      <div className="container">
        <motion.header
          className="skills__header"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45 }}
        >
          <span className="stencil-tag">{t('skills.tag')}</span>
          <h2 className="section__title">{t('skills.title')}</h2>
          <p className="section__subtitle skills__subtitle">{t('skills.subtitle')}</p>
        </motion.header>

        <div className="skills__atelier">
          {categoryOrder.map((categoryKey, catIndex) => {
            const names = categories[categoryKey];
            const isLanguages = categoryKey === 'languages';

            return (
              <motion.section
                key={categoryKey}
                className={`skills__rack ${isLanguages ? 'skills__rack--languages' : ''}`}
                initial={{ opacity: 0, y: 28 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.08 * catIndex, duration: 0.45 }}
              >
                <div className="skills__rack-head">
                  <span className="skills__rack-index">{String(catIndex + 1).padStart(2, '0')}</span>
                  <h3 className="skills__rack-title">{t(`skills.categoriesList.${categoryKey}`)}</h3>
                  <span className="skills__rack-rule" aria-hidden="true" />
                </div>

                {isLanguages ? (
                  <ul className="skills__lang-row">
                    {names.map((skillName, i) => {
                      const skill = skills.find((s) => s.name === skillName);
                      return (
                        <li key={skillName}>
                          <motion.button
                            type="button"
                            className="skills__lang"
                            onClick={() => openSkill(skill)}
                            style={{ '--c': skill?.color }}
                            initial={{ opacity: 0, y: 12 }}
                            animate={animated ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: 0.08 * i + 0.05 * catIndex, duration: 0.4 }}
                            whileHover={{ y: -3 }}
                          >
                            <span className="skills__lang-icon">{skill?.icon}</span>
                            <div className="skills__lang-body">
                              <span className="skills__lang-name">{skillName}</span>
                              <span className="skills__lang-sub">
                                {t(`skills.langLabel.${skill?.descriptionKey}`)}
                              </span>
                            </div>
                            <span className="skills__lang-cta" aria-hidden="true">→</span>
                          </motion.button>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <ul className="skills__rows">
                    {names.map((skillName, i) => {
                      const skill = skills.find((s) => s.name === skillName);
                      return (
                        <li key={skillName}>
                          <motion.button
                            type="button"
                            className="skills__row"
                            onClick={() => openSkill(skill)}
                            style={{ '--c': skill?.color }}
                            initial={{ opacity: 0, x: -12 }}
                            animate={animated ? { opacity: 1, x: 0 } : {}}
                            transition={{ delay: 0.035 * i + 0.05 * catIndex, duration: 0.35 }}
                          >
                            <span className="skills__row-icon">{skill?.icon}</span>
                            <span className="skills__row-name">{skillName}</span>
                            <span className="skills__row-arrow" aria-hidden="true">→</span>
                          </motion.button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </motion.section>
            );
          })}
        </div>

        <p className="skills__hint">{t('skills.clickHint')}</p>
      </div>

      <AnimatePresence>
        {selectedSkill && (
          <motion.div
            className="skills__popup-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedSkill(null)}
          >
            <motion.div
              className="skills__popup"
              initial={{ scale: 0.94, opacity: 0, y: 28 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 16 }}
              onClick={(e) => e.stopPropagation()}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            >
              <button
                type="button"
                className="skills__popup-close"
                onClick={() => setSelectedSkill(null)}
                aria-label={t('skills.closePopup')}
              >
                ×
              </button>

              <div className="skills__popup-accent" style={{ background: selectedSkill.color }} aria-hidden="true" />
              <div className="skills__popup-header">
                <div className="skills__popup-icon" style={{ color: selectedSkill.color }}>
                  {selectedSkill.icon}
                </div>
                <div>
                  <h3 className="skills__popup-title">{selectedSkill.name}</h3>
                  <p className="skills__popup-level">
                    {selectedSkill.isLanguage
                      ? t(`skills.langLabel.${selectedSkill.descriptionKey}`)
                      : t('skills.categoriesList.' + (
                          Object.entries(categories).find(([, arr]) => arr.includes(selectedSkill.name))?.[0]
                          || 'programmingLanguages'
                        ))}
                  </p>
                </div>
              </div>

              {selectedSkill.isLanguage ? (
                <div className="skills__popup-lang">
                  <p className="skills__popup-lang-intro">
                    {t(`skills.descriptions.${selectedSkill.descriptionKey}`)}
                  </p>
                  <ul className="skills__popup-lang-grid">
                    {['speaking', 'listening', 'reading', 'writing'].map((axis) => {
                      const bundle = t(`skills.langBreakdown.${selectedSkill.descriptionKey}`, { returnObjects: true }) || {};
                      const row = bundle[axis] || {};
                      return (
                        <li key={axis} className="skills__popup-lang-row" style={{ '--c': selectedSkill.color }}>
                          <span className="skills__popup-lang-axis">{t(`skills.langAxis.${axis}`)}</span>
                          <span className="skills__popup-lang-level">{row.level}</span>
                          <span className="skills__popup-lang-note">{row.note}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : (
                <div className="skills__popup-description">
                  <h4>{t('skills.whatIs', { skill: selectedSkill.name })}</h4>
                  <p>{t(`skills.descriptions.${selectedSkill.descriptionKey}`)}</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Skills;
