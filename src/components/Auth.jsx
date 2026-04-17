"use client";
import { useState, useEffect } from 'react';
import { Shield, Lock, User, Layers, Cpu, GitBranch, FileText, ChevronRight, Fingerprint } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Auth({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [particles, setParticles] = useState([]);

  const layers = [
    { icon: Layers, label: "INGEST", desc: "Data Normalization", color: "#f5c542" },
    { icon: Cpu, label: "DETECT", desc: "ML Classification", color: "#ffa600" },
    { icon: GitBranch, label: "CORRELATE", desc: "Event Fusion", color: "#ff8400" },
    { icon: FileText, label: "OUTPUT", desc: "SOC Explainability", color: "#ff9d00" },
  ];

  // Floating particles
  useEffect(() => {
    const pts = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      dur: Math.random() * 20 + 15,
      delay: Math.random() * 10,
      opacity: Math.random() * 0.15 + 0.03,
    }));
    setParticles(pts);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin({ email, name: email.split('@')[0] });
  };

  return (
    <div className="grid-bg scanline" style={{
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
    }}>

      {/* Floating particles */}
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'fixed',
          left: `${p.x}%`, top: `${p.y}%`,
          width: p.size, height: p.size,
          background: 'var(--accent)',
          borderRadius: '50%',
          opacity: p.opacity,
          animation: `float ${p.dur}s ease-in-out ${p.delay}s infinite`,
          pointerEvents: 'none', zIndex: 0,
          boxShadow: '0 0 6px var(--accent-glow)',
        }} />
      ))}

      {/* Top bar */}
      <div style={{ position: 'absolute', top: 24, left: 32, display: 'flex', alignItems: 'center', gap: 10, zIndex: 2 }}>
        <div className="pulse-dot" style={{ width: 6, height: 6 }} />
        <span style={{ fontSize: '0.65rem', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', fontWeight: 500, fontFamily: 'JetBrains Mono, monospace' }}>
          Secure Connection Established
        </span>
      </div>
      <div style={{ position: 'absolute', top: 24, right: 32, zIndex: 2 }}>
        <span style={{ fontSize: '0.65rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.15)', textTransform: 'uppercase', fontWeight: 400, fontFamily: 'JetBrains Mono, monospace' }}>
          Nexus.AI v2.0
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', maxWidth: 540, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 2 }}
      >
        {/* Logo */}
        <motion.div
          className="float-animation"
          style={{
            width: 120, height: 120,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 32,
            animation: 'float 4s ease-in-out infinite',
          }}
        >
          <img src="/icon.png" alt="Nexus AI" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </motion.div>

        <h1 style={{
          fontFamily: 'Orbitron, sans-serif',
          fontWeight: 900, fontSize: '2.6rem',
          letterSpacing: '0.05em',
          marginBottom: 8,
          background: 'linear-gradient(to bottom, #f5c542, #b08d26)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          NEXUS.AI
        </h1>
        <p style={{
          fontSize: '0.65rem',
          letterSpacing: '0.5em',
          color: 'rgba(255,255,255,0.3)',
          textTransform: 'uppercase',
          fontWeight: 400,
          marginBottom: 44,
          fontFamily: 'Inter, sans-serif',
        }}>
          Threat Detection & Simulation
        </p>

        {/* 4-Layer Architecture Display */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, width: '100%', marginBottom: 40 }}>
          {layers.map((layer, i) => (
            <motion.div
              key={layer.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="glass-card"
              style={{
                padding: '18px 12px', textAlign: 'center',
                cursor: 'default',
                borderColor: `${layer.color}10`,
              }}
            >
              <layer.icon size={20} color={layer.color} style={{ marginBottom: 10 }} />
              <p style={{
                fontSize: '0.6rem', fontWeight: 700,
                color: layer.color, letterSpacing: '0.15em',
                marginBottom: 4, fontFamily: 'Orbitron, sans-serif',
              }}>{layer.label}</p>
              <p style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>{layer.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Login Card */}
        <div className="glass-card" style={{
          width: '100%', padding: '44px 40px',
          border: '1px solid rgba(0,212,255,0.06)',
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 28 }}>
              <label style={{
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: '0.6rem', fontWeight: 600,
                color: 'var(--accent)', letterSpacing: '0.2em',
                textTransform: 'uppercase', marginBottom: 12, marginLeft: 4,
                fontFamily: 'Orbitron, sans-serif',
              }}>
                <Fingerprint size={12} />
                Operator Identity
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="rgba(255,255,255,0.2)" style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="nexus-input"
                  placeholder="operator@nexus.ai"
                />
              </div>
            </div>

            <div style={{ marginBottom: 36 }}>
              <label style={{
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: '0.6rem', fontWeight: 600,
                color: 'var(--accent)', letterSpacing: '0.2em',
                textTransform: 'uppercase', marginBottom: 12, marginLeft: 4,
                fontFamily: 'Orbitron, sans-serif',
              }}>
                <Lock size={12} />
                Encrypted Token
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="rgba(255,255,255,0.2)" style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password" required value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="nexus-input"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="btn-gold"
              style={{
                width: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              }}
            >
              Access Command Center
              <ChevronRight size={16} />
            </motion.button>
          </form>
        </div>

        {/* Footer info */}
        <div style={{ marginTop: 36, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ height: 1, width: 50, background: 'linear-gradient(90deg, transparent, var(--accent-mid))' }} />
          <span style={{
            fontSize: '0.55rem', color: 'rgba(255,255,255,0.2)',
            letterSpacing: '0.35em', textTransform: 'uppercase', fontWeight: 400,
          }}>
            Secured by 4-Layer Neural Architecture
          </span>
          <div style={{ height: 1, width: 50, background: 'linear-gradient(90deg, var(--accent-mid), transparent)' }} />
        </div>
      </motion.div>
    </div>
  );
}
