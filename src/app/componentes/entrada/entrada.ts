import { Component, inject } from "@angular/core"
import { EntradaService } from "../../servicios/entrada-service"
import { PeliculaService } from "../../servicios/pelicula-service"
import { FuncionService } from "../../servicios/funcion-service"
import { CurrencyPipe, DatePipe, NgOptimizedImage } from "@angular/common"
import { CandybarService } from "../../servicios/candybar-service"

@Component({
  selector: "app-entrada",
  templateUrl: "./entrada.html",
  styleUrl: "./entrada.sass",
  imports: [CurrencyPipe, DatePipe, NgOptimizedImage]
})
export class Entrada {
  entradaService: EntradaService = inject(EntradaService)
  funcionService: FuncionService = inject(FuncionService)
  peliculaService: PeliculaService = inject(PeliculaService)
  candybarService: CandybarService = inject(CandybarService)

  guardarPdf(): void { window.print() }
}