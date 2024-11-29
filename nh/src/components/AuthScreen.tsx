"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { SignUp } from './SignUp'
import { Login } from './Login'
import { Button } from './ui/button'

export function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false)

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <h1 className="text-3xl font-bold text-center text-primary mb-8">
          Welcome to NH
        </h1>
        {isSignUp ? <SignUp /> : <Login />}
        <div className="mt-6 text-center">
          <Button variant="link" onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? "Already have an account? Log in" : "Don't have an account? Sign up"}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

