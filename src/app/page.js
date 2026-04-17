"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Auth from '../components/Auth';
import Dashboard from '../components/Dashboard';

const loadingSteps = [
  { label: "Initializing secure connection...", delay: 400 },
  { label: "Loading neural architecture...", delay: 800 },
  { label: "Connecting threat intelligence layers...", delay: 1200 },
  { label: "Calibrating ML detection engine...", delay: 1800 },
  { label: "Establishing real-time data stream...", delay: 2400 },
  { label: "System ready.", delay: 3000 },
];

function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(-1);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const totalDuration = 3400;
    const startTime = Date.now();

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / totalDuration) * 100, 100);
      setProgress(pct);
      if (pct >= 100) clearInterval(progressInterval);
    }, 30);

    loadingSteps.forEach((step, i) => {
      setTimeout(() => setActiveStep(i), step.delay);
    });

    setTimeout(() => {
      setFading(true);
      setTimeout(onComplete, 600);
    }, totalDuration);

    return () => clearInterval(progressInterval);
  }, [onComplete]);

  return (
    <div
      className="loading-screen"
      style={{
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.6s ease-out',
      }}
    >
      {/* Animated rings */}
      <div style={{ position: 'relative', width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 40 }}>
        <img src="/icon.png" alt="Nexus AI" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>

      <div className="loading-title" style={{ background: 'linear-gradient(to bottom, #f5c542, #b08d26)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: 'none' }}>NEXUS.AI</div>
      <div className="loading-subtitle">Advanced Threat Intelligence Platform</div>

      {/* Progress bar */}
      <div className="loading-bar-container">
        <div className="loading-bar" style={{ width: `${progress}%` }} />
      </div>

      {/* Status items */}
      <div className="loading-status-items">
        {loadingSteps.map((step, i) => {
          let className = 'loading-status-item';
          if (i < activeStep) className += ' done';
          else if (i === activeStep) className += ' active';
          return (
            <div key={i} className={className}>
              <div className="loading-status-dot" />
              <span>{step.label}</span>
            </div>
          );
        })}
      </div>

      {/* Corner decorations */}
      <div style={{ position: 'absolute', top: 24, left: 32, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#00d4ff', boxShadow: '0 0 8px #00d4ff' }} />
        <span style={{ fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.15em' }}>
          SYS.BOOT
        </span>
      </div>
      <div style={{ position: 'absolute', top: 24, right: 32 }}>
        <span style={{ fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.15)', letterSpacing: '0.1em' }}>
          v2.0.4
        </span>
      </div>
      <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)' }}>
        <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.12)', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
          Encrypted • Zero Trust • Neural Architecture
        </span>
      </div>
    </div>
  );
}

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  if (isLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} />;
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
}
