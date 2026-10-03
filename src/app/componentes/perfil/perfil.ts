import { Component, computed, inject, OnInit, Signal, signal, WritableSignal } from "@angular/core"
import { SesionService } from "../../servicios/sesion-service"
import { DetallesPersonales } from "./detalles-personales/detalles-personales"
import { Router } from "@angular/router"
import { Cupones } from "./cupones/cupones"
import { Puntos } from "./puntos/puntos"
import { HistorialPeliculas } from "./historial-peliculas/historial-peliculas"
import { NotificacionService } from "../../servicios/notificacion-service"
import { NotificacionInterface } from "../../interfaces/notificacion-interface"
import { DatePipe } from "@angular/common"

@Component({
  selector: "app-perfil",
  templateUrl: "./perfil.html",
  styleUrl: "./perfil.sass",
  imports: [DetallesPersonales, Cupones, Puntos, HistorialPeliculas, DatePipe]
})
export class Perfil implements OnInit {
  private notificacionService: NotificacionService = inject(NotificacionService)
  private router: Router = inject(Router)

  mostrarNotificaciones: WritableSignal<boolean> = signal<boolean>(false)
  notificacionesDisponibles: Signal<NotificacionInterface[]> = computed((): NotificacionInterface[] =>
    this.notificacionService.notificaciones())
  notificacionesNoLeidas: Signal<boolean> = computed((): boolean => this.notificacionService.NotificacionesNoLeidas())

  sesionService: SesionService = inject(SesionService)

  async ngOnInit(): Promise<void> { await this.notificacionService.obtenerNotificacionesUsuario() }

  async abrirNotificaciones(): Promise<void> {
    if (!this.mostrarNotificaciones()) await this.notificacionService.leerNotificaciones()

    this.mostrarNotificaciones.update(visible => !visible)
  }

  cerrarSesion(): void {
    this.sesionService.cerrarSesion()
    this.router.navigate([""])
  }
}