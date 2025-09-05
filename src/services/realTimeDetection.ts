import { fraudDetectionAI } from './aiModels';
import { webScraper } from './webScraper';

export interface RealTimeAlert {
  id: string;
  timestamp: Date;
  url: string;
  riskScore: number;
  threatType: string;
  blocked: boolean;
  userAction?: 'allowed' | 'blocked' | 'reported';
}

export class RealTimeDetectionService {
  private alerts: RealTimeAlert[] = [];
  private subscribers: ((alert: RealTimeAlert) => void)[] = [];
  private isMonitoring = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('🛡️ Real-time fraud detection monitoring started');

    // Simulate real-time threat detection
    this.monitoringInterval = setInterval(() => {
      this.simulateRealTimeDetection();
    }, 15000); // Check every 15 seconds
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    console.log('🛡️ Real-time monitoring stopped');
  }

  subscribe(callback: (alert: RealTimeAlert) => void): () => void {
    this.subscribers.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  private async simulateRealTimeDetection(): Promise<void> {
    // Simulate discovering new threats in real-time
    const suspiciousUrls = [
      'paypal-security-update.net',
      'amazon-prime-renewal.org',
      'microsoft-account-verify.com',
      'apple-id-locked.net',
      'google-security-alert.org',
      'facebook-account-suspended.com',
      'netflix-payment-failed.net',
      'crypto-wallet-recovery.org'
    ];

    const randomUrl = suspiciousUrls[Math.floor(Math.random() * suspiciousUrls.length)];
    
    try {
      // Perform real AI analysis
      const analysis = await fraudDetectionAI.analyzeContent(`https://${randomUrl}`);
      
      if (analysis.riskScore > 60) {
        const alert: RealTimeAlert = {
          id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
          url: randomUrl,
          riskScore: analysis.riskScore,
          threatType: analysis.threatType,
          blocked: analysis.riskScore > 70
        };

        this.alerts.unshift(alert);
        
        // Keep only last 50 alerts
        if (this.alerts.length > 50) {
          this.alerts = this.alerts.slice(0, 50);
        }

        // Notify subscribers
        this.notifySubscribers(alert);
      }
    } catch (error) {
      console.error('Real-time detection error:', error);
    }
  }

  private notifySubscribers(alert: RealTimeAlert): void {
    this.subscribers.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        console.error('Error notifying subscriber:', error);
      }
    });
  }

  getRecentAlerts(limit = 10): RealTimeAlert[] {
    return this.alerts.slice(0, limit);
  }

  getThreatStats(): {
    totalDetected: number;
    blocked: number;
    allowed: number;
    reported: number;
  } {
    return {
      totalDetected: this.alerts.length,
      blocked: this.alerts.filter(a => a.blocked).length,
      allowed: this.alerts.filter(a => a.userAction === 'allowed').length,
      reported: this.alerts.filter(a => a.userAction === 'reported').length
    };
  }

  async analyzeUrlInRealTime(url: string): Promise<RealTimeAlert> {
    try {
      const analysis = await fraudDetectionAI.analyzeContent(url);
      
      const alert: RealTimeAlert = {
        id: `manual-${Date.now()}`,
        timestamp: new Date(),
        url,
        riskScore: analysis.riskScore,
        threatType: analysis.threatType,
        blocked: analysis.riskScore > 70
      };

      this.alerts.unshift(alert);
      this.notifySubscribers(alert);
      
      return alert;
    } catch (error) {
      console.error('Real-time analysis error:', error);
      throw error;
    }
  }
}

export const realTimeDetection = new RealTimeDetectionService();