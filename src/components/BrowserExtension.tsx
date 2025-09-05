import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, TrendingUp, Eye, Zap, Globe, CheckCircle, Settings, Bell, Download } from 'lucide-react';
import { downloadChromeExtension, downloadFirefoxExtension } from '../utils/extensionDownload';

const BrowserExtension: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [protectionLevel, setProtectionLevel] = useState('high');
  const [notifications, setNotifications] = useState(true);
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);

  const blockedSites = [
    { url: 'paypal-secure.net', blocked: '2 mins ago', threat: 'Phishing' },
    { url: 'amazon-deals.org', blocked: '15 mins ago', threat: 'Scam' },
    { url: 'microsoft-update.com', blocked: '1 hour ago', threat: 'Malware' },
    { url: 'crypto-wallet-login.net', blocked: '2 hours ago', threat: 'Clone' }
  ];

  const handleChromeDownload = () => {
    try {
      downloadChromeExtension();
      setDownloadStatus('Chrome extension package downloaded! Check your downloads folder.');
      setTimeout(() => setDownloadStatus(null), 5000);
    } catch (error) {
      setDownloadStatus('Download failed. Please try again.');
      setTimeout(() => setDownloadStatus(null), 3000);
    }
  };

  const handleFirefoxDownload = () => {
    downloadFirefoxExtension();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Browser Extension</h1>
        <p className="text-gray-600">Real-time protection for web browsing with AI-powered threat detection</p>
      </div>

      {/* Extension Preview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Extension Interface</h2>
        
        {/* Mock Extension Popup */}
        <div className="max-w-md mx-auto">
          <div className="bg-gray-50 rounded-lg p-1 mb-4">
            <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Spot the Fake</h3>
                  <p className="text-xs text-gray-500">AI Protection Active</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium text-green-700">Site is Safe</span>
                  </div>
                  <span className="text-xs text-green-600">Verified</span>
                </div>
                
                <div className="text-center py-2">
                  <div className="text-2xl font-bold text-gray-900">247</div>
                  <div className="text-xs text-gray-500">Threats Blocked Today</div>
                </div>
                
                <button className="w-full py-2 text-blue-600 text-sm font-medium hover:text-blue-800">
                  View Protection Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Protection Settings</span>
          </h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Real-time Protection</h4>
                <p className="text-sm text-gray-500">Enable continuous monitoring</p>
              </div>
              <button
                onClick={() => setIsEnabled(!isEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isEnabled ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Protection Level
              </label>
              <select
                value={protectionLevel}
                onChange={(e) => setProtectionLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low - Basic detection</option>
                <option value="medium">Medium - Balanced protection</option>
                <option value="high">High - Maximum security</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Notifications</h4>
                <p className="text-sm text-gray-500">Alert on threat detection</p>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Recent Blocks */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Blocks</h3>
          <div className="space-y-3">
            {blockedSites.map((site, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900 text-sm">{site.url}</div>
                  <div className="text-xs text-gray-500">{site.blocked}</div>
                </div>
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                  {site.threat}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Download Section */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-8 text-white">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 opacity-90" />
          <h2 className="text-2xl font-bold mb-2">Download Browser Extension</h2>
          <p className="text-blue-100 mb-6 max-w-md mx-auto">
            Get real-time protection while browsing with our AI-powered fraud detection extension
          </p>
          
          <div className="flex items-center justify-center space-x-4">
            <button 
              onClick={handleChromeDownload}
              className="flex items-center space-x-2 px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors duration-200"
            >
              <Download className="w-5 h-5" />
              <span>Chrome Extension</span>
            </button>
            <button 
              onClick={handleFirefoxDownload}
              className="flex items-center space-x-2 px-6 py-3 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition-colors duration-200"
            >
              <Download className="w-5 h-5" />
              <span>Firefox Add-on</span>
            </button>
          </div>
          
          {downloadStatus && (
            <div className="mt-4 p-3 bg-white/20 rounded-lg text-center">
              <p className="text-sm text-white">{downloadStatus}</p>
            </div>
          )}
          
          <div className="flex items-center justify-center space-x-6 mt-6 text-sm text-blue-100">
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-4 h-4" />
              <span>Real-time scanning</span>
            </div>
            <div className="flex items-center space-x-1">
              <Shield className="w-4 h-4" />
              <span>Privacy-first design</span>
            </div>
            <div className="flex items-center space-x-1">
              <Bell className="w-4 h-4" />
              <span>Instant alerts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowserExtension;