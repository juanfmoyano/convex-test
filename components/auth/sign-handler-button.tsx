"use client";

import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { SignOutButton } from "./sign-out-button";
import { SignInButton } from "./sign-in-button";

export const SignHandlerButton = () =>{
  return (
    <>
      <AuthLoading>
        <span>Loading...</span>
      </AuthLoading>
      <Unauthenticated>
        <SignInButton />
      </Unauthenticated>
      <Authenticated>
        <SignOutButton />
      </Authenticated>
    </>
  );
}
