import { Component, inject, signal, WritableSignal } from "@angular/core"
import { PuntoService } from "../../../servicios/punto-service"
import { CompraCandybar } from "../../../interfaces/compra-candybar"
import { EntradaService } from "../../../servicios/entrada-service"
import { CandybarService } from "../../../servicios/candybar-service"
import {DatePipe, NgOptimizedImage} from "@angular/common"
import { SesionService } from "../../../servicios/sesion-service"
import { Router } from "@angular/router"

@Component({
  selector: "app-puntos",
  templateUrl: "./puntos.html",
  styleUrl: "./puntos.sass",
  imports: [NgOptimizedImage, DatePipe]
})
export class Puntos {
  private puntoService: PuntoService = inject(PuntoService)
  private entradaService: EntradaService = inject(EntradaService)
  private candybarService: CandybarService = inject(CandybarService)
  private sesionService: SesionService = inject(SesionService)
  private router: Router = inject(Router)

  puntosDisponibles: WritableSignal<number> = signal<number>(0)
  entradasCanjeadas: WritableSignal<any[]> = signal<any[]>([])
  productosCanjeados: WritableSignal<CompraCandybar[]> = signal<CompraCandybar[]>([])

  async ngOnInit(): Promise<void> {
    this.puntosDisponibles.set(await this.puntoService.obtenerPuntos())
    this.entradasCanjeadas.set(await this.entradaService.obtenerEntradasCanjeadas())
    this.productosCanjeados.set(await this.candybarService.obtenerProductosCanjeados())
  }

  activarModoCanje(): void {
    this.sesionService.modoCanjeActivado.set(true)
    this.router.navigate([""])
  }
}