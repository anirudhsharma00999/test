import { useState, useEffect } from 'react';
import { modelLoader } from '../services/modelLoader';
import * as tf from '@tensorflow/tfjs';

export interface ModelStatus {
  name: string;
  loaded: boolean;
  loading: boolean;
  error?: string;
}

export const useAIModels = () => {
  const [modelStatuses, setModelStatuses] = useState<ModelStatus[]>([
    { name: 'phishing-detector', loaded: false, loading: false },
    { name: 'content-classifier', loaded: false, loading: false },
    { name: 'domain-analyzer', loaded: false, loading: false }
  ]);

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    loadAllModels();
  }, []);

  const loadAllModels = async () => {
    const modelNames = ['phishing-detector', 'content-classifier', 'domain-analyzer'];
    
    for (const modelName of modelNames) {
      setModelStatuses(prev => 
        prev.map(status => 
          status.name === modelName 
            ? { ...status, loading: true, error: undefined }
            : status
        )
      );

      try {
        await modelLoader.loadModel(modelName);
        
        setModelStatuses(prev => 
          prev.map(status => 
            status.name === modelName 
              ? { ...status, loaded: true, loading: false }
              : status
          )
        );
      } catch (error) {
        console.error(`Failed to load model ${modelName}:`, error);
        
        setModelStatuses(prev => 
          prev.map(status => 
            status.name === modelName 
              ? { ...status, loading: false, error: error instanceof Error ? error.message : 'Unknown error' }
              : status
          )
        );
      }
    }

    // Check if all models are loaded
    const allLoaded = modelStatuses.every(status => status.loaded);
    setIsReady(allLoaded);
  };

  const getModelInfo = () => {
    return {
      totalModels: modelStatuses.length,
      loadedModels: modelStatuses.filter(s => s.loaded).length,
      failedModels: modelStatuses.filter(s => s.error).length,
      isReady,
      statuses: modelStatuses
    };
  };

  const reloadModel = async (modelName: string) => {
    setModelStatuses(prev => 
      prev.map(status => 
        status.name === modelName 
          ? { ...status, loading: true, error: undefined, loaded: false }
          : status
      )
    );

    try {
      await modelLoader.loadModel(modelName);
      
      setModelStatuses(prev => 
        prev.map(status => 
          status.name === modelName 
            ? { ...status, loaded: true, loading: false }
            : status
        )
      );
    } catch (error) {
      setModelStatuses(prev => 
        prev.map(status => 
          status.name === modelName 
            ? { ...status, loading: false, error: error instanceof Error ? error.message : 'Unknown error' }
            : status
        )
      );
    }
  };

  return {
    modelStatuses,
    isReady,
    getModelInfo,
    reloadModel,
    loadAllModels
  };
};

// TensorFlow.js backend configuration
export const configureTensorFlow = () => {
  // Set backend to WebGL for better performance
  tf.setBackend('webgl').then(() => {
    console.log('🧠 TensorFlow.js WebGL backend initialized');
  }).catch(() => {
    // Fallback to CPU backend
    tf.setBackend('cpu').then(() => {
      console.log('🧠 TensorFlow.js CPU backend initialized');
    });
  });

  // Enable production mode for better performance
  tf.enableProdMode();
  
  // Configure memory management
  tf.env().set('WEBGL_DELETE_TEXTURE_THRESHOLD', 0);
  tf.env().set('WEBGL_FORCE_F16_TEXTURES', true);
};