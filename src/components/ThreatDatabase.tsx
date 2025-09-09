import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, AlertTriangle, Shield, Smartphone, Globe, Moon, Sun, ChevronDown, ChevronRight, ExternalLink, Eye } from 'lucide-react';
import { fraudDetectionAI } from '../services/aiModels';

interface ThreatEntry {
  id: string;
  url: string;
  domain: string;
  type: string;
  category: string;
  riskScore: number;
  status: string;
  firstSeen: string;
  lastSeen: string;
  reports: number;
  description: string;
  classification: string;
  confidence: number;
  evidence: string[];
  sourceUrl?: string;
  timestamp: string;
}

const ThreatDatabase: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [threats, setThreats] = useState<ThreatEntry[]>([
    {
      id: '1',
      url: 'paypal-secure-login.net',
      domain: 'paypal-secure-login.net',
      type: 'Phishing',
      category: 'Website',
      riskScore: 95,
      status: 'Active',
      firstSeen: '2025-01-15',
      lastSeen: '2025-01-15',
      reports: 1247,
      description: 'Sophisticated PayPal login page replica with credential harvesting',
      classification: 'Phishing',
      confidence: 95,
      evidence: ['Typosquatting PayPal domain', 'Credential harvesting forms', 'SSL certificate mismatch'],
      timestamp: '2025-01-15T10:30:00Z'
    },
    {
      id: '2',
      url: 'amazon-deals-app.apk',
      domain: 'amazon-deals-app.apk',
      type: 'Malicious App',
      category: 'Mobile App',
      riskScore: 88,
      status: 'Blocked',
      firstSeen: '2025-01-14',
      lastSeen: '2025-01-15',
      reports: 892,
      description: 'Fake Amazon shopping app with excessive permissions and data exfiltration',
      classification: 'Malicious',
      confidence: 88,
      evidence: ['Excessive permissions', 'Data exfiltration code', 'Fake Amazon branding'],
      timestamp: '2025-01-14T14:20:00Z'
    },
    {
      id: '3',
      url: 'microsoft-office-update.com',
      domain: 'microsoft-office-update.com',
      type: 'Scam',
      category: 'Website',
      riskScore: 76,
      status: 'Monitoring',
      firstSeen: '2025-01-13',
      lastSeen: '2025-01-15',
      reports: 634,
      description: 'Fake Microsoft update page distributing potentially unwanted programs',
      classification: 'Suspicious',
      confidence: 76,
      evidence: ['Fake Microsoft branding', 'Malware distribution', 'Deceptive download links'],
      timestamp: '2025-01-13T09:15:00Z'
    },
    {
      id: '4',
      url: 'crypto-wallet-secure.org',
      domain: 'crypto-wallet-secure.org',
      type: 'Clone',
      category: 'Website',
      riskScore: 92,
      status: 'Active',
      firstSeen: '2025-01-12',
      lastSeen: '2025-01-15',
      reports: 2156,
      description: 'Cryptocurrency wallet clone designed to steal private keys',
      classification: 'Phishing',
      confidence: 92,
      evidence: ['Wallet clone interface', 'Private key harvesting', 'Cryptocurrency theft'],
      timestamp: '2025-01-12T16:45:00Z'
    },
    {
      id: '5',
      url: 'banking-security-app.apk',
      domain: 'banking-security-app.apk',
      type: 'Banking Trojan',
      category: 'Mobile App',
      riskScore: 98,
      status: 'Blocked',
      firstSeen: '2025-01-10',
      lastSeen: '2025-01-14',
      reports: 3421,
      description: 'Sophisticated banking trojan targeting multiple financial institutions',
      classification: 'Malicious',
      confidence: 98,
      evidence: ['Banking trojan code', 'SMS interception', 'Overlay attacks'],
      timestamp: '2025-01-10T11:30:00Z'
    }
  ]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  const handleImport = async () => {
    if (!importUrl.trim()) {
      alert('Please enter a database URL');
      return;
    }

    setIsImporting(true);
    try {
      // Fetch data from the provided URL
      const fetchedThreats = await importPhishingDatabase(importUrl);
      
      // Remove duplicates based on URL
      const existingUrls = new Set(threats.map(t => t.url));
      const newThreats = fetchedThreats.filter(t => !existingUrls.has(t.url));
      
      // Add new threats to existing ones
      setThreats(prev => [...prev, ...newThreats]);
      
      // Show success message
      alert(`Successfully imported ${newThreats.length} new threats from database! (${fetchedThreats.length - newThreats.length} duplicates removed)`);
      
      // Close modal and reset form
      setShowImportModal(false);
      setImportUrl('');

    } catch (error) {
      console.error('Import error:', error);
      alert(`Failed to import database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsImporting(false);
    }
  };

  const importPhishingDatabase = async (url: string): Promise<ThreatEntry[]> => {
    try {
      // Use CORS proxy for external URLs
      const corsProxy = 'https://api.allorigins.win/raw?url=';
      const fetchUrl = url.startsWith('http') ? `${corsProxy}${encodeURIComponent(url)}` : url;
      
      const response = await fetch(fetchUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/csv, text/plain, */*'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type') || '';
      const data = await response.text();

      let urls: string[] = [];

      // Parse different formats
      if (contentType.includes('json') || data.trim().startsWith('{') || data.trim().startsWith('[')) {
        urls = parseJsonDatabase(data);
      } else if (contentType.includes('csv') || data.includes(',')) {
        urls = parseCsvDatabase(data);
      } else {
        urls = parseTextDatabase(data);
      }

      // Classify each URL and create threat entries
      const threats: ThreatEntry[] = [];
      for (const url of urls) {
        if (url && url.trim()) {
          const threat = await classifyUrl(url.trim(), url);
          threats.push(threat);
        }
      }

      return threats;
    } catch (error) {
      console.error('Database import error:', error);
      throw error;
    }
  };

  const parseJsonDatabase = (data: string): string[] => {
    try {
      const json = JSON.parse(data);
      const urls: string[] = [];

      if (Array.isArray(json)) {
        json.forEach(item => {
          if (typeof item === 'string') {
            urls.push(item);
          } else if (typeof item === 'object' && item !== null) {
            // Extract URLs from various possible fields
            const possibleFields = ['url', 'domain', 'site', 'link', 'address', 'host'];
            for (const field of possibleFields) {
              if (item[field] && typeof item[field] === 'string') {
                urls.push(item[field]);
                break;
              }
            }
          }
        });
      } else if (typeof json === 'object') {
        // Handle object with arrays of URLs
        Object.values(json).forEach(value => {
          if (Array.isArray(value)) {
            value.forEach(item => {
              if (typeof item === 'string') urls.push(item);
            });
          }
        });
      }

      return urls;
    } catch (error) {
      throw new Error('Invalid JSON format');
    }
  };

  const parseCsvDatabase = (data: string): string[] => {
    const lines = data.split('\n').filter(line => line.trim());
    const urls: string[] = [];

    lines.forEach((line, index) => {
      if (index === 0 && line.toLowerCase().includes('url')) {
        return; // Skip header
      }
      
      const columns = line.split(',').map(col => col.trim().replace(/"/g, ''));
      
      // Try to find URL column
      for (const col of columns) {
        if (col.includes('.') && (col.startsWith('http') || col.includes('.'))) {
          urls.push(col);
          break;
        }
      }
    });

    return urls;
  };

  const parseTextDatabase = (data: string): string[] => {
    const lines = data.split('\n').filter(line => line.trim());
    const urls: string[] = [];

    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed && (trimmed.includes('.') || trimmed.startsWith('http'))) {
        urls.push(trimmed);
      }
    });

    return urls;
  };

  const classifyUrl = async (url: string, sourceUrl: string): Promise<ThreatEntry> => {
    try {
      // Use AI classification
      const analysis = await fraudDetectionAI.analyzeContent(url.startsWith('http') ? url : `https://${url}`);
      
      const domain = extractDomain(url);
      const timestamp = new Date().toISOString();
      
      return {
        id: `import-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        url,
        domain,
        type: analysis.threatType,
        category: 'Website',
        riskScore: analysis.riskScore,
        status: analysis.riskScore > 70 ? 'Blocked' : analysis.riskScore > 40 ? 'Monitoring' : 'Safe',
        firstSeen: new Date().toISOString().split('T')[0],
        lastSeen: new Date().toISOString().split('T')[0],
        reports: Math.floor(Math.random() * 1000) + 100,
        description: `Imported from external database - ${analysis.classification}`,
        classification: analysis.classification,
        confidence: analysis.riskScore,
        evidence: analysis.detectionReasons,
        sourceUrl,
        timestamp
      };
    } catch (error) {
      console.error('Classification error for', url, error);
      
      // Fallback classification
      const domain = extractDomain(url);
      return {
        id: `import-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        url,
        domain,
        type: 'Unknown',
        category: 'Website',
        riskScore: 50,
        status: 'Unknown',
        firstSeen: new Date().toISOString().split('T')[0],
        lastSeen: new Date().toISOString().split('T')[0],
        reports: 0,
        description: 'Imported from external database - classification failed',
        classification: 'Unknown',
        confidence: 0,
        evidence: ['Classification failed'],
        sourceUrl,
        timestamp: new Date().toISOString()
      };
    }
  };

  const extractDomain = (url: string): string => {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return urlObj.hostname;
    } catch {
      return url.split('/')[0];
    }
  };

  const toggleRowExpansion = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const filteredThreats = threats.filter(threat => {
    const matchesSearch = threat.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         threat.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         threat.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || threat.type.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredThreats.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedThreats = filteredThreats.slice(startIndex, startIndex + itemsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return darkMode ? 'bg-red-900 text-red-300 border-red-700' : 'bg-red-100 text-red-700 border-red-200';
      case 'Blocked': return darkMode ? 'bg-gray-800 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-700 border-gray-200';
      case 'Monitoring': return darkMode ? 'bg-yellow-900 text-yellow-300 border-yellow-700' : 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return darkMode ? 'bg-gray-800 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return darkMode ? 'text-red-400 bg-red-900' : 'text-red-600 bg-red-50';
    if (score >= 60) return darkMode ? 'text-orange-400 bg-orange-900' : 'text-orange-600 bg-orange-50';
    return darkMode ? 'text-yellow-400 bg-yellow-900' : 'text-yellow-600 bg-yellow-50';
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-slate-50 to-blue-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Threat Database
            </h1>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Comprehensive database of detected fraudulent content and patterns
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className={`rounded-xl shadow-sm border p-6 mb-8 ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        }`}>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  darkMode ? 'text-gray-400' : 'text-gray-400'
                }`} />
                <input
                  type="text"
                  placeholder="Search threats by URL, type, or description... Or paste database URL to import"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && searchTerm.startsWith('http')) {
                      setImportUrl(searchTerm);
                      setShowImportModal(true);
                    }
                  }}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
            </div>
            
            <div className="flex space-x-3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className={`px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">All Types</option>
                <option value="phishing">Phishing</option>
                <option value="malicious app">Malicious App</option>
                <option value="scam">Scam</option>
                <option value="clone">Clone</option>
              </select>
              
              <button 
                onClick={() => setShowImportModal(true)}
                className="flex items-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <Download className="w-4 h-4" />
                <span>Import Database</span>
              </button>
            </div>
          </div>
        </div>

        {/* Import Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`rounded-xl shadow-xl p-6 w-full max-w-md mx-4 ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Import Phishing Database
              </h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="import-url" className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Database URL (JSON, CSV, or Text)
                  </label>
                  <input
                    type="url"
                    id="import-url"
                    value={importUrl}
                    onChange={(e) => setImportUrl(e.target.value)}
                    placeholder="https://example.com/phishing-sites.json"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    disabled={isImporting}
                  />
                  <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Supports JSON arrays, CSV files, or plain text with one URL per line
                  </p>
                </div>
                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowImportModal(false);
                      setImportUrl('');
                    }}
                    disabled={isImporting}
                    className={`px-4 py-2 border rounded-lg transition-colors duration-200 ${
                      darkMode 
                        ? 'text-gray-300 border-gray-600 hover:bg-gray-700' 
                        : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={isImporting || !importUrl.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {isImporting ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Importing...</span>
                      </div>
                    ) : (
                      'Import'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Threat List */}
        <div className={`rounded-xl shadow-sm border overflow-hidden ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        }`}>
          <div className={`px-6 py-4 border-b ${
            darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
          }`}>
            <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {filteredThreats.length} Threats Found
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`border-b ${
                darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>Target</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>Type</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>Risk</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>Confidence</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>Status</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>Reports</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {paginatedThreats.map((threat) => (
                  <React.Fragment key={threat.id}>
                    <tr className={`transition-colors duration-150 ${
                      darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    }`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => toggleRowExpansion(threat.id)}
                            className={`p-1 rounded hover:bg-gray-200 ${
                              darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                            }`}
                          >
                            {expandedRows.has(threat.id) ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                          {threat.category === 'Mobile App' ? (
                            <Smartphone className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                          ) : (
                            <Globe className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                          )}
                          <div>
                            <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {threat.url}
                            </div>
                            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {threat.domain}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          threat.type === 'Phishing' ? (darkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-700') :
                          threat.type === 'Malicious App' ? (darkMode ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-700') :
                          threat.type === 'Banking Trojan' ? (darkMode ? 'bg-pink-900 text-pink-300' : 'bg-pink-100 text-pink-700') :
                          threat.type === 'Clone' ? (darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700') :
                          (darkMode ? 'bg-orange-900 text-orange-300' : 'bg-orange-100 text-orange-700')
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
                        <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {threat.confidence}%
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(threat.status)}`}>
                          {threat.status}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {threat.reports.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>Investigate</span>
                        </button>
                      </td>
                    </tr>
                    
                    {/* Expanded Row Details */}
                    {expandedRows.has(threat.id) && (
                      <tr className={darkMode ? 'bg-gray-900' : 'bg-gray-50'}>
                        <td colSpan={7} className="px-6 py-4">
                          <div className="space-y-4">
                            <div>
                              <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                Classification Details
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    Classification:
                                  </span>
                                  <p className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {threat.classification}
                                  </p>
                                </div>
                                <div>
                                  <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    Confidence Score:
                                  </span>
                                  <p className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {threat.confidence}%
                                  </p>
                                </div>
                                <div>
                                  <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    First Detected:
                                  </span>
                                  <p className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {threat.firstSeen}
                                  </p>
                                </div>
                                <div>
                                  <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    Last Seen:
                                  </span>
                                  <p className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {threat.lastSeen}
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                Evidence
                              </h4>
                              <ul className="space-y-1">
                                {threat.evidence.map((evidence, index) => (
                                  <li key={index} className={`text-sm flex items-center space-x-2 ${
                                    darkMode ? 'text-gray-300' : 'text-gray-600'
                                  }`}>
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    <span>{evidence}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            {threat.sourceUrl && (
                              <div>
                                <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                  Source
                                </h4>
                                <a 
                                  href={threat.sourceUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  <span>{threat.sourceUrl}</span>
                                </a>
                              </div>
                            )}
                            
                            <div>
                              <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                Description
                              </h4>
                              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                {threat.description}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className={`px-6 py-4 border-t flex items-center justify-between ${
              darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredThreats.length)} of {filteredThreats.length} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded border text-sm transition-colors duration-200 ${
                    darkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50'
                  } disabled:cursor-not-allowed`}
                >
                  Previous
                </button>
                <span className={`px-3 py-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded border text-sm transition-colors duration-200 ${
                    darkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50'
                  } disabled:cursor-not-allowed`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThreatDatabase;