"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { auth, db } from '@/lib/firebase'
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { FirebaseError } from 'firebase/app'

const formSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
})

export function Onboarding({ isNewUser = false }) {
  const [step, setStep] = useState(isNewUser ? 'username' : 'login')
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (step === 'login') {
        await signInWithEmailAndPassword(auth, values.email, values.password)
        toast({
          title: "Logged in successfully",
          description: "Welcome back!",
        })
      } else if (step === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password)
        await sendEmailVerification(userCredential.user)
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          username: values.username,
          email: values.email,
          points: 2500,
        })
        toast({
          title: "Account created successfully",
          description: "Please check your email for verification.",
        })
      } else if (step === 'username') {
        setStep('signup')
      }
    } catch (error) {
      const errorMessage = error instanceof FirebaseError 
        ? error.message 
        : "An unexpected error occurred. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-lg"
      >
        <h2 className="text-3xl font-bold text-center text-primary">
          {step === 'login' ? 'Welcome Back' : 'Join Us'}
        </h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {step === 'username' && (
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {(step === 'login' || step === 'signup') && (
              <>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter your email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter your password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            <Button type="submit" className="w-full">
              {step === 'login' ? 'Log In' : step === 'signup' ? 'Sign Up' : 'Continue'}
            </Button>
          </form>
        </Form>
        {step === 'login' && (
          <p className="text-center text-sm">
            Don't have an account?{' '}
            <button onClick={() => setStep('username')} className="text-primary hover:underline">
              Sign up
            </button>
          </p>
        )}
        {step === 'signup' && (
          <p className="text-center text-sm">
            Already have an account?{' '}
            <button onClick={() => setStep('login')} className="text-primary hover:underline">
              Log in
            </button>
          </p>
        )}
      </motion.div>
    </div>
  )
}

