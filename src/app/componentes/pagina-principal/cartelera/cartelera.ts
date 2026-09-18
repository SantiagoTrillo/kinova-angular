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
  generosDisponibles: Signal<string[]> = signal<string[]>([
    "Drama", "Fantasía", "Comedia", "Acción", "Romance", "Suspenso", "Teror", "Ciencia Ficción", "Histórico", "Musical",
    "Aventura", "Animación"
  ])
  peliculasTotales: InputSignal<PeliculaInterface[]> = input.required<PeliculaInterface[]>()
  busqueda: WritableSignal<string> = signal<string>("")
  generoSeleccionado: WritableSignal<string> = signal<string>("")
  peliculasMostradas: Signal<PeliculaInterface[]> = computed((): PeliculaInterface[] => {
    const textoBuscado: string = this.busqueda().toLowerCase()

    return this.peliculasTotales().filter(pelicula => (
      pelicula.titulo.toLowerCase().includes(textoBuscado)) && (pelicula.generos.includes(this.generoSeleccionado()) ||
      this.generoSeleccionado() === "")
    )
  })

  filtrarPeliculasTexto(texto: string): void {
    this.busqueda.set(texto)
  }

  filtrarPeliculasGenero(genero: string): void {
    this.generoSeleccionado.set(genero)
  }
}