import { inject, Service } from "@angular/core"
import { SupabaseService } from "./supabase-service"
import { SesionService } from "./sesion-service"
import { CuponInterface } from "../interfaces/cupon-interface"
import { UsuarioInterface } from "../interfaces/usuario-interface"

@Service()
export class CuponService {
  private supabaseService: SupabaseService = inject(SupabaseService)
  private sesionService: SesionService = inject(SesionService)

  async obtenerCupones(): Promise<CuponInterface[]> {
    const respuesta = await this.supabaseService.cliente.from("cupones").select("*")
      .order("id", { ascending: true })

    if (respuesta.error) {
      alert("Error al procesar la solicitud: " + respuesta.error.message)
      return []
    }
    if (!respuesta.data) return []

    return respuesta.data as CuponInterface[]
  }

  async obtenerCuponesUsuario(): Promise<CuponInterface[]> {
    const usuarioActual: UsuarioInterface | null = this.sesionService.usuarioActual()

    if (!usuarioActual) return []

    const respuesta = await this.supabaseService.cliente.from("cupones_usuarios")
      .select("cupones(*)").eq("usuario_id", usuarioActual.id).eq("utilizado", false)

    if (respuesta.error) {
      alert("Error al procesar la solicitud: " + respuesta.error.message)
      return []
    }
    if (!respuesta.data) return []

    return respuesta.data.map((fila: any): CuponInterface => fila.cupones as CuponInterface)
  }

  async obtenerMejorCupon(): Promise<CuponInterface | null> {
    const cupones: CuponInterface[] = await this.obtenerCuponesUsuario()

    if (cupones.length === 0) return null

    return cupones.reduce((mejorCupon: CuponInterface, cuponActual: CuponInterface): CuponInterface =>
      cuponActual.descuento > mejorCupon.descuento ? cuponActual : mejorCupon)
  }

  async canjearCupon(cuponId: number): Promise<void> {
    const usuarioActual: UsuarioInterface | null = this.sesionService.usuarioActual()

    if (!usuarioActual) return alert ("No hay una sesión activa")

    const respuesta = await this.supabaseService.cliente.from("cupones_usuarios")
      .update({ utilizado: true }).eq("usuario_id", usuarioActual.id).eq("cupon_id", cuponId)

    if (respuesta.error) return alert("Error al procesar la solicitud: " + respuesta.error.message)
  }

  async actualizarDescuentoCupon(nombreCupon: string, nuevoDescuento: number): Promise<void> {
    const respuesta = await this.supabaseService.cliente.from("cupones")
      .update({ descuento: nuevoDescuento }).eq("nombre", nombreCupon)

    if (respuesta.error) return alert("Error al procesar la solicitud: " + respuesta.error.message)
  }
}