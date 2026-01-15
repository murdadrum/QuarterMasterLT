
import React, { useState, useEffect, useCallback } from 'react';
import { INITIAL_ENDPOINTS } from './constants';
import { Endpoint, HealthReport, EndpointStatus } from './types';
import { EndpointCard } from './components/EndpointCard';
import { HealthSummary } from './components/HealthSummary';
import { CoverageMap } from './components/CoverageMap';
import { getAIHealthAnalysis } from './services/geminiService';

interface SectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badge?: string | number;
}

const Section: React.FC<SectionProps> = ({ title, isOpen, onToggle, children, badge }) => (
  <div className="border-b border-gray-100 dark:border-slate-800 last:border-b-0">
    <button 
      onClick={onToggle}
      className="w-full py-4 flex items-center justify-between group focus:outline-none"
    >
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-slate-400 group-hover:text-indigo-600 transition-colors">
          {title}
        </h2>
        {badge !== undefined && (
          <span className="text-[10px] bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 px-1.5 py-0.5 rounded-full font-bold">
            {badge}
          </span>
        )}
      </div>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        fill="none" viewBox="0 0 24 24" stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[2000px] pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
      {children}
    </div>
  </div>
);

const App: React.FC = () => {
  const [endpoints, setEndpoints] = useState<Endpoint[]>(INITIAL_ENDPOINTS);
  const [report, setReport] = useState<HealthReport | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [openSections, setOpenSections] = useState({
    stats: true,
    ai: true,
    coverage: false,
    monitoring: true,
  });
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const triggerAnalysis = useCallback(async (currentEndpoints: Endpoint[]) => {
    setLoadingReport(true);
    try {
      const result = await getAIHealthAnalysis(currentEndpoints);
      setReport(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReport(false);
    }
  }, []);

  const refreshStatuses = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setEndpoints(prev => prev.map(ep => {
        const newLatency = ep.status !== EndpointStatus.OFFLINE 
          ? Math.max(10, ep.avgLatency + (Math.random() * 20 - 10)) 
          : 0;
        
        return {
          ...ep,
          avgLatency: Math.round(newLatency),
          lastChecked: new Date(),
          history: [...ep.history.slice(1), { timestamp: new Date().toLocaleTimeString(), latency: newLatency }]
        };
      }));
      setRefreshing(false);
    }, 1500);
  }, []);

  useEffect(() => {
    triggerAnalysis(endpoints);
    const interval = setInterval(refreshStatuses, 10000);
    return () => clearInterval(interval);
  }, [triggerAnalysis, refreshStatuses, endpoints]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const stats = {
    total: endpoints.length,
    online: endpoints.filter(e => e.status === EndpointStatus.ONLINE).length,
    offline: endpoints.filter(e => e.status === EndpointStatus.OFFLINE).length,
    degraded: endpoints.filter(e => e.status === EndpointStatus.DEGRADED).length,
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fb] dark:bg-slate-950 transition-colors duration-300">
      {/* Mini Nav */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-xl mx-auto px-4 flex justify-between h-14 items-center">
          <div className="flex items-center gap-2">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="3.5"
              className="w-6 h-6 text-indigo-600 dark:text-indigo-400"
            >
              <polyline points="13 17 18 12 13 7"></polyline>
              <polyline points="6 17 11 12 6 7"></polyline>
            </svg>
            <span className="text-md font-bold text-gray-900 dark:text-white">QM<span className="text-indigo-600">LT</span></span>
          </div>
          <div className="flex items-center gap-2">
             <button 
                onClick={toggleTheme}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
              <button onClick={refreshStatuses} className={`p-1.5 rounded-lg text-gray-400 ${refreshing ? 'animate-spin' : ''}`}>
                🔄
              </button>
          </div>
        </div>
      </nav>

      {/* Main Columnized Mobile View */}
      <main className="flex-1 max-w-xl w-full mx-auto p-4 space-y-2">
        
        <header className="mb-6 pt-2">
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Sentinel Hub</h1>
          <p className="text-xs text-gray-500 dark:text-slate-500 uppercase font-bold mt-1">Status: {stats.online === stats.total ? 'Optimal' : 'Issues Detected'}</p>
        </header>

        {/* Stats Strip */}
        <Section title="Quick Stats" isOpen={openSections.stats} onToggle={() => toggleSection('stats')}>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'ALL', val: stats.total, color: 'bg-indigo-500' },
              { label: 'UP', val: stats.online, color: 'bg-green-500' },
              { label: 'DEG', val: stats.degraded, color: 'bg-yellow-500' },
              { label: 'OFF', val: stats.offline, color: 'bg-red-500' },
            ].map((s, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-gray-100 dark:border-slate-800 text-center">
                <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 block mb-1 uppercase">{s.label}</span>
                <span className="text-lg font-black text-gray-900 dark:text-white">{s.val}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* AI Insight */}
        <Section title="AI Intelligence" isOpen={openSections.ai} onToggle={() => toggleSection('ai')}>
          <HealthSummary report={report} loading={loadingReport} />
        </Section>

        {/* Coverage */}
        <Section title="Infrastructure Map" isOpen={openSections.coverage} onToggle={() => toggleSection('coverage')} badge={8}>
          <div className="scale-[0.9] origin-top">
            <CoverageMap />
          </div>
        </Section>

        {/* Monitoring Grid */}
        <Section title="Endpoints" isOpen={openSections.monitoring} onToggle={() => toggleSection('monitoring')} badge={endpoints.length}>
          <div className="space-y-4">
            {endpoints.map((ep) => (
              <div key={ep.id} className="scale-[0.98] origin-center">
                <EndpointCard endpoint={ep} />
              </div>
            ))}
          </div>
        </Section>

      </main>

      <footer className="max-w-xl mx-auto w-full p-6 text-center text-[10px] text-gray-400 dark:text-slate-600 font-bold uppercase tracking-widest">
        QuarterMasterLT &bull; Sentinel Node {stats.total}
      </footer>
    </div>
  );
};

export default App;
