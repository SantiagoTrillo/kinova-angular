import { inject, Service } from "@angular/core"
import { SupabaseService } from "./supabase-service"
import { SesionService } from "./sesion-service"
import { CuponInterface } from "../interfaces/cupon-interface"
import { UsuarioInterface } from "../interfaces/usuario-interface"

@Service()
export class CuponService {
  private supabaseService: SupabaseService = inject(SupabaseService)
  private sesionService: SesionService = inject(SesionService)

  async obtenerMejorCupon(): Promise<CuponInterface | null> {
    const cupones: CuponInterface[] = await this.obtenerCupones()

    if (cupones.length === 0) return null

    return cupones.reduce((mejorCupon: CuponInterface, cuponActual: CuponInterface): CuponInterface =>
      cuponActual.descuento > mejorCupon.descuento ? cuponActual : mejorCupon)
  }

  async obtenerCupones(): Promise<CuponInterface[]> {
    const usuarioActual: UsuarioInterface | null = this.sesionService.usuarioActual()

    if (!usuarioActual) return []

    const respuesta = await this.supabaseService.cliente
      .from("cupones_usuarios").select("cupones(*)").eq("usuario_id", usuarioActual.id)
      .eq("utilizado", false)

    if (respuesta.data) {
      return respuesta.data.map((fila: any): CuponInterface => fila.cupones as CuponInterface)
    } else {
      return []
    }
  }

  async canjearCupon(cuponId: number): Promise<void> {
    const usuarioActual: UsuarioInterface | null = this.sesionService.usuarioActual()

    if (!usuarioActual) return

    await this.supabaseService.cliente.from("cupones_usuarios").update({ utilizado: true })
      .eq("usuario_id", usuarioActual.id).eq("cupon_id", cuponId)
  }

  async actualizarDescuentoCupon(nombreCupon: string, nuevoDescuento: number): Promise<void> {
    await this.supabaseService.cliente.from("cupones").update({descuento: nuevoDescuento})
      .eq("nombre", nombreCupon)
  }
}