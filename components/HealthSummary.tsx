
import React from 'react';
import { HealthReport } from '../types';

interface HealthSummaryProps {
  report: HealthReport | null;
  loading: boolean;
}

export const HealthSummary: React.FC<HealthSummaryProps> = ({ report, loading }) => {
  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-slate-900 border border-dashed border-gray-200 dark:border-slate-800 animate-pulse rounded-2xl text-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-[10px] text-gray-400 dark:text-slate-500 font-black uppercase tracking-widest">AI Sentinel Processing...</p>
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
    <div className="space-y-3">
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 mb-2.5">
          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${riskColor}`}>
            {report.riskLevel} Risk State
          </span>
        </div>
        <p className="text-[11px] text-gray-600 dark:text-slate-400 leading-relaxed font-medium">
          {report.summary}
        </p>
      </div>
      
      <div className="space-y-1.5">
        <h4 className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">Sentinel Directives</h4>
        {report.recommendations.map((rec, i) => (
          <div key={i} className="flex gap-2 items-center p-2.5 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl text-[10px] text-gray-600 dark:text-slate-400 transition-all hover:border-indigo-200">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
            <span className="truncate">{rec}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
