import { Component, inject } from "@angular/core"
import { RouterLink } from "@angular/router"
import { SesionService } from "../../servicios/sesion-service"
import { NgOptimizedImage } from "@angular/common"

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.html",
  styleUrl: "./navbar.sass",
  imports: [RouterLink, NgOptimizedImage]
})
export class Navbar { sesionService: SesionService = inject(SesionService) }