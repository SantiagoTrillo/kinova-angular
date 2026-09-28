import { inject, Service } from "@angular/core"
import { SupabaseService } from "./supabase-service"
import { SesionService } from "./sesion-service"
import { UsuarioInterface } from "../interfaces/usuario-interface"

@Service()
export class PuntoService {
  private supabaseService: SupabaseService = inject(SupabaseService)
  private sesionService: SesionService = inject(SesionService)

  async obtenerPuntos(): Promise<number> {
    const usuarioActual: UsuarioInterface | null = this.sesionService.usuarioActual()

    if (!usuarioActual) return 0

    const respuesta = await this.supabaseService.cliente.from("usuarios")
      .select("puntos").eq("id", usuarioActual.id).single()

    if (respuesta.error) {
      alert("Error al procesar la solicitud: " + respuesta.error.message)
      return 0
    }
    if (!respuesta.data) return 0

    return respuesta.data.puntos
  }

  async acreditarPuntos(pesosGastados: number): Promise<void> {
    const usuarioActual: UsuarioInterface | null = this.sesionService.usuarioActual()

    if (!usuarioActual) return

    const puntosActuales: number = await this.obtenerPuntos()
    const respuesta = await this.supabaseService.cliente.from("usuarios")
      .update({ puntos: puntosActuales + pesosGastados }).eq("id", usuarioActual.id)

    if (respuesta.error) return alert("Error al procesar la solicitud: " + respuesta.error.message)
  }

  async descontarPuntos(puntosGastados: number): Promise<void> {
    const usuarioActual: UsuarioInterface | null = this.sesionService.usuarioActual()

    if (!usuarioActual) return

    const puntosActuales: number = await this.obtenerPuntos()
    const respuesta = await this.supabaseService.cliente.from("usuarios")
      .update({ puntos: puntosActuales - puntosGastados }).eq("id", usuarioActual.id)

    if (respuesta.error) return alert("Error al procesar la solicitud: " + respuesta.error.message)
  }
}