import { computed, inject, Service, signal, Signal, WritableSignal } from "@angular/core"
import { NotificacionInterface } from "../interfaces/notificacion-interface"
import { PeliculaInterface } from "../interfaces/pelicula-interface"
import { PeliculaService } from "./pelicula-service"
import { SesionService } from "./sesion-service"
import { SupabaseService } from "./supabase-service"
import { ToastService } from "./toast-service"
import { UsuarioInterface } from "../interfaces/usuario-interface"

@Service()
export class NotificacionService {
  private supabaseService: SupabaseService = inject(SupabaseService)
  private sesionService: SesionService = inject(SesionService)
  private peliculaService: PeliculaService = inject(PeliculaService)
  private toastService: ToastService = inject(ToastService)

  notificaciones: WritableSignal<NotificacionInterface[]> = signal<NotificacionInterface[]>([])
  NotificacionesNoLeidas: Signal<boolean> = computed((): boolean => {
    for (const notificacion of this.notificaciones()) if (!notificacion.leida) return true
    return false
  })

  async activarNotificacion(pelicula: PeliculaInterface): Promise<boolean> {
    const usuarioActual: UsuarioInterface | null = this.sesionService.usuarioActual()

    if (!usuarioActual) {
      this.toastService.mostrarToast("Debés iniciar sesión para recibir notificaciones", "error")
      return false
    }

    const respuestaNotificacionExistente = await this.supabaseService.cliente
      .from("notificaciones").select("id").eq("usuario_id", usuarioActual.id).eq("pelicula_id", pelicula.id)

    if (respuestaNotificacionExistente.data?.[0]) {
      this.toastService.mostrarToast("Ya tenés activadas las notificaciones para esta película", "informacion")
      return false
    }

    const respuesta = await this.supabaseService.cliente.from("notificaciones").insert({
      usuario_id: usuarioActual.id,
      pelicula_id: pelicula.id,
      mensaje: `Ya están disponibles las entradas para ${ pelicula.titulo }`,
      fecha: new Date().toISOString(),
      leida: false
    })

    if (respuesta.error) {
      this.toastService.mostrarToast("No se pudo registrar la notificación", "error")
      return false
    }

    this.toastService.mostrarToast("Se te notificará cuando estén disponibles las entradas", "informacion")
    await this.obtenerNotificacionesUsuario()
    return true
  }

  async obtenerNotificacionesUsuario(): Promise<NotificacionInterface[]> {
    const usuarioActual: UsuarioInterface | null = this.sesionService.usuarioActual()

    if (!usuarioActual) return []

    const respuesta = await this.supabaseService.cliente.from("notificaciones")
      .select("*, peliculas(*)").eq("usuario_id", usuarioActual.id).order("id", { ascending: false })

    if (respuesta.error || !respuesta.data) return []

    const notificacionesDisponibles: NotificacionInterface[] = []

    for (const notificacion of (respuesta.data as NotificacionInterface[])) {
      const pelicula: PeliculaInterface | undefined = notificacion.peliculas
      if (pelicula) {
        const estado: string | null = this.peliculaService.verificarEstadoPelicula(pelicula)

        if (estado === "preventa" || estado === "cartelera") notificacionesDisponibles.push(notificacion)
      }
    }

    this.notificaciones.set(notificacionesDisponibles)
    return notificacionesDisponibles
  }

  async leerNotificaciones(): Promise<void> {
    const usuarioActual: UsuarioInterface | null = this.sesionService.usuarioActual()

    if (!usuarioActual) return

    const notificacionesNoLeidas: NotificacionInterface[] = []

    for (const notificacion of this.notificaciones()) if (!notificacion.leida) notificacionesNoLeidas.push(notificacion)

    if (notificacionesNoLeidas.length === 0) return

    const idsNotificacionesNoLeidas: number[] = []

    for (const notificacion of notificacionesNoLeidas) if (notificacion.id) idsNotificacionesNoLeidas.push(notificacion.id)

    const respuesta = await this.supabaseService.cliente.from("notificaciones")
      .update({ leida: true }).in("id", idsNotificacionesNoLeidas)

    if (!respuesta.error) {
      this.notificaciones.update(notificaciones => notificaciones.map(notificacion =>
        ({ ...notificacion, leida: true }))
      )
    }
  }
}