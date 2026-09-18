import { Component, inject, signal, WritableSignal } from "@angular/core"
import { PeliculaService } from "../../servicios/pelicula-service"
import { ReseniaInterface } from "../../interfaces/resenia-interface"
import { ReseniaService } from "../../servicios/resenia-service"
import { SupabaseService } from "../../servicios/supabase-service"
import { PeliculaInterface } from "../../interfaces/pelicula-interface"
import {Volver} from "../../directivas/volver";

@Component({
  selector: "app-resenia",
  templateUrl: "./resenia.html",
  styleUrl: "./resenia.sass",
  imports: [Volver]
})
export class Resenia {
  private supabaseService: SupabaseService = inject(SupabaseService)

  resenias: WritableSignal<ReseniaInterface[]> = signal<ReseniaInterface[]>([])
  calificacionSeleccionada: WritableSignal<number> = signal<number>(0)

  peliculaService: PeliculaService = inject(PeliculaService)
  reseniaService: ReseniaService = inject(ReseniaService)

  obtenerResenias(): void {
    this.reseniaService.obtenerResenias().then(resenias => this.resenias.set(resenias))
  }

  ngOnInit(): void {
    this.obtenerResenias()
  }

  async publicarResenia(cajaComentarios: HTMLTextAreaElement): Promise<void> {
    const peliculaActual: PeliculaInterface | null = this.peliculaService.peliculaSeleccionada()

    if (peliculaActual) {
      const reseniaNueva: ReseniaInterface = {
        pelicula_id: peliculaActual.id,
        calificacion: this.calificacionSeleccionada(),
        comentarios: cajaComentarios.value
      }
      const respuesta = await this.supabaseService.cliente.from("resenias")
        .insert(reseniaNueva)

      if (!respuesta.error) {
        await this.actualizarPuntuacionPromedio()
        this.calificacionSeleccionada.set(0)
        cajaComentarios.value = ""
        this.obtenerResenias()
      }
    }
  }

  async actualizarPuntuacionPromedio(): Promise<void> {
    const peliculaActual: PeliculaInterface | null = this.peliculaService.peliculaSeleccionada()

    if (peliculaActual) {
      const calificaciones: number[] = this.resenias().map(resenia => resenia.calificacion)
      const sumaCalificaciones: number = calificaciones.reduce((acumulador: number, calificacion: number): number =>
        acumulador + calificacion, 0)
      const promedio: number = (sumaCalificaciones + this.calificacionSeleccionada()) / (calificaciones.length + 1)
      const nuevaPuntuacionPromedio: number = Math.round(promedio * 10) / 10

      await this.supabaseService.cliente.from("peliculas").update({puntuacion_promedio: nuevaPuntuacionPromedio})
        .eq("id", peliculaActual.id)

      peliculaActual.puntuacion_promedio = nuevaPuntuacionPromedio

      this.peliculaService.peliculaSeleccionada.set({ ...peliculaActual })
    }
  }

  seleccionarEstrella(numero: number): void {
    this.calificacionSeleccionada.set(numero)
  }
}