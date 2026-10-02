import { Component, inject, output, OutputEmitterRef } from "@angular/core"
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms"
import { CuponService } from "../../../../servicios/cupon-service"
import { ToastService } from "../../../../servicios/toast-service"

@Component({
  selector: "app-crear-cupon",
  templateUrl: "./crear-cupon.html",
  styleUrl: "./crear-cupon.sass",
  imports: [ReactiveFormsModule]
})
export class CrearCupon {
  private formBuilder: FormBuilder = inject(FormBuilder)
  private cuponService: CuponService = inject(CuponService)
  private toastService: ToastService = inject(ToastService)

  protected formularioCupon = this.formBuilder.nonNullable.group({
    nombre: ["", Validators.required],
    descuento: [null as number | null, [Validators.required, Validators.min(0.1), Validators.max(0.99)]]
  })

  cuponCreado: OutputEmitterRef<void> = output<void>()
  cancelado: OutputEmitterRef<void> = output<void>()

  protected async guardarCupon(): Promise<void> {
    if (!this.formularioCupon.valid) return this.toastService.mostrarToast("El formulario tiene campos inválidos", "error")

    const datosFormulario = this.formularioCupon.getRawValue()
    const cuponCreado: boolean = await this.cuponService.crearCupon(datosFormulario.nombre, datosFormulario.descuento!)

    if (cuponCreado) this.cuponCreado.emit()
  }

  protected cancelar(): void { this.cancelado.emit() }
}