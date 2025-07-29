import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Mail } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, loading, signIn } = useAuth()
  const { toast } = useToast()
  const [email, setEmail] = React.useState('')
  const [isSigningIn, setIsSigningIn] = React.useState(false)
  const [emailSent, setEmailSent] = React.useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center space-x-2"
        >
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </motion.div>
      </div>
    )
  }

  if (!user) {
    const handleSignIn = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!email) return

      setIsSigningIn(true)
      try {
        await signIn(email)
        setEmailSent(true)
        toast({
          title: 'Check your email',
          description: 'We sent you a magic link to sign in.',
        })
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to send magic link',
          variant: 'destructive',
        })
      } finally {
        setIsSigningIn(false)
      }
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto h-12 w-12 rounded-lg bg-primary flex items-center justify-center mb-4">
                <span className="text-primary-foreground font-bold text-lg">IL</span>
              </div>
              <CardTitle className="text-2xl">Welcome back</CardTitle>
              <CardDescription>
                Sign in to your Internal Linking account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {emailSent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-4"
                >
                  <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto">
                    <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Check your email</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      We sent a magic link to <strong>{email}</strong>
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEmailSent(false)
                      setEmail('')
                    }}
                    className="w-full"
                  >
                    Try different email
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isSigningIn}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSigningIn || !email}
                  >
                    {isSigningIn ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending magic link...
                      </>
                    ) : (
                      'Send magic link'
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return <>{children}</>
}