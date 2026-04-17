"use client";
import { useState, useEffect, useRef } from 'react';
import { Shield, Lock, User, Layers, Cpu, GitBranch, FileText, ChevronRight, Fingerprint, Camera, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

const PHASE = {
  LOGIN: 'LOGIN',
  NEURAL_SCAN: 'NEURAL_SCAN',
  VERIFYING: 'VERIFYING'
};

export default function Auth({ onLogin }) {
  const [phase, setPhase] = useState(PHASE.LOGIN);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [particles, setParticles] = useState([]);
  const videoRef = useRef(null);

  const layers = [
    { icon: Layers, label: "INGEST", desc: "Data Normalization", color: "#f5c542" },
    { icon: Cpu, label: "DETECT", desc: "ML Classification", color: "#ffa600" },
    { icon: GitBranch, label: "CORRELATE", desc: "Event Fusion", color: "#ff8400" },
    { icon: FileText, label: "OUTPUT", desc: "SOC Explainability", color: "#ff9d00" },
  ];

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

  const capturePhoto = () => {
    if (!videoRef.current) return null;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.8);
  };

  const startNeuralScan = async () => {
    setError('');
    setIsConnecting(true);
    
    try {
      // 1. Initialize camera
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      
      // 2. Capture and Verify/Register via OpenCV Backend
      const photo = capturePhoto();
      if (!photo) throw new Error("Could not capture neural image.");

      const endpoint = isRegistering ? '/api/biometrics/register' : '/api/biometrics/verify';
      
      const res = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, image: photo }),
      });
      
      const data = await res.json();

      if (data.success) {
        setPhase(PHASE.VERIFYING);
        setIsConnecting(false);
        setTimeout(() => {
          onLogin({ email, name: email?.split('@')[0] || 'Operator' });
        }, 2500);
      } else {
        setError(data.message || "Biometric verification failed.");
        setIsConnecting(false);
      }

    } catch (err) {
      console.error("Neural Scan Error:", err);
      setIsConnecting(false);
      setError(err.name === 'NotAllowedError' ? "Access Denied: Camera permission required." : "Neural Link Failed: " + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsConnecting(true);
    setError('');

    try {
      // MASTER BYPASS for Rapid Testing (1 / 1) - Skips all DB and Biometric checks
      if (email === '1' && password === '1') {
        setTimeout(() => {
          setPhase(PHASE.NEURAL_SCAN);
          setIsConnecting(false);
        }, 800);
        return;
      }

      if (process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_url' || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
        setError('Configuration Required: Please update .env.local with your Supabase URL and Key.');
        setIsConnecting(false);
        return;
      }

      let result;
      try {
        if (isRegistering) {
          result = await supabase.auth.signUp({ email, password });
        } else {
          result = await supabase.auth.signInWithPassword({ email, password });
        }
      } catch (fetchErr) {
        setError('Network Error: Could not reach Supabase. Check your URL and connection.');
        setIsConnecting(false);
        return;
      }

      if (result?.error) {
        setError(result.error.message);
        setIsConnecting(false);
      } else if (result?.data?.user) {
        // Sign-up might require email confirmation unless disabled in Supabase
        if (isRegistering && !result.data.session) {
          setError('Check your email for confirmation link.');
          setIsConnecting(false);
        } else {
          setTimeout(() => {
            setPhase(PHASE.NEURAL_SCAN);
            setIsConnecting(false);
          }, 1200);
        }
      }
    } catch (err) {
      setError('An unexpected authentication error occurred.');
      setIsConnecting(false);
    }
  };

  const startNeuralVerification = () => {
    setPhase(PHASE.VERIFYING);
    setTimeout(() => {
      onLogin({ email, name: email.split('@')[0] });
    }, 3000);
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
        <AnimatePresence mode="wait">
          {phase === PHASE.LOGIN && (
            <motion.div
              key="login"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              {/* Logo */}
              <div className="float-animation" style={{
                width: 120, height: 120,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 32,
                animation: 'float 4s ease-in-out infinite',
              }}>
                <img src="/icon.png" alt="Nexus AI" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>

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
                border: '1px solid rgba(245,197,66,0.06)',
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
                      <input
                        type="text" required value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="nexus-input"
                        placeholder="operator@nexus.ai"
                      />
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

                  {error && (
                    <div style={{ marginBottom: 20, textAlign: 'center' }}>
                      <span style={{ 
                        color: error.includes('Check your email') ? 'var(--accent)' : '#ff3b5c', 
                        fontSize: '0.7rem', 
                        fontWeight: 600 
                      }}>{error}</span>
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isConnecting}
                    type="submit"
                    className="btn-gold"
                    style={{
                      width: '100%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    }}
                  >
                    {isConnecting ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>
                        {isRegistering ? 'Create Operator Account' : 'Access Command Center'}
                        <ChevronRight size={16} />
                      </>
                    )}
                  </motion.button>

                  <div style={{ marginTop: 24, textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setIsRegistering(!isRegistering)}
                      style={{
                        background: 'none', border: 'none',
                        color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem',
                        letterSpacing: '0.1em', cursor: 'pointer',
                        textTransform: 'uppercase', textDecoration: 'underline',
                      }}
                    >
                      {isRegistering ? 'Already have identity? Sign In' : 'New Operator? Register Identity'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {(phase === PHASE.NEURAL_SCAN || phase === PHASE.VERIFYING) && (
            <motion.div
              key="neural-scan"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <h2 style={{ fontFamily: 'Orbitron, sans-serif', color: 'var(--accent)', letterSpacing: '0.3em', fontSize: '1.2rem', marginBottom: 8 }}>NEURAL BIOMETRIC SCAN</h2>
                <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Step 2: Operator Authentication</p>
              </div>

              <div style={{
                position: 'relative',
                width: 320, height: 320,
                borderRadius: '50%',
                border: '2px solid var(--accent-mid)',
                overflow: 'hidden',
                background: '#000',
                boxShadow: '0 0 40px var(--accent-dim)',
              }}>
                <video
                  ref={videoRef}
                  autoPlay playsInline muted
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: phase === PHASE.VERIFYING ? 0.3 : 0.7 }}
                />
                
                {error && phase === PHASE.NEURAL_SCAN && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: 20, textAlign: 'center', zIndex: 10,
                  }}>
                    <Camera size={32} color="#ff3b5c" style={{ marginBottom: 12 }} />
                    <span style={{ fontSize: '0.65rem', color: '#ff3b5c', fontWeight: 600, letterSpacing: '0.1em' }}>{error}</span>
                  </div>
                )}
                
                {/* Scanning Line */}
                <motion.div
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  style={{
                    position: 'absolute', left: 0, right: 0, height: 4,
                    background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
                    boxShadow: '0 0 15px var(--accent)',
                    zIndex: 2,
                  }}
                />

                {/* Grid Overlay */}
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(var(--accent-dim) 1px, transparent 1px)', backgroundSize: '20px 20px', pointerEvents: 'none' }} />
                
                {phase === PHASE.VERIFYING && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(0,0,0,0.6)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    zIndex: 10, backdropFilter: 'blur(4px)',
                  }}>
                    <Loader2 className="animate-spin" color="var(--accent)" size={48} style={{ marginBottom: 16 }} />
                    <span style={{ fontSize: '0.7rem', color: 'var(--accent)', letterSpacing: '0.4em' }}>ANALYZING...</span>
                  </div>
                )}
              </div>

              <div style={{ marginTop: 48, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {phase === PHASE.NEURAL_SCAN ? (
                  <button
                    onClick={startNeuralScan}
                    disabled={isConnecting}
                    className="btn-gold"
                    style={{ padding: '20px 60px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}
                  >
                    {isConnecting ? <Loader2 className="animate-spin" size={20} /> : <Camera size={20} />}
                    {isConnecting ? "INITIALIZING..." : "INITIALIZE NEURAL LINK"}
                  </button>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--accent)' }}>
                    <CheckCircle2 size={20} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em' }}>Neural Patterns Confirmed</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer info */}
        <div style={{ marginTop: 60, display: 'flex', alignItems: 'center', gap: 16 }}>
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
