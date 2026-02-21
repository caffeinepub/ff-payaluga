import { useState, useCallback, useEffect } from 'react';

interface RetryState {
  isRetrying: boolean;
  retryCount: number;
  maxRetries: number;
  canRetry: boolean;
  lastError: Error | null;
}

export function useRetryConnection(maxRetries: number = 3) {
  const [state, setState] = useState<RetryState>({
    isRetrying: false,
    retryCount: 0,
    maxRetries,
    canRetry: true,
    lastError: null,
  });

  const calculateDelay = (attempt: number): number => {
    // Exponential backoff: 1s, 2s, 4s
    return Math.min(1000 * Math.pow(2, attempt), 4000);
  };

  const retry = useCallback(async (retryFn: () => Promise<void>) => {
    if (state.retryCount >= maxRetries) {
      setState(prev => ({ ...prev, canRetry: false }));
      return;
    }

    setState(prev => ({
      ...prev,
      isRetrying: true,
      retryCount: prev.retryCount + 1,
    }));

    const delay = calculateDelay(state.retryCount);
    console.log(`Retry attempt ${state.retryCount + 1}/${maxRetries} after ${delay}ms delay`);

    await new Promise(resolve => setTimeout(resolve, delay));

    try {
      await retryFn();
      // Success - reset state
      setState({
        isRetrying: false,
        retryCount: 0,
        maxRetries,
        canRetry: true,
        lastError: null,
      });
    } catch (error) {
      console.error(`Retry attempt ${state.retryCount + 1} failed:`, error);
      setState(prev => ({
        ...prev,
        isRetrying: false,
        lastError: error as Error,
        canRetry: prev.retryCount < maxRetries - 1,
      }));
    }
  }, [state.retryCount, maxRetries]);

  const manualRetry = useCallback(() => {
    console.log('Manual retry triggered - reloading page');
    window.location.reload();
  }, []);

  const reset = useCallback(() => {
    setState({
      isRetrying: false,
      retryCount: 0,
      maxRetries,
      canRetry: true,
      lastError: null,
    });
  }, [maxRetries]);

  return {
    ...state,
    retry,
    manualRetry,
    reset,
  };
}
