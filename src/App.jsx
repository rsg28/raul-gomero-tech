import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import BootGate from './components/BootGate/BootGate';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import AboutPage from './pages/AboutPage';
import SkillsPage from './pages/SkillsPage';
import ExperiencePage from './pages/ExperiencePage';
import PersonalPage from './pages/PersonalPage';
import ProjectsPage from './pages/ProjectsPage';
import ContactPage from './pages/ContactPage';
import Commonplace from './commonplace/Commonplace';
import FaultBench from './faultbench/FaultBench';
import './App.css';

function isStudioAppPath() {
  try {
    return /^\/(commonplace|fault-bench)\/?$/.test(window.location.pathname);
  } catch {
    return false;
  }
}

function App() {
  const skipGate = isStudioAppPath();
  const alreadyEntered = (() => {
    if (skipGate) return true;
    try {
      return sessionStorage.getItem('rg_entered') === '1';
    } catch {
      return false;
    }
  })();

  const [ready, setReady] = useState(alreadyEntered);
  const [showGate, setShowGate] = useState(!alreadyEntered);

  useEffect(() => {
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (ready) window.scrollTo(0, 0);
  }, [ready]);

  const handleRevealSite = () => {
    try {
      sessionStorage.setItem('rg_entered', '1');
    } catch { /* ignore */ }
    window.scrollTo(0, 0);
    setReady(true);
  };

  const handleGateDone = () => {
    setShowGate(false);
    window.scrollTo(0, 0);
  };

  return (
    <div className="App">
      {ready && (
        <BrowserRouter>
          <Routes>
            <Route path="commonplace" element={<Commonplace />} />
            <Route path="fault-bench" element={<FaultBench />} />
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="skills" element={<SkillsPage />} />
              <Route path="experience" element={<ExperiencePage />} />
              <Route path="personal" element={<PersonalPage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      )}

      {showGate && (
        <BootGate onRevealSite={handleRevealSite} onDone={handleGateDone} />
      )}
    </div>
  );
}

export default App;
