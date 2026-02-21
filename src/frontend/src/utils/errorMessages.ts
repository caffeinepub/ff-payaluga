export interface ErrorInfo {
  title: string;
  description: string;
  suggestions: string[];
}

export function categorizeConnectionError(error: any): ErrorInfo {
  const errorMessage = error?.message?.toLowerCase() || '';
  
  // Network timeout or unreachable
  if (errorMessage.includes('timeout') || errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return {
      title: 'Connection Timeout',
      description: 'We couldn\'t reach the server. This might be due to a slow or unstable internet connection.',
      suggestions: [
        'Check your internet connection',
        'Try refreshing the page',
        'Wait a moment and try again'
      ]
    };
  }
  
  // Authentication issues
  if (errorMessage.includes('unauthorized') || errorMessage.includes('authentication') || errorMessage.includes('identity')) {
    return {
      title: 'Authentication Required',
      description: 'Your session may have expired or you need to log in again.',
      suggestions: [
        'Please log out and log in again',
        'Clear your browser cache and try again'
      ]
    };
  }
  
  // Canister/service unreachable
  if (errorMessage.includes('canister') || errorMessage.includes('replica') || errorMessage.includes('agent')) {
    return {
      title: 'Service Temporarily Unavailable',
      description: 'The service is currently unreachable. This may be a temporary issue.',
      suggestions: [
        'Wait a few moments and refresh the page',
        'The service may be undergoing maintenance',
        'Try again in a few minutes'
      ]
    };
  }
  
  // Actor initialization failure
  if (errorMessage.includes('actor') || errorMessage.includes('not available') || errorMessage.includes('not initialized')) {
    return {
      title: 'System Initialization Failed',
      description: 'We couldn\'t initialize the connection to the system.',
      suggestions: [
        'Refresh the page to try again',
        'Check your internet connection',
        'Clear your browser cache if the problem persists'
      ]
    };
  }
  
  // Generic connection error
  return {
    title: 'Connection Error',
    description: 'We encountered an unexpected problem connecting to the system.',
    suggestions: [
      'Refresh the page and try again',
      'Check your internet connection',
      'If the problem persists, please try again later'
    ]
  };
}

export function getDepositErrorMessage(error: any): string {
  const errorMessage = error?.message || '';
  
  if (errorMessage.includes('Invalid deposit amount')) {
    return 'Please enter an amount between ₹5 and ₹100';
  }
  
  if (errorMessage.includes('Unauthorized')) {
    return 'Please log in to make a deposit';
  }
  
  if (errorMessage.includes('not registered')) {
    return 'Please complete your profile setup first';
  }
  
  if (errorMessage.includes('not available') || errorMessage.includes('not initialized')) {
    return 'Unable to connect to the system. Please refresh the page and try again.';
  }
  
  return errorMessage || 'Unable to submit deposit. Please try again.';
}
