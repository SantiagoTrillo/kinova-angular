import {Component, inject, signal, WritableSignal} from "@angular/core"
import { PeliculaService } from "../../../servicios/pelicula-service"
import {PeliculaInterface} from "../../../interfaces/pelicula-interface";
import {TarjetaPelicula} from "./tarjeta-pelicula/tarjeta-pelicula";

@Component({
  selector: "app-cartelera",
  templateUrl: "./cartelera.html",
  styleUrl: "./cartelera.sass",
  imports: [TarjetaPelicula]
})
export class Cartelera {
  private peliculaService: PeliculaService = inject(PeliculaService)
  peliculas: WritableSignal<PeliculaInterface[]> = signal<PeliculaInterface[]>([])
  peliculaSeleccionada: PeliculaInterface | null = null

  ngOnInit(): void {
    this.peliculaService.obtenerPeliculas().then(peliculas => {
      this.peliculas.set(peliculas)
    })
  }

  seleccionarPelicula(pelicula: PeliculaInterface): void {
    this.peliculaSeleccionada = pelicula
  }
}