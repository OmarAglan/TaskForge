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
      return () => websocketService.disconnect();
    }

    websocketService.disconnect();
    return;
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