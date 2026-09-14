import {Component , input, InputSignal } from "@angular/core"
import { PeliculaInterface } from "../../../interfaces/pelicula-interface"
import { TarjetaPelicula } from "./tarjeta-pelicula/tarjeta-pelicula"

@Component({
  selector: "app-cartelera",
  templateUrl: "./cartelera.html",
  styleUrl: "./cartelera.sass",
  imports: [TarjetaPelicula]
})
export class Cartelera {
  peliculas: InputSignal<PeliculaInterface[]> = input.required<PeliculaInterface[]>()
}