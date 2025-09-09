import * as tf from '@tensorflow/tfjs';

export class ModelLoader {
  private static instance: ModelLoader;
  private models: Map<string, tf.LayersModel> = new Map();
  private loadingPromises: Map<string, Promise<tf.LayersModel>> = new Map();

  static getInstance(): ModelLoader {
    if (!ModelLoader.instance) {
      ModelLoader.instance = new ModelLoader();
    }
    return ModelLoader.instance;
  }

  async loadModel(modelName: string, modelPath?: string): Promise<tf.LayersModel> {
    // Return cached model if already loaded
    if (this.models.has(modelName)) {
      return this.models.get(modelName)!;
    }

    // Return existing loading promise if model is currently being loaded
    if (this.loadingPromises.has(modelName)) {
      return this.loadingPromises.get(modelName)!;
    }

    // Start loading the model
    const loadingPromise = this.loadModelInternal(modelName, modelPath);
    this.loadingPromises.set(modelName, loadingPromise);

    try {
      const model = await loadingPromise;
      this.models.set(modelName, model);
      this.loadingPromises.delete(modelName);
      return model;
    } catch (error) {
      this.loadingPromises.delete(modelName);
      throw error;
    }
  }

  private async loadModelInternal(modelName: string, modelPath?: string): Promise<tf.LayersModel> {
    try {
      if (modelPath) {
        // Load custom model from path
        return await tf.loadLayersModel(modelPath);
      }

      // Create pre-configured models for different tasks
      switch (modelName) {
        case 'phishing-detector':
          return this.createPhishingDetectionModel();
        case 'content-classifier':
          return this.createContentClassificationModel();
        case 'domain-analyzer':
          return this.createDomainAnalysisModel();
        default:
          throw new Error(`Unknown model: ${modelName}`);
      }
    } catch (error) {
      console.error(`Error loading model ${modelName}:`, error);
      throw error;
    }
  }

  private createPhishingDetectionModel(): tf.LayersModel {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ 
          inputShape: [100], 
          units: 128, 
          activation: 'relu',
          kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
        }),
        tf.layers.batchNormalization(),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ 
          units: 64, 
          activation: 'relu',
          kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
        }),
        tf.layers.batchNormalization(),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.1 }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  private createContentClassificationModel(): tf.LayersModel {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [200], units: 256, activation: 'relu' }),
        tf.layers.batchNormalization(),
        tf.layers.dropout({ rate: 0.4 }),
        tf.layers.dense({ units: 128, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 64, activation: 'relu' }),
        tf.layers.dense({ units: 4, activation: 'softmax' }) // 4 classes: phishing, malware, scam, legitimate
      ]
    });

    model.compile({
      optimizer: 'adam',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  private createDomainAnalysisModel(): tf.LayersModel {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [50], units: 64, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' })
      ]
    });

    model.compile({
      optimizer: 'adam',
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  getLoadedModels(): string[] {
    return Array.from(this.models.keys());
  }

  disposeModel(modelName: string): void {
    const model = this.models.get(modelName);
    if (model) {
      model.dispose();
      this.models.delete(modelName);
    }
  }

  disposeAllModels(): void {
    this.models.forEach(model => model.dispose());
    this.models.clear();
  }
}

export const modelLoader = ModelLoader.getInstance();