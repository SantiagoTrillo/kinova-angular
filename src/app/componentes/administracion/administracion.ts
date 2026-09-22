import { Component, inject, signal, TemplateRef, WritableSignal } from "@angular/core"
import { DatePipe, NgOptimizedImage, NgTemplateOutlet } from "@angular/common"
import { DuracionPipe } from "../../tuberias/duracion-pipe"
import { PeliculaService } from "../../servicios/pelicula-service"
import { PeliculaInterface } from "../../interfaces/pelicula-interface"
import { FuncionService } from "../../servicios/funcion-service"
import { FuncionInterface } from "../../interfaces/funcion-interface"

@Component({
  selector: "app-administracion",
  templateUrl: "./administracion.html",
  styleUrl: "./administracion.sass",
  imports: [NgOptimizedImage, DuracionPipe, NgTemplateOutlet, DatePipe]
})
export class Administracion {
  private peliculaService: PeliculaService = inject(PeliculaService)

  plantillaSeleccionada: WritableSignal<TemplateRef<any> | null> = signal<TemplateRef<any> | null>(null)
  peliculasDisponibles: WritableSignal<PeliculaInterface[]> = signal<PeliculaInterface[]>([])
  peliculaSeleccionada: WritableSignal<PeliculaInterface | null> = signal<PeliculaInterface | null>(null)
  funcionesDisponibles: WritableSignal<FuncionInterface[]> = signal<FuncionInterface[]>([])

  funcionService: FuncionService = inject(FuncionService)

  async ngOnInit(): Promise<void> {
    this.peliculasDisponibles.set(await this.peliculaService.obtenerPeliculas())
    this.funcionesDisponibles.set(await this.funcionService.obtenerFunciones())
  }

  seleccionarPlantilla(plantillaSeleccionada: TemplateRef<any>): void {
    this.plantillaSeleccionada.set(plantillaSeleccionada)
  }

  cambiarEstadoPelicula(estado: boolean, idPelicula: number): void {
    this.peliculaService.cambiarEstadoPelicula(estado, idPelicula).then(_ =>
      this.peliculasDisponibles.update(peliculas => peliculas.map(pelicula =>
        pelicula.id === idPelicula ? {...pelicula, principal: estado} : pelicula)))
  }

  obtenerFuncionesPelicula(idPelicula: number): FuncionInterface[] {
    return this.funcionesDisponibles().filter(funcion => funcion.pelicula_id === idPelicula)
  }

  seleccionarPelicula(peliculaSeleccionada: PeliculaInterface): void {
    this.peliculaSeleccionada.set(peliculaSeleccionada)
  }
}