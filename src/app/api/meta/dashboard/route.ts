import { prisma } from "@/lib/prisma";
import { response } from "@/lib/response";
import { getAuthUser } from "@/lib/getAuthUser";
import { withCache } from "@/lib/cache";

export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user || !["ADMIN", "TRABAJADOR"].includes(user.rol)) {
      return response({ error: "No autorizado" }, 403);
    }

    // ✅ Cache los KPIs por 30 segundos (reduce queries a DB)
    const data = await withCache(
      "dashboard_kpis",
      async () => {
        const [totalClientes, totalEmpleados, totalProductos, totalVentas] = await Promise.all([
          prisma.cliente.count(),
          prisma.usuario.count({ where: { rol: { in: ["ADMIN", "TRABAJADOR"] }, estado: "ACTIVO" } }),
          prisma.producto.count({ where: { estado: "ACTIVO" } }),
          prisma.venta.count(),
        ]);

        return { totalClientes, totalEmpleados, totalProductos, totalVentas };
      },
      30 // TTL: 30 segundos
    );

    return response({
      data,
      message: "KPIs meta obtenidos correctamente",
    });
  } catch (e) {
    const error = e instanceof Error ? e.message : "Error al obtener KPIs";
    return response({ error }, 500);
  }
}
