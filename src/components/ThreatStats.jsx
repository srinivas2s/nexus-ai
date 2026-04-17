"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis } from 'recharts';

const tooltipStyle = {
  backgroundColor: 'rgba(0, 0, 0, 0.85)',
  border: '1px solid var(--accent-mid)',
  borderRadius: 10,
  fontSize: '0.7rem',
  padding: '10px 14px',
  backdropFilter: 'blur(12px)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
};

const barData = [
  { name: 'Mon', genuine: 12, fp: 34 },
  { name: 'Tue', genuine: 19, fp: 28 },
  { name: 'Wed', genuine: 32, fp: 45 },
  { name: 'Thu', genuine: 25, fp: 39 },
  { name: 'Fri', genuine: 40, fp: 50 },
];

export default function ThreatStats({ stats }) {
  const genuine = stats?.genuine_threats || 0;
  const fp = stats?.false_positives || 0;

  const pieData = [
    { name: 'Genuine', value: genuine || 1, color: '#f5c542' },
    { name: 'False Positive', value: fp || 1, color: 'rgba(255,255,255,0.06)' },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div style={{ flex: 1, minHeight: 200 }}>
        <p style={{
          fontSize: '0.55rem', fontWeight: 700, color: '#f5c542',
          letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16,
          fontFamily: 'Orbitron, sans-serif',
        }}>Signal Distribution</p>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={pieData} cx="50%" cy="50%"
              innerRadius={65} outerRadius={85}
              paddingAngle={8} dataKey="value" stroke="none"
            >
              {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
            </Pie>
            <Tooltip
              contentStyle={tooltipStyle}
              itemStyle={{ color: '#f5c542' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 8 }}>
          {pieData.map(d => (
            <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 8, height: 8, borderRadius: 3,
                background: d.color,
                boxShadow: d.name === 'Genuine' ? '0 0 8px rgba(245, 197, 66, 0.3)' : 'none',
              }} />
              <span style={{
                fontSize: '0.58rem', color: 'rgba(255,255,255,0.35)',
                fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase',
              }}>{d.name}: {d.name === 'Genuine' ? genuine : fp}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 200 }}>
        <p style={{
          fontSize: '0.55rem', fontWeight: 700, color: '#f5c542',
          letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16,
          fontFamily: 'Orbitron, sans-serif',
        }}>Weekly Trend</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={barData} barGap={2}>
            <XAxis
              dataKey="name"
              axisLine={false} tickLine={false}
              tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.25)', fontWeight: 500 }}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              cursor={{ fill: 'rgba(245, 197, 66, 0.02)' }}
            />
            <Bar dataKey="genuine" stackId="a" fill="#f5c542" radius={[4, 4, 0, 0]} />
            <Bar dataKey="fp" stackId="a" fill="rgba(245, 197, 66, 0.08)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
