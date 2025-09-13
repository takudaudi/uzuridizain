import { Context, Hono } from "hono";
import { handle } from "hono/vercel";
import { AuthConfig, initAuthConfig } from "@hono/auth-js";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";

import ai from "./ai";
import users from "./users";
import images from "./images";
import projects from "./projects";
import subscriptions from "./subscriptions";

import { db } from "@/db/drizzle";

// Revert to "edge" if planning on running on the edge
export const runtime = "nodejs";

function getAuthConfig(c: Context): AuthConfig {
  return {
    secret: c.env.AUTH_SECRET,
    adapter: DrizzleAdapter(db),
    providers: [
      GitHub({
        clientId: c.env.GITHUB_ID!,
        clientSecret: c.env.GITHUB_SECRET!,
      }), 
      Google({
        clientId: c.env.GOOGLE_ID!,
        clientSecret: c.env.GOOGLE_SECRET!,
      })
    ],
    pages: {
      signIn: "/sign-in",
      error: "/sign-in"
    },
    session: {
      strategy: "jwt",
    },
    callbacks: {
      session({ session, token }) {
        if (token.id) {
          session.user.id = token.id;
        }
        return session;
      },
      jwt({ token, user }) {
        if (user) {
          token.id = user.id;  
        }
        return token;
      }
    },
  };
};

const app = new Hono().basePath("/api");

app.use("*", initAuthConfig(getAuthConfig));

const routes = app
  .route("/ai", ai)
  .route("/users", users)
  .route("/images", images)
  .route("/projects", projects)
  .route("/subscriptions", subscriptions);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;
