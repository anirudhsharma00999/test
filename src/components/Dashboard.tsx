import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, TrendingUp, Eye, Zap, Globe, Moon, Sun } from 'lucide-react';
import ThreatCard from './ThreatCard';
import RiskChart from './RiskChart';
import { realTimeDetection, RealTimeAlert } from '../services/realTimeDetection';
import AIModelStatus from './AIModelStatus';

interface PendingThreat {
  alert: RealTimeAlert;
  timeoutId: NodeJS.Timeout;
}
const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalScanned: 0,
    threatsDetected: 0,
    riskScore: 0,
    activeThreats: 0
  });

  const [recentThreats, setRecentThreats] = useState<RealTimeAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  useEffect(() => {
    // Start real-time monitoring
    realTimeDetection.startMonitoring();
    setIsMonitoring(true);

    // Subscribe to real-time alerts
    const unsubscribe = realTimeDetection.subscribe((alert: RealTimeAlert) => {
      // Add threat directly to the list without delay
      setRecentThreats(prev => [alert, ...prev.slice(0, 4)]); // Keep last 5 alerts
      
      // Update stats when new threats are detected
      setStats(prev => ({
        ...prev,
        threatsDetected: prev.threatsDetected + 1,
        activeThreats: prev.activeThreats + (alert.blocked ? 1 : 0)
      }));
    });

    // Load initial alerts
    setRecentThreats(realTimeDetection.getRecentAlerts(5));

    const interval = setInterval(() => {
      setStats(prev => ({
        totalScanned: prev.totalScanned + Math.floor(Math.random() * 3) + 1,
        threatsDetected: prev.threatsDetected,
        riskScore: Math.floor(Math.random() * 20) + 15,
        activeThreats: prev.activeThreats
      }));
    }, 3000);

    return () => {
      clearInterval(interval);
      unsubscribe();
      realTimeDetection.stopMonitoring();
      setIsMonitoring(false);
    };
  }, []);

  const statCards = [
    {
      title: 'Total Scanned',
      value: (24847 + stats.totalScanned).toLocaleString(),
      change: '+12.5%',
      icon: Eye,
      color: 'blue'
    },
    {
      title: 'Threats Detected',
      value: (1243 + stats.threatsDetected).toLocaleString(),
      change: '+8.2%',
      icon: AlertTriangle,
      color: 'red'
    },
    {
      title: 'Risk Score',
      value: stats.riskScore,
      change: 'Low',
      icon: Shield,
      color: 'green'
    },
    {
      title: 'Active Threats',
      value: stats.activeThreats,
      change: '-5.1%',
      icon: Zap,
      color: 'orange'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Security Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">Real-time monitoring of fraudulent content across the web</p>
        </div>
        
        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-2 rounded-lg transition-colors duration-200 ${
            darkMode 
              ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
              : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm border border-gray-200'
          }`}
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'bg-blue-500 text-blue-50',
            red: 'bg-red-500 text-red-50',
            green: 'bg-green-500 text-green-50',
            orange: 'bg-orange-500 text-orange-50'
          };

          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                  stat.change.startsWith('+') ? 'bg-green-100 text-green-700' :
                  stat.change.startsWith('-') ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-gray-500 text-sm">{stat.title}</p>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Threats */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Threats Detected</h2>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-500">Live monitoring</span>
              </div>
            </div>
            
            <div className="space-y-4">
              {recentThreats.map((threat) => (
                <ThreatCard 
                  key={threat.id} 
                  threat={{
                    id: threat.id,
                    url: threat.url,
                    type: threat.threatType,
                    riskScore: threat.riskScore,
                    detected: formatTimeAgo(threat.timestamp),
                    reasons: [`AI Model Detection: ${threat.threatType}`, `Risk Score: ${threat.riskScore}%`]
                  }} 
                />
              ))}
              {recentThreats.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No recent threats detected</p>
                  <p className="text-sm">AI monitoring is {isMonitoring ? 'active' : 'inactive'}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Risk Analysis */}
        <div className="space-y-6">
          <AIModelStatus />
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Distribution</h3>
            <RiskChart />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detection Capabilities</h3>
            <div className="space-y-3">
              {[
                { label: 'NLP Analysis', accuracy: 94 },
                { label: 'Visual Similarity', accuracy: 89 },
                { label: 'Domain Reputation', accuracy: 96 },
                { label: 'Behavioral Patterns', accuracy: 91 }
              ].map((capability, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{capability.label}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000"
                        style={{ width: `${capability.accuracy}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{capability.accuracy}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  function formatTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} mins ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  }
};

export default Dashboard;