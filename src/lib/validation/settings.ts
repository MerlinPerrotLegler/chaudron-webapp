import { z } from 'zod';

const hex = z.string().regex(/^#[0-9A-Fa-f]{6}$/);

export const apparenceUpdateSchema = z.object({
  colorPrimary: hex.optional(),
  colorAccent: hex.optional(),
  colorBg: hex.optional(),
  colorFg: hex.optional(),
  fontPreset: z.enum(['serife_campagne', 'sans_lisible', 'mixte']).optional(),
  radius: z.enum(['none', 'sm', 'md']).optional(),
  logoPath: z.string().nullable().optional(),
});

export const identiteUpdateSchema = z.object({
  appName: z.string().min(1).optional(),
  timezone: z.string().min(1).optional(),
});
