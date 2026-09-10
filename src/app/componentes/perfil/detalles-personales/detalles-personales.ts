import { Component, input, InputSignal } from "@angular/core"
import { UsuarioInterface } from "../../../interfaces/usuario-interface"

@Component({
  selector: "app-detalles-personales",
  templateUrl: "./detalles-personales.html",
  styleUrl: "./detalles-personales.sass"
})
export class DetallesPersonales {
  usuarioActual: InputSignal<UsuarioInterface> = input.required<UsuarioInterface>()
}