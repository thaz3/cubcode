import { z } from "zod";

const pinField = z
  .string()
  .trim()
  .regex(/^\d{4,6}$/, "PIN must be 4–6 digits");

export const setParentPinSchema = z
  .object({
    newPin: pinField,
    confirmPin: z.string().trim(),
    currentPin: z.string().trim().optional(),
  })
  .refine((data) => data.newPin === data.confirmPin, {
    message: "PINs do not match",
    path: ["confirmPin"],
  });

export const verifyParentPinSchema = z.object({
  pin: pinField,
  returnTo: z.string().optional(),
});

export const removeParentPinSchema = z.object({
  currentPin: pinField,
});

export const resetParentPinSchema = z
  .object({
    token: z.string().min(1, "Reset link is invalid or expired"),
    newPin: pinField,
    confirmPin: z.string().trim(),
  })
  .refine((data) => data.newPin === data.confirmPin, {
    message: "PINs do not match",
    path: ["confirmPin"],
  });
