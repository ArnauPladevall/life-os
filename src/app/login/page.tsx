"use client";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { createClient } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.replace("/");
      } else {
        setIsChecking(false);
      }
    };

    checkSession();
  }, [router, supabase]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        router.refresh();
        router.replace("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase]);

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#121212]">
        <Loader2 className="animate-spin text-white/20" size={32} />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#121212] p-4">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-900/20 blur-[100px]" />

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-[#1A1A1A] p-8 shadow-2xl">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 text-5xl">🔐</div>
          <h1 className="text-2xl font-bold text-white">LifeOS</h1>
          <p className="mt-2 text-sm text-gray-400">Sign in to continue</p>
        </div>

        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: "#2563eb",
                  brandAccent: "#1d4ed8",
                  inputText: "white",
                  inputBackground: "#262626",
                  inputBorder: "#404040",
                },
                radii: {
                  borderRadiusButton: "12px",
                  inputBorderRadius: "12px",
                },
              },
            },
            className: {
              button: "font-bold py-3",
              input: "py-3",
            },
          }}
          theme="dark"
          providers={["google", "github"]}
          localization={{
            variables: {
              sign_in: {
                email_label: "Email",
                password_label: "Password",
                button_label: "Sign in",
              },
            },
          }}
        />
      </div>
    </div>
  );
}