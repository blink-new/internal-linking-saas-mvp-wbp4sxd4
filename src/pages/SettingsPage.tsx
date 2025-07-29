import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { Settings, User, CreditCard, Bell } from 'lucide-react'

export const SettingsPage: React.FC = () => {
  const { user } = useAuth()

  return (
    <div className="container mx-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Account</span>
              </CardTitle>
              <CardDescription>
                Your account information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Account Status</label>
                <div className="mt-1">
                  <Badge variant="default">Active</Badge>
                </div>
              </div>
              <Button variant="outline" className="w-full" disabled>
                Update Profile
                <span className="ml-2 text-xs">(Coming Soon)</span>
              </Button>
            </CardContent>
          </Card>

          {/* Billing Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Billing</span>
              </CardTitle>
              <CardDescription>
                Manage your subscription and billing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Current Plan</label>
                <div className="mt-1">
                  <Badge variant="secondary">Free</Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Usage</label>
                <p className="text-sm text-muted-foreground mt-1">
                  No usage limits on free plan
                </p>
              </div>
              <Button variant="outline" className="w-full" disabled>
                Upgrade Plan
                <span className="ml-2 text-xs">(Coming Soon)</span>
              </Button>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notifications</span>
              </CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email Notifications</label>
                <p className="text-sm text-muted-foreground mt-1">
                  Get notified when jobs complete
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <div className="mt-1">
                  <Badge variant="secondary">Enabled</Badge>
                </div>
              </div>
              <Button variant="outline" className="w-full" disabled>
                Configure
                <span className="ml-2 text-xs">(Coming Soon)</span>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Coming Soon Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Coming Soon</span>
            </CardTitle>
            <CardDescription>
              Features we're working on for future releases
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Advanced Analytics</h4>
                <p className="text-sm text-muted-foreground">
                  Detailed insights into your internal linking performance
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Team Collaboration</h4>
                <p className="text-sm text-muted-foreground">
                  Share projects and collaborate with team members
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">API Access</h4>
                <p className="text-sm text-muted-foreground">
                  Integrate with your existing workflow via REST API
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Custom Rules</h4>
                <p className="text-sm text-muted-foreground">
                  Define custom internal linking rules and patterns
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}