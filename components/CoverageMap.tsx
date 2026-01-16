
import React from 'react';

interface CoverageItem {
  label: string;
  status: 'active' | 'warning' | 'scanning';
  icon: string;
}

const coverageItems: CoverageItem[] = [
  { label: 'HTTP Stack', status: 'active', icon: '⚡' },
  { label: 'DNS Layers', status: 'active', icon: '🌐' },
  { label: 'TLS Handshake', status: 'active', icon: '🔒' },
  { label: 'Security Headers', status: 'warning', icon: '📄' },
  { label: 'Asset Links', status: 'active', icon: '🔗' },
  { label: 'Internal APIs', status: 'active', icon: '⚙️' },
  { label: 'Web Vitals', status: 'scanning', icon: '📊' },
  { label: 'Hash Integrity', status: 'active', icon: '💎' }
];

export const CoverageMap: React.FC = () => {
  return (
    <div className="grid grid-cols-2 gap-2">
      {coverageItems.map((item, idx) => (
        <div key={idx} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl p-3 flex items-center justify-between shadow-sm transition-all hover:scale-[1.02]">
          <div className="flex items-center gap-2">
            <span className="text-sm">{item.icon}</span>
            <span className="text-[10px] font-black uppercase text-gray-500 dark:text-slate-400 tracking-tight">{item.label}</span>
          </div>
          <span className={`w-1.5 h-1.5 rounded-full ${
            item.status === 'active' ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]' : 
            item.status === 'warning' ? 'bg-yellow-500 shadow-[0_0_5px_rgba(234,179,8,0.5)]' : 
            'bg-blue-500 animate-pulse'
          }`} />
        </div>
      ))}
    </div>
  );
};
