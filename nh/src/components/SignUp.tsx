"use client"

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth, createUserDocument, sendVerificationEmail } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
})

interface SignUpProps {
  step: number
  formData: Partial<z.infer<typeof formSchema>>
  onStepComplete: (data: Partial<z.infer<typeof formSchema>>) => void
}

export function SignUp({ step, formData, onStepComplete }: SignUpProps) {
  const { toast } = useToast()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: formData.email || '',
      password: formData.password || '',
      username: formData.username || '',
    },
  })

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (step === 1) {
        onStepComplete({ email: values.email })
      } else if (step === 2) {
        onStepComplete({ password: values.password })
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email!,
          formData.password!
        )
        await createUserDocument(userCredential.user, values.username)
        await sendVerificationEmail(userCredential.user)
        toast({
          title: "Account created successfully",
          description: "Please check your email for verification.",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="email"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
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
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="password"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Create a password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="username"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Choose a username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <Button type="submit" className="w-full">
          {step === 3 ? "Create Account" : "Next"}
        </Button>
      </form>
    </Form>
  )
}

