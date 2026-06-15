"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { User as UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { supabase } from "@/lib/supabaseClient"
import { isAdminEmail } from "@/lib/brand"

export function AccountPopover() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIsOpen(false)
    window.location.reload()
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <UserIcon className="h-5 w-5" />
          <span className="sr-only">Account</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        {user ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">My Account</h4>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <div className="flex flex-col gap-2">
              <Link href={isAdminEmail(user.email) ? "/admin" : "/customer"} onClick={() => setIsOpen(false)}>
                <Button className="w-full" variant="outline">
                  {isAdminEmail(user.email) ? "Admin Dashboard" : "Profile"}
                </Button>
              </Link>
              <Button className="w-full" variant="destructive" onClick={handleLogout}>Log out</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Welcome Back</h4>
              <p className="text-sm text-muted-foreground">
                Sign in to your account to continue
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="w-full"
              />
            </div>
            <div className="flex items-center justify-between">
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
                onClick={() => setIsOpen(false)}
              >
                Forgot password?
              </Link>
            </div>
            <Button className="w-full">Sign In</Button>
            <div className="text-center text-sm">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-primary hover:underline"
                onClick={() => setIsOpen(false)}
              >
                Sign up
              </Link>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
} 