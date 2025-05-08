import { z } from "zod";

/**
 * Client data model schema and type definitions
 */
export const clientSchema = z.object({
  id: z.string(),
  clientName: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  abn: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postcode: z.string().optional(),
  status: z.enum(["prospect", "active", "archived"]),
  auditMonthEnd: z.number().int().optional(),
  nextContactDate: z.date().optional(),
  estAnnFees: z.number().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Infer Client type from schema
 */
export type Client = z.infer<typeof clientSchema>; 