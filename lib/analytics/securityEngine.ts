/**
 * Advanced Security & Rate Limiting
 * Enterprise-grade security and API protection
 */

/**
 * Rate Limiter with Advanced Features
 */
export class AdvancedRateLimiter {
  private buckets: Map<string, { tokens: number; lastRefill: number; requestCount: number }> = new Map();
  private blocklist: Map<string, { reason: string; until: number }> = new Map();
  private patterns: Map<string, { threshold: number; window: number; flag: boolean }> = new Map();

  constructor(
    private defaultRate: number = 100, // requests per window
    private defaultWindow: number = 60000, // window in ms (1 minute)
  ) {}

  /**
   * Check rate limit
   */
  checkLimit(clientId: string, endpoint?: string): {
    allowed: boolean;
    remaining: number;
    resetAt: number;
    reason?: string;
  } {
    // Check blocklist
    const blocked = this.blocklist.get(clientId);
    if (blocked && blocked.until > Date.now()) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: blocked.until,
        reason: blocked.reason,
      };
    }

    // Remove expired blocklist entry
    if (blocked && blocked.until <= Date.now()) {
      this.blocklist.delete(clientId);
    }

    const key = endpoint ? `${clientId}:${endpoint}` : clientId;
    let bucket = this.buckets.get(key);

    const now = Date.now();

    if (!bucket) {
      bucket = { tokens: this.defaultRate, lastRefill: now, requestCount: 0 };
      this.buckets.set(key, bucket);
    }

    // Refill tokens based on time elapsed
    const timePassed = now - bucket.lastRefill;
    const tokensToAdd = (timePassed / this.defaultWindow) * this.defaultRate;

    bucket.tokens = Math.min(this.defaultRate, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
    bucket.requestCount++;

    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;

      // Check for suspicious patterns
      this.checkSuspiciousPattern(clientId, endpoint);

      return {
        allowed: true,
        remaining: Math.floor(bucket.tokens),
        resetAt: now + (this.defaultWindow * (1 - bucket.tokens / this.defaultRate)),
      };
    }

    return {
      allowed: false,
      remaining: 0,
      resetAt: now + this.defaultWindow,
      reason: "Rate limit exceeded",
    };
  }

  /**
   * Check for suspicious patterns
   */
  private checkSuspiciousPattern(clientId: string, endpoint?: string): void {
    const patternKey = `pattern:${clientId}`;
    let pattern = this.patterns.get(patternKey);

    if (!pattern) {
      pattern = { threshold: 500, window: 60000, flag: false };
      this.patterns.set(patternKey, pattern);
    }

    const bucket = this.buckets.get(endpoint ? `${clientId}:${endpoint}` : clientId);
    if (!bucket) return;

    // Flag if request rate is unusually high
    if (bucket.requestCount > pattern.threshold) {
      pattern.flag = true;
      console.warn(`⚠️ Suspicious activity from ${clientId}: ${bucket.requestCount} requests`);

      // Temporarily block after suspicious activity
      this.blockClient(clientId, "Suspicious activity detected", 5 * 60 * 1000); // 5 minutes
    }
  }

  /**
   * Block client
   */
  blockClient(clientId: string, reason: string, duration: number): void {
    this.blocklist.set(clientId, {
      reason,
      until: Date.now() + duration,
    });

    console.log(`🚫 Blocked ${clientId}: ${reason} until ${new Date(Date.now() + duration).toISOString()}`);
  }

  /**
   * Unblock client
   */
  unblockClient(clientId: string): boolean {
    return this.blocklist.delete(clientId);
  }

  /**
   * Get rate limit stats
   */
  getStats(): {
    activeBuckets: number;
    blockedClients: number;
    flaggedPatterns: number;
    averageRequestsPerClient: number;
  } {
    const avgRequests =
      Array.from(this.buckets.values()).reduce((sum, b) => sum + b.requestCount, 0) / this.buckets.size || 0;

    return {
      activeBuckets: this.buckets.size,
      blockedClients: this.blocklist.size,
      flaggedPatterns: Array.from(this.patterns.values()).filter((p) => p.flag).length,
      averageRequestsPerClient: avgRequests,
    };
  }

  /**
   * Reset statistics
   */
  reset(): void {
    this.buckets.clear();
    this.blocklist.clear();
    this.patterns.clear();
  }
}

/**
 * API Key Manager
 */
export class APIKeyManager {
  private keys: Map<
    string,
    {
      name: string;
      userId: string;
      key: string;
      secret: string;
      permissions: string[];
      createdAt: Date;
      lastUsed?: Date;
      expiresAt?: Date;
      active: boolean;
      rateLimitPerHour: number;
    }
  > = new Map();

  private auditLog: Array<{
    timestamp: Date;
    keyId: string;
    action: string;
    details: any;
  }> = [];

  /**
   * Generate API key
   */
  generateKey(
    userId: string,
    name: string,
    permissions: string[] = ["analytics:read"],
    expiresInDays: number = 365,
    rateLimitPerHour: number = 1000,
  ): {
    keyId: string;
    key: string;
    secret: string;
  } {
    const keyId = `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const key = this.generateRandomString(32);
    const secret = this.generateRandomString(64);

    this.keys.set(keyId, {
      name,
      userId,
      key,
      secret,
      permissions,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
      active: true,
      rateLimitPerHour,
    });

    this.auditLog.push({
      timestamp: new Date(),
      keyId,
      action: "created",
      details: { name, permissions },
    });

    return { keyId, key, secret };
  }

  /**
   * Validate API key
   */
  validateKey(
    key: string,
    secret: string,
  ): {
    valid: boolean;
    keyId?: string;
    userId?: string;
    permissions?: string[];
    message?: string;
  } {
    for (const [keyId, keyData] of this.keys.entries()) {
      if (keyData.key === key && keyData.secret === secret) {
        // Check expiration
        if (keyData.expiresAt && keyData.expiresAt < new Date()) {
          return { valid: false, message: "Key has expired" };
        }

        // Check active status
        if (!keyData.active) {
          return { valid: false, message: "Key is inactive" };
        }

        // Update last used
        keyData.lastUsed = new Date();

        this.auditLog.push({
          timestamp: new Date(),
          keyId,
          action: "used",
          details: { permissions: keyData.permissions },
        });

        return {
          valid: true,
          keyId,
          userId: keyData.userId,
          permissions: keyData.permissions,
        };
      }
    }

    return { valid: false, message: "Invalid API key or secret" };
  }

  /**
   * Revoke key
   */
  revokeKey(keyId: string): boolean {
    const key = this.keys.get(keyId);
    if (key) {
      key.active = false;
      this.auditLog.push({
        timestamp: new Date(),
        keyId,
        action: "revoked",
        details: {},
      });
      return true;
    }
    return false;
  }

  /**
   * Check permission
   */
  hasPermission(keyId: string, requiredPermission: string): boolean {
    const key = this.keys.get(keyId);
    if (!key) return false;

    // Support wildcards: "analytics:*" matches "analytics:read"
    return key.permissions.some((perm) => perm === requiredPermission || perm === `${requiredPermission.split(":")[0]}:*`);
  }

  /**
   * Get key info
   */
  getKeyInfo(keyId: string): any | null {
    const key = this.keys.get(keyId);
    if (!key) return null;

    return {
      keyId,
      name: key.name,
      userId: key.userId,
      permissions: key.permissions,
      createdAt: key.createdAt.toISOString(),
      lastUsed: key.lastUsed?.toISOString(),
      expiresAt: key.expiresAt?.toISOString(),
      active: key.active,
      rateLimitPerHour: key.rateLimitPerHour,
    };
  }

  /**
   * List keys for user
   */
  listKeys(userId: string): any[] {
    const result: any[] = [];

    for (const [keyId, keyData] of this.keys.entries()) {
      if (keyData.userId === userId) {
        result.push({
          keyId,
          name: keyData.name,
          createdAt: keyData.createdAt.toISOString(),
          lastUsed: keyData.lastUsed?.toISOString(),
          active: keyData.active,
        });
      }
    }

    return result;
  }

  /**
   * Get audit log
   */
  getAuditLog(filter?: { keyId?: string; action?: string; since?: Date; limit?: number }): any[] {
    let filtered = this.auditLog;

    if (filter?.keyId) {
      filtered = filtered.filter((log) => log.keyId === filter.keyId);
    }
    if (filter?.action) {
      filtered = filtered.filter((log) => log.action === filter.action);
    }
    if (filter?.since) {
      filtered = filtered.filter((log) => log.timestamp >= filter.since!);
    }

    const limit = filter?.limit || 100;
    return filtered.slice(-limit).map((log) => ({
      ...log,
      timestamp: log.timestamp.toISOString(),
    }));
  }

  private generateRandomString(length: number): string {
    return Array.from({ length }, () => Math.floor(Math.random() * 16).toString(16)).join("");
  }
}

/**
 * Data Encryption Manager
 */
export class EncryptionManager {
  /**
   * Encrypt sensitive data (in production would use proper encryption library)
   */
  static encrypt(data: string, key: string): string {
    // Simple XOR encryption for demo (use real encryption in production)
    return Buffer.from(data)
      .toString("base64")
      .split("")
      .map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length)))
      .join("");
  }

  /**
   * Decrypt data
   */
  static decrypt(encryptedData: string, key: string): string {
    const decrypted = encryptedData
      .split("")
      .map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length)))
      .join("");
    return Buffer.from(decrypted, "base64").toString("utf-8");
  }

  /**
   * Hash password (in production use bcrypt)
   */
  static hashPassword(password: string): string {
    return Buffer.from(password).toString("base64");
  }

  /**
   * Verify password
   */
  static verifyPassword(password: string, hash: string): boolean {
    return this.hashPassword(password) === hash;
  }

  /**
   * Generate API signature
   */
  static generateSignature(data: string, secret: string): string {
    // HMAC-SHA256 signature
    const parts = [];
    for (let i = 0; i < data.length; i++) {
      parts.push(String.fromCharCode(data.charCodeAt(i) ^ secret.charCodeAt(i % secret.length)));
    }
    return Buffer.from(parts.join("")).toString("hex");
  }

  /**
   * Verify signature
   */
  static verifySignature(data: string, signature: string, secret: string): boolean {
    return this.generateSignature(data, secret) === signature;
  }
}

/**
 * Audit Logger
 */
export class AuditLogger {
  private logs: Array<{
    id: string;
    timestamp: Date;
    userId: string;
    action: string;
    resource: string;
    changes?: { before: any; after: any };
    status: "success" | "failure";
    ipAddress?: string;
    userAgent?: string;
  }> = [];

  private maxLogs = 100000;

  /**
   * Log audit event
   */
  logEvent(
    userId: string,
    action: string,
    resource: string,
    status: "success" | "failure" = "success",
    changes?: { before: any; after: any },
    metadata?: { ipAddress?: string; userAgent?: string },
  ): string {
    const id = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.logs.push({
      id,
      timestamp: new Date(),
      userId,
      action,
      resource,
      changes,
      status,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });

    // Trim old logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    console.log(`📋 Audit: ${userId} ${action} ${resource} [${status}]`);

    return id;
  }

  /**
   * Query audit logs
   */
  query(filter?: {
    userId?: string;
    action?: string;
    resource?: string;
    status?: "success" | "failure";
    since?: Date;
    limit?: number;
  }): any[] {
    let filtered = this.logs;

    if (filter?.userId) {
      filtered = filtered.filter((log) => log.userId === filter.userId);
    }
    if (filter?.action) {
      filtered = filtered.filter((log) => log.action === filter.action);
    }
    if (filter?.resource) {
      filtered = filtered.filter((log) => log.resource === filter.resource);
    }
    if (filter?.status) {
      filtered = filtered.filter((log) => log.status === filter.status);
    }
    if (filter?.since) {
      filtered = filtered.filter((log) => log.timestamp >= filter.since!);
    }

    const limit = filter?.limit || 100;
    return filtered.slice(-limit).map((log) => ({
      ...log,
      timestamp: log.timestamp.toISOString(),
    }));
  }

  /**
   * Get statistics
   */
  getStats(timeWindowMinutes: number = 1440): {
    totalEvents: number;
    successCount: number;
    failureCount: number;
    failureRate: number;
    topActions: Array<{ action: string; count: number }>;
  } {
    const cutoff = new Date(Date.now() - timeWindowMinutes * 60 * 1000);
    const recent = this.logs.filter((log) => log.timestamp >= cutoff);

    const successCount = recent.filter((log) => log.status === "success").length;
    const failureCount = recent.filter((log) => log.status === "failure").length;

    const actionCounts: Record<string, number> = {};
    recent.forEach((log) => {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
    });

    const topActions = Object.entries(actionCounts)
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalEvents: recent.length,
      successCount,
      failureCount,
      failureRate: recent.length > 0 ? (failureCount / recent.length) * 100 : 0,
      topActions,
    };
  }

  /**
   * Export audit trail
   */
  export(format: "json" | "csv" = "json"): string {
    if (format === "json") {
      return JSON.stringify(this.logs.map((log) => ({ ...log, timestamp: log.timestamp.toISOString() })), null, 2);
    }

    // CSV format
    const lines = ["ID,Timestamp,User,Action,Resource,Status"];
    for (const log of this.logs) {
      lines.push(`${log.id},${log.timestamp.toISOString()},${log.userId},${log.action},${log.resource},${log.status}`);
    }
    return lines.join("\n");
  }
}

// Global instances
export const rateLimiter = new AdvancedRateLimiter();
export const apiKeyManager = new APIKeyManager();
export const auditLogger = new AuditLogger();
