import { Component, inject, input, InputSignal, OnInit, output, OutputEmitterRef } from "@angular/core"
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms"
import { FuncionInterface } from "../../../../interfaces/funcion-interface"
import { PeliculaInterface } from "../../../../interfaces/pelicula-interface"
import { FuncionService } from "../../../../servicios/funcion-service"
import { ToastService } from "../../../../servicios/toast-service"
import { SelectorFecha } from "../../../selectores/selector-fecha/selector-fecha"
import { SelectorHora } from "../../../selectores/selector-hora/selector-hora"

@Component({
  selector: "app-modificar-funcion",
  templateUrl: "./modificar-funcion.html",
  styleUrl: "./modificar-funcion.sass",
  imports: [ReactiveFormsModule, SelectorFecha, SelectorHora]
})
export class ModificarFuncion implements OnInit {
  private formBuilder: FormBuilder = inject(FormBuilder)
  private funcionService: FuncionService = inject(FuncionService)
  private toastService: ToastService = inject(ToastService)

  protected formularioFuncion = this.formBuilder.nonNullable.group({
    fecha: ["", Validators.required],
    formato: ["2D", Validators.required],
    idioma: ["Español", Validators.required],
    hora: ["", Validators.required],
    precio: [null as number | null, [Validators.required, Validators.min(0)]],
    precio_puntos: [null as number | null, [Validators.required, Validators.min(0)]],
    disponible: [true, Validators.required]
  })

  peliculaSeleccionada: InputSignal<PeliculaInterface | null> = input<PeliculaInterface | null>(null)
  funcionSeleccionada: InputSignal<FuncionInterface | null> = input<FuncionInterface | null>(null)

  funcionModificada: OutputEmitterRef<void> = output<void>()
  cancelado: OutputEmitterRef<void> = output<void>()

  ngOnInit(): void {
    const funcion: FuncionInterface | null = this.funcionSeleccionada()

    if (!funcion) return

    const fecha = new Date(funcion.fecha_hora)

    this.formularioFuncion.patchValue({
      fecha: `${ fecha.getFullYear() }-${ fecha.getMonth() + 1 }-${ fecha.getDate() }`,
      hora: `${ fecha.getHours() }:${ fecha.getMinutes() < 10 ? "0" : "" }${ fecha.getMinutes() }`,
      formato: funcion.formato,
      idioma: funcion.idioma,
      precio: funcion.precio,
      precio_puntos: funcion.precio_puntos,
      disponible: funcion.disponible
    })
  }

  protected async guardarCambios(): Promise<void> {
    const funcion: FuncionInterface | null = this.funcionSeleccionada()
    const pelicula: PeliculaInterface | null = this.peliculaSeleccionada()

    if (!funcion) return
    if (!this.formularioFuncion.valid) return this.toastService.mostrarToast("El formulario tiene campos inválidos", "error")
    if (!pelicula) return this.toastService.mostrarToast("No se encontró la película asociada a la función", "error")

    const datosFormulario = this.formularioFuncion.getRawValue()
    const exito: boolean = await this.funcionService.modificarFuncion(funcion.id, datosFormulario, pelicula)

    if (exito) { this.funcionModificada.emit() }
  }

  protected cancelar(): void { this.cancelado.emit() }
}