import React from 'react';
import { Brain, CheckCircle, AlertCircle, Loader, RefreshCw } from 'lucide-react';
import { useAIModels } from '../hooks/useAIModels';

const AIModelStatus: React.FC = () => {
  const { modelStatuses, isReady, getModelInfo, reloadModel } = useAIModels();
  const modelInfo = getModelInfo();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <Brain className="w-5 h-5" />
          <span>AI Models Status</span>
        </h3>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          isReady 
            ? 'bg-green-100 text-green-700' 
            : 'bg-orange-100 text-orange-700'
        }`}>
          {isReady ? 'All Systems Ready' : 'Loading Models'}
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {modelStatuses.map((status) => (
          <div key={status.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {status.loading ? (
                <Loader className="w-4 h-4 text-blue-500 animate-spin" />
              ) : status.loaded ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
              <div>
                <div className="font-medium text-gray-900 capitalize">
                  {status.name.replace('-', ' ')}
                </div>
                {status.error && (
                  <div className="text-xs text-red-600">{status.error}</div>
                )}
              </div>
            </div>
            
            {status.error && (
              <button
                onClick={() => reloadModel(status.name)}
                className="p-1 text-gray-400 hover:text-gray-600"
                title="Retry loading model"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-lg font-bold text-gray-900">{modelInfo.loadedModels}</div>
          <div className="text-xs text-gray-500">Loaded</div>
        </div>
        <div>
          <div className="text-lg font-bold text-gray-900">{modelInfo.totalModels}</div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
        <div>
          <div className="text-lg font-bold text-gray-900">{modelInfo.failedModels}</div>
          <div className="text-xs text-gray-500">Failed</div>
        </div>
      </div>
    </div>
  );
};

export default AIModelStatus;