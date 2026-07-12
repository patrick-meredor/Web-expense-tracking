'use server'

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export type FormState = {
  error: string | null
  success: boolean
}

export async function handleRegister(prevState: FormState, formData: FormData): Promise<FormState> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!email || !password) {
    return { error: "Email and password are required.", success: false }
  }

  if (password !== confirmPassword) {
    return { error: "Password does not match.", success: false}
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return { error: error.message, success: false }
  }

  // Redirect on successful login
  redirect("/login")
}
