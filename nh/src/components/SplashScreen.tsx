import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { showTelegramAlert } from '@/lib/telegram'

export function SplashScreen() {
  const { loading, user, error } = useAuth()
  const [status, setStatus] = useState('Initializing...')

  useEffect(() => {
    if (loading) {
      setStatus('Connecting to Telegram...')
    } else if (user) {
      setStatus('Loading your profile...')
    } else if (error) {
      setStatus('Unable to connect. Please try again.')
      showTelegramAlert(error)
    }
  }, [loading, user, error])

  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Image src="/assets/logos/main.png" alt="SWHIT LOGO" width={150} height={150} />
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-8 text-2xl font-bold text-primary"
      >
        {status}
      </motion.h1>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <Button onClick={handleRetry} className="mt-4">
            Retry
          </Button>
        </motion.div>
      )}
    </div>
  )
}

