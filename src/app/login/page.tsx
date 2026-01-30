"use client";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { createClient } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Shield } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { getAppRootUrl } from "@/lib/appUrl";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const { t } = useLocale();
  const redirectTo = typeof window !== "undefined" ? getAppRootUrl() : undefined;

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
      <div className="min-h-screen flex items-center justify-center bg-[#121212]">
        <Loader2 className="animate-spin text-white/20" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#121212] p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#1A1A1A] p-8 rounded-3xl border border-white/10 shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
            <Shield className="text-white/80" size={26} />
          </div>
          <h1 className="text-2xl font-bold text-white">LifeOS</h1>
          <p className="text-gray-400 text-sm mt-2">{t("login_subtitle")}</p>
        </div>

        <Auth
          supabaseClient={supabase}
          redirectTo={redirectTo}
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
                email_label: "Correo",
                password_label: "Contraseña",
                button_label: "Entrar",
              },
            },
          }}
        />
      </div>
    </div>
  );
}
