import { Component, inject, input, InputSignal, OnInit, output, OutputEmitterRef } from "@angular/core"
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms"
import { ProductoInterface } from "../../../../interfaces/producto-interface"
import { CandybarService } from "../../../../servicios/candybar-service"
import { ToastService } from "../../../../servicios/toast-service"

@Component({
  selector: "app-modificar-producto",
  templateUrl: "./modificar-producto.html",
  styleUrl: "./modificar-producto.sass",
  imports: [ReactiveFormsModule]
})
export class ModificarProducto implements OnInit {
  private formBuilder: FormBuilder = inject(FormBuilder)
  private candybarService: CandybarService = inject(CandybarService)
  private toastService: ToastService = inject(ToastService)

  protected formularioProducto = this.formBuilder.nonNullable.group({
    nombre: ["", Validators.required],
    categoria: ["Combos", Validators.required],
    imagen: ["", Validators.required],
    precio: [null as number | null, [Validators.required, Validators.min(0)]],
    precio_puntos: [null as number | null, [Validators.required, Validators.min(0)]],
    disponible: [true, Validators.required]
  })

  productoSeleccionado: InputSignal<ProductoInterface | null> = input<ProductoInterface | null>(null)
  productoModificado: OutputEmitterRef<void> = output<void>()
  cancelado: OutputEmitterRef<void> = output<void>()

  ngOnInit(): void {
    const producto: ProductoInterface | null = this.productoSeleccionado()

    if (producto) {
      this.formularioProducto.patchValue({
        nombre: producto.nombre,
        categoria: producto.categoria,
        imagen: producto.imagen,
        precio: producto.precio,
        precio_puntos: producto.precio_puntos,
        disponible: producto.disponible
      })
    }
  }

  protected async guardarCambios(): Promise<void> {
    const producto: ProductoInterface | null = this.productoSeleccionado()

    if (!producto) return
    if (!this.formularioProducto.valid) return this.toastService.mostrarToast("El formulario tiene campos inválidos", "error")

    const datosFormulario = this.formularioProducto.getRawValue()
    const exito: boolean = await this.candybarService.modificarProducto(producto.id, datosFormulario)

    if (exito) this.productoModificado.emit()
  }

  protected cancelar(): void { this.cancelado.emit() }
}