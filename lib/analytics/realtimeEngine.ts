/**
 * Real-Time Data Streaming & Webhook System
 * For real-time analytics updates and integrations
 */

/**
 * WebSocket Manager for Real-Time Updates
 */
export class RealtimeStreamManager {
  private connections: Map<string, Set<string>> = new Map(); // userId -> Set of connectionIds
  private subscriptions: Map<string, Set<string>> = new Map(); // channelName -> Set of userIds
  private messageQueue: Array<{ userId: string; data: any; timestamp: number }> = [];
  private listeners: Map<string, Function[]> = new Map();

  /**
   * Register real-time connection
   */
  registerConnection(userId: string, connectionId: string): void {
    if (!this.connections.has(userId)) {
      this.connections.set(userId, new Set());
    }
    this.connections.get(userId)!.add(connectionId);
  }

  /**
   * Subscribe to channel
   */
  subscribe(userId: string, channel: string): void {
    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, new Set());
    }
    this.subscriptions.get(channel)!.add(userId);

    this.emit("subscribe", {
      userId,
      channel,
      timestamp: Date.now(),
    });
  }

  /**
   * Publish data to subscribers
   */
  publish(channel: string, data: any): void {
    const subscribers = this.subscriptions.get(channel) || new Set();

    for (const userId of subscribers) {
      const connections = this.connections.get(userId);
      if (connections) {
        for (const connId of connections) {
          this.messageQueue.push({
            userId,
            data: {
              channel,
              data,
              connectionId: connId,
            },
            timestamp: Date.now(),
          });
        }
      }
    }

    this.emit("publish", {
      channel,
      subscriberCount: subscribers.size,
      timestamp: Date.now(),
    });
  }

  /**
   * Broadcast analytics update
   */
  broadcastAnalyticsUpdate(userId: string, accountId: string, data: any): void {
    const channel = `analytics:${userId}:${accountId}`;
    this.publish(channel, {
      type: "update",
      payload: data,
      timestamp: Date.now(),
    });
  }

  /**
   * Broadcast cache update
   */
  broadcastCacheInvalidation(pattern: string, reason: string): void {
    this.publish("cache:invalidation", {
      pattern,
      reason,
      timestamp: Date.now(),
    });
  }

  /**
   * Get pending messages
   */
  getMessages(userId: string, connectionId: string, since?: number): any[] {
    const filtered = this.messageQueue.filter((msg) => msg.userId === userId && msg.data.connectionId === connectionId && (!since || msg.timestamp > since));

    // Remove retrieved messages from queue
    this.messageQueue = this.messageQueue.filter((msg) => !filtered.includes(msg));

    return filtered.map((msg) => msg.data);
  }

  /**
   * Add event listener
   */
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  /**
   * Emit event
   */
  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach((cb) => cb(data));
  }

  /**
   * Get connection stats
   */
  getStats(): {
    totalConnections: number;
    totalSubscribers: number;
    channelCount: number;
    queuedMessages: number;
  } {
    const totalConnections = Array.from(this.connections.values()).reduce((sum, set) => sum + set.size, 0);
    const totalSubscribers = Array.from(this.subscriptions.values()).reduce((sum, set) => sum + set.size, 0);

    return {
      totalConnections,
      totalSubscribers,
      channelCount: this.subscriptions.size,
      queuedMessages: this.messageQueue.length,
    };
  }
}

/**
 * Webhook Manager
 * Delivers real-time events to external endpoints
 */
export class WebhookManager {
  private webhooks: Map<
    string,
    {
      url: string;
      events: string[];
      active: boolean;
      retryPolicy: { maxRetries: number; backoffMs: number };
      lastTriggered?: Date;
      failureCount: number;
    }
  > = new Map();

  private queue: Array<{
    webhookId: string;
    event: string;
    data: any;
    attempts: number;
    nextRetryAt?: number;
  }> = [];

  /**
   * Register webhook
   */
  registerWebhook(
    id: string,
    url: string,
    events: string[],
    retryPolicy?: { maxRetries: number; backoffMs: number },
  ): void {
    this.webhooks.set(id, {
      url,
      events,
      active: true,
      retryPolicy: retryPolicy || { maxRetries: 3, backoffMs: 5000 },
      failureCount: 0,
    });
  }

  /**
   * Trigger webhook event
   */
  async triggerEvent(event: string, data: any, userId?: string): Promise<{ webhookId: string; status: "queued" | "sent" | "failed" }[]> {
    const results: { webhookId: string; status: "queued" | "sent" | "failed" }[] = [];

    for (const [id, webhook] of this.webhooks.entries()) {
      if (!webhook.active || !webhook.events.includes(event)) continue;

      const queueItem: {
        webhookId: string;
        event: string;
        data: any;
        attempts: number;
        nextRetryAt?: number;
      } = {
        webhookId: id,
        event,
        data: {
          event,
          data,
          userId,
          timestamp: new Date().toISOString(),
        },
        attempts: 0,
      };

      this.queue.push(queueItem);

      try {
        await this.deliverWebhook(id, queueItem);
        results.push({ webhookId: id, status: "sent" });
      } catch (error) {
        results.push({ webhookId: id, status: "queued" });
        queueItem.nextRetryAt = Date.now() + webhook.retryPolicy.backoffMs;
      }
    }

    return results;
  }

  /**
   * Deliver webhook with retry logic
   */
  private async deliverWebhook(
    webhookId: string,
    queueItem: {
      webhookId: string;
      event: string;
      data: any;
      attempts: number;
      nextRetryAt?: number;
    },
  ): Promise<void> {
    const webhook = this.webhooks.get(webhookId);
    if (!webhook) return;

    try {
      // Simulate HTTP delivery (in production would use fetch)
      const response = await this.sendWebhookRequest(webhook.url, queueItem.data);

      if (response.ok) {
        webhook.lastTriggered = new Date();
        webhook.failureCount = 0;

        // Remove from queue
        this.queue = this.queue.filter((q) => q.webhookId !== webhookId);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      queueItem.attempts++;

      if (queueItem.attempts < webhook.retryPolicy.maxRetries) {
        queueItem.nextRetryAt = Date.now() + webhook.retryPolicy.backoffMs * Math.pow(2, queueItem.attempts - 1);
        webhook.failureCount++;

        if (webhook.failureCount > webhook.retryPolicy.maxRetries * 2) {
          webhook.active = false;
          console.error(`Webhook ${webhookId} disabled after repeated failures`);
        }
      }
    }
  }

  /**
   * Mock webhook delivery (in production would use actual HTTP)
   */
  private async sendWebhookRequest(
    url: string,
    data: any,
  ): Promise<{ ok: boolean; status: number }> {
    // Simulate network request
    return new Promise((resolve) => {
      setTimeout(() => {
        // 95% success rate simulation
        const success = Math.random() > 0.05;
        resolve({ ok: success, status: success ? 200 : 500 });
      }, 100);
    });
  }

  /**
   * Process retry queue
   */
  async processRetryQueue(): Promise<void> {
    const now = Date.now();
    const toRetry = this.queue.filter((q) => !q.nextRetryAt || q.nextRetryAt <= now);

    for (const item of toRetry) {
      await this.deliverWebhook(item.webhookId, item);
    }
  }

  /**
   * Get webhook status
   */
  getWebhookStatus(webhookId: string): {
    active: boolean;
    lastTriggered?: Date;
    failureCount: number;
    queuedEvents: number;
  } | null {
    const webhook = this.webhooks.get(webhookId);
    if (!webhook) return null;

    const queuedEvents = this.queue.filter((q) => q.webhookId === webhookId).length;

    return {
      active: webhook.active,
      lastTriggered: webhook.lastTriggered,
      failureCount: webhook.failureCount,
      queuedEvents,
    };
  }

  /**
   * Get all webhooks
   */
  listWebhooks(): Array<{ id: string; url: string; active: boolean; events: string[] }> {
    const result: Array<{ id: string; url: string; active: boolean; events: string[] }> = [];

    for (const [id, webhook] of this.webhooks.entries()) {
      result.push({
        id,
        url: webhook.url,
        active: webhook.active,
        events: webhook.events,
      });
    }

    return result;
  }

  /**
   * Delete webhook
   */
  deleteWebhook(webhookId: string): boolean {
    return this.webhooks.delete(webhookId);
  }
}

/**
 * Event Logger
 */
export class EventLogger {
  private events: Array<{
    id: string;
    timestamp: Date;
    event: string;
    category: string;
    userId?: string;
    data?: any;
  }> = [];

  private maxEvents = 10000;

  /**
   * Log event
   */
  logEvent(
    event: string,
    category: string,
    userId?: string,
    data?: any,
  ): string {
    const id = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.events.push({
      id,
      timestamp: new Date(),
      event,
      category,
      userId,
      data,
    });

    // Trim old events if exceeding max
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    return id;
  }

  /**
   * Get events by filter
   */
  getEvents(filter?: {
    category?: string;
    userId?: string;
    event?: string;
    since?: Date;
    limit?: number;
  }): any[] {
    let filtered = this.events;

    if (filter?.category) {
      filtered = filtered.filter((e) => e.category === filter.category);
    }
    if (filter?.userId) {
      filtered = filtered.filter((e) => e.userId === filter.userId);
    }
    if (filter?.event) {
      filtered = filtered.filter((e) => e.event === filter.event);
    }
    if (filter?.since) {
      filtered = filtered.filter((e) => e.timestamp >= filter.since!);
    }

    const limit = filter?.limit || 100;
    return filtered.slice(-limit).map((e) => ({
      ...e,
      timestamp: e.timestamp.toISOString(),
    }));
  }

  /**
   * Get event statistics
   */
  getStats(timeWindowMinutes: number = 60): {
    totalEvents: number;
    eventsByCategory: Record<string, number>;
    eventsByType: Record<string, number>;
    eventsPerMinute: number;
  } {
    const cutoff = new Date(Date.now() - timeWindowMinutes * 60 * 1000);
    const recent = this.events.filter((e) => e.timestamp >= cutoff);

    const byCategory: Record<string, number> = {};
    const byType: Record<string, number> = {};

    recent.forEach((e) => {
      byCategory[e.category] = (byCategory[e.category] || 0) + 1;
      byType[e.event] = (byType[e.event] || 0) + 1;
    });

    return {
      totalEvents: recent.length,
      eventsByCategory: byCategory,
      eventsByType: byType,
      eventsPerMinute: recent.length / timeWindowMinutes,
    };
  }

  /**
   * Clear old events
   */
  cleanup(olderThanMinutes: number = 1440): void {
    const cutoff = new Date(Date.now() - olderThanMinutes * 60 * 1000);
    this.events = this.events.filter((e) => e.timestamp > cutoff);
  }
}

/**
 * Notification System
 */
export class NotificationSystem {
  private subscriptions: Map<string, Set<string>> = new Map(); // userId -> Set of notification types
  private notifications: Array<{
    id: string;
    userId: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: Date;
    actionUrl?: string;
  }> = [];

  /**
   * Subscribe to notifications
   */
  subscribe(userId: string, notificationType: string): void {
    if (!this.subscriptions.has(userId)) {
      this.subscriptions.set(userId, new Set());
    }
    this.subscriptions.get(userId)!.add(notificationType);
  }

  /**
   * Send notification
   */
  sendNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    actionUrl?: string,
  ): string {
    const userSubscriptions = this.subscriptions.get(userId);
    if (!userSubscriptions || !userSubscriptions.has(type)) {
      return "";
    }

    const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.notifications.push({
      id,
      userId,
      type,
      title,
      message,
      read: false,
      createdAt: new Date(),
      actionUrl,
    });

    return id;
  }

  /**
   * Get unread notifications
   */
  getUnread(userId: string, limit: number = 20): any[] {
    return this.notifications
      .filter((n) => n.userId === userId && !n.read)
      .slice(-limit)
      .map((n) => ({
        ...n,
        createdAt: n.createdAt.toISOString(),
      }));
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): boolean {
    const notif = this.notifications.find((n) => n.id === notificationId);
    if (notif) {
      notif.read = true;
      return true;
    }
    return false;
  }

  /**
   * Clear old notifications
   */
  cleanup(olderThanDays: number = 30): void {
    const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
    this.notifications = this.notifications.filter((n) => n.createdAt > cutoff);
  }
}

// Global instances
export const realtimeStream = new RealtimeStreamManager();
export const webhookManager = new WebhookManager();
export const eventLogger = new EventLogger();
export const notificationSystem = new NotificationSystem();
