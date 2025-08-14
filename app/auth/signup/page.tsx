"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { signUp } from "@/lib/actions"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white py-6 text-lg font-medium rounded-lg h-[60px] transition-all duration-200"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing up...
        </>
      ) : (
        "Sign Up"
      )}
    </Button>
  )
}

export default function SignUpPage() {
  const [state, formAction] = useActionState(signUp, null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white">Join RealGrind</h1>
          <p className="text-lg text-gray-400">Create your account to get started</p>
        </div>

        <form action={formAction} className="space-y-6">
          {state?.error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
              {state.error}
            </div>
          )}

          {state?.success && (
            <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg">
              {state.success}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="bg-gray-800/50 border-gray-700 text-white focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
          </div>

          <SubmitButton />

          <div className="text-center text-gray-400">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-purple-400 hover:text-purple-300 hover:underline">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
