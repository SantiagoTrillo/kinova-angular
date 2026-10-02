import { Component, inject, output, OutputEmitterRef } from "@angular/core"
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms"
import { CandybarService } from "../../../../servicios/candybar-service"
import { ToastService } from "../../../../servicios/toast-service"

@Component({
  selector: "app-crear-producto",
  templateUrl: "./crear-producto.html",
  styleUrl: "./crear-producto.sass",
  imports: [ReactiveFormsModule]
})
export class CrearProducto {
  private formBuilder: FormBuilder = inject(FormBuilder)
  private candybarService: CandybarService = inject(CandybarService)
  private toastService: ToastService = inject(ToastService)

  protected formularioProducto = this.formBuilder.nonNullable.group({
    nombre: ["", Validators.required],
    categoria: ["Combos", Validators.required],
    imagen: ["", Validators.required],
    precio: [null as number | null, [Validators.required, Validators.min(0)]],
    precio_puntos: [null as number | null, [Validators.required, Validators.min(0)]]
  })

  productoCreado: OutputEmitterRef<void> = output<void>()
  cancelado: OutputEmitterRef<void> = output<void>()

  protected async guardarProducto(): Promise<void> {
    if (!this.formularioProducto.valid) return this.toastService.mostrarToast("El formulario tiene campos inválidos", "error")

    const datosFormulario = this.formularioProducto.getRawValue()
    const productoCreado: boolean = await this.candybarService.crearProducto(datosFormulario)

    if (productoCreado) this.productoCreado.emit()
  }

  protected cancelar(): void { this.cancelado.emit() }
}