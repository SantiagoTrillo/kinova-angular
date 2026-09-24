import { Component, inject, signal, WritableSignal } from "@angular/core"
import { EntradaService } from "../../servicios/entrada-service"
import { PeliculaService } from "../../servicios/pelicula-service"
import { FuncionService } from "../../servicios/funcion-service"
import { CurrencyPipe, DatePipe, NgOptimizedImage } from "@angular/common"
import { CandybarService } from "../../servicios/candybar-service"
import { ProductoInterface } from "../../interfaces/producto-interface"

@Component({
  selector: "app-entrada",
  templateUrl: "./entrada.html",
  styleUrl: "./entrada.sass",
  imports: [CurrencyPipe, DatePipe, NgOptimizedImage]
})
export class Entrada {
  totalProductos: WritableSignal<number> = signal<number>(0)
  codigoQr: WritableSignal<string> = signal<string>(crypto.randomUUID())

  entradaService: EntradaService = inject(EntradaService)
  funcionService: FuncionService = inject(FuncionService)
  peliculaService: PeliculaService = inject(PeliculaService)
  candybarService: CandybarService = inject(CandybarService)

  ngOnInit(): void { this.calcularTotalProductos() }

  calcularTotalProductos(): void {
    this.totalProductos.set(this.candybarService.productosComprados()
      .reduce((total: number, producto: ProductoInterface): number => total + producto.precio, 0))
  }

  guardarPdf(): void { window.print() }
}