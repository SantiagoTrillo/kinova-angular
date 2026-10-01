import { Component, inject } from "@angular/core"
import { EntradaService } from "../../servicios/entrada-service"
import { PeliculaService } from "../../servicios/pelicula-service"
import { FuncionService } from "../../servicios/funcion-service"
import { CurrencyPipe, DatePipe, NgOptimizedImage } from "@angular/common"
import { CandybarService } from "../../servicios/candybar-service"

@Component({
  selector: "app-comprobante",
  templateUrl: "./comprobante.html",
  styleUrl: "./comprobante.sass",
  imports: [CurrencyPipe, DatePipe, NgOptimizedImage]
})
export class Comprobante {
  entradaService: EntradaService = inject(EntradaService)
  funcionService: FuncionService = inject(FuncionService)
  peliculaService: PeliculaService = inject(PeliculaService)
  candybarService: CandybarService = inject(CandybarService)

  ngOnDestroy(): void {
    this.peliculaService.peliculaSeleccionada.set(null)
    this.funcionService.funcionSeleccionada.set(null)
    this.entradaService.entradasCompradas.set(null)
    this.entradaService.codigoQrGenerado.set(null)
    this.candybarService.compraCandybar.set(null)
  }

  guardarPdf(): void { window.print() }
}