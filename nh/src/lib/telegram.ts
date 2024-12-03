import WebApp from '@twa-dev/sdk'

export const initializeTelegramWebApp = () => {
  if (typeof window !== 'undefined' && WebApp) {
    try {
      WebApp.ready()
      return WebApp
    } catch (error) {
      console.error('Failed to initialize Telegram Web App:', error)
      return null
    }
  }
  return null
}

export const getTelegramUser = () => {
  const webApp = initializeTelegramWebApp()
  if (webApp) {
    const user = webApp.initDataUnsafe?.user
    if (user) {
      return {
        id: user.id.toString(),
        username: user.username || '',
        firstName: user.first_name,
        lastName: user.last_name || '',
        languageCode: user.language_code || null,
        isPremium: user.is_premium || false,
      }
    }
  }
  if (process.env.NODE_ENV === 'development') {
    // Return mock data for development
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
  const webApp = initializeTelegramWebApp()
  if (webApp) {
    webApp.close()
  }
}

export const showTelegramAlert = (message: string) => {
  const webApp = initializeTelegramWebApp()
  if (webApp) {
    webApp.showAlert(message)
  }
}

export const isTelegramWebApp = () => {
  return typeof window !== 'undefined' && WebApp ? true : false
}

