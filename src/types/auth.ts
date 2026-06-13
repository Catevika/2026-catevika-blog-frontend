import { z } from "zod";

// --------------------------------------------------
// User schema (adjust fields to match your backend)
// --------------------------------------------------
export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ error: "Invalid email" })),
  role: z.enum(["user", "admin"]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type User = z.infer<typeof userSchema>;

// --------------------------------------------------
// Login / Signup payloads
// --------------------------------------------------
export const signupPayloadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ error: "Invalid email" })),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type SignupPayload = z.infer<typeof signupPayloadSchema>;

export const loginPayloadSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ error: "Invalid email" })),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().optional(),
});

export type LoginPayload = z.infer<typeof loginPayloadSchema>;

// --------------------------------------------------
// Backend response
// --------------------------------------------------
export const authResponseSchema = z.object({
  user: userSchema,
});

export type AuthResponse = z.infer<typeof authResponseSchema>;
