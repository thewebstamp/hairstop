// lib/auth.ts
import {
  NextAuthOptions,
  DefaultSession,
  User as NextAuthUser,
} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { pool } from "./db";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// Extend the default session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
  }
}

// Generate random token for email verification and password reset
export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

// Create verification token
export function createVerificationToken(): string {
  return generateToken(32);
}

// Create reset token
export function createResetToken(): string {
  return generateToken(32);
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const client = await pool.connect();
        try {
          // Find user by email
          const result = await client.query(
            "SELECT * FROM users WHERE email = $1",
            [credentials.email.toLowerCase()]
          );

          const user = result.rows[0];

          if (!user) {
            return null;
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.password_hash
          );

          if (!isValidPassword) {
            return null;
          }

          // REMOVE OR COMMENT OUT THIS BLOCK: Email verification check
          // if (!user.email_verified) {
          //   // Instead of throwing an error, just return null to indicate failed login
          //   return null;
          // }

          // Update last login
          await client.query(
            "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1",
            [user.id]
          );

          return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            role: user.role || "customer",
            image: user.image,
          };
        } finally {
          client.release();
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/login",
    error: "/auth/error",
    verifyRequest: "/auth/verify-email",
    newUser: "/auth/welcome",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      const client = await pool.connect();
      try {
        if (
          account?.provider === "google" ||
          account?.provider === "facebook"
        ) {
          // Check if user already exists
          const existingUser = await client.query(
            "SELECT id, role FROM users WHERE email = $1",
            [user.email?.toLowerCase()]
          );

          if (existingUser.rows.length === 0) {
            // Create new user for OAuth sign-in
            await client.query(
              `INSERT INTO users 
               (email, name, image, role, email_verified, provider, created_at) 
               VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5, CURRENT_TIMESTAMP)`,
              [
                user.email?.toLowerCase(),
                user.name,
                user.image,
                "customer",
                account.provider,
              ]
            );
          } else {
            // Update last login and provider for existing user
            await client.query(
              "UPDATE users SET last_login = CURRENT_TIMESTAMP, image = COALESCE($1, image), provider = COALESCE($2, provider) WHERE email = $3",
              [user.image, account.provider, user.email?.toLowerCase()]
            );
          }
        }
        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      } finally {
        client.release();
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

// Get server session - Now using NextAuth's built-in function
export async function getServerSession() {
  const { getServerSession: getSession } = await import("next-auth");
  return getSession(authOptions);
}

// Get current user
export async function getCurrentUser() {
  const session = await getServerSession();
  return session?.user;
}

// Check if user is admin
export async function isAdmin() {
  const user = await getCurrentUser();
  return user?.role === "admin";
}

// Check if user is authenticated
export async function isAuthenticated() {
  const session = await getServerSession();
  return !!session;
}
