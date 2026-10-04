import { inject, Service, signal, WritableSignal } from "@angular/core"
import { UsuarioInterface } from "../interfaces/usuario-interface"
import { SupabaseService } from "./supabase-service"
import { ToastService } from "./toast-service"

@Service()
export class SesionService {
  private supabaseService: SupabaseService = inject(SupabaseService)
  private toastService: ToastService = inject(ToastService)

  usuarioActual: WritableSignal<UsuarioInterface | null> = signal<UsuarioInterface | null>(
    sessionStorage.getItem("usuarioActual") ? JSON.parse(sessionStorage.getItem("usuarioActual")!) : null
  )

  async registrarUsuario(usuarioNuevo: UsuarioInterface): Promise<UsuarioInterface | null> {
    const respuesta = await this.supabaseService.cliente.from("usuarios")
      .insert({ ...usuarioNuevo, puntos: 0, credito: 0 }).select().single()

    if (respuesta.error || !respuesta.data) {
      if (respuesta.error) this.toastService.mostrarToast("No se pudo registrar el usuario", "error")
      return null
    }

    const usuarioRegistrado = respuesta.data as UsuarioInterface

    this.usuarioActual.set(usuarioRegistrado)
    sessionStorage.setItem("usuarioActual", JSON.stringify(usuarioRegistrado))

    return usuarioRegistrado
  }

  async iniciarSesion(correoElectronico: string, contrasenia: string): Promise<UsuarioInterface | null> {
    const respuesta = await this.supabaseService.cliente.from("usuarios").select("*")
      .eq("correo_electronico", correoElectronico).eq("contrasenia", contrasenia).single()

    if (respuesta.error || !respuesta.data) {
      if (respuesta.error) this.toastService.mostrarToast("El correo o la contraseña son incorrectos", "error")
      return null
    }

    const usuarioAutenticado = respuesta.data as UsuarioInterface

    this.usuarioActual.set(usuarioAutenticado)
    sessionStorage.setItem("usuarioActual", JSON.stringify(usuarioAutenticado))

    return usuarioAutenticado
  }

  calcularEdadUsuario(): number {
    const usuarioActual = this.usuarioActual()

    if (!usuarioActual) return 0

    const fechaNacimiento: string = usuarioActual.fecha_nacimiento
    const diferenciaMilisegundos: number = Date.now() - new Date(fechaNacimiento).getTime()

    return Math.floor(diferenciaMilisegundos / (1000 * 60 * 60 * 24 * 365.25))
  }

  cerrarSesion(): void {
    this.usuarioActual.set(null)
    sessionStorage.removeItem("usuarioActual")
  }
}