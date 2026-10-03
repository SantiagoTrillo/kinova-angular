import { Component, inject, input, InputSignal } from "@angular/core"
import { NgOptimizedImage } from "@angular/common"
import { PeliculaInterface } from "../../../../interfaces/pelicula-interface"
import { PeliculaService } from "../../../../servicios/pelicula-service"
import { Router } from "@angular/router"
import { DuracionPipe } from "../../../../tuberias/duracion-pipe"
import { NotificacionService } from "../../../../servicios/notificacion-service"
import { SesionService } from "../../../../servicios/sesion-service"

@Component({
  selector: "app-tarjeta-pelicula",
  templateUrl: "./tarjeta-pelicula.html",
  styleUrl: "./tarjeta-pelicula.sass",
  imports: [NgOptimizedImage, DuracionPipe]
})
export class TarjetaPelicula {
  private peliculaService: PeliculaService = inject(PeliculaService)
  private notificacionService: NotificacionService = inject(NotificacionService)
  private router: Router = inject(Router)
  sesionService: SesionService = inject(SesionService)

  peliculaSeleccionada: InputSignal<PeliculaInterface> = input.required<PeliculaInterface>()
  estreno: InputSignal<boolean> = input<boolean>(false)

  protected activarNotificacion(): void { this.notificacionService.activarNotificacion(this.peliculaSeleccionada()) }

  seleccionarPelicula(pelicula: PeliculaInterface): void {
    this.peliculaService.seleccionarPelicula(pelicula)
    this.router.navigate(["/película"])
  }
}