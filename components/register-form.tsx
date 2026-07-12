"use client"

import { useActionState, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"
import { handleRegister, FormState } from "@/app/register/actions"
import { ReturnHome } from "./return-home"
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

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  // Use React 19's useActionState hook
  const [state, formAction, isPending] = useActionState(handleRegister, initialState)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="space-y-4 flex flex-col items-center">
          <ReturnHome />
          <div>
            <CardTitle className="font-family-pixel text-center">Create an account</CardTitle>
            <CardDescription className="text-center pt-2">
              Enter your details below to register an account
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form action={formAction}>
            <FieldGroup>
              {state.error && (
                <div className="text-sm text-red-500 bg-red-500/10 p-3 rounded-md border border-red-500/20 text-center">
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

              <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
              <div className="relative">
                <Input 
                  id="confirmPassword" 
                  name="confirmPassword" // Added name attribute
                  type={showConfirmPassword ? "text" : "password"} 
                  required 
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isPending}
                >
                  {showConfirmPassword ? <EyeOff className="size-4"/> : <Eye className="size-4" />}
                </button>
              </div>
              </Field>
              <Field>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Registering..." : "Register"}
                </Button>
                <FieldDescription className="text-center">
                  Already have an account? <a href="/register">Login here</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
