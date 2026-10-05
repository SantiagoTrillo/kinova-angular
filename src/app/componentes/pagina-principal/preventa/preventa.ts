import { Component, computed, inject, input, InputSignal, Signal } from "@angular/core"
import { PeliculaInterface } from "../../../interfaces/pelicula-interface"
import { PeliculaService } from "../../../servicios/pelicula-service"
import { TarjetaPelicula } from "../cartelera/tarjeta-pelicula/tarjeta-pelicula"

@Component({
  selector: "app-preventa",
  templateUrl: "./preventa.html",
  styleUrl: "./preventa.sass",
  imports: [TarjetaPelicula]
})
export class Preventa {
  private peliculaService: PeliculaService = inject(PeliculaService)

  protected peliculasPreventa: Signal<PeliculaInterface[]> = computed((): PeliculaInterface[] => {
    return this.peliculasTotales().filter(pelicula => this.peliculaService.verificarEstadoPelicula(pelicula) === "preventa")
  })

  peliculasTotales: InputSignal<PeliculaInterface[]> = input.required<PeliculaInterface[]>()
}