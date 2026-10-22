import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaExternalLinkAlt, FaTimes, FaLink } from 'react-icons/fa';
import secuAppImage from '../../assets/SecuApp.jpeg';
import elcontadorecImage from '../../assets/elcontadorec.png';
import ganpiImage from '../../assets/ganpi.png';
import volleyballImage from '../../assets/volleyball_app.jpeg';
import volleyGuardImage from '../../assets/VolleyGuard.jpeg';
import healthInsightImage from '../../assets/health_insight.png';
import biomedicalImage from '../../assets/biomedical.png';
import mountainMadnessImage from '../../assets/mountain-madness.png';
import automationImage from '../../assets/automation.png';
import toolkitImage from '../../assets/toolkit.png';
import commonplaceImage from '../../assets/commonplace.svg';
import faultbenchImage from '../../assets/faultbench.svg';
import comptiaImage from '../../assets/comptia.png';
import PCBuild from '../PCBuild/PCBuild';
import PCWatchdogDemo from '../PCWatchdog/PCWatchdogDemo';
import GanpiDemo from '../GanpiDemo/GanpiDemo';
import JarvisDemo from '../JarvisDemo/JarvisDemo';
import './Projects.css';

const CornerWeb = ({ className }) => (
  <svg className={className} viewBox="0 0 220 220" fill="none" aria-hidden="true">
    <path
      d="M0 0 L220 0 M0 0 L0 220 M0 0 L200 48 M0 0 L180 90 M0 0 L140 140 M0 0 L90 180 M0 0 L48 200"
      stroke="currentColor"
      strokeWidth="1.1"
      opacity="0.5"
    />
    <path
      d="M28 0 Q42 42 0 28 M56 0 Q78 78 0 56 M88 0 Q118 118 0 88 M124 0 Q158 158 0 124 M164 0 Q192 192 0 164"
      stroke="currentColor"
      strokeWidth="1.15"
      fill="none"
      opacity="0.8"
    />
    <circle cx="0" cy="0" r="3.5" fill="currentColor" opacity="0.65" />
  </svg>
);

/** Section header: big index number + title + subtitle + rule */
const SectionRack = ({ index, title, label }) => (
  <div className="projects__rack-head">
    <span className="projects__rack-index">{index}</span>
    <div className="projects__rack-heading">
      <h3 className="projects__rack-title">{title}</h3>
      {label && <span className="projects__rack-label">{label}</span>}
    </div>
    <span className="projects__rack-rule" aria-hidden="true" />
  </div>
);

/** Small card used inside a category grid */
const ProjectCard = ({ project, i, onOpen, t }) => (
  <button type="button" className="projects__spot" onClick={() => onOpen(project)}>
    <div className="projects__spot-media">
      <img src={project.image} alt="" />
      <span className="projects__spot-num">{String(i + 1).padStart(2, '0')}</span>
      {project.demo && (
        <span className="projects__spot-live" aria-label="Live demo available">
          <i /> LIVE DEMO
        </span>
      )}
    </div>
    <div className="projects__spot-body">
      <h4 className="projects__spot-title">{t(`projects.${project.titleKey}`)}</h4>
      <p className="projects__spot-desc">{t(`projects.${project.descriptionKey}`)}</p>
      <div className="projects__tech">
        {project.technologies.slice(0, 4).map((tech) => (
          <span key={tech} className="projects__tech-item">{tech}</span>
        ))}
      </div>
      <span className="projects__spot-cta">
        {project.demo ? t('projects.openLiveDemo') : t('projects.viewDetails')}
      </span>
    </div>
  </button>
);

const Projects = () => {
  const { t } = useTranslation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.04 });
  const [selectedProject, setSelectedProject] = useState(null);

  // Project definitions with explicit bucket assignment: work | studio | credentials
  // Order inside each bucket = display order.
  const projects = [
    // ============ WORK ============
    {
      id: 2,
      bucket: 'work',
      titleKey: 'secuApp.title',
      descriptionKey: 'secuApp.description',
      image: secuAppImage,
      technologies: ['React Native', 'Expo', 'AWS', 'EC2', 'SQL', 'JavaScript'],
      github: 'https://github.com/rsg28/secuapp',
      live: null,
      type: 'github',
      detailsKey: 'secuApp.details',
    },
    {
      id: 3,
      bucket: 'work',
      titleKey: 'elContador.title',
      descriptionKey: 'elContador.description',
      image: elcontadorecImage,
      technologies: ['React', 'CSS3', 'JavaScript', 'AWS', 'Route 53', 'EC2', 'S3', 'IAM'],
      github: 'https://www.elcontadorec.store/',
      live: 'https://www.elcontadorec.store/',
      type: 'website',
      detailsKey: 'elContador.details',
    },
    {
      id: 11,
      bucket: 'work',
      titleKey: 'tuSalud.title',
      descriptionKey: 'tuSalud.description',
      image: automationImage,
      technologies: ['Python', 'pandas', 'openpyxl', 'SQL', 'Customer Service', 'Records Management', 'Bilingual Support'],
      github: null,
      live: null,
      type: 'experience',
      detailsKey: 'tuSalud.details',
    },

    // ============ STUDIO ============
    {
      id: 4,
      bucket: 'studio',
      titleKey: 'ganpi.title',
      descriptionKey: 'ganpi.description',
      image: ganpiImage,
      technologies: ['C++', 'Google Gemini API', 'Natural Language', 'CLI'],
      github: 'https://github.com/rsg28/GANPI',
      live: null,
      type: 'github',
      detailsKey: 'ganpi.details',
      demo: 'ganpi',
    },
    {
      id: 14,
      bucket: 'studio',
      titleKey: 'pcWatchdog.title',
      descriptionKey: 'pcWatchdog.description',
      image: automationImage,
      technologies: ['Python', 'psutil', 'WMI', 'SQLite', 'matplotlib', 'Windows'],
      github: 'https://github.com/rsg28/pc-watchdog',
      live: null,
      type: 'experience',
      detailsKey: 'pcWatchdog.details',
      demo: 'pcWatchdog',
    },
    {
      id: 17,
      bucket: 'studio',
      titleKey: 'faultBench.title',
      descriptionKey: 'faultBench.description',
      image: faultbenchImage,
      technologies: ['React', 'CompTIA A+', 'Diagnostics', 'localStorage'],
      github: null,
      live: '/fault-bench',
      type: 'website',
      detailsKey: 'faultBench.details',
    },
    {
      id: 15,
      bucket: 'studio',
      titleKey: 'jarvis.title',
      descriptionKey: 'jarvis.description',
      image: toolkitImage,
      technologies: ['Python', 'PySide6', 'edge-tts', 'SpeechRecognition', 'sounddevice', 'psutil'],
      github: 'https://github.com/rsg28/jarvis',
      live: null,
      type: 'experience',
      detailsKey: 'jarvis.details',
      demo: 'jarvis',
    },
    {
      id: 16,
      bucket: 'studio',
      titleKey: 'commonplace.title',
      descriptionKey: 'commonplace.description',
      image: commonplaceImage,
      technologies: ['React', 'Vite', 'localStorage', 'Canon', 'Spaced return'],
      github: null,
      live: '/commonplace',
      type: 'website',
      detailsKey: 'commonplace.details',
    },
    {
      id: 12,
      bucket: 'studio',
      titleKey: 'toolkit.title',
      descriptionKey: 'toolkit.description',
      image: toolkitImage,
      technologies: ['Python', 'python-docx', 'PDF Automation', 'Git', 'Bash / PowerShell'],
      github: null,
      live: null,
      type: 'experience',
      detailsKey: 'toolkit.details',
    },
    {
      id: 6,
      bucket: 'studio',
      titleKey: 'spikeConnect.title',
      descriptionKey: 'spikeConnect.description',
      image: volleyballImage,
      technologies: ['React Native', 'JavaScript', 'REST APIs', 'Figma'],
      github: 'https://github.com/rsg28/Spike-Connect',
      live: null,
      type: 'github',
      detailsKey: 'spikeConnect.details',
    },
    {
      id: 7,
      bucket: 'studio',
      titleKey: 'volleyGuard.title',
      descriptionKey: 'volleyGuard.description',
      image: volleyGuardImage,
      technologies: ['React Native', 'AI/ML', 'Computer Vision', 'JavaScript'],
      github: 'https://github.com/rsg28/Volleyguard',
      live: null,
      type: 'github',
      detailsKey: 'volleyGuard.details',
    },
    {
      id: 8,
      bucket: 'studio',
      titleKey: 'healthInsight.title',
      descriptionKey: 'healthInsight.description',
      image: healthInsightImage,
      technologies: ['React Native', 'Ollama', 'Node.js', 'Express'],
      github: 'https://github.com/rsg28/Health-Insight',
      live: null,
      type: 'github',
      detailsKey: 'healthInsight.details',
    },
    {
      id: 9,
      bucket: 'studio',
      titleKey: 'biomedicalML.title',
      descriptionKey: 'biomedicalML.description',
      image: biomedicalImage,
      technologies: ['Python', 'TensorFlow', 'CNN', 'Medical Imaging', 'OpenCV'],
      github: 'https://github.com/sfu-cmpt340/project_14',
      live: null,
      type: 'github',
      detailsKey: 'biomedicalML.details',
    },
    {
      id: 10,
      bucket: 'studio',
      titleKey: 'mountainMadness.title',
      descriptionKey: 'mountainMadness.description',
      image: mountainMadnessImage,
      technologies: ['Python', 'JavaScript', 'OpenCV', 'DeepFace'],
      github: 'https://github.com/DenkuKuro/Mountain-Madness-Project/tree/main',
      live: null,
      type: 'github',
      detailsKey: 'mountainMadness.details',
    },

    // ============ CREDENTIALS ============
    {
      id: 5,
      bucket: 'credentials',
      titleKey: 'comptia.title',
      descriptionKey: 'comptia.description',
      image: comptiaImage,
      technologies: ['Hardware', 'Networking', 'Mobile Devices', 'Virtualization', 'Troubleshooting', 'Operating Systems'],
      github: null,
      live: null,
      type: 'certification',
      detailsKey: 'comptia.details',
    },
  ];

  const work = projects.filter((p) => p.bucket === 'work');
  const studio = projects.filter((p) => p.bucket === 'studio');
  const credentials = projects.filter((p) => p.bucket === 'credentials');

  return (
    <section id="projects" className="projects section page-shell" ref={ref}>
      <CornerWeb className="projects__web projects__web--tl" />
      <CornerWeb className="projects__web projects__web--tr" />
      <div className="projects__strand" aria-hidden="true" />

      <div className="container">
        <motion.header
          className="projects__header"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
        >
          <span className="stencil-tag">{t('projects.tag')}</span>
          <h2 className="section__title">{t('projects.title')}</h2>
          <p className="section__subtitle projects__subtitle">{t('projects.subtitle')}</p>
        </motion.header>

        {/* ============ 01 · WORK ============ */}
        <motion.section
          className="projects__section"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1 }}
        >
          <SectionRack
            index="01"
            title={t('projects.sections.workTitle')}
            label={t('projects.sections.workLabel')}
          />
          <div className="projects__spotlight-grid">
            {work.map((project, i) => (
              <ProjectCard key={project.id} project={project} i={i} onOpen={setSelectedProject} t={t} />
            ))}
          </div>
        </motion.section>

        {/* ============ 02 · STUDIO ============ */}
        <motion.section
          className="projects__section"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.18 }}
        >
          <SectionRack
            index="02"
            title={t('projects.sections.studioTitle')}
            label={t('projects.sections.studioLabel')}
          />

          {/* PC 3D — headline studio piece */}
          <div className="projects__hero-piece">
            <PCBuild embedded />
          </div>

          <div className="projects__spotlight-grid projects__spotlight-grid--dense">
            {studio.map((project, i) => (
              <ProjectCard key={project.id} project={project} i={i} onOpen={setSelectedProject} t={t} />
            ))}
          </div>
        </motion.section>

        {/* ============ 03 · CREDENTIALS ============ */}
        {credentials.length > 0 && (
          <motion.section
            className="projects__section projects__section--last"
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.24 }}
          >
            <SectionRack
              index="03"
              title={t('projects.sections.credentialsTitle')}
              label={t('projects.sections.credentialsLabel')}
            />
            <div className="projects__spotlight-grid projects__spotlight-grid--single">
              {credentials.map((project, i) => (
                <ProjectCard key={project.id} project={project} i={i} onOpen={setSelectedProject} t={t} />
              ))}
            </div>
          </motion.section>
        )}
      </div>

      <AnimatePresence>
        {selectedProject && (
          <motion.div
            className="projects__modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              className="projects__modal"
              initial={{ scale: 0.94, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            >
              <button
                type="button"
                className="projects__modal-close"
                onClick={() => setSelectedProject(null)}
                aria-label={t('projects.closeModal')}
              >
                <FaTimes />
              </button>

              <div className="projects__modal-content">
                <div className="projects__modal-info">
                  <h3 className="projects__modal-title">{t(`projects.${selectedProject.titleKey}`)}</h3>

                  {/* Inline live demo for projects that ship one */}
                  {selectedProject.demo === 'pcWatchdog' && (
                    <div className="projects__modal-demo">
                      <PCWatchdogDemo />
                    </div>
                  )}
                  {selectedProject.demo === 'ganpi' && (
                    <div className="projects__modal-demo">
                      <GanpiDemo />
                    </div>
                  )}
                  {selectedProject.demo === 'jarvis' && (
                    <div className="projects__modal-demo">
                      <JarvisDemo />
                    </div>
                  )}

                  <p className="projects__modal-description">
                    {t(`projects.${selectedProject.detailsKey}.overview`)}
                  </p>

                  {selectedProject.type === 'certification' ? (
                    <>
                      <div className="projects__modal-section">
                        <h4>{t('projects.comptia.domainsTitle')}</h4>
                        <div className="projects__cert-grid">
                          {(t(`projects.${selectedProject.detailsKey}.domains`, { returnObjects: true }) || []).map((d, i) => (
                            <div key={i} className="projects__cert-card">
                              <span className="projects__cert-card-num">{String(i + 1).padStart(2, '0')}</span>
                              <div>
                                <h5 className="projects__cert-card-title">{d.title}</h5>
                                <p className="projects__cert-card-body">{d.body}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="projects__modal-section">
                        <h4>{t('projects.comptia.approachTitle')}</h4>
                        <ul className="projects__modal-features">
                          {(t(`projects.${selectedProject.detailsKey}.approach`, { returnObjects: true }) || []).map((line, i) => (
                            <li key={i}>{line}</li>
                          ))}
                        </ul>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="projects__modal-section">
                        <h4>{t('projects.keyFeatures')}</h4>
                        <ul className="projects__modal-features">
                          {(t(`projects.${selectedProject.detailsKey}.features`, { returnObjects: true }) || []).map((feature, index) => (
                            <li key={index}>{feature}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="projects__modal-section">
                        <h4>{t('projects.challengesSolutions')}</h4>
                        <div className="challenges-section">
                          <strong>{t('projects.challenges')}</strong>
                          {Array.isArray(t(`projects.${selectedProject.detailsKey}.challenges`, { returnObjects: true })) ? (
                            <ul className="challenges-list">
                              {(t(`projects.${selectedProject.detailsKey}.challenges`, { returnObjects: true }) || []).map((challenge, index) => (
                                <li key={index}>{challenge}</li>
                              ))}
                            </ul>
                          ) : (
                            <p>{t(`projects.${selectedProject.detailsKey}.challenges`)}</p>
                          )}
                        </div>
                        <div className="solution-section">
                          <strong>{t('projects.solution')}</strong>
                          {Array.isArray(t(`projects.${selectedProject.detailsKey}.solution`, { returnObjects: true })) ? (
                            <ul className="solution-list">
                              {(t(`projects.${selectedProject.detailsKey}.solution`, { returnObjects: true }) || []).map((solution, index) => (
                                <li key={index}>{solution}</li>
                              ))}
                            </ul>
                          ) : (
                            <p>{t(`projects.${selectedProject.detailsKey}.solution`)}</p>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  <div className="projects__modal-tech">
                    <h4>{t('projects.technologiesUsed')}</h4>
                    <div className="projects__modal-tech-list">
                      {selectedProject.technologies.map((tech) => (
                        <span key={tech} className="projects__tech-item">{tech}</span>
                      ))}
                    </div>
                  </div>

                  {(selectedProject.github || selectedProject.live) && (
                    <div className="projects__modal-links">
                      {selectedProject.github && (
                        <a
                          href={selectedProject.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn--secondary"
                        >
                          <FaLink /> {selectedProject.type === 'website' ? t('projects.visitWebsite') : t('projects.viewCode')}
                        </a>
                      )}
                      {selectedProject.live && selectedProject.live !== selectedProject.github && (
                        selectedProject.live.startsWith('http') ? (
                          <a
                            href={selectedProject.live}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn--primary"
                          >
                            <FaExternalLinkAlt /> {t('projects.liveDemo')}
                          </a>
                        ) : (
                          <Link to={selectedProject.live} className="btn btn--primary" onClick={() => setSelectedProject(null)}>
                            <FaExternalLinkAlt /> {t('projects.liveDemo')}
                          </Link>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Projects;
