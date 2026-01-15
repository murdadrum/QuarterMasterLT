
import React from 'react';
import { HealthReport } from '../types';

interface HealthSummaryProps {
  report: HealthReport | null;
  loading: boolean;
}

export const HealthSummary: React.FC<HealthSummaryProps> = ({ report, loading }) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border-2 border-dashed border-gray-200 dark:border-slate-800 animate-pulse text-center">
        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mx-auto mb-4 flex items-center justify-center">
           <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-500 dark:text-slate-400 font-medium">QuarterMaster AI is generating your infrastructure report...</p>
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
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 flex flex-col md:flex-row gap-8">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-4">
          <span className="p-2 bg-indigo-600 rounded-lg text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.674a1 1 0 00.951-.692l1.11-3.328a1 1 0 00-.951-1.31h-2.147l.951-2.852a1 1 0 00-.951-1.31H9.663a1 1 0 00-.951.692l-1.11 3.328a1 1 0 00.951 1.31h2.147l-.951 2.852a1 1 0 00.951 1.31H9.663a1 1 0 00-.951.692l-1.11 3.328a1 1 0 00.951 1.31h2.147l-.951 2.852a1 1 0 00.951 1.31z" />
            </svg>
          </span>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sentinel Health Intel</h2>
        </div>
        <p className="text-gray-600 dark:text-slate-400 leading-relaxed mb-4">{report.summary}</p>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase">System Risk Level:</span>
          <span className={`px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-widest ${riskColor}`}>
            {report.riskLevel}
          </span>
        </div>
      </div>
      <div className="md:w-1/3 bg-gray-50 dark:bg-slate-800 rounded-xl p-5 border border-gray-100 dark:border-slate-800">
        <h3 className="text-sm font-bold text-gray-700 dark:text-slate-300 uppercase mb-4 tracking-tighter">AI Recommendations</h3>
        <ul className="space-y-3">
          {report.recommendations.map((rec, i) => (
            <li key={i} className="flex gap-2 items-start text-sm text-gray-600 dark:text-slate-400">
              <span className="text-indigo-500 mt-1">•</span>
              {rec}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
