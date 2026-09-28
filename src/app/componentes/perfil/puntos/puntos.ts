import { Component, inject, signal, WritableSignal } from "@angular/core"
import { PuntoService } from "../../../servicios/punto-service"
import { EntradaInterface } from "../../../interfaces/entrada-interface"
import { CompraCandybar } from "../../../interfaces/compra-candybar"
import { EntradaService } from "../../../servicios/entrada-service"
import { CandybarService } from "../../../servicios/candybar-service"
import { NgOptimizedImage } from "@angular/common"
import { SesionService } from "../../../servicios/sesion-service"

@Component({
  selector: "app-puntos",
  templateUrl: "./puntos.html",
  styleUrl: "./puntos.sass",
  imports: [NgOptimizedImage]
})
export class Puntos {
  private puntoService: PuntoService = inject(PuntoService)
  private entradaService: EntradaService = inject(EntradaService)
  private candybarService: CandybarService = inject(CandybarService)
  private sesionService: SesionService = inject(SesionService)

  puntosDisponibles: WritableSignal<number> = signal<number>(0)
  entradasCanjeadas: WritableSignal<EntradaInterface[]> = signal<EntradaInterface[]>([])
  productosCanjeados: WritableSignal<CompraCandybar[]> = signal<CompraCandybar[]>([])

  async ngOnInit(): Promise<void> {
    this.puntosDisponibles.set(await this.puntoService.obtenerPuntos())
    this.entradasCanjeadas.set(await this.entradaService.obtenerEntradasCanjeadas())
    this.productosCanjeados.set(await this.candybarService.obtenerProductosCanjeados())
  }

  activarModoCanje(): void { this.sesionService.modoCanjeActivado.set(true) }
}