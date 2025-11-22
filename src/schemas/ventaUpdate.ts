// src/schemas/ventaUpdate.ts
import { z } from 'zod';

export const ventaUpdateSchema = z.object({
  estado: z.enum(['PENDIENTE', 'CONFIRMADA', 'ANULADA']).optional(),
  metodoPago: z.string().min(1).optional(),
  observaciones: z.string().optional(),
  impuesto: z.number().min(0).optional(),
  descuento: z.number().min(0).optional(),
});
