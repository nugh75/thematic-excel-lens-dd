import { User } from '../types/analysis';

// Simple password hashing using built-in crypto (for demo purposes)
// In production, use a proper library like bcrypt
export class AuthService {
  
  /**
   * Hash a password using a simple algorithm
   * Note: In production, use bcrypt or similar
   */
  static async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'salt_thematic_excel_lens');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Verify a password against a hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    const passwordHash = await this.hashPassword(password);
    return passwordHash === hash;
  }

  /**
   * Generate a secure random password
   */
  static generateRandomPassword(length: number = 12): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    
    return password;
  }

  /**
   * Validate password strength
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('La password deve essere di almeno 8 caratteri');
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Aggiungi almeno una lettera maiuscola');
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Aggiungi almeno una lettera minuscola');
    }

    // Number check
    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('Aggiungi almeno un numero');
    }

    // Special character check
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Aggiungi almeno un carattere speciale');
    }

    return {
      isValid: score >= 3,
      score,
      feedback
    };
  }

  /**
   * Create default admin user
   */
  static async createDefaultAdmin(): Promise<User & { password: string }> {
    const defaultPassword = 'Admin123!';
    const hashedPassword = await this.hashPassword(defaultPassword);
    
    return {
      id: 'admin_' + Date.now(),
      name: 'Amministratore',
      email: 'admin@thematic-excel-lens.local',
      color: '#DC2626',
      role: 'admin',
      isActive: true,
      createdAt: Date.now(),
      passwordHash: hashedPassword,
      password: defaultPassword // Solo per mostrare all'utente la prima volta
    };
  }

  /**
   * Authentication attempt with rate limiting
   */
  static createAuthLimiter() {
    const attempts = new Map<string, { count: number; lastAttempt: number }>();
    const MAX_ATTEMPTS = 5;
    const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minuti

    return {
      canAttempt: (userId: string): boolean => {
        const userAttempts = attempts.get(userId);
        if (!userAttempts) {
          return true;
        }

        const timeSinceLastAttempt = Date.now() - userAttempts.lastAttempt;
        if (timeSinceLastAttempt > LOCKOUT_TIME) {
          attempts.delete(userId);
          return true;
        }

        return userAttempts.count < MAX_ATTEMPTS;
      },

      recordFailure: (userId: string): void => {
        const userAttempts = attempts.get(userId) || { count: 0, lastAttempt: 0 };
        userAttempts.count++;
        userAttempts.lastAttempt = Date.now();
        attempts.set(userId, userAttempts);
      },

      recordSuccess: (userId: string): void => {
        attempts.delete(userId);
      },

      getRemainingLockoutTime: (userId: string): number => {
        const userAttempts = attempts.get(userId);
        if (!userAttempts) {
          return 0;
        }

        const timeSinceLastAttempt = Date.now() - userAttempts.lastAttempt;
        return Math.max(0, LOCKOUT_TIME - timeSinceLastAttempt);
      }
    };
  }

  /**
   * Session management
   */
  static createSessionManager() {
    const sessions = new Map<string, { userId: string; expiresAt: number }>();
    const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 ore

    return {
      createSession: (userId: string): string => {
        const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessions.set(sessionId, {
          userId,
          expiresAt: Date.now() + SESSION_DURATION
        });
        return sessionId;
      },

      validateSession: (sessionId: string): string | null => {
        const session = sessions.get(sessionId);
        if (!session) {
          return null;
        }

        if (Date.now() > session.expiresAt) {
          sessions.delete(sessionId);
          return null;
        }

        return session.userId;
      },

      destroySession: (sessionId: string): void => {
        sessions.delete(sessionId);
      },

      extendSession: (sessionId: string): boolean => {
        const session = sessions.get(sessionId);
        if (!session) {
          return false;
        }

        session.expiresAt = Date.now() + SESSION_DURATION;
        return true;
      }
    };
  }
}

// Global auth limiter instance
export const authLimiter = AuthService.createAuthLimiter();

// Global session manager instance
export const sessionManager = AuthService.createSessionManager();
