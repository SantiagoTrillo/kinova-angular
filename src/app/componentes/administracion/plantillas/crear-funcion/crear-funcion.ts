import { Component, inject, input, InputSignal, output, OutputEmitterRef } from "@angular/core"
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms"
import { PeliculaInterface } from "../../../../interfaces/pelicula-interface"
import { FuncionService } from "../../../../servicios/funcion-service"
import { ToastService } from "../../../../servicios/toast-service"
import { SelectorFecha } from "../../../selectores/selector-fecha/selector-fecha"
import { SelectorHora } from "../../../selectores/selector-hora/selector-hora"

@Component({
  selector: "app-crear-funcion",
  templateUrl: "./crear-funcion.html",
  styleUrl: "./crear-funcion.sass",
  imports: [ReactiveFormsModule, SelectorFecha, SelectorHora]
})
export class CrearFuncion {
  private formBuilder: FormBuilder = inject(FormBuilder)
  private toastService: ToastService = inject(ToastService)
  private funcionService: FuncionService = inject(FuncionService)

  protected formularioFuncion = this.formBuilder.nonNullable.group({
    fecha: [new Date().toISOString().split("T")[0], Validators.required],
    formato: ["2D", Validators.required],
    idioma: ["Español", Validators.required],
    hora: [`${ new Date().getHours() }:${ new Date().getMinutes() < 10 ? "0" : "" }${ new Date().getMinutes() }`, Validators.required],
    precio: [null as number | null, [Validators.required, Validators.min(1)]],
    precio_puntos: [null as number | null, [Validators.required, Validators.min(1)]],
    precio_preventa: [null as number | null, [Validators.required, Validators.min(1)]]
  })

  peliculaSeleccionada: InputSignal<PeliculaInterface | null> = input<PeliculaInterface | null>(null)
  funcionCreada: OutputEmitterRef<void> = output<void>()
  cancelado: OutputEmitterRef<void> = output<void>()

  protected async guardarFuncion(): Promise<void> {
    if (!this.formularioFuncion.valid) return this.toastService.mostrarToast("El formulario tiene campos inválidos", "error")

    const pelicula = this.peliculaSeleccionada()

    if (!pelicula) return this.toastService.mostrarToast("No se seleccionó una película para la función", "error")

    const datosFormulario = this.formularioFuncion.getRawValue()
    const funcionCreada: boolean = await this.funcionService.crearFuncion(datosFormulario, pelicula)

    if (funcionCreada) {
      this.toastService.mostrarToast("Función creada con éxito", "exito")
      this.funcionCreada.emit()
    }
  }

  protected cancelar(): void { this.cancelado.emit() }
}