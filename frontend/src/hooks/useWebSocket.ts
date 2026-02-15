import { useEffect, useMemo, useState } from 'react';
import { websocketService } from '../services/websocket/websocket.service';
import { useAuthStore } from '../store/authStore';

type ConnectionState = 'disconnected' | 'connecting' | 'connected';

export function useWebSocket() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [state, setState] = useState<ConnectionState>(websocketService.getState());

  useEffect(() => {
    const unsubscribe = websocketService.onStateChange(setState);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      websocketService.connect(accessToken);
      // Intentionally NOT disconnecting in the cleanup.
      // React 18 strict-mode double-invokes effects which causes
      // the socket to be closed before the connection is established.
      // The service's connect() already guards against duplicate connections,
      // and we disconnect when isAuthenticated becomes false.
      return undefined;
    }

    websocketService.disconnect();
    return undefined;
  }, [isAuthenticated, accessToken]);

  return useMemo(
    () => ({
      isConnected: state === 'connected',
      connectionState: state,
      websocketService,
    }),
    [state],
  );
}