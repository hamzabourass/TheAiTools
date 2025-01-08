// src/components/auth/signin-button.tsx
"use client"

import { signIn, signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"

export function SignInButton() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <Button disabled>Loading...</Button>
  }

  if (session) {
    redirect("/analyse")
  }

  return (
    <Button onClick={() => signIn("google")}>
      Sign in with Google
    </Button>
  )
}