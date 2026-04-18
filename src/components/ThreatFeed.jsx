"use client";
import { ShieldAlert, ShieldCheck, Clock, ExternalLink, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

const sevClass = { Critical: 'badge-critical', High: 'badge-high', Medium: 'badge-high', Low: 'badge-low', Info: 'badge-info' };

export default function ThreatFeed({ threats = [], onSelect }) {

  if (threats.length === 0) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16,
      }}>
        <div style={{
          width: 60, height: 60, borderRadius: 16,
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.04)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <ShieldCheck size={28} color="rgba(255,255,255,0.15)" />
        </div>
        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>No threats detected yet</p>
        <p style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.15)', textAlign: 'center', lineHeight: 1.6 }}>
          Click <strong style={{ color: '#00d4ff' }}>"Simulate"</strong> to process sample logs through the 4-layer pipeline
        </p>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {threats.map((t, i) => {
        const alert = t.alert || {};
        const sev = alert.severity || 'Info';
        const isGenuine = alert.status === 'Genuine';

        return (
          <motion.div
            key={t.id || i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => onSelect && onSelect(t)}
            className="threat-row"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: onSelect ? 'pointer' : 'default' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isGenuine ? 'rgba(255,59,92,0.05)' : 'rgba(0,255,136,0.03)',
                border: `1px solid ${isGenuine ? 'rgba(255,59,92,0.1)' : 'rgba(0,255,136,0.08)'}`,
              }}>
                {isGenuine ? <ShieldAlert size={20} color="#ff3b5c" /> : <ShieldCheck size={20} color="#00ff88" />}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.58rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em',
                  }}>{t.id}</span>
                  <span className={`badge ${sevClass[sev] || 'badge-info'}`}>{sev}</span>
                  <span style={{
                    fontSize: '0.55rem', fontWeight: 600, color: '#00d4ff',
                    background: 'rgba(0,212,255,0.05)','padding': '2px 8px', borderRadius: 4,
                    border: '1px solid rgba(0,212,255,0.08)',
                  }}>
                    ML {alert.confidence_score || 0}%
                  </span>
                  <span style={{
                    fontSize: '0.5rem', color: 'rgba(255,255,255,0.25)',
                    background: 'rgba(255,255,255,0.02)',
                    padding: '2px 6px', borderRadius: 4,
                    border: '1px solid rgba(255,255,255,0.04)',
                  }}>
                    {t.raw_source?.toUpperCase()}
                  </span>
                </div>
                <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff', marginBottom: 4 }}>{alert.threat_type || 'Unknown'}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} color="#00d4ff" /> {t.timestamp}</span>
                  <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                  <span>{alert.source || 'N/A'}</span>
                  {alert.cross_layer_match && (
                    <>
                      <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                      <span style={{
                        color: '#a855f7', display: 'flex', alignItems: 'center', gap: 4,
                      }}><Layers size={11} /> {alert.cross_layer_match}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
              <span className={`badge ${isGenuine ? 'badge-genuine' : 'badge-fp'}`} style={{ padding: '4px 12px' }}>
                {alert.status}
              </span>
              {t.playbook && (
                <span style={{
                  fontSize: '0.48rem', color: '#00d4ff', fontWeight: 500,
                  letterSpacing: '0.1em', fontFamily: 'JetBrains Mono, monospace',
                }}>
                  {t.playbook.length} STEPS
                </span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
