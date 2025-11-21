import { Injectable, signal } from '@angular/core';

export interface DebugLog {
  timestamp: Date;
  type: 'navigation' | 'message' | 'cart' | 'mfe';
  from: string;
  to?: string;
  action: string;
  details?: any;
}

export interface MfeStatus {
  name: string;
  port: number;
  icon: string;
  isActive: boolean;
  lastChecked?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class DebugLoggerService {
  private logs = signal<DebugLog[]>([]);
  private maxLogs = 50;
  private mfeStatuses = signal<MfeStatus[]>([
    { name: 'Shell', port: 4200, icon: '🏠', isActive: true },
    { name: 'Header', port: 4201, icon: '📋', isActive: false },
    { name: 'Products', port: 4202, icon: '📦', isActive: false },
    { name: 'Cart', port: 4203, icon: '🛒', isActive: false }
  ]);

  getLogs = this.logs.asReadonly();
  getMfeStatuses = this.mfeStatuses.asReadonly();

  log(log: Omit<DebugLog, 'timestamp'>): void {
    const newLog: DebugLog = {
      ...log,
      timestamp: new Date()
    };

    // Keep only the last maxLogs entries
    const currentLogs = this.logs();
    const updatedLogs = [...currentLogs, newLog].slice(-this.maxLogs);
    this.logs.set(updatedLogs);

    // Also log to console
    const emoji = this.getEmoji(log.type);
    const toStr = log.to ? ` → ${log.to}` : '';
    console.log(`${emoji} [${log.from}${toStr}] ${log.action}`, log.details || '');
  }

  clear(): void {
    this.logs.set([]);
  }

  updateMfeStatus(mfeName: string, isActive: boolean): void {
    const statuses = this.mfeStatuses();
    const updated = statuses.map(mfe => 
      mfe.name === mfeName 
        ? { ...mfe, isActive, lastChecked: new Date() }
        : mfe
    );
    this.mfeStatuses.set(updated);
  }

  async checkMfeHealth(): Promise<void> {
    const statuses = this.mfeStatuses();
    const checks = statuses.map(async (mfe) => {
      if (mfe.name === 'Shell') return { ...mfe, isActive: true };
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        const response = await fetch(`http://localhost:${mfe.port}/remoteEntry.js`, {
          method: 'HEAD',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        return { ...mfe, isActive: response.ok, lastChecked: new Date() };
      } catch {
        return { ...mfe, isActive: false, lastChecked: new Date() };
      }
    });

    const results = await Promise.all(checks);
    this.mfeStatuses.set(results);
  }

  private getEmoji(type: DebugLog['type']): string {
    switch (type) {
      case 'navigation': return '🧭';
      case 'message': return '📨';
      case 'cart': return '🛒';
      case 'mfe': return '🔌';
      default: return '📝';
    }
  }
}
