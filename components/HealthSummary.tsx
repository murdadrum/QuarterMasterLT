
import React from 'react';
import { HealthReport } from '../types';

interface HealthSummaryProps {
  report: HealthReport | null;
  loading: boolean;
}

export const HealthSummary: React.FC<HealthSummaryProps> = ({ report, loading }) => {
  if (loading) {
    return (
      <div className="p-4 border border-dashed border-gray-200 dark:border-slate-800 animate-pulse rounded-xl text-center">
        <p className="text-xs text-gray-400 dark:text-slate-500 font-medium">Analyzing system state...</p>
      </div>
    );
  }

  if (!report) return null;

  const riskColor = {
    'Low': 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20',
    'Medium': 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20',
    'High': 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20'
  }[report.riskLevel];

  return (
    <div className="space-y-4">
      <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${riskColor}`}>
            {report.riskLevel} Risk
          </span>
        </div>
        <p className="text-xs text-gray-600 dark:text-slate-400 leading-relaxed font-medium">
          {report.summary}
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        {report.recommendations.map((rec, i) => (
          <div key={i} className="flex gap-2 items-center p-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-lg text-[11px] text-gray-500 dark:text-slate-400">
            <span className="w-1 h-1 rounded-full bg-indigo-500" />
            {rec}
          </div>
        ))}
      </div>
    </div>
  );
};
