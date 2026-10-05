import { Component, inject, signal, WritableSignal } from "@angular/core"
import { PeliculaService } from "../../servicios/pelicula-service"
import { ReseniaInterface } from "../../interfaces/resenia-interface"
import { ReseniaService } from "../../servicios/resenia-service"
import { SupabaseService } from "../../servicios/supabase-service"
import { PeliculaInterface } from "../../interfaces/pelicula-interface"
import { Volver } from "../../directivas/volver"
import { ToastService } from "../../servicios/toast-service"

@Component({
  selector: "app-resenia",
  templateUrl: "./resenia.html",
  styleUrl: "./resenia.sass",
  imports: [Volver]
})
export class Resenia {
  private supabaseService: SupabaseService = inject(SupabaseService)
  private toastService: ToastService = inject(ToastService)

  protected peliculaService: PeliculaService = inject(PeliculaService)
  protected reseniaService: ReseniaService = inject(ReseniaService)
  protected resenias: WritableSignal<ReseniaInterface[]> = signal<ReseniaInterface[]>([])
  protected calificacionSeleccionada: WritableSignal<number> = signal<number>(0)

  ngOnInit(): void { this.obtenerResenias() }

  protected obtenerResenias(): void { this.reseniaService.obtenerResenias().then(resenias => this.resenias.set(resenias)) }

  protected async publicarResenia(cajaComentarios: HTMLTextAreaElement): Promise<void> {
    const peliculaActual: PeliculaInterface | null = this.peliculaService.peliculaSeleccionada()

    if (!peliculaActual) return

    const reseniaNueva: ReseniaInterface = {
      pelicula_id: peliculaActual.id,
      calificacion: this.calificacionSeleccionada(),
      comentarios: cajaComentarios.value
    }
    const respuesta = await this.supabaseService.cliente.from("resenias").insert(reseniaNueva)

    if (respuesta.error) return this.toastService.mostrarToast("No se pudo publicar la reseña", "error")

    await this.actualizarPuntuacionPromedio()
    this.calificacionSeleccionada.set(0)
    cajaComentarios.value = ""
    this.obtenerResenias()
  }

  protected async actualizarPuntuacionPromedio(): Promise<void> {
    const peliculaActual: PeliculaInterface | null = this.peliculaService.peliculaSeleccionada()

    if (!peliculaActual) return

    let sumaCalificaciones: number = this.calificacionSeleccionada()

    for (const resenia of this.resenias()) sumaCalificaciones += resenia.calificacion

    const nuevoPromedio: number = sumaCalificaciones / (this.resenias().length + 1)

    await this.supabaseService.cliente.from("peliculas").update({ puntuacion_promedio: nuevoPromedio })
      .eq("id", peliculaActual.id)

    peliculaActual.puntuacion_promedio = nuevoPromedio
    this.peliculaService.peliculaSeleccionada.set({ ...peliculaActual })
  }

  protected seleccionarEstrella(numero: number): void { this.calificacionSeleccionada.set(numero) }
}