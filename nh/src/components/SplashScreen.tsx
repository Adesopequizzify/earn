import { motion } from 'framer-motion'
import Image from 'next/image'

export function SplashScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Image src="/logo.png" alt="NH Logo" width={150} height={150} />
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-8 text-2xl font-bold text-primary"
      >
        Initializing...
      </motion.h1>
    </div>
  )
}

