
import React, { useState, useEffect, useCallback } from 'react';
import { INITIAL_ENDPOINTS } from './constants';
import { Endpoint, HealthReport, EndpointStatus } from './types';
import { EndpointCard } from './components/EndpointCard';
import { HealthSummary } from './components/HealthSummary';
import { getAIHealthAnalysis } from './services/geminiService';

const App: React.FC = () => {
  const [endpoints, setEndpoints] = useState<Endpoint[]>(INITIAL_ENDPOINTS);
  const [report, setReport] = useState<HealthReport | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

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
    // Simulate real network check
    setTimeout(() => {
      setEndpoints(prev => prev.map(ep => {
        // Randomly fluctuate latency and status for demo purposes
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update theme on change
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
      {/* Navigation */}
      <nav className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="currentColor" 
                  className="w-8 h-8 text-indigo-600 dark:text-indigo-400 drop-shadow-sm"
                >
                  <path fillRule="evenodd" d="M12.53 16.28a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 1 1 1.06-1.06l2.47 2.47 4.97-4.97a.75.75 0 1 1 1.06 1.06l-5.5 5.5Z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75-4.365-9.75-9.75-9.75ZM18.75 12a6.75 6.75 0 1 1-13.5 0 6.75 6.75 0 0 1 13.5 0Z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">QuarterMaster<span className="text-indigo-600 dark:text-indigo-400">LT</span></span>
            </div>
            <div className="flex items-center gap-4 md:gap-6">
              <div className="hidden md:flex items-center gap-6">
                <a href="#" className="text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-indigo-600">Dashboard</a>
                <a href="#" className="text-sm font-medium text-gray-400 dark:text-slate-500 hover:text-indigo-600">Incidents</a>
                <a href="#" className="text-sm font-medium text-gray-400 dark:text-slate-500 hover:text-indigo-600">Safety Logs</a>
              </div>
              
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all"
                aria-label="Toggle Dark Mode"
              >
                {isDarkMode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              
              <button className="hidden sm:block bg-gray-900 dark:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 dark:hover:bg-indigo-500 transition-all">
                + New Endpoint
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">System Overview</h1>
            <p className="text-gray-500 dark:text-slate-400">Real-time validation of links, APIs, and infrastructure endpoints.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={refreshStatuses}
              disabled={refreshing}
              className={`flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-slate-800 rounded-lg text-sm font-semibold text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {refreshing ? 'Refreshing...' : 'Refresh Status'}
            </button>
            <button 
              onClick={() => triggerAnalysis(endpoints)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-lg text-sm font-semibold text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-all"
            >
              Analyze with Gemini
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Endpoints', value: stats.total, icon: '🔍', color: 'bg-blue-500' },
            { label: 'Operational', value: stats.online, icon: '✓', color: 'bg-green-500' },
            { label: 'Degraded', value: stats.degraded, icon: '!', color: 'bg-yellow-500' },
            { label: 'Critically Offline', value: stats.offline, icon: '✕', color: 'bg-red-500' },
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] ${stat.color}`}>
                  {stat.icon}
                </span>
              </div>
              <p className="text-2xl font-black text-gray-900 dark:text-white leading-none">{stat.value}</p>
              <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase mt-2 tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* AI Insight Section */}
        <HealthSummary report={report} loading={loadingReport} />

        {/* Grid of Endpoints */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Active Monitoring</h2>
            <div className="flex gap-2">
              <button className="p-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
              </button>
              <button className="p-2 bg-gray-100 dark:bg-indigo-600 border border-gray-200 dark:border-indigo-500 rounded-lg text-gray-900 dark:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {endpoints.map((ep) => (
              <EndpointCard key={ep.id} endpoint={ep} />
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 py-8 transition-colors">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-400 dark:text-slate-500 font-medium">
            &copy; {new Date().getFullYear()} QuarterMasterLT Dashboard. Powered by Gemini Sentinel Intelligence.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
