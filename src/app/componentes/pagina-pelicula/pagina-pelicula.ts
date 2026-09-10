import { Component, inject } from "@angular/core"
import { PeliculaService } from "../../servicios/pelicula-service"
import {NgOptimizedImage} from "@angular/common";
import {Funciones} from "./funciones/funciones";

@Component({
  selector: "app-pagina-pelicula",
  templateUrl: "./pagina-pelicula.html",
  imports: [
    NgOptimizedImage,
    Funciones
  ],
  styleUrl: "./pagina-pelicula.sass"
})
export class PaginaPelicula {
  peliculaService: PeliculaService = inject(PeliculaService)
}