import { Component, inject, Signal, signal } from "@angular/core"
import { PeliculaService } from "../../servicios/pelicula-service"
import { NgOptimizedImage } from "@angular/common"
import { Funciones } from "./funciones/funciones"
import { RouterLink } from "@angular/router"

@Component({
  selector: "app-pagina-pelicula",
  templateUrl: "./pagina-pelicula.html",
  styleUrl: "./pagina-pelicula.sass",
  imports: [NgOptimizedImage, Funciones, RouterLink]
})
export class PaginaPelicula {
  estrellas: Signal<number[]> = signal<number[]>([1, 2, 3, 4, 5])

  peliculaService: PeliculaService = inject(PeliculaService)

  ngOnInit() {
    console.log(this.peliculaService.peliculaSeleccionada())
  }
}