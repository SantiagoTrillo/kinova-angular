import { Component, inject } from "@angular/core"
import { SesionService } from "../../servicios/sesion-service"

@Component({
  selector: "app-perfil",
  templateUrl: "./perfil.html",
  styleUrl: "./perfil.sass"
})
export class Perfil {
  sesionService: SesionService = inject(SesionService)
}