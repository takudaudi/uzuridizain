import { z } from "zod";
import { Hono } from "hono";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";

import { db } from "@/db/drizzle";
import { users } from "@/db/schema";

const app = new Hono()
  .post(
    "/",
    zValidator(
      "json",
      z.object({
        name: z.string(),
        email: z.string().email(),
        password: z.string().min(3).max(20),
      })
    ),
    async (c) => {
      try {
        const { name, email, password } = c.req.valid("json");

        console.log("Creating user:", { name, email });

        const hashedPassword = await bcrypt.hash(password, 12);

        const query = await db
          .select()
          .from(users)
          .where(eq(users.email, email));

        if (query[0]) {
          console.log("Email already exists:", email);
          return c.json({ error: "Email already in use" }, 400);
        }

        await db.insert(users).values({
          email,
          name,
          password: hashedPassword,
        });
        
        console.log("User created successfully:", email);
        return c.json({ success: true }, 200);
      } catch (error) {
        console.error("Error creating user:", error);
        return c.json({ error: "Internal server error" }, 500);
      }
    },
  );

export default app;
