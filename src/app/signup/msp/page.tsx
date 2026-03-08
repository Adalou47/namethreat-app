import { SignUp } from "@clerk/nextjs";

export default function SignUpMspPage() {
  return (
    <main className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#ffffff] px-4 py-12">
      <SignUp
        signInUrl="/sign-in"
        fallbackRedirectUrl="/onboarding/msp"
        forceRedirectUrl="/onboarding/msp"
      />
    </main>
  );
}
