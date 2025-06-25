"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthActions } from "@convex-dev/auth/react";
import { redirect } from "next/navigation";
import { useState } from "react";

export function SignIn({ onSuccess }: { onSuccess?: () => void }) {
  const { signIn } = useAuthActions();
  const [step, setStep] = useState<"signUp" | "signIn">("signIn");
  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        await signIn("password", formData);
        if (onSuccess) onSuccess();
        redirect('/battles')
      }}
    >
      <Input name="email" placeholder="Email" type="text" />
      <Input name="password" placeholder="Password" type="password" />
      <Input name="flow" type="hidden" value={step} />
      <Button type="submit">{step === "signIn" ? "Sign in" : "Sign up"}</Button>
      <Button
        type="button"
        onClick={() => {
          setStep(step === "signIn" ? "signUp" : "signIn");
        }}
      >
        {step === "signIn" ? "Sign up instead" : "Sign in instead"}
      </Button>
    </form>
  );
}
