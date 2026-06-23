"use client"

import { useActionState, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronLeft, Eye, EyeOff } from "lucide-react"
import { handleLogin, FormState } from "@/app/login/actions"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const initialState: FormState = {
  error: null,
  success: false,
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  // Use React 19's useActionState hook
  const [state, formAction, isPending] = useActionState(handleLogin, initialState)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="space-y-4">
          <Link
            href="/"
            className="w-fit text-muted-foreground hover:text-foreground border border-zinc-600 rounded"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <CardTitle>Login to your account</CardTitle>
            <CardDescription>
              Enter your email below to login to your account
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form action={formAction}>
            <FieldGroup>
              {state.error && (
                <div className="text-sm text-red-500 bg-red-500/10 p-3 rounded-md border border-red-500/20">
                  {state.error}
                </div>
              )}
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email" // Added name attribute
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </Field>
              <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <div className="relative">
                <Input 
                  id="password" 
                  name="password" // Added name attribute
                  type={showPassword ? "text" : "password"} 
                  required 
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isPending}
                >
                  {showPassword ? <EyeOff className="size-4"/> : <Eye className="size-4" />}
                </button>
              </div>
              </Field>
              <Field>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Logging in..." : "Login"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
