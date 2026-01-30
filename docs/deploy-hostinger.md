# Deploy (Hostinger) - guía rápida

Tu proyecto es **Next.js (App Router)**. En Hostinger tienes 2 caminos:

## Opción A (recomendada): Hostinger **Web App Hosting / Node.js Apps**
Hostinger permite desplegar apps Node.js subiendo un ZIP y configurando build/start. citeturn0search4turn0search16

1) Entra a hPanel → Websites → **Add Website** → **Node.js Apps**
2) Sube este ZIP del proyecto (sin `.env.local`)
3) Configura:
   - **Build command**: `npm install && npm run build`
   - **Start command**: `npm run start`
   - **Node version**: 18 o 20
4) En “Environment variables” crea:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL=https://techtrickslab.com`
   - `NEXT_PUBLIC_BASE_PATH=/lifeos`
5) Apunta tu dominio al hosting (DNS) y activa SSL

## Opción B: Hostinger VPS (más control, más trabajo)
Si tienes VPS, lo típico es Node + PM2 + Nginx + SSL. (PM2 suele ser lo más cómodo). citeturn0search13turn0search12

---

# Supabase - checklist

1) Crea proyecto en Supabase
2) En SQL Editor ejecuta: `docs/supabase.sql`
3) Authentication:
   - Email/password (mínimo)
4) En tu hosting añade variables de entorno (arriba)
5) Verifica que todo funciona: login → tasks → crea tarea → recarga → sigue

---

# Nota importante (subruta /lifeos)

Este proyecto está configurado con `basePath: /lifeos`.

Eso significa:
- La home es `https://techtrickslab.com/lifeos`
- El login es `https://techtrickslab.com/lifeos/login`

En Supabase (Auth → URL Configuration) añade:
- **Site URL**: `https://techtrickslab.com/lifeos`
- **Redirect URLs**: `https://techtrickslab.com/lifeos/**` y (para local) `http://localhost:3000/lifeos/**`

---

# Cobrar (cuando quieras)

Cuando decidas cobrar, añade Stripe (suscripciones) y “feature flags” por plan.
