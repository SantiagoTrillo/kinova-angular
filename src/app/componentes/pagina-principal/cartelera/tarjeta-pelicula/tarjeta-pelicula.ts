import { Component, inject, input, InputSignal } from "@angular/core"
import { NgOptimizedImage } from "@angular/common"
import { PeliculaInterface } from "../../../../interfaces/pelicula-interface"
import { PeliculaService } from "../../../../servicios/pelicula-service"
import { Router } from "@angular/router"

@Component({
  selector: "app-tarjeta-pelicula",
  templateUrl: "./tarjeta-pelicula.html",
  styleUrl: "./tarjeta-pelicula.sass",
  imports: [NgOptimizedImage]
})
export class TarjetaPelicula {
  private peliculaService: PeliculaService = inject(PeliculaService)
  private router: Router = inject(Router)
  pelicula: InputSignal<PeliculaInterface> = input.required<PeliculaInterface>()

  formatearDuracion(minutos: number): string {
    return `${Math.floor(minutos / 60)}h ${minutos % 60}m`
  }

  seleccionarPelicula(pelicula: PeliculaInterface): void {
    this.peliculaService.seleccionarPelicula(pelicula)
    this.router.navigate(["/pelicula"])
  }
}