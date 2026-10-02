import { Component, input, InputSignal, output, OutputEmitterRef } from "@angular/core"

@Component({
  selector: "app-modal-confirmacion",
  templateUrl: "./modal-confirmacion.html",
  styleUrl: "./modal-confirmacion.sass"
})
export class ModalConfirmacion {
  titulo: InputSignal<string> = input<string>("Confirmación")
  mensaje: InputSignal<string> = input<string>("¿Estás seguro de que querés realizar esta acción?")

  confirmar: OutputEmitterRef<void> = output<void>()
  cancelar: OutputEmitterRef<void> = output<void>()

  protected confirmarAccion(): void { this.confirmar.emit() }

  protected cancelarAccion(): void { this.cancelar.emit() }
}