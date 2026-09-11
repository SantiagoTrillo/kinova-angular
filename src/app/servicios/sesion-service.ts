import { inject, Service, signal, WritableSignal } from "@angular/core"
import { UsuarioInterface } from "../interfaces/usuario-interface"
import { SupabaseService } from "./supabase-service"

@Service()
export class SesionService {
  private supabaseService: SupabaseService = inject(SupabaseService)

  usuarioActual: WritableSignal<UsuarioInterface | null> = signal<UsuarioInterface | null>(null)

  async registrarUsuario(usuarioNuevo: UsuarioInterface): Promise<void> {
    const respuesta = await this.supabaseService.cliente.from("usuarios").insert(usuarioNuevo)

    if (!respuesta.error) {
      this.usuarioActual.set(usuarioNuevo)
    }
  }

  cerrarSesion(): void {
    this.usuarioActual.set(null)
  }
}