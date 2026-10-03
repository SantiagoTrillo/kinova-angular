import { Component, inject, OnInit, signal, WritableSignal } from "@angular/core"
import { NgOptimizedImage } from "@angular/common"
import { SesionService } from "../../../servicios/sesion-service"
import { SupabaseService } from "../../../servicios/supabase-service"
import { ToastService } from "../../../servicios/toast-service"
import { UsuarioInterface } from "../../../interfaces/usuario-interface"

@Component({
  selector: "app-historial-peliculas",
  templateUrl: "./historial-peliculas.html",
  styleUrl: "./historial-peliculas.sass",
  imports: [NgOptimizedImage]
})
export class HistorialPeliculas implements OnInit {
  private supabaseService: SupabaseService = inject(SupabaseService)
  private sesionService: SesionService = inject(SesionService)
  private toastService: ToastService = inject(ToastService)

  historialPeliculas: WritableSignal<any[]> = signal<any[]>([])

  async ngOnInit(): Promise<void> { await this.cargarHistorial() }

  private async cargarHistorial(): Promise<void> {
    const usuarioActual: UsuarioInterface | null = this.sesionService.usuarioActual()

    if (!usuarioActual) return

    const respuesta: any = await this.supabaseService.cliente.from("entradas")
      .select("id, fecha_compra, funciones(pelicula_id, peliculas(id, titulo, imagen, resenias(calificacion, comentarios)))")
      .eq("usuario_id", usuarioActual.id).order("id", { ascending: false })

    if (respuesta.error || !respuesta.data) {
      if (respuesta.error) this.toastService.mostrarToast("No se pudo cargar el historial de mis películas", "error")
      return
    }

    const peliculas: any[] = []

    for (const entrada of (respuesta.data as any[])) {
      if (entrada.fecha_compra) {
        const fecha: Date = new Date(entrada.fecha_compra)
        const funcion: any = entrada.funciones
        const pelicula: any = funcion?.peliculas

        if (pelicula) {
          const peliculaId: number = pelicula.id
          const dia: number = fecha.getDate()
          const mes: number = fecha.getMonth() + 1
          const anio: number = fecha.getFullYear()
          const diaTexto: string = dia < 10 ? `0${ dia }` : `${ dia }`
          const mesTexto: string = mes < 10 ? `0${ mes }` : `${ mes }`
          const fechaFormateada: string = `${ diaTexto }/${ mesTexto }/${ anio }`

          let peliculaExistente: any = null

          for (const pelicula of peliculas) {
            if (pelicula.peliculaId === peliculaId) {
              peliculaExistente = pelicula
              break
            }
          }

          if (!peliculaExistente) {
            const resenia: any = pelicula.resenias?.[0]

            peliculas.push({
              peliculaId: peliculaId,
              titulo: pelicula.titulo,
              imagen: pelicula.imagen,
              fechasCompra: fechaFormateada,
              calificacion: resenia?.calificacion,
              comentario: resenia?.comentarios
            })
          } else {
            if (!peliculaExistente.fechasCompra.includes(fechaFormateada)) peliculaExistente.fechasCompra += `, ${ fechaFormateada }`
          }
        }
      }
    }
    this.historialPeliculas.set(peliculas)
  }
}