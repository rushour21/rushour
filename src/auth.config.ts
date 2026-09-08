import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe half of the auth config.
 *
 * The proxy (middleware) runs on the Edge Runtime, which has no Node built-ins,
 * so anything that touches mongoose or bcrypt must stay out of this file. The
 * providers are added in `auth.ts`, which only ever runs in the Node runtime.
 */
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/sign-in" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.uid = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.uid) session.user.id = token.uid as string;
      return session;
    },
  },
};
