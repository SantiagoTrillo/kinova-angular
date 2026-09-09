import { Component, inject } from "@angular/core"
import { RouterLink } from "@angular/router"
import { SesionService } from "../../servicios/sesion-service"

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.html",
  styleUrl: "./navbar.sass",
  imports: [RouterLink]
})
export class Navbar {
  sesionService: SesionService = inject(SesionService)
}