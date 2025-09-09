import React from 'react';

const RiskChart: React.FC = () => {
  const data = [
    { label: 'Phishing', value: 45, color: 'bg-red-500' },
    { label: 'Malware', value: 25, color: 'bg-purple-500' },
    { label: 'Scams', value: 20, color: 'bg-orange-500' },
    { label: 'Clones', value: 10, color: 'bg-yellow-500' }
  ];

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
            <span className="text-sm font-medium text-gray-700">{item.label}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${item.color} transition-all duration-1000`}
                style={{ width: `${item.value * 2}%` }}
              ></div>
            </div>
            <span className="text-sm font-bold text-gray-900 w-8">{item.value}%</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RiskChart;