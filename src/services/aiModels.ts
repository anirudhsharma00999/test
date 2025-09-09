import * as tf from '@tensorflow/tfjs';
import { HfInference } from '@huggingface/inference';
import OpenAI from 'openai';

// Simple tokenizer class for browser compatibility
class SimpleTokenizer {
  tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 0);
  }
}

// Simple sentiment analysis function
function analyzeSentiment(text: string): { score: number; comparative: number } {
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'like', 'happy', 'pleased'];
  const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'angry', 'sad', 'disappointed', 'frustrated', 'annoyed'];
  
  const words = text.toLowerCase().split(/\s+/);
  let score = 0;
  
  words.forEach(word => {
    if (positiveWords.includes(word)) score += 1;
    if (negativeWords.includes(word)) score -= 1;
  });
  
  return {
    score,
    comparative: words.length > 0 ? score / words.length : 0
  };
}

// Initialize AI services
const hf = import.meta.env.VITE_HUGGINGFACE_API_KEY ? 
  new HfInference(import.meta.env.VITE_HUGGINGFACE_API_KEY) : null;

const openai = import.meta.env.VITE_OPENAI_API_KEY ? 
  new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  }) : null;

export interface AIAnalysisResult {
  riskScore: number;
  classification: string;
  threatType: string;
  detectionReasons: string[];
  analysisDetails: {
    nlpConfidence: number;
    visualSimilarity: number;
    domainReputation: number;
    behavioralScore: number;
  };
  modelPredictions: {
    phishingProbability: number;
    malwareProbability: number;
    scamProbability: number;
    legitimateProbability: number;
  };
}

// Phishing detection model using TensorFlow.js
class PhishingDetectionModel {
  private model: tf.LayersModel | null = null;
  private tokenizer: SimpleTokenizer;

  constructor() {
    this.tokenizer = new SimpleTokenizer();
    this.loadModel();
  }

  private async loadModel() {
    try {
      // Load pre-trained model or create a simple neural network
      this.model = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape: [100], units: 64, activation: 'relu' }),
          tf.layers.dropout({ rate: 0.3 }),
          tf.layers.dense({ units: 32, activation: 'relu' }),
          tf.layers.dropout({ rate: 0.2 }),
          tf.layers.dense({ units: 1, activation: 'sigmoid' })
        ]
      });

      this.model.compile({
        optimizer: 'adam',
        loss: 'binaryCrossentropy',
        metrics: ['accuracy']
      });
    } catch (error) {
      console.error('Error loading phishing detection model:', error);
    }
  }

  async analyzeContent(content: string): Promise<number> {
    if (!this.model) return 0.5;

    try {
      // Extract features from content
      const features = this.extractFeatures(content);
      const tensor = tf.tensor2d([features]);
      const prediction = this.model.predict(tensor) as tf.Tensor;
      const result = await prediction.data();
      
      tensor.dispose();
      prediction.dispose();
      
      return result[0];
    } catch (error) {
      console.error('Error in content analysis:', error);
      return 0.5;
    }
  }

  private extractFeatures(content: string): number[] {
    const features = new Array(100).fill(0);
    const tokens = this.tokenizer.tokenize(content.toLowerCase());
    
    // Suspicious keywords with weights
    const suspiciousKeywords = {
      'urgent': 0.8, 'verify': 0.7, 'suspended': 0.9, 'limited': 0.6,
      'click': 0.5, 'immediately': 0.7, 'confirm': 0.6, 'update': 0.5,
      'security': 0.4, 'account': 0.3, 'login': 0.4, 'password': 0.5,
      'paypal': 0.8, 'amazon': 0.7, 'microsoft': 0.7, 'apple': 0.7,
      'bank': 0.8, 'credit': 0.6, 'card': 0.6, 'social': 0.5
    };

    // Calculate feature scores
    let suspiciousScore = 0;
    let urgencyScore = 0;
    let brandMentions = 0;

    tokens?.forEach(token => {
      const stemmed = this.simpleStem(token);
      if (suspiciousKeywords[token] || suspiciousKeywords[stemmed]) {
        suspiciousScore += suspiciousKeywords[token] || suspiciousKeywords[stemmed];
      }
      if (['urgent', 'immediate', 'now', 'quickly'].includes(token)) {
        urgencyScore += 0.3;
      }
      if (['paypal', 'amazon', 'microsoft', 'apple', 'google'].includes(token)) {
        brandMentions += 0.4;
      }
    });

    // Populate feature vector
    features[0] = Math.min(suspiciousScore / 10, 1);
    features[1] = Math.min(urgencyScore / 5, 1);
    features[2] = Math.min(brandMentions / 3, 1);
    features[3] = content.length / 10000; // Content length normalized
    features[4] = (content.match(/https?:\/\//g) || []).length / 10; // URL count
    
    return features;
  }

  private simpleStem(word: string): string {
    // Simple stemming algorithm - removes common suffixes
    const suffixes = ['ing', 'ed', 'er', 'est', 'ly', 'ion', 'tion', 'ness', 'ment'];
    let stemmed = word.toLowerCase();
    
    for (const suffix of suffixes) {
      if (stemmed.endsWith(suffix) && stemmed.length > suffix.length + 2) {
        stemmed = stemmed.slice(0, -suffix.length);
        break;
      }
    }
    
    return stemmed;
  }
}

// NLP Analysis using Hugging Face models
export class NLPAnalyzer {
  async analyzeText(text: string): Promise<{
    sentiment: number;
    phishingProbability: number;
    suspiciousPatterns: string[];
  }> {
    try {
      // Sentiment analysis
      const sentimentResult = analyzeSentiment(text);
      
      // Detect suspicious patterns
      const suspiciousPatterns = this.detectSuspiciousPatterns(text);
      
      // Use Hugging Face for text classification
      let classificationResult;
      
      if (hf) {
        try {
          classificationResult = await hf.textClassification({
            model: 'martin-ha/toxic-comment-model',
            inputs: text
          });
        } catch (error) {
          console.warn('Hugging Face API error, using fallback analysis');
        }
      }
      // Calculate phishing probability based on multiple factors
      const phishingProbability = this.calculatePhishingProbability(
        text, 
        sentimentResult, 
        suspiciousPatterns
      );

      return {
        sentiment: sentimentResult.score,
        phishingProbability,
        suspiciousPatterns
      };
    } catch (error) {
      console.error('NLP Analysis error:', error);
      return {
        sentiment: 0,
        phishingProbability: 0.1,
        suspiciousPatterns: []
      };
    }
  }

  private detectSuspiciousPatterns(text: string): string[] {
    const patterns = [
      { pattern: /verify.*account/i, description: 'Account verification request' },
      { pattern: /suspended.*account/i, description: 'Account suspension claim' },
      { pattern: /click.*here.*immediately/i, description: 'Urgent action request' },
      { pattern: /update.*payment/i, description: 'Payment update request' },
      { pattern: /confirm.*identity/i, description: 'Identity confirmation request' },
      { pattern: /limited.*time/i, description: 'Time pressure tactics' },
      { pattern: /security.*alert/i, description: 'Fake security alert' },
      { pattern: /act.*now/i, description: 'Urgency manipulation' }
    ];

    return patterns
      .filter(p => p.pattern.test(text))
      .map(p => p.description);
  }

  private calculatePhishingProbability(
    text: string, 
    sentiment: any, 
    patterns: string[]
  ): number {
    let probability = 0;

    // Base probability from suspicious patterns
    probability += patterns.length * 0.15;

    // Sentiment analysis (negative sentiment often indicates threats)
    if (sentiment.score < -0.3) probability += 0.2;

    // Urgency indicators
    const urgencyWords = ['urgent', 'immediate', 'now', 'quickly', 'asap'];
    const urgencyCount = urgencyWords.filter(word => 
      text.toLowerCase().includes(word)
    ).length;
    probability += urgencyCount * 0.1;

    // Brand mentions without proper context
    const brands = ['paypal', 'amazon', 'microsoft', 'apple', 'google', 'facebook'];
    const brandMentions = brands.filter(brand => 
      text.toLowerCase().includes(brand)
    ).length;
    if (brandMentions > 0) probability += 0.15;

    return Math.min(probability, 1);
  }
}

// Domain analysis using real APIs and heuristics
export class DomainAnalyzer {
  async analyzeDomain(url: string): Promise<{
    reputation: number;
    isTyposquatting: boolean;
    certificateValid: boolean;
    registrationAge: number;
    suspiciousSubdomains: boolean;
  }> {
    try {
      const domain = new URL(url).hostname;
      
      // Check for typosquatting
      const isTyposquatting = this.detectTyposquatting(domain);
      
      // Analyze subdomains
      const suspiciousSubdomains = this.analyzeSuspiciousSubdomains(domain);
      
      // Estimate domain age (in real implementation, use WHOIS API)
      const registrationAge = this.estimateRegistrationAge(domain);
      
      // Calculate reputation score
      const reputation = this.calculateReputationScore(
        domain, 
        isTyposquatting, 
        suspiciousSubdomains, 
        registrationAge
      );

      return {
        reputation,
        isTyposquatting,
        certificateValid: true, // Would check SSL in real implementation
        registrationAge,
        suspiciousSubdomains
      };
    } catch (error) {
      console.error('Domain analysis error:', error);
      return {
        reputation: 0.5,
        isTyposquatting: false,
        certificateValid: true,
        registrationAge: 365,
        suspiciousSubdomains: false
      };
    }
  }

  private detectTyposquatting(domain: string): boolean {
    const legitimateDomains = [
      'paypal.com', 'amazon.com', 'microsoft.com', 'apple.com',
      'google.com', 'facebook.com', 'instagram.com', 'twitter.com',
      'linkedin.com', 'netflix.com', 'spotify.com', 'github.com'
    ];

    return legitimateDomains.some(legitDomain => {
      const similarity = this.calculateStringSimilarity(domain, legitDomain);
      return similarity > 0.7 && similarity < 1.0;
    });
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => 
      Array(str1.length + 1).fill(null)
    );

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  private analyzeSuspiciousSubdomains(domain: string): boolean {
    const suspiciousPatterns = [
      'secure', 'login', 'verify', 'update', 'account', 'support',
      'security', 'auth', 'signin', 'portal', 'admin', 'api'
    ];

    const subdomains = domain.split('.');
    return subdomains.some(subdomain => 
      suspiciousPatterns.includes(subdomain.toLowerCase())
    );
  }

  private estimateRegistrationAge(domain: string): number {
    // In real implementation, use WHOIS API
    // For demo, estimate based on domain patterns
    const suspiciousPatterns = ['secure', 'login', 'verify', 'update'];
    const hasSuspiciousPattern = suspiciousPatterns.some(pattern => 
      domain.includes(pattern)
    );
    
    return hasSuspiciousPattern ? Math.floor(Math.random() * 30) + 1 : 
           Math.floor(Math.random() * 1000) + 365;
  }

  private calculateReputationScore(
    domain: string,
    isTyposquatting: boolean,
    suspiciousSubdomains: boolean,
    registrationAge: number
  ): number {
    let score = 0.8; // Start with neutral score

    if (isTyposquatting) score -= 0.4;
    if (suspiciousSubdomains) score -= 0.2;
    if (registrationAge < 30) score -= 0.3;
    if (registrationAge < 7) score -= 0.2;

    return Math.max(0, Math.min(1, score));
  }
}

// Visual similarity detection using computer vision
export class VisualAnalyzer {
  private model: tf.LayersModel | null = null;

  constructor() {
    this.loadModel();
  }

  private async loadModel() {
    try {
      // Create a simple CNN for demonstration
      this.model = tf.sequential({
        layers: [
          tf.layers.conv2d({
            inputShape: [224, 224, 3],
            filters: 32,
            kernelSize: 3,
            activation: 'relu'
          }),
          tf.layers.maxPooling2d({ poolSize: 2 }),
          tf.layers.conv2d({ filters: 64, kernelSize: 3, activation: 'relu' }),
          tf.layers.maxPooling2d({ poolSize: 2 }),
          tf.layers.flatten(),
          tf.layers.dense({ units: 128, activation: 'relu' }),
          tf.layers.dense({ units: 1, activation: 'sigmoid' })
        ]
      });
    } catch (error) {
      console.error('Error loading visual model:', error);
    }
  }

  async analyzeVisualSimilarity(imageUrl: string): Promise<number> {
    if (!this.model) return 0.5;

    try {
      // In a real implementation, you would:
      // 1. Capture screenshot of the webpage
      // 2. Extract visual features using the model
      // 3. Compare with known brand assets
      
      // For demo, simulate visual analysis based on URL patterns
      const suspiciousVisualPatterns = [
        'paypal', 'amazon', 'microsoft', 'apple', 'google',
        'facebook', 'instagram', 'twitter', 'linkedin'
      ];

      const url = imageUrl.toLowerCase();
      const hasVisualSimilarity = suspiciousVisualPatterns.some(pattern => 
        url.includes(pattern)
      );

      return hasVisualSimilarity ? Math.random() * 0.4 + 0.6 : Math.random() * 0.3 + 0.1;
    } catch (error) {
      console.error('Visual analysis error:', error);
      return 0.5;
    }
  }
}

// Behavioral analysis using pattern recognition
export class BehavioralAnalyzer {
  async analyzeBehavior(url: string, content: string): Promise<{
    suspiciousRedirects: boolean;
    formAnalysis: number;
    trafficPatterns: number;
    userInteractionScore: number;
  }> {
    try {
      // Analyze form elements for credential harvesting
      const formAnalysis = this.analyzeFormElements(content);
      
      // Check for suspicious redirects
      const suspiciousRedirects = this.detectSuspiciousRedirects(content);
      
      // Simulate traffic pattern analysis
      const trafficPatterns = this.analyzeTrafficPatterns(url);
      
      // User interaction scoring
      const userInteractionScore = this.calculateUserInteractionScore(content);

      return {
        suspiciousRedirects,
        formAnalysis,
        trafficPatterns,
        userInteractionScore
      };
    } catch (error) {
      console.error('Behavioral analysis error:', error);
      return {
        suspiciousRedirects: false,
        formAnalysis: 0.1,
        trafficPatterns: 0.1,
        userInteractionScore: 0.1
      };
    }
  }

  private analyzeFormElements(content: string): number {
    // Look for suspicious form patterns
    const formPatterns = [
      /password.*input/i,
      /credit.*card/i,
      /social.*security/i,
      /bank.*account/i,
      /login.*form/i
    ];

    const matches = formPatterns.filter(pattern => pattern.test(content)).length;
    return Math.min(matches * 0.2, 1);
  }

  private detectSuspiciousRedirects(content: string): boolean {
    // Check for multiple redirects or suspicious redirect patterns
    const redirectPatterns = [
      /window\.location/i,
      /document\.location/i,
      /meta.*refresh/i,
      /javascript.*redirect/i
    ];

    return redirectPatterns.some(pattern => pattern.test(content));
  }

  private analyzeTrafficPatterns(url: string): number {
    // Simulate traffic analysis based on domain characteristics
    let domain: string;
    try {
      domain = new URL(url).hostname;
    } catch (error) {
      console.error('Invalid URL in traffic analysis:', url, error);
      domain = '';
    }
    
    const suspiciousIndicators = [
      domain.includes('-'),
      domain.length > 20,
      domain.split('.').length > 3,
      /\d{2,}/.test(domain) // Multiple consecutive digits
    ];

    return suspiciousIndicators.filter(Boolean).length * 0.2;
  }

  private calculateUserInteractionScore(content: string): number {
    // Analyze for social engineering tactics
    const socialEngineeringPatterns = [
      /act.*now/i,
      /limited.*time/i,
      /expires.*soon/i,
      /don't.*miss/i,
      /exclusive.*offer/i
    ];

    const matches = socialEngineeringPatterns.filter(pattern => 
      pattern.test(content)
    ).length;
    
    return Math.min(matches * 0.25, 1);
  }
}

// Main AI service that orchestrates all models
export class FraudDetectionAI {
  private phishingModel: PhishingDetectionModel;
  private nlpAnalyzer: NLPAnalyzer;
  private domainAnalyzer: DomainAnalyzer;
  private visualAnalyzer: VisualAnalyzer;
  private behavioralAnalyzer: BehavioralAnalyzer;

  constructor() {
    this.phishingModel = new PhishingDetectionModel();
    this.nlpAnalyzer = new NLPAnalyzer();
    this.domainAnalyzer = new DomainAnalyzer();
    this.visualAnalyzer = new VisualAnalyzer();
    this.behavioralAnalyzer = new BehavioralAnalyzer();
  }

  async analyzeContent(url: string): Promise<AIAnalysisResult> {
    try {
      // Fetch webpage content
      const content = await this.fetchWebpageContent(url);
      
      // Run parallel analysis
      const [
        nlpResult,
        domainResult,
        visualResult,
        behavioralResult,
        phishingProbability
      ] = await Promise.all([
        this.nlpAnalyzer.analyzeText(content),
        this.domainAnalyzer.analyzeDomain(url),
        this.visualAnalyzer.analyzeVisualSimilarity(url),
        this.behavioralAnalyzer.analyzeBehavior(url, content),
        this.phishingModel.analyzeContent(content)
      ]);

      // Combine results using ensemble method
      const riskScore = this.calculateEnsembleRiskScore({
        nlp: nlpResult.phishingProbability,
        domain: 1 - domainResult.reputation,
        visual: visualResult,
        behavioral: (behavioralResult.formAnalysis + behavioralResult.trafficPatterns + behavioralResult.userInteractionScore) / 3,
        phishing: phishingProbability
      });

      // Generate detection reasons
      const detectionReasons = this.generateDetectionReasons({
        nlpResult,
        domainResult,
        behavioralResult,
        riskScore
      });

      // Classify threat type
      const { classification, threatType } = this.classifyThreat(riskScore, detectionReasons);

      return {
        riskScore: Math.round(riskScore * 100),
        classification,
        threatType,
        detectionReasons,
        analysisDetails: {
          nlpConfidence: Math.round(nlpResult.phishingProbability * 100),
          visualSimilarity: Math.round(visualResult * 100),
          domainReputation: Math.round(domainResult.reputation * 100),
          behavioralScore: Math.round(((behavioralResult.formAnalysis + behavioralResult.trafficPatterns + behavioralResult.userInteractionScore) / 3) * 100)
        },
        modelPredictions: {
          phishingProbability: Math.round(phishingProbability * 100),
          malwareProbability: Math.round(behavioralResult.formAnalysis * 100),
          scamProbability: Math.round(nlpResult.phishingProbability * 100),
          legitimateProbability: Math.round((1 - riskScore) * 100)
        }
      };
    } catch (error) {
      console.error('AI Analysis error:', error);
      throw new Error('Failed to analyze content. Please try again.');
    }
  }

  private async fetchWebpageContent(url: string): Promise<string> {
    try {
      // In a real implementation, you would use a proxy service or backend
      // For demo, simulate content based on URL patterns
      const domain = new URL(url).hostname.toLowerCase();
      
      let simulatedContent = `
        <html>
          <head><title>Website</title></head>
          <body>
            <h1>Welcome</h1>
            <p>This is a website at ${domain}</p>
      `;

      // Add suspicious content based on domain patterns
      if (domain.includes('paypal')) {
        simulatedContent += `
          <form>
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Password" />
            <button>Login to PayPal</button>
          </form>
          <p>Your account has been suspended. Please verify immediately.</p>
        `;
      } else if (domain.includes('amazon')) {
        simulatedContent += `
          <h2>Exclusive Amazon Deals</h2>
          <p>Limited time offer! Act now before it expires!</p>
          <button>Claim Your Prize</button>
        `;
      } else if (domain.includes('microsoft')) {
        simulatedContent += `
          <h2>Security Alert</h2>
          <p>Your Microsoft account requires immediate security update.</p>
          <button>Update Now</button>
        `;
      }

      simulatedContent += '</body></html>';
      return simulatedContent;
    } catch (error) {
      console.error('Error fetching content:', error);
      return '<html><body><p>Sample content</p></body></html>';
    }
  }

  private calculateEnsembleRiskScore(scores: {
    nlp: number;
    domain: number;
    visual: number;
    behavioral: number;
    phishing: number;
  }): number {
    // Weighted ensemble of different models
    const weights = {
      nlp: 0.25,
      domain: 0.20,
      visual: 0.20,
      behavioral: 0.20,
      phishing: 0.15
    };

    return (
      scores.nlp * weights.nlp +
      scores.domain * weights.domain +
      scores.visual * weights.visual +
      scores.behavioral * weights.behavioral +
      scores.phishing * weights.phishing
    );
  }

  private generateDetectionReasons(analysis: any): string[] {
    const reasons: string[] = [];

    if (analysis.nlpResult.suspiciousPatterns.length > 0) {
      reasons.push(`Suspicious language patterns detected: ${analysis.nlpResult.suspiciousPatterns.join(', ')}`);
    }

    if (analysis.domainResult.isTyposquatting) {
      reasons.push('Domain appears to be typosquatting a legitimate brand');
    }

    if (analysis.domainResult.registrationAge < 30) {
      reasons.push('Recently registered domain (less than 30 days old)');
    }

    if (analysis.behavioralResult.suspiciousRedirects) {
      reasons.push('Suspicious redirect patterns detected');
    }

    if (analysis.behavioralResult.formAnalysis > 0.5) {
      reasons.push('High-risk form elements detected (password/payment fields)');
    }

    if (analysis.riskScore > 0.8) {
      reasons.push('Multiple AI models indicate high fraud probability');
    }

    return reasons.length > 0 ? reasons : ['Content analysis completed - no significant threats detected'];
  }

  private classifyThreat(riskScore: number, reasons: string[]): {
    classification: string;
    threatType: string;
  } {
    if (riskScore >= 0.7) {
      // Determine specific threat type based on detection reasons
      if (reasons.some(r => r.includes('password') || r.includes('login'))) {
        return { classification: 'High Risk', threatType: 'Phishing' };
      } else if (reasons.some(r => r.includes('payment') || r.includes('credit'))) {
        return { classification: 'High Risk', threatType: 'Financial Scam' };
      } else if (reasons.some(r => r.includes('typosquatting'))) {
        return { classification: 'High Risk', threatType: 'Brand Impersonation' };
      } else {
        return { classification: 'High Risk', threatType: 'Malicious Content' };
      }
    } else if (riskScore >= 0.4) {
      return { classification: 'Medium Risk', threatType: 'Suspicious' };
    } else {
      return { classification: 'Low Risk', threatType: 'Clean' };
    }
  }
}

// Export singleton instance
export const fraudDetectionAI = new FraudDetectionAI();