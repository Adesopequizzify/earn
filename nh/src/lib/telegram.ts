declare global {
  interface Window {
    Telegram: {
      WebApp: {
        ready: () => void;
        close: () => void;
        showAlert: (message: string) => void;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
          };
        };
      };
    };
  }
}

export const initializeTelegramWebApp = () => {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    try {
      window.Telegram.WebApp.ready()
      return window.Telegram.WebApp
    } catch (error) {
      console.error('Failed to initialize Telegram Web App:', error)
      return null
    }
  }
  return null
}

export const getTelegramUser = () => {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    const webApp = window.Telegram.WebApp
    const user = webApp.initDataUnsafe?.user
    if (user) {
      return {
        id: user.id.toString(),
        username: user.username || '',
        firstName: user.first_name,
        lastName: user.last_name || '',
        languageCode: user.language_code || null,
        isPremium: false, // This is not available in the basic WebApp data
      }
    }
  }
  
  if (process.env.NODE_ENV === 'development') {
    return {
      id: '12345',
      username: 'test_user',
      firstName: 'Test',
      lastName: 'User',
      languageCode: 'en',
      isPremium: false,
    }
  }
  
  return null
}

export const closeTelegramWebApp = () => {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    window.Telegram.WebApp.close()
  }
}

export const showTelegramAlert = (message: string) => {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    window.Telegram.WebApp.showAlert(message)
  }
}

export const isTelegramWebApp = () => {
  return typeof window !== 'undefined' && window.Telegram?.WebApp ? true : false
}

