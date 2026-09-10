import { inject, Service, signal, WritableSignal } from "@angular/core"
import { UsuarioInterface } from "../interfaces/usuario-interface"
import { SupabaseService } from "./supabase-service"

@Service()
export class SesionService {
  private supabaseService: SupabaseService = inject(SupabaseService)
  usuarioActual: WritableSignal<UsuarioInterface | null> = signal<UsuarioInterface | null>(null)

  async registrarUsuario(usuarioNuevo: UsuarioInterface): Promise<void> {
    const respuesta = await this.supabaseService.cliente.from("usuarios").insert(
      {
        correo_electronico: usuarioNuevo.correoElectronico,
        nombre: usuarioNuevo.nombre,
        apellido: usuarioNuevo.apellido,
        fecha_nacimiento: usuarioNuevo.fechaNacimiento,
        tipo_sangre: usuarioNuevo.tipoSangre,
        color_ojos: usuarioNuevo.colorOjos,
        dias_vacaciones_anuales: usuarioNuevo.diasVacacionesAnuales,
        cupon_primera_compra: true
      }
    )

    if (!respuesta.error) {
      this.usuarioActual.set(usuarioNuevo)
    }
  }

  cerrarSesion(): void {
    this.usuarioActual.set(null)
  }
}