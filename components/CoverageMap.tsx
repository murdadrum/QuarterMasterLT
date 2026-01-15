
import React from 'react';

interface CoverageItem {
  label: string;
  status: 'active' | 'warning' | 'scanning';
  icon: React.ReactNode;
}

const coverageItems: CoverageItem[] = [
  { label: 'HTTP Status', status: 'active', icon: '⚡' },
  { label: 'DNS', status: 'active', icon: '🌐' },
  { label: 'SSL/TLS', status: 'active', icon: '🔒' },
  { label: 'Headers', status: 'warning', icon: '📄' },
  { label: 'Links', status: 'active', icon: '🔗' },
  { label: 'API Health', status: 'active', icon: '⚙️' },
  { label: 'Core Vitals', status: 'scanning', icon: '📊' },
  { label: 'Integrity', status: 'active', icon: '💎' }
];

export const CoverageMap: React.FC = () => {
  return (
    <div className="grid grid-cols-2 gap-2">
      {coverageItems.map((item, idx) => (
        <div key={idx} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">{item.icon}</span>
            <span className="text-[11px] font-bold text-gray-700 dark:text-slate-300">{item.label}</span>
          </div>
          <span className={`w-1.5 h-1.5 rounded-full ${
            item.status === 'active' ? 'bg-green-500' : 
            item.status === 'warning' ? 'bg-yellow-500' : 
            'bg-blue-500 animate-pulse'
          }`} />
        </div>
      ))}
    </div>
  );
};
