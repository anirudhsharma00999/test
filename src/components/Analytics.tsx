import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Activity, Globe, Smartphone, AlertTriangle, Shield } from 'lucide-react';

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');

  const metrics = [
    {
      title: 'Detection Rate',
      value: '94.7%',
      change: '+2.3%',
      trend: 'up',
      description: 'Successful fraud identification rate'
    },
    {
      title: 'False Positives',
      value: '0.8%',
      change: '-0.2%',
      trend: 'down',
      description: 'Legitimate content incorrectly flagged'
    },
    {
      title: 'Response Time',
      value: '1.2s',
      change: '-0.3s',
      trend: 'down',
      description: 'Average analysis completion time'
    },
    {
      title: 'Coverage',
      value: '99.2%',
      change: '+0.1%',
      trend: 'up',
      description: 'Percentage of monitored domains'
    }
  ];

  const threatTrends = [
    { month: 'Oct', phishing: 245, malware: 156, scams: 89, clones: 67 },
    { month: 'Nov', phishing: 289, malware: 178, scams: 102, clones: 81 },
    { month: 'Dec', phishing: 324, malware: 201, scams: 134, clones: 95 },
    { month: 'Jan', phishing: 367, malware: 189, scams: 156, clones: 112 }
  ];

  const topTargets = [
    { brand: 'PayPal', attempts: 1247, change: '+23%' },
    { brand: 'Amazon', attempts: 1089, change: '+18%' },
    { brand: 'Microsoft', attempts: 892, change: '+31%' },
    { brand: 'Apple', attempts: 756, change: '+15%' },
    { brand: 'Google', attempts: 634, change: '+8%' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">Insights and trends from fraud detection system</p>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">{metric.title}</h3>
              {metric.trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
            </div>
            <div className="flex items-end space-x-2 mb-1">
              <span className="text-2xl font-bold text-gray-900">{metric.value}</span>
              <span className={`text-sm font-medium ${
                metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.change}
              </span>
            </div>
            <p className="text-xs text-gray-500">{metric.description}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Threat Trends Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Threat Trends</h3>
          <div className="space-y-4">
            {threatTrends.map((month, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">{month.month}</span>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">{month.phishing}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">{month.malware}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">{month.scams}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">{month.clones}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Targeted Brands */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Most Targeted Brands</h3>
          <div className="space-y-4">
            {topTargets.map((target, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{target.brand[0]}</span>
                  </div>
                  <span className="font-medium text-gray-900">{target.brand}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{target.attempts}</div>
                  <div className="text-sm text-green-600">{target.change}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detection Methods Performance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Detection Methods Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              method: 'NLP Content Analysis',
              accuracy: 94.7,
              speed: '0.3s',
              icon: Activity,
              color: 'blue'
            },
            {
              method: 'Visual Similarity Detection',
              accuracy: 89.2,
              speed: '0.8s',
              icon: Globe,
              color: 'purple'
            },
            {
              method: 'Domain Reputation Check',
              accuracy: 96.1,
              speed: '0.1s',
              icon: Shield,
              color: 'green'
            }
          ].map((method, index) => {
            const Icon = method.icon;
            return (
              <div key={index} className="text-center p-4 border border-gray-200 rounded-lg">
                <div className={`w-12 h-12 bg-${method.color}-100 rounded-lg flex items-center justify-center mx-auto mb-3`}>
                  <Icon className={`w-6 h-6 text-${method.color}-600`} />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">{method.method}</h4>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-gray-900">{method.accuracy}%</div>
                  <div className="text-sm text-gray-500">Avg: {method.speed}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Analytics;