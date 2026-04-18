"use client";
import { useState, useEffect } from 'react';
import { 
  Shield, AlertTriangle, Activity, MessageSquare, Settings, LogOut, 
  Search, Bell, Zap, CheckCircle, XCircle, Layers, Play, RefreshCw,
  ChevronRight, Hexagon, Radio
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThreatFeed from './ThreatFeed';
import AIChat from './AIChat';
import ThreatStats from './ThreatStats';

const API = "http://localhost:8000";

const menuItems = [
  { id: 'overview', icon: Activity, label: 'Overview' },
  { id: 'threats', icon: Shield, label: 'Intelligence' },
  { id: 'nexus-ai', icon: MessageSquare, label: 'Nexus AI' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export default function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [time, setTime] = useState('');
  const [health, setHealth] = useState(null);
  const [stats, setStats] = useState(null);
  const [threats, setThreats] = useState([]);
  const [simulating, setSimulating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchHealth(), fetchStats(), fetchThreats()]);
      setTimeout(() => setLoading(false), 2000); // Artificial delay for premium feel
    };
    init();

    const tick = () => setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);



  const fetchHealth = async () => {
    try {
      const res = await fetch(`${API}/api/health`);
      setHealth(await res.json());
    } catch { setHealth(null); }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API}/api/stats`);
      setStats(await res.json());
    } catch { setStats(null); }
  };

  const fetchThreats = async () => {
    try {
      const res = await fetch(`${API}/api/threats`);
      const data = await res.json();
      setThreats(data.threats || []);
    } catch { setThreats([]); }
  };

  const runSimulation = async () => {
    setSimulating(true);
    try {
      await fetch(`${API}/api/simulate`, { method: 'POST' });
      await fetchStats();
      await fetchThreats();
    } catch (e) { console.error(e); }
    setSimulating(false);
  };

  const layers = health?.layers || {};
  const layerList = [
    { key: "L1_Ingestion", label: "L1 Ingest", color: "#f5c542" },
    { key: "L2_Detection", label: "L2 Detect", color: "#ffa600" },
    { key: "L3_Correlation", label: "L3 Correlate", color: "#ff8400" },
    { key: "L4_Output", label: "L4 Output", color: "#ff9d00" },
  ];

  return (
    <div className="scanline grid-bg" style={{ display: 'flex', height: '100vh', overflow: 'hidden', color: '#fff', background: 'transparent' }}>
      
      {/* SIDEBAR */}
      <aside style={{
        width: 280,
        borderRight: '1px solid rgba(255,255,255,0.04)',
        display: 'flex', flexDirection: 'column',
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(20px)',
        position: 'relative', zIndex: 2,
      }}>
        <div style={{ padding: '32px 24px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            width: 72, height: 72,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 14,
            transition: 'transform 0.3s',
          }}>
            <img src="/icon.png" alt="Nexus AI" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <span style={{
            fontFamily: 'Orbitron, sans-serif', fontWeight: 800,
            fontSize: '1rem',
            letterSpacing: '0.2em',
            background: 'linear-gradient(to bottom, #f5c542, #b08d26)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>NEXUS.AI</span>
          <span style={{
            fontSize: '0.5rem', color: 'rgba(255,255,255,0.2)',
            letterSpacing: '0.3em', marginTop: 6,
            textTransform: 'uppercase',
          }}>Command Center</span>
        </div>

        <nav style={{ flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {menuItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`sidebar-tab ${activeTab === item.id ? 'active' : ''}`}>
              <div className="tab-icon"><item.icon size={16} /></div>
              <span style={{
                letterSpacing: '0.12em', textTransform: 'uppercase',
                fontSize: '0.7rem', fontWeight: 600,
              }}>{item.label}</span>
              {activeTab === item.id && (
                <ChevronRight size={12} style={{ marginLeft: 'auto', opacity: 0.5 }} />
              )}
            </button>
          ))}
        </nav>

        {/* Live Layer Status from API */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <p style={{
            fontSize: '0.55rem', color: 'rgba(255,255,255,0.25)',
            letterSpacing: '0.2em', textTransform: 'uppercase',
            fontWeight: 600, marginBottom: 14,
            fontFamily: 'Orbitron, sans-serif',
          }}>Core Layers</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {layerList.map(l => {
              const status = layers[l.key] || 'offline';
              const color = status === 'active' ? l.color : '#ff3b5c';
              return (
                <div key={l.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="layer-dot" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
                  <span style={{
                    fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)',
                    fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase',
                  }}>{l.label}</span>
                  <span style={{
                    marginLeft: 'auto',
                    fontSize: '0.5rem', fontFamily: 'JetBrains Mono, monospace',
                    color, fontWeight: 600, textTransform: 'uppercase',
                  }}>{status}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* User */}
        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="glass-card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, borderRadius: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'rgba(0,212,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, color: '#00d4ff',
              border: '1px solid rgba(0,212,255,0.15)',
              fontSize: '0.85rem',
              fontFamily: 'Orbitron, sans-serif',
            }}>
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{
                fontSize: '0.75rem', fontWeight: 700,
                color: '#00d4ff',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{user?.name || 'Admin'}</p>
              <p style={{
                fontSize: '0.5rem', color: 'rgba(255,255,255,0.25)',
                letterSpacing: '0.15em', textTransform: 'uppercase',
              }}>SOC Analyst</p>
            </div>
          </div>
          <button onClick={onLogout} style={{
            width: '100%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 8,
            padding: '10px', borderRadius: 10,
            border: '1px solid rgba(255,59,92,0.12)',
            color: '#ff3b5c', background: 'transparent',
            cursor: 'pointer', fontSize: '0.6rem', fontWeight: 600,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            transition: 'all 0.3s',
          }}
          onMouseEnter={e => { e.target.style.background = 'rgba(255,59,92,0.04)'; e.target.style.borderColor = 'rgba(255,59,92,0.25)'; }}
          onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.borderColor = 'rgba(255,59,92,0.12)'; }}
          >
            <LogOut size={13} /> Disconnect
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        <header style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 32px',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          background: 'rgba(0,0,0,0.3)',
          backdropFilter: 'blur(12px)',
          zIndex: 2,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="pulse-dot" style={{ width: 6, height: 6 }} />
            <span style={{
              fontSize: '0.6rem', letterSpacing: '0.25em', color: 'rgba(255,255,255,0.3)',
              textTransform: 'uppercase', fontWeight: 500,
              fontFamily: 'JetBrains Mono, monospace',
            }}>
              {health ? 'System Online' : 'Connecting...'}
            </span>
            <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.08)', margin: '0 4px' }}>|</span>
            <span style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 500,
              textShadow: '0 0 12px rgba(245,197,66,0.2)',
            }}>{time}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={runSimulation} disabled={simulating} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 18px', borderRadius: 10,
              border: '1px solid rgba(0,212,255,0.15)',
              background: simulating ? 'rgba(0,212,255,0.04)' : 'transparent',
              color: '#00d4ff', cursor: 'pointer',
              fontSize: '0.6rem', fontWeight: 600,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              transition: 'all 0.3s',
              fontFamily: 'Orbitron, sans-serif',
            }}
            onMouseEnter={e => { if (!simulating) e.target.style.background = 'rgba(0,212,255,0.04)'; }}
            onMouseLeave={e => { if (!simulating) e.target.style.background = 'transparent'; }}
            >
              {simulating ? <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Play size={13} />}
              {simulating ? 'Processing...' : 'Simulate'}
            </button>
            <button onClick={() => { fetchStats(); fetchThreats(); }} style={{
              padding: '8px', borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.06)',
              background: 'transparent', cursor: 'pointer',
              color: 'rgba(255,255,255,0.3)',
              transition: 'all 0.3s',
            }}>
              <RefreshCw size={14} />
            </button>
            <button style={{
              position: 'relative', padding: 10,
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 10, background: 'transparent', cursor: 'pointer',
            }}>
              <Bell size={16} color="rgba(255,255,255,0.3)" />
              {threats.length > 0 && <span style={{
                position: 'absolute', top: 6, right: 6,
                width: 6, height: 6, background: '#00d4ff',
                borderRadius: '50%',
                boxShadow: '0 0 8px #00d4ff',
              }} />}
            </button>
          </div>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: '32px 36px' }}>
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 32 }}
              >
                {/* Header Skeleton */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <div className="skeleton" style={{ width: 400, height: 48 }} />
                  <div className="skeleton" style={{ width: 300, height: 12 }} />
                </div>

                {/* Stats Grid Skeleton */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} className="skeleton-card" style={{ height: 120 }}>
                      <div className="skeleton" style={{ margin: 20, width: '40%', height: 14 }} />
                      <div className="skeleton" style={{ margin: '0 20px', width: '60%', height: 28 }} />
                    </div>
                  ))}
                </div>

                {/* Main View Skeletons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32 }}>
                   <div className="skeleton-card" style={{ height: 400 }} />
                   <div className="skeleton-card" style={{ height: 400 }} />
                </div>
              </motion.div>
            ) : (
              <>
                {activeTab === 'overview' && <OverviewTab key="ov" stats={stats} threats={threats} />}
                {activeTab === 'threats' && <IntelligenceTab key="it" stats={stats} threats={threats} />}
                {activeTab === 'nexus-ai' && (
                  <motion.div 
                    key="ai" 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -20 }} 
                    style={{ height: 'calc(100vh - 160px)', display: 'flex', flexDirection: 'column', gap: 24 }}
                  >
                    {/* Upper Intelligence Sector */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, flex: 1, minHeight: 0 }}>
                      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Radio size={14} className="pulse-text" style={{ color: 'var(--accent)' }} />
                          <h3 style={{ fontSize: '0.75rem', fontWeight: 800, margin: 0, letterSpacing: '0.1em', color: 'var(--accent)' }}>LIVE NEURAL STREAM</h3>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
                          <ThreatFeed threats={threats} />
                        </div>
                      </div>
                      
                      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 10 }}>
                          <MessageSquare size={14} style={{ color: 'var(--accent)' }} />
                          <h3 style={{ fontSize: '0.75rem', fontWeight: 800, margin: 0, letterSpacing: '0.1em', color: 'var(--accent)' }}>NEXUS AI ANALYST</h3>
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <AIChat />
                        </div>
                      </div>
                    </div>

                    {/* Tactical Action Deck */}
                    <div className="glass-card" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.2em' }}>TACTICAL ACTIONS:</span>
                      <div style={{ display: 'flex', gap: 12, flex: 1 }}>
                        <ActionButton icon={Shield} label="DEFEND SYSTEM" color="#f5c542" />
                        <ActionButton icon={Play} label="EXPLAIN THREAT" color="#ffa600" />
                        <ActionButton icon={XCircle} label="ISOLATE NODE" color="#ff3b5c" />
                        <ActionButton icon={Zap} label="NEUTRALIZE" color="#ff8400" />
                      </div>
                      <div style={{ padding: '8px 16px', background: 'rgba(245,197,66,0.05)', border: '1px solid rgba(245,197,66,0.1)', borderRadius: 8 }}>
                         <span className="pulse-text" style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.1em' }}>NEURAL LINK: ENCRYPTED</span>
                      </div>
                    </div>
                  </motion.div>
                )}
                {activeTab === 'settings' && (
                  <motion.div key="st" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16,
                  }}>
                    <Settings size={32} color="rgba(245,197,66,0.1)" />
                    <p style={{
                      fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)',
                      letterSpacing: '0.3em', textTransform: 'uppercase',
                      fontFamily: 'Orbitron, sans-serif',
                    }}>Configuration Module</p>
                    <p style={{
                      fontSize: '0.6rem', color: 'rgba(245,197,66,0.2)',
                      letterSpacing: '0.15em',
                    }}>Coming Soon</p>
                  </motion.div>
                )}
              </>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function IntelligenceTab({ stats, threats }) {
  const sectors = [
    { name: "Cloud Edge", load: "12%", health: "Nominal", status: "Active", color: "#f5c542" },
    { name: "Core Kernel", load: "24%", health: "Secured", status: "Active", color: "#ffa600" },
    { name: "User Nodes", load: "45%", health: "Warning", status: "Investigating", color: "#ff8400" },
    { name: "Neural Link", load: "08%", health: "Encrypted", status: "Active", color: "#ff9d00" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
      {/* Sector Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {sectors.map((s, i) => (
          <motion.div key={s.name} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card" style={{ padding: 20, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, padding: '4px 8px', background: `${s.color}15`, fontSize: '0.5rem', fontWeight: 800, color: s.color, letterSpacing: '0.1em' }}>{s.health}</div>
            <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', marginBottom: 6 }}>SYSTEM SECTOR</p>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', marginBottom: 16, fontFamily: 'Orbitron, sans-serif' }}>{s.name}</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.2)', marginBottom: 2 }}>NEURAL LOAD</p>
                <p style={{ fontSize: '1rem', fontWeight: 800, color: s.color }}>{s.load}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.2)', marginBottom: 2 }}>STATUS</p>
                <p className="pulse-text" style={{ fontSize: '0.6rem', fontWeight: 700, color: s.color }}>{s.status}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
        <div className="glass-card" style={{ padding: 24 }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
             <Zap size={16} color="var(--accent)" />
             <h3 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent)', letterSpacing: '0.1em' }}>NEURAL TELEMETRY STREAM</h3>
           </div>
           <ThreatFeed threats={threats} />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="glass-card" style={{ padding: 24, flex: 1 }}>
            <h3 style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent)', letterSpacing: '0.2em', marginBottom: 16 }}>ML PRECISION ENGINE</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
               {["L1 Ingest", "L2 Classify", "L3 Correlate", "L4 Explain"].map(layer => (
                 <div key={layer}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                       <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)' }}>{layer}</span>
                       <span style={{ fontSize: '0.6rem', color: 'var(--accent)', fontWeight: 800 }}>99.{Math.floor(Math.random() * 10) + 90}%</span>
                    </div>
                    <div style={{ width: '100%', height: 2, background: 'rgba(255,255,255,0.04)', borderRadius: 2, overflow: 'hidden' }}>
                       <motion.div initial={{ width: 0 }} animate={{ width: '99%' }} transition={{ duration: 1 }} style={{ height: '100%', background: 'var(--accent)' }} />
                    </div>
                 </div>
               ))}
            </div>
          </div>
          <div className="glass-card" style={{ padding: 24, background: 'rgba(255,59,92,0.03)', border: '1px solid rgba(255,59,92,0.1)' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <AlertTriangle size={16} color="#ff3b5c" />
                <h3 style={{ fontSize: '0.7rem', fontWeight: 800, color: '#ff3b5c', letterSpacing: '0.1em' }}>CRITICAL SECTOR ALERT</h3>
             </div>
             <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>Unusual pattern detected in <b>User Endpoints</b>. Neural correlation suggests active lateral movement simulation. Immediate oversight required.</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function OverviewTab({ stats, threats }) {
  const healthValue = 94.2;

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32, height: '100%' }}>
      {/* Visual Summary Sector */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48, background: 'radial-gradient(circle at center, rgba(245,197,66,0.03) 0%, transparent 70%)' }}>
         <div style={{ position: 'relative', width: 280, height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
               <circle cx="140" cy="140" r="120" stroke="rgba(255,255,255,0.02)" strokeWidth="8" fill="transparent" />
               <motion.circle 
                 cx="140" cy="140" r="120" 
                 stroke="var(--accent)" strokeWidth="8" fill="transparent" 
                 strokeDasharray="753" 
                 initial={{ strokeDashoffset: 753 }}
                 animate={{ strokeDashoffset: 753 - (753 * (healthValue/100)) }}
                 transition={{ duration: 1.5, ease: "easeOut" }}
                 style={{ filter: 'drop-shadow(0 0 12px var(--accent-glow))' }}
               />
            </svg>
            <div style={{ position: 'absolute', textAlign: 'center' }}>
               <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.3em', marginBottom: 8 }}>OVERALL INTEGRITY</p>
               <h2 style={{ fontSize: '3.5rem', fontWeight: 900, color: '#fff', margin: 0, fontFamily: 'Orbitron, sans-serif' }}>{healthValue}%</h2>
               <p style={{ fontSize: '0.6rem', color: 'var(--accent)', fontWeight: 700, marginTop: 4 }}>STATUS: OPTIMAL</p>
            </div>
         </div>
         
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 48, marginTop: 48 }}>
            <div style={{ textAlign: 'center' }}>
               <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.2em', marginBottom: 8 }}>UPTIME</p>
               <p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', fontFamily: 'JetBrains Mono, monospace' }}>04:12:89:12</p>
            </div>
            <div style={{ textAlign: 'center' }}>
               <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.2em', marginBottom: 8 }}>NEURAL OPS</p>
               <p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', fontFamily: 'JetBrains Mono, monospace' }}>{stats?.total_processed || 1204}</p>
            </div>
         </div>
      </div>

      {/* Metric Sidebar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
         <div className="glass-card" style={{ padding: 24, flex: 1 }}>
            <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--accent)', letterSpacing: '0.2em', marginBottom: 20 }}>REAL-TIME FEEDBACK</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
               <MiniStat label="DATA THROUGHPUT" value={stats?.throughput || "812.4 TB"} icon={Zap} />
               <MiniStat label="ANOMALIES DETECTED" value={stats?.anomaly_count || "112"} icon={AlertTriangle} />
               <MiniStat label="ACTIVE AGENTS" value="48" icon={Activity} />
               <MiniStat label="NEURAL PEAK" value="1.2 GB/s" icon={Radio} />
            </div>
         </div>
         <div className="glass-card" style={{ padding: 24, height: 260 }}>
            <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em', marginBottom: 16 }}>QUICK ACTIONS</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
               <ActionButton icon={RefreshCw} label="FLUSH NEURAL CACHE" color="var(--accent)" />
               <ActionButton icon={Shield} label="INITIATE LOCKDOWN" color="#ff3b5c" />
            </div>
         </div>
      </div>
    </motion.div>
  );
}

function MiniStat({ label, value, icon: Icon }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
       <div style={{ padding: 10, background: 'rgba(255,255,255,0.02)', borderRadius: 10 }}>
          <Icon size={16} color="var(--accent)" />
       </div>
       <div>
          <p style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em' }}>{label}</p>
          <p style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>{value}</p>
       </div>
    </div>
  );
}

function ActionButton({ icon: Icon, label, color }) {
  return (
    <button className="glass-card" style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '8px 16px', borderRadius: 8,
      border: `1px solid ${color}22`,
      background: 'rgba(255,255,255,0.02)',
      cursor: 'pointer',
      transition: 'all 0.3s',
    }}
    onMouseEnter={e => { e.currentTarget.style.background = `${color}11`; e.currentTarget.style.borderColor = `${color}44`; }}
    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = `${color}22`; }}
    >
      <Icon size={14} color={color} />
      <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.05em' }}>{label}</span>
    </button>
  );
}

