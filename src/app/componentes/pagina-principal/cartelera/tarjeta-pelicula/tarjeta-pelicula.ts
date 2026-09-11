import { Component, inject, input, InputSignal } from "@angular/core"
import { NgOptimizedImage } from "@angular/common"
import { PeliculaInterface } from "../../../../interfaces/pelicula-interface"
import { PeliculaService } from "../../../../servicios/pelicula-service"
import { Router } from "@angular/router"
import { DuracionPipe } from "../../../../tuberias/duracion-pipe"

@Component({
  selector: "app-tarjeta-pelicula",
  templateUrl: "./tarjeta-pelicula.html",
  styleUrl: "./tarjeta-pelicula.sass",
  imports: [NgOptimizedImage, DuracionPipe]
})
export class TarjetaPelicula {
  private peliculaService: PeliculaService = inject(PeliculaService)
  private router: Router = inject(Router)

  pelicula: InputSignal<PeliculaInterface> = input.required<PeliculaInterface>()

  seleccionarPelicula(pelicula: PeliculaInterface): void {
    this.peliculaService.seleccionarPelicula(pelicula)
    this.router.navigate(["/pelicula"])
  }
}