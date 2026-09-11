import { Component, input, InputSignal } from "@angular/core"
import { UsuarioInterface } from "../../../interfaces/usuario-interface"
import { DatePipe } from "@angular/common"

@Component({
  selector: "app-detalles-personales",
  templateUrl: "./detalles-personales.html",
  styleUrl: "./detalles-personales.sass",
  imports: [DatePipe]
})
export class DetallesPersonales {
  usuarioActual: InputSignal<UsuarioInterface> = input.required<UsuarioInterface>()
}