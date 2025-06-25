import { Button } from "@/components/ui/button";
import { useAuthActions } from "@convex-dev/auth/react";
import { redirect } from "next/navigation";
 
export function SignOutButton() {
  const { signOut } = useAuthActions();
  const onSignOut = () => {
    void signOut();
    redirect("/home"); // Redirect to home page after sign out
  }
  return <Button onClick={onSignOut}>Sign out</Button>;
}