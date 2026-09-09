import { Component } from "@angular/core"
import { Formulario } from "./formulario/formulario"

@Component({
  selector: "app-registro",
  templateUrl: "./registro.html",
  styleUrl: "./registro.sass",
  imports: [Formulario]
})
export class Registro {}