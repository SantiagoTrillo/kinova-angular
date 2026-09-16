import {Component, inject, Signal, signal, WritableSignal} from "@angular/core"
import { PeliculaService } from "../../servicios/pelicula-service"
import { ReseniaInterface } from "../../interfaces/resenia-interface"
import { ReseniaService } from "../../servicios/resenia-service"

@Component({
  selector: "app-resenia",
  templateUrl: "./resenia.html",
  styleUrl: "./resenia.sass"
})
export class Resenia {
  private reseniaService: ReseniaService = inject(ReseniaService)

  resenias: WritableSignal<ReseniaInterface[]> = signal<ReseniaInterface[]>([])
  estrellas: Signal<number[]> = signal<number[]>([1, 2, 3, 4, 5])

  peliculaService: PeliculaService = inject(PeliculaService)

  ngOnInit(): void {
    this.reseniaService.obtenerResenias().then(resenias => this.resenias.set(resenias))
  }

  protected readonly indexedDB = indexedDB;
}