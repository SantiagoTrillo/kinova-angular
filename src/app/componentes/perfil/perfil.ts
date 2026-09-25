import { Component, inject } from "@angular/core"
import { SesionService } from "../../servicios/sesion-service"
import { DetallesPersonales } from "./detalles-personales/detalles-personales"
import { Router } from "@angular/router"
import {Cupones} from "./cupones/cupones";

@Component({
  selector: "app-perfil",
  templateUrl: "./perfil.html",
  styleUrl: "./perfil.sass",
  imports: [DetallesPersonales, Cupones]
})
export class Perfil {
  sesionService: SesionService = inject(SesionService)
  private router: Router = inject(Router)

  cerrarSesion(): void {
    this.sesionService.cerrarSesion()
    this.router.navigate([""])
  }
}