import { Component, computed, inject, input, InputSignal, Signal, signal, WritableSignal } from "@angular/core"
import { PeliculaInterface } from "../../../interfaces/pelicula-interface"
import { PeliculaService } from "../../../servicios/pelicula-service"
import { TarjetaPelicula } from "./tarjeta-pelicula/tarjeta-pelicula"

@Component({
  selector: "app-cartelera",
  templateUrl: "./cartelera.html",
  styleUrl: "./cartelera.sass",
  imports: [TarjetaPelicula]
})
export class Cartelera {
  private peliculaService: PeliculaService = inject(PeliculaService)

  generosDisponibles: Signal<string[]> = signal<string[]>([
    "Drama", "Fantasía", "Comedia", "Acción", "Romance", "Suspenso", "Terror", "Ciencia Ficción", "Histórico", "Musical", "Aventura",
    "Animación"
  ])
  peliculasTotales: InputSignal<PeliculaInterface[]> = input.required<PeliculaInterface[]>()
  busqueda: WritableSignal<string> = signal<string>("")
  generoSeleccionado: WritableSignal<string> = signal<string>("")
  peliculasMostradas: Signal<PeliculaInterface[]> = computed((): PeliculaInterface[] => {
    const textoBuscado: string = this.busqueda().toLowerCase()

    return this.peliculasTotales().filter(pelicula => {
      const coincideTexto = pelicula.titulo.toLowerCase().includes(textoBuscado)
      const coincideGenero = pelicula.generos.includes(this.generoSeleccionado()) || this.generoSeleccionado() === ""
      return coincideTexto && coincideGenero && this.peliculaService.verificarEstadoPelicula(pelicula) === "cartelera"
    })
  })

  filtrarPeliculasTexto(texto: string): void { this.busqueda.set(texto) }

  filtrarPeliculasGenero(genero: string): void { this.generoSeleccionado.set(genero) }
}