import { Component, inject } from "@angular/core"
import { EntradaService } from "../../servicios/entrada-service"
import { PeliculaService } from "../../servicios/pelicula-service"
import { FuncionService } from "../../servicios/funcion-service"
import { CurrencyPipe, DatePipe, NgOptimizedImage } from "@angular/common"
import { CandybarService } from "../../servicios/candybar-service"
import { EntradaInterface } from "../../interfaces/entrada-interface"
import { CompraCandybar } from "../../interfaces/compra-candybar"

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
    this.entradaService.cuponAplicado.set(null)
    this.entradaService.montoDescontado.set(0)
    this.candybarService.compraCandybar.set(null)
    this.candybarService.cuponAplicado.set(null)
    this.candybarService.montoDescontado.set(0)
  }

  calcularTotalPesos(): number {
    const entradas: EntradaInterface[] | null  = this.entradaService.entradasCompradas()
    const compraCandybar: CompraCandybar | null = this.candybarService.compraCandybar()

    let total: number = 0

    if (entradas && entradas[0].precio > 0) total += this.entradaService.calcularTotalEntradas(entradas, false)
    if (compraCandybar && compraCandybar.total > 0) total += compraCandybar.total

    return total
  }

  calcularTotalPuntos(): number {
    const entradas: EntradaInterface[] | null = this.entradaService.entradasCompradas()
    const compraCandybar: CompraCandybar | null = this.candybarService.compraCandybar()

    let totalPuntos: number = 0

    if (entradas && entradas[0].precio === 0) totalPuntos += this.entradaService.calcularTotalEntradas(entradas, true)
    if (compraCandybar && compraCandybar.total === 0) totalPuntos += this.candybarService.puntosGastados()

    return totalPuntos
  }

  obtenerTotalFinal(): string {
    const pesos: number = this.calcularTotalPesos()
    const puntos: number = this.calcularTotalPuntos()

    if (pesos > 0 && puntos > 0) return `$ ${ pesos.toLocaleString("es-AR") } + ${ puntos.toLocaleString("es-AR") } puntos`
    if (puntos > 0) return `${ puntos.toLocaleString("es-AR") } puntos`

    return `$ ${pesos.toLocaleString("es-AR")}`
  }

  guardarPdf(): void { window.print() }
}