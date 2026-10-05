import { Component, computed, inject, input, InputSignal, Signal } from "@angular/core"
import { PeliculaInterface } from "../../../interfaces/pelicula-interface"
import { PeliculaService } from "../../../servicios/pelicula-service"
import { TarjetaPelicula } from "../cartelera/tarjeta-pelicula/tarjeta-pelicula"

@Component({
  selector: "app-proximamente",
  templateUrl: "./proximamente.html",
  styleUrl: "./proximamente.sass",
  imports: [TarjetaPelicula]
})
export class Proximamente {
  private peliculaService: PeliculaService = inject(PeliculaService)

  protected peliculasProximamente: Signal<PeliculaInterface[]> = computed((): PeliculaInterface[] => {
    return this.peliculasTotales().filter(pelicula =>
      this.peliculaService.verificarEstadoPelicula(pelicula) === "proximamente")
  })

  peliculasTotales: InputSignal<PeliculaInterface[]> = input.required<PeliculaInterface[]>()
}