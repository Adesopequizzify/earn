import { WebApp } from '@twa-dev/types'

declare global {
  interface Window {
    Telegram: {
      WebApp: WebApp
    }
  }
}

export const getTelegramUser = () => {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    const webApp = window.Telegram.WebApp
    webApp.ready()
    const user = webApp.initDataUnsafe?.user
    if (user) {
      return {
        id: user.id.toString(),
        username: user.username || '',
        firstName: user.first_name,
        lastName: user.last_name || '',
        languageCode: user.language_code,
        isPremium: user.is_premium || false,
      }
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

