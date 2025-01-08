"use client"
import { SignInButton } from "@/components/auth/signin-button"

export default function Signin(){
     return (<>
     <div className="min-h-screen flex items-center justify-center">
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold">Welcome to CV Assistant</h1>
              <SignInButton />
            </div>
          </div>
    </>)
}