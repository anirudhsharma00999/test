import React from 'react';
import { AlertTriangle, Clock, ExternalLink } from 'lucide-react';

interface ThreatCardProps {
  threat: {
    id: string;
    url: string;
    type: string;
    riskScore: number;
    detected: string;
    reasons: string[];
  };
}

const ThreatCard: React.FC<ThreatCardProps> = ({ threat }) => {
  const getRiskColor = (score: number) => {
    if (score >= 80) return 'red';
    if (score >= 60) return 'orange';
    return 'yellow';
  };

  const riskColor = getRiskColor(threat.riskScore);
  const colorClasses = {
    red: 'bg-red-50 border-red-200 text-red-800',
    orange: 'bg-orange-50 border-orange-200 text-orange-800',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800'
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="font-medium text-gray-900 truncate">{threat.url}</h4>
            <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{threat.detected}</span>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${colorClasses[riskColor as keyof typeof colorClasses]}`}>
          {threat.riskScore}% Risk
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          threat.type === 'Phishing' ? 'bg-red-100 text-red-700' :
          threat.type === 'Malicious App' ? 'bg-purple-100 text-purple-700' :
          'bg-orange-100 text-orange-700'
        }`}>
          {threat.type}
        </span>
        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
          View Details
        </button>
      </div>
    </div>
  );
};

export default ThreatCard;