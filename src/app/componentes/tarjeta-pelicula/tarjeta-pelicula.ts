import { Component, input, InputSignal, output, OutputEmitterRef } from "@angular/core"
import { NgOptimizedImage } from "@angular/common"
import { PeliculaInterface } from "../../interfaces/pelicula-interface"

@Component({
  selector: "app-tarjeta-pelicula",
  templateUrl: "./tarjeta-pelicula.html",
  styleUrl: "./tarjeta-pelicula.sass",
  imports: [NgOptimizedImage]
})
export class TarjetaPelicula {
  pelicula: InputSignal<PeliculaInterface> = input.required<PeliculaInterface>()
  peliculaSeleccionada: OutputEmitterRef<PeliculaInterface> = output<PeliculaInterface>()

  formatearDuracion(minutos: number): string {
    return `${Math.floor(minutos / 60)}h ${minutos % 60}m`
  }

  // seleccionarPelicula(): void {
  //   this.peliculaSeleccionada.emit(this.pelicula())
  // }
}