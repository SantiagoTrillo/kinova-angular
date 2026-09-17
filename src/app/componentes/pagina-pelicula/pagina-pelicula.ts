import { Component, inject } from "@angular/core"
import { PeliculaService } from "../../servicios/pelicula-service"
import { NgOptimizedImage } from "@angular/common"
import { Funciones } from "./funciones/funciones"
import { RouterLink } from "@angular/router"
import { ReseniaService } from "../../servicios/resenia-service"

@Component({
  selector: "app-pagina-pelicula",
  templateUrl: "./pagina-pelicula.html",
  styleUrl: "./pagina-pelicula.sass",
  imports: [NgOptimizedImage, Funciones, RouterLink]
})
export class PaginaPelicula {
  peliculaService: PeliculaService = inject(PeliculaService)
  reseniaService: ReseniaService = inject(ReseniaService)

  ngOnInit(): void {
    console.log(this.peliculaService.peliculaSeleccionada())
  }
}