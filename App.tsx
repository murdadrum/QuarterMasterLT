
import React, { useState, useEffect, useCallback } from 'react';
import { INITIAL_ENDPOINTS } from './constants';
import { Endpoint, HealthReport, EndpointStatus, EndpointType } from './types';
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
        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-slate-500 group-hover:text-indigo-600 transition-colors">
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
        className={`w-4 h-4 text-gray-300 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        fill="none" viewBox="0 0 24 24" stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[5000px] pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
      {children}
    </div>
  </div>
);

const App: React.FC = () => {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
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

  // Logic to discover endpoints within the host website
  const discoverHostEndpoints = useCallback(() => {
    const urls = new Set<string>();
    const discovered: Endpoint[] = [];

    // Scan for various asset types
    const scanners = [
      { selector: 'a[href]', attr: 'href', type: EndpointType.LINK, label: 'Link' },
      { selector: 'script[src]', attr: 'src', type: EndpointType.CDN, label: 'Script' },
      { selector: 'link[rel="stylesheet"]', attr: 'href', type: EndpointType.CDN, label: 'Style' },
      { selector: 'img[src]', attr: 'src', type: EndpointType.CDN, label: 'Image' },
      { selector: 'iframe[src]', attr: 'src', type: EndpointType.WEBSITE, label: 'Frame' }
    ];

    scanners.forEach(scanner => {
      document.querySelectorAll(scanner.selector).forEach(el => {
        const url = (el as any)[scanner.attr];
        if (url && !url.startsWith('javascript:') && !url.startsWith('#') && !urls.has(url)) {
          urls.add(url);
          const name = scanner.label === 'Link' ? (el as HTMLElement).innerText.trim() : url.split('/').pop()?.split('?')[0];
          discovered.push({
            id: `${scanner.label.toLowerCase()}-${discovered.length}`,
            name: (name || `Dynamic ${scanner.label}`).slice(0, 30),
            url: url,
            type: scanner.type,
            status: EndpointStatus.CHECKING,
            lastChecked: new Date(),
            avgLatency: 0,
            uptime: 100,
            history: []
          });
        }
      });
    });

    // Limit to prevent DOM-heavy websites from overwhelming the UI
    const finalBatch = [...INITIAL_ENDPOINTS, ...discovered.slice(0, 15)];
    setEndpoints(finalBatch);
    
    // Simulate check for newly discovered items
    setTimeout(() => {
      setEndpoints(prev => prev.map(ep => {
        if (ep.status === EndpointStatus.CHECKING) {
          const isHealthy = Math.random() > 0.05;
          return {
            ...ep,
            status: isHealthy ? EndpointStatus.ONLINE : EndpointStatus.DEGRADED,
            avgLatency: Math.floor(Math.random() * 80) + 15,
            history: Array.from({ length: 10 }, (_, i) => ({
              timestamp: `${i}:00`,
              latency: 20 + Math.random() * 40
            }))
          };
        }
        return ep;
      }));
    }, 2500);
  }, []);

  const triggerAnalysis = useCallback(async (currentEndpoints: Endpoint[]) => {
    if (currentEndpoints.length === 0) return;
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
        const newLatency = ep.status !== EndpointStatus.OFFLINE && ep.status !== EndpointStatus.CHECKING
          ? Math.max(10, ep.avgLatency + (Math.random() * 20 - 10)) 
          : ep.avgLatency;
        
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
    discoverHostEndpoints();
    const interval = setInterval(refreshStatuses, 12000);
    return () => clearInterval(interval);
  }, [discoverHostEndpoints, refreshStatuses]);

  useEffect(() => {
    if (endpoints.some(e => e.status !== EndpointStatus.CHECKING)) {
      triggerAnalysis(endpoints);
    }
  }, [endpoints, triggerAnalysis]);

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
    checking: endpoints.filter(e => e.status === EndpointStatus.CHECKING).length,
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fb] dark:bg-slate-950 transition-colors duration-300">
      {/* Sentinel Navigation */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-xl mx-auto px-4 flex justify-between h-14 items-center">
          <div className="flex items-center gap-2">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="3.5"
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-5 h-5 text-indigo-600 dark:text-indigo-400 rotate-90"
            >
              <polyline points="13 17 18 12 13 7"></polyline>
              <polyline points="6 17 11 12 6 7"></polyline>
            </svg>
            <span className="text-sm font-black tracking-tight text-gray-900 dark:text-white uppercase">QuarterMaster<span className="text-indigo-600">LT</span></span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <button onClick={refreshStatuses} className={`p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 ${refreshing ? 'animate-spin' : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Column */}
      <main className="flex-1 max-w-xl w-full mx-auto p-4 space-y-2 pb-20">
        <header className="mb-6 pt-4 text-center">
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">Sentinel Hub</h1>
          <p className="text-[10px] text-gray-500 dark:text-slate-500 uppercase font-black mt-1 tracking-widest">
            {stats.checking > 0 ? 'Scanning Host Infrastructure...' : `Active Guard: ${stats.online}/${stats.total} Optimal`}
          </p>
        </header>

        {/* Breakdown Section */}
        <Section title="Sentinel Pulse" isOpen={openSections.stats} onToggle={() => toggleSection('stats')}>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'NODES', val: stats.total, color: 'bg-indigo-500' },
              { label: 'HEALTHY', val: stats.online, color: 'bg-green-500' },
              { label: 'DEGRADED', val: stats.degraded, color: 'bg-yellow-500' },
              { label: 'CRITICAL', val: stats.offline, color: 'bg-red-500' },
            ].map((s, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-gray-100 dark:border-slate-800 text-center shadow-sm">
                <span className="text-[9px] font-black text-gray-400 dark:text-slate-500 block mb-1 uppercase tracking-tighter">{s.label}</span>
                <span className="text-lg font-black text-gray-900 dark:text-white leading-none">{s.val}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* AI Diagnostics Section */}
        <Section title="AI Insight" isOpen={openSections.ai} onToggle={() => toggleSection('ai')}>
          <HealthSummary report={report} loading={loadingReport} />
        </Section>

        {/* Coverage Map Section */}
        <Section title="Host Coverage" isOpen={openSections.coverage} onToggle={() => toggleSection('coverage')} badge={8}>
          <CoverageMap />
        </Section>

        {/* Monitoring Grid Section */}
        <Section title="Active Monitoring" isOpen={openSections.monitoring} onToggle={() => toggleSection('monitoring')} badge={endpoints.length}>
          <div className="space-y-4">
            {endpoints.map((ep) => (
              <EndpointCard key={ep.id} endpoint={ep} />
            ))}
          </div>
          <button 
            onClick={discoverHostEndpoints}
            className="w-full mt-6 py-3 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase text-gray-400 hover:border-indigo-400 hover:text-indigo-500 transition-all"
          >
            Re-scan Page Environment
          </button>
        </Section>
      </main>

      <footer className="max-w-xl mx-auto w-full p-8 text-center text-[9px] text-gray-400 dark:text-slate-600 font-black uppercase tracking-[0.3em]">
        QuarterMasterLT &bull; Sentinel Node v2.5
      </footer>
    </div>
  );
};

export default App;
