"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function LoginButton() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async () => {
    setIsLoading(true);
    try {
      if (session) {
        await signOut();
      } else {
        await signIn('google');
      }
    } catch (error) {
      console.error('Authentication error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return null;
  }

  return (
    <Button 
      onClick={handleAuth}
      disabled={isLoading}
      variant={session ? "destructive" : "default"}
    >
      {isLoading ? (
        "Loading..."
      ) : session ? (
        "Sign Out"
      ) : (
        "Sign In with Google"
      )}
    </Button>
  );
} 