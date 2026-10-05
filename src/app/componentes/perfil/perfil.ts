import { Component, computed, inject, OnInit, Signal, signal, WritableSignal } from "@angular/core"
import { SesionService } from "../../servicios/sesion-service"
import { DetallesPersonales } from "./detalles-personales/detalles-personales"
import { Router } from "@angular/router"
import { Cupones } from "./cupones/cupones"
import { Puntos } from "./puntos/puntos"
import { HistorialPeliculas } from "./historial-peliculas/historial-peliculas"
import { NotificacionService } from "../../servicios/notificacion-service"
import { NotificacionInterface } from "../../interfaces/notificacion-interface"
import { CurrencyPipe, DatePipe } from "@angular/common"
import { CreditoService } from "../../servicios/credito-service"

@Component({
  selector: "app-perfil",
  templateUrl: "./perfil.html",
  styleUrl: "./perfil.sass",
  imports: [DetallesPersonales, Cupones, Puntos, HistorialPeliculas, DatePipe, CurrencyPipe]
})
export class Perfil implements OnInit {
  private notificacionService: NotificacionService = inject(NotificacionService)
  private creditoService: CreditoService = inject(CreditoService)
  private router: Router = inject(Router)

  protected mostrarNotificaciones: WritableSignal<boolean> = signal<boolean>(false)
  protected creditoDisponible: WritableSignal<number> = signal<number>(0)
  protected notificacionesDisponibles: Signal<NotificacionInterface[]> = computed((): NotificacionInterface[] =>
    this.notificacionService.notificaciones())
  protected notificacionesNoLeidas: Signal<boolean> = computed((): boolean => this.notificacionService.NotificacionesNoLeidas())
  protected sesionService: SesionService = inject(SesionService)

  async ngOnInit(): Promise<void> {
    await this.notificacionService.obtenerNotificacionesUsuario()
    this.creditoDisponible.set(await this.creditoService.obtenerCredito())
  }

  protected async abrirNotificaciones(): Promise<void> {
    if (!this.mostrarNotificaciones()) await this.notificacionService.leerNotificaciones()

    this.mostrarNotificaciones.update(visible => !visible)
  }

  protected async actualizarCredito(): Promise<void> { this.creditoDisponible.set(await this.creditoService.obtenerCredito()) }

  protected cerrarSesion(): void {
    this.sesionService.cerrarSesion()
    this.router.navigate([""])
  }
}