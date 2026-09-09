import { Component } from "@angular/core"
import { Cartelera } from "./cartelera/cartelera"

@Component({
  selector: "app-pagina-principal",
  templateUrl: "./pagina-principal.html",
  styleUrl: "./pagina-principal.sass",
  imports: [Cartelera]
})
export class PaginaPrincipal {}