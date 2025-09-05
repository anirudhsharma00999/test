import React, { useState } from 'react';
import { Search, Filter, Download, AlertTriangle, Shield, Smartphone, Globe } from 'lucide-react';

const ThreatDatabase: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const threats = [
    {
      id: '1',
      url: 'paypal-secure-login.net',
      type: 'Phishing',
      category: 'Website',
      riskScore: 95,
      status: 'Active',
      firstSeen: '2025-01-15',
      lastSeen: '2025-01-15',
      reports: 1247,
      description: 'Sophisticated PayPal login page replica with credential harvesting'
    },
    {
      id: '2',
      url: 'amazon-deals-app.apk',
      type: 'Malicious App',
      category: 'Mobile App',
      riskScore: 88,
      status: 'Blocked',
      firstSeen: '2025-01-14',
      lastSeen: '2025-01-15',
      reports: 892,
      description: 'Fake Amazon shopping app with excessive permissions and data exfiltration'
    },
    {
      id: '3',
      url: 'microsoft-office-update.com',
      type: 'Scam',
      category: 'Website',
      riskScore: 76,
      status: 'Monitoring',
      firstSeen: '2025-01-13',
      lastSeen: '2025-01-15',
      reports: 634,
      description: 'Fake Microsoft update page distributing potentially unwanted programs'
    },
    {
      id: '4',
      url: 'crypto-wallet-secure.org',
      type: 'Clone',
      category: 'Website',
      riskScore: 92,
      status: 'Active',
      firstSeen: '2025-01-12',
      lastSeen: '2025-01-15',
      reports: 2156,
      description: 'Cryptocurrency wallet clone designed to steal private keys'
    },
    {
      id: '5',
      url: 'banking-security-app.apk',
      type: 'Banking Trojan',
      category: 'Mobile App',
      riskScore: 98,
      status: 'Blocked',
      firstSeen: '2025-01-10',
      lastSeen: '2025-01-14',
      reports: 3421,
      description: 'Sophisticated banking trojan targeting multiple financial institutions'
    }
  ];

  const filteredThreats = threats.filter(threat => {
    const matchesSearch = threat.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         threat.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || threat.type.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-red-100 text-red-700 border-red-200';
      case 'Blocked': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'Monitoring': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-600 bg-red-50';
    if (score >= 60) return 'text-orange-600 bg-orange-50';
    return 'text-yellow-600 bg-yellow-50';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Threat Database</h1>
        <p className="text-gray-600">Comprehensive database of detected fraudulent content and patterns</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search threats by URL, type, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex space-x-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="phishing">Phishing</option>
              <option value="malicious app">Malicious App</option>
              <option value="scam">Scam</option>
              <option value="clone">Clone</option>
            </select>
            
            <button className="flex items-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Threat List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">
            {filteredThreats.length} Threats Found
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reports</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Seen</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredThreats.map((threat) => (
                <tr key={threat.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      {threat.category === 'Mobile App' ? (
                        <Smartphone className="w-5 h-5 text-gray-400" />
                      ) : (
                        <Globe className="w-5 h-5 text-gray-400" />
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{threat.url}</div>
                        <div className="text-sm text-gray-500">{threat.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      threat.type === 'Phishing' ? 'bg-red-100 text-red-700' :
                      threat.type === 'Malicious App' ? 'bg-purple-100 text-purple-700' :
                      threat.type === 'Banking Trojan' ? 'bg-pink-100 text-pink-700' :
                      threat.type === 'Clone' ? 'bg-blue-100 text-blue-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {threat.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${getRiskColor(threat.riskScore)}`}>
                      {threat.riskScore}%
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(threat.status)}`}>
                      {threat.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                    {threat.reports.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {threat.lastSeen}
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Investigate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ThreatDatabase;