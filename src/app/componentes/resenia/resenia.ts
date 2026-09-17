import { Component, inject, signal, WritableSignal } from "@angular/core"
import { PeliculaService } from "../../servicios/pelicula-service"
import { ReseniaInterface } from "../../interfaces/resenia-interface"
import { ReseniaService } from "../../servicios/resenia-service"
import {SupabaseService} from "../../servicios/supabase-service";
import {PeliculaInterface} from "../../interfaces/pelicula-interface";

@Component({
  selector: "app-resenia",
  templateUrl: "./resenia.html",
  styleUrl: "./resenia.sass"
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

  async publicarResenia(comentarios: string): Promise<void> {
    const peliculaActual: PeliculaInterface | null = this.peliculaService.peliculaSeleccionada()

    if (peliculaActual) {
      const reseniaNueva: ReseniaInterface = {
        pelicula_id: peliculaActual.id,
        calificacion: this.calificacionSeleccionada(),
        comentarios: comentarios
      }
      const respuesta = await this.supabaseService.cliente.from("resenias")
        .insert(reseniaNueva)

      if (!respuesta.error) {
        this.obtenerResenias()
      }
    }
  }

  seleccionarEstrella(numero: number): void {
    this.calificacionSeleccionada.set(numero)
  }
}