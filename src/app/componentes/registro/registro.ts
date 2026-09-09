import { Component } from "@angular/core"
import {Formulario} from "./formulario/formulario";

@Component({
  selector: "app-registro",
  templateUrl: "./registro.html",
  imports: [
    Formulario
  ],
  styleUrl: "./registro.sass"
})
export class Registro {}