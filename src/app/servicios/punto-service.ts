import { inject, Service } from "@angular/core"
import { SupabaseService } from "./supabase-service"
import { SesionService } from "./sesion-service"
import { UsuarioInterface } from "../interfaces/usuario-interface"
import { ToastService } from "./toast-service"

@Service()
export class PuntoService {
  private supabaseService: SupabaseService = inject(SupabaseService)
  private sesionService: SesionService = inject(SesionService)
  private toastService: ToastService = inject(ToastService)

  async obtenerPuntos(): Promise<number> {
    const usuarioActual: UsuarioInterface | null = this.sesionService.usuarioActual()

    if (!usuarioActual) return 0

    const respuesta = await this.supabaseService.cliente.from("usuarios")
      .select("puntos").eq("id", usuarioActual.id).single()

    if (respuesta.error || !respuesta.data) {
      if (respuesta.error) this.toastService.mostrarToast("No se pudieron obtener los puntos del usuario", "error")
      return 0
    }

    return respuesta.data.puntos
  }

  async actualizarPuntos(monto: number, canje: boolean = false): Promise<void> {
    const usuarioActual: UsuarioInterface | null = this.sesionService.usuarioActual()

    if (!usuarioActual) return

    const puntosActuales: number = await this.obtenerPuntos()
    const respuesta = await this.supabaseService.cliente.from("usuarios")
      .update({ puntos: canje ? puntosActuales - monto : puntosActuales + monto }).eq("id", usuarioActual.id)

    if (respuesta.error) return this.toastService.mostrarToast("No se pudieron actualizar los puntos", "error")
  }
}