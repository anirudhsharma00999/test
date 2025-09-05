import React from 'react';
import { AlertTriangle, CheckCircle, XCircle, Eye, Brain, Shield, Activity, ExternalLink } from 'lucide-react';

interface ScanResultProps {
  result: any;
  onNewScan: () => void;
}

const ScanResult: React.FC<ScanResultProps> = ({ result, onNewScan }) => {
  const getRiskColor = (score: number) => {
    if (score >= 70) return 'red';
    if (score >= 40) return 'orange';
    return 'green';
  };

  const getRiskIcon = (score: number) => {
    if (score >= 70) return XCircle;
    if (score >= 40) return AlertTriangle;
    return CheckCircle;
  };

  const riskColor = getRiskColor(result.riskScore);
  const RiskIcon = getRiskIcon(result.riskScore);

  const colorClasses = {
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      icon: 'text-red-500'
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-700',
      icon: 'text-orange-500'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      icon: 'text-green-500'
    }
  };

  const colors = colorClasses[riskColor as keyof typeof colorClasses];

  return (
    <div className="space-y-6">
      {/* Main Result Card */}
      <div className={`rounded-xl border-2 p-6 ${colors.bg} ${colors.border}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <RiskIcon className={`w-8 h-8 ${colors.icon}`} />
            <div>
              <h2 className="text-xl font-bold text-gray-900">{result.classification}</h2>
              <p className="text-gray-600">{result.target}</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${colors.text}`}>{result.riskScore}</div>
            <div className="text-sm text-gray-500">Risk Score</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <span className="text-sm font-medium text-gray-500">Threat Type</span>
            <p className="text-lg font-semibold text-gray-900">{result.threatType}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Detected</span>
            <p className="text-lg font-semibold text-gray-900">{new Date(result.timestamp).toLocaleTimeString()}</p>
          </div>
        </div>

        {/* Detection Reasons */}
        {result.detectionReasons.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Why This Was Flagged</h3>
            <ul className="space-y-2">
              {result.detectionReasons.map((reason: string, index: number) => (
                <li key={index} className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${colors.icon.replace('text-', 'bg-')}`}></div>
                  <span className="text-gray-700">{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Detailed Analysis */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Detailed AI Analysis</h3>
        
        {/* Model Predictions */}
        {result.modelPredictions && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">AI Model Predictions</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-red-600">{result.modelPredictions.phishingProbability}%</div>
                <div className="text-xs text-gray-500">Phishing</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">{result.modelPredictions.malwareProbability}%</div>
                <div className="text-xs text-gray-500">Malware</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">{result.modelPredictions.scamProbability}%</div>
                <div className="text-xs text-gray-500">Scam</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{result.modelPredictions.legitimateProbability}%</div>
                <div className="text-xs text-gray-500">Legitimate</div>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              label: 'NLP Model', 
              score: result.analysisDetails.nlpConfidence, 
              icon: Brain,
              description: 'Natural language processing confidence'
            },
            { 
              label: 'Computer Vision', 
              score: result.analysisDetails.visualSimilarity, 
              icon: Eye,
              description: 'Visual similarity detection accuracy'
            },
            { 
              label: 'Domain Reputation', 
              score: result.analysisDetails.domainReputation, 
              icon: Shield,
              description: 'Domain intelligence and reputation score'
            },
            { 
              label: 'Behavioral AI', 
              score: result.analysisDetails.behavioralScore, 
              icon: Activity,
              description: 'Behavioral pattern recognition score'
            }
          ].map((analysis, index) => {
            const Icon = analysis.icon;
            return (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-8 h-8 text-gray-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{analysis.score}%</div>
                <div className="text-sm font-medium text-gray-900 mb-1">{analysis.label}</div>
                <div className="text-xs text-gray-500">{analysis.description}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Recommendations</h3>
        <div className="space-y-3">
          {result.riskScore > 70 ? (
            <>
              <div className="flex items-center space-x-2 text-red-700">
                <XCircle className="w-5 h-5" />
                <span className="font-medium">Block access to this content immediately</span>
              </div>
              <div className="flex items-center space-x-2 text-red-700">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">Report to security team and threat databases</span>
              </div>
              <div className="flex items-center space-x-2 text-red-700">
                <Shield className="w-5 h-5" />
                <span className="font-medium">Add to blocklist and monitor for variants</span>
              </div>
            </>
          ) : result.riskScore > 40 ? (
            <>
              <div className="flex items-center space-x-2 text-orange-700">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">Exercise caution when accessing this content</span>
              </div>
              <div className="flex items-center space-x-2 text-orange-700">
                <Eye className="w-5 h-5" />
                <span className="font-medium">Monitor for suspicious activity</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-2 text-green-700">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Content appears legitimate</span>
              </div>
              <div className="flex items-center space-x-2 text-green-700">
                <Shield className="w-5 h-5" />
                <span className="font-medium">Continue regular monitoring</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onNewScan}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
        >
          Scan Another
        </button>
        
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            Export Report
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            Add to Watchlist
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScanResult;