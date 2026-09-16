import { Component, computed, input, InputSignal, Signal, signal, WritableSignal } from "@angular/core"
import { PeliculaInterface } from "../../../interfaces/pelicula-interface"
import { TarjetaPelicula } from "./tarjeta-pelicula/tarjeta-pelicula"

@Component({
  selector: "app-cartelera",
  templateUrl: "./cartelera.html",
  styleUrl: "./cartelera.sass",
  imports: [TarjetaPelicula]
})
export class Cartelera {
  peliculasTotales: InputSignal<PeliculaInterface[]> = input.required<PeliculaInterface[]>()
  busqueda: WritableSignal<string> = signal<string>("")
  peliculasMostradas: Signal<PeliculaInterface[]> = computed((): PeliculaInterface[] => {
    const textoBuscado: string = this.busqueda().toLowerCase()

    return this.peliculasTotales().filter(pelicula => pelicula.titulo.toLowerCase().includes(textoBuscado))
  })

  filtrarPeliculas(texto: string): void {
    this.busqueda.set(texto)
  }
}