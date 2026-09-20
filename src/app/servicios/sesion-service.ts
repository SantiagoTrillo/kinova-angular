import { inject, Service, signal, WritableSignal } from "@angular/core"
import { UsuarioInterface } from "../interfaces/usuario-interface"
import { SupabaseService } from "./supabase-service"

@Service()
export class SesionService {
  private supabaseService: SupabaseService = inject(SupabaseService)

  usuarioActual: WritableSignal<UsuarioInterface | null> = signal<UsuarioInterface | null>(null)

  async registrarUsuario(usuarioNuevo: UsuarioInterface): Promise<UsuarioInterface | null> {
    const respuesta = await this.supabaseService.cliente.from("usuarios")
      .insert(usuarioNuevo).select().single()

    if (!respuesta.data) return null

    const usuarioRegistrado = respuesta.data as UsuarioInterface

    this.usuarioActual.set(usuarioRegistrado)

    return usuarioRegistrado
  }

  cerrarSesion(): void {
    this.usuarioActual.set(null)
  }
}