import { io, Socket } from 'socket.io-client';
import { WS_URL } from '../../utils/constants';

type Listener = (data: any) => void;

type ConnectionState = 'disconnected' | 'connecting' | 'connected';

class WebSocketService {
  private socket: Socket | null = null;

  /**
   * We keep our own listener registry so we can:
   * - prevent duplicate socket.on registrations
   * - safely add/remove multiple callbacks per event
   */
  private listeners = new Map<string, Set<Listener>>();
  private eventDispatcherInstalled = new Set<string>();

  private connectionState: ConnectionState = 'disconnected';
  private stateListeners = new Set<(state: ConnectionState) => void>();

  /**
   * Queue events while disconnected and replay after reconnect.
   * (Only used for client-originated emits like join/leave rooms.)
   */
  private pendingEmits: Array<{ event: string; data: any }> = [];

  private reconnectAttempts = 0;
  private maxReconnectAttempts = 8;

  connect(token: string) {
    if (this.socket?.connected) return;

    // If there is an old socket instance, fully dispose it before reconnecting
    if (this.socket) {
      this.disconnect();
    }

    this.setState('connecting');

    this.socket = io(WS_URL + '/events', {
      path: '/socket.io',
      transports: ['websocket'],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 500,
      reconnectionDelayMax: 8000,
      randomizationFactor: 0.4,
      timeout: 10000,
    });

    // Core connection events
    this.socket.on('connect', () => {
      this.reconnectAttempts = 0;
      this.setState('connected');
      this.flushPendingEmits();
    });

    this.socket.on('disconnect', () => {
      this.setState('disconnected');
    });

    this.socket.on('connect_error', () => {
      // Socket.io handles retries. We'll just mark state.
      this.setState('disconnected');
    });

    this.socket.io.on('reconnect_attempt', () => {
      this.reconnectAttempts += 1;
      this.setState('connecting');
    });

    this.socket.io.on('reconnect_failed', () => {
      this.setState('disconnected');
    });

    // Re-install our dispatchers for already-registered events (hot reconnect)
    for (const event of this.listeners.keys()) {
      this.installDispatcher(event);
    }
  }

  disconnect() {
    if (!this.socket) {
      this.setState('disconnected');
      return;
    }

    // Remove all socket listeners to avoid leaks
    for (const event of this.eventDispatcherInstalled) {
      this.socket.off(event);
    }

    this.socket.disconnect();
    this.socket = null;

    this.eventDispatcherInstalled.clear();
    this.setState('disconnected');
  }

  getState(): ConnectionState {
    return this.connectionState;
  }

  onStateChange(cb: (state: ConnectionState) => void) {
    this.stateListeners.add(cb);
    return () => {
      this.stateListeners.delete(cb);
    };
  }

  on(event: string, callback: Listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)!.add(callback);
    this.installDispatcher(event);
  }

  off(event: string, callback?: Listener) {
    if (!this.listeners.has(event)) return;

    if (callback) {
      this.listeners.get(event)!.delete(callback);
      if (this.listeners.get(event)!.size === 0) {
        this.listeners.delete(event);
        this.socket?.off(event);
        this.eventDispatcherInstalled.delete(event);
      }
      return;
    }

    // Remove all listeners for that event
    this.listeners.delete(event);
    this.socket?.off(event);
    this.eventDispatcherInstalled.delete(event);
  }

  emit(event: string, data: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
      return;
    }

    // Queue if disconnected
    this.pendingEmits.push({ event, data });
  }

  joinTeam(teamId: string) {
    this.emit('join:team', { teamId });
  }

  leaveTeam(teamId: string) {
    this.emit('leave:team', { teamId });
  }

  // -----------------------------
  // Internals
  // -----------------------------

  private installDispatcher(event: string) {
    if (!this.socket) return;
    if (this.eventDispatcherInstalled.has(event)) return;

    this.eventDispatcherInstalled.add(event);

    this.socket.on(event, (data: any) => {
      const callbacks = this.listeners.get(event);
      if (!callbacks?.size) return;
      callbacks.forEach((cb) => cb(data));
    });
  }

  private flushPendingEmits() {
    if (!this.socket?.connected) return;
    const queued = [...this.pendingEmits];
    this.pendingEmits = [];

    for (const item of queued) {
      this.socket.emit(item.event, item.data);
    }
  }

  private setState(next: ConnectionState) {
    if (this.connectionState === next) return;
    this.connectionState = next;
    this.stateListeners.forEach((cb) => cb(next));
  }
}

export const websocketService = new WebSocketService();