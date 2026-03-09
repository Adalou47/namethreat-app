import { SignUp } from "@clerk/nextjs";

export default function SignUpCompanyCatchAllPage() {
  return (
    <main className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#ffffff] px-4 py-12">
      <SignUp
        path="/signup/company"
        routing="path"
        signInUrl="/sign-in"
        fallbackRedirectUrl="/onboarding/company"
        forceRedirectUrl="/onboarding/company"
      />
    </main>
  );
}
