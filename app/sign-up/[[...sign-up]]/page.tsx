import { SignUp } from '@clerk/nextjs'
import { Sparkles } from 'lucide-react'

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      {/* Background gradient */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Logo and Branding */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <Sparkles className="size-7" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">RAG Assistant</h1>
            <p className="text-sm text-muted-foreground">Create your account</p>
          </div>
        </div>

        {/* Clerk Sign Up */}
        <SignUp
          appearance={{
            elements: {
              rootBox: 'mx-auto w-full',
              card: 'shadow-xl border bg-card rounded-2xl',
              headerTitle: 'text-xl font-semibold',
              headerSubtitle: 'text-muted-foreground',
              formButtonPrimary: 'bg-primary hover:bg-primary/90 text-primary-foreground',
              formFieldInput: 'rounded-lg border-input',
              footerActionLink: 'text-primary hover:text-primary/80',
            },
          }}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          forceRedirectUrl="/"
        />
      </div>
    </div>
  )
}
