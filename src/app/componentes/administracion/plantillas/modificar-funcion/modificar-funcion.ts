import { Component, inject, input, InputSignal, OnInit, output, OutputEmitterRef } from "@angular/core"
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms"
import { FuncionInterface } from "../../../../interfaces/funcion-interface"
import { PeliculaInterface } from "../../../../interfaces/pelicula-interface"
import { FuncionService } from "../../../../servicios/funcion-service"
import { AuditoriaService } from "../../../../servicios/auditoria-service"
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
  private auditoriaService: AuditoriaService = inject(AuditoriaService)
  private toastService: ToastService = inject(ToastService)

  protected formularioFuncion = this.formBuilder.nonNullable.group({
    fecha: [new Date().toISOString().split("T")[0], Validators.required],
    formato: ["2D", Validators.required],
    idioma: ["Español", Validators.required],
    hora: [`${ new Date().getHours() }:${ new Date().getMinutes() < 10 ? "0" : "" }${ new Date().getMinutes() }`, Validators.required],
    precio: [null as number | null, [Validators.required, Validators.min(1)]],
    precio_puntos: [null as number | null, [Validators.required, Validators.min(1)]],
    precio_preventa: [null as number | null, [Validators.required, Validators.min(1)]],
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
      precio_preventa: funcion.precio_preventa ?? null,
      disponible: funcion.disponible
    })
  }

  protected async guardarCambios(): Promise<void> {
    const funcion: FuncionInterface | null = this.funcionSeleccionada()
    const pelicula: PeliculaInterface | null = this.peliculaSeleccionada()

    if (!funcion) return
    if (!this.formularioFuncion.valid) return this.toastService.mostrarToast("El formulario tiene campos inválidos", "error")
    if (!pelicula) return this.toastService.mostrarToast("No se encontró la película asociada a la función", "error")

    const datosFormulario: any = this.formularioFuncion.getRawValue()
    const exito: boolean = await this.funcionService.modificarFuncion(funcion.id, datosFormulario, pelicula)

    if (exito) {
      const fechaAnterior: Date = new Date(funcion.fecha_hora)
      const minutosAnteriores: number = fechaAnterior.getMinutes()
      const horaAnteriorTexto: string = `${ fechaAnterior.getHours() }:${ minutosAnteriores < 10 ? '0' : '' }${ minutosAnteriores }`
      const fechaAnteriorTexto: string = `${ fechaAnterior.getFullYear() }-${ fechaAnterior.getMonth() + 1 }-${ fechaAnterior.getDate() }`

      if (fechaAnteriorTexto !== datosFormulario.fecha || horaAnteriorTexto !== datosFormulario.hora) {
        await this.auditoriaService.registrarAccion(`Modificación de función (ID: ${ funcion.id }, Fecha y hora): ${ fechaAnteriorTexto } ${ horaAnteriorTexto } -> ${ datosFormulario.fecha } ${ datosFormulario.hora }`)
      }
      if (funcion.formato !== datosFormulario.formato) {
        await this.auditoriaService.registrarAccion(`Modificación de función (ID: ${ funcion.id }, Formato): ${ funcion.formato } -> ${ datosFormulario.formato }`)
      }
      if (funcion.idioma !== datosFormulario.idioma) {
        await this.auditoriaService.registrarAccion(`Modificación de función (ID: ${ funcion.id }, Idioma): ${ funcion.idioma } -> ${ datosFormulario.idioma }`)
      }
      if (funcion.precio !== datosFormulario.precio) {
        await this.auditoriaService.registrarAccion(`Modificación de función (ID: ${ funcion.id }, Precio): $${ funcion.precio } -> $${ datosFormulario.precio }`)
      }
      if (funcion.precio_puntos !== datosFormulario.precio_puntos) {
        await this.auditoriaService.registrarAccion(`Modificación de función (ID: ${ funcion.id }, Precio en puntos): ${ funcion.precio_puntos } puntos -> ${ datosFormulario.precio_puntos } puntos`)
      }
      if (funcion.precio_preventa !== datosFormulario.precio_preventa) {
        const preventaAnterior: string = funcion.precio_preventa ? `$${ funcion.precio_preventa }` : "Sin preventa"
        const preventaNueva: string = datosFormulario.precio_preventa ? `$${ datosFormulario.precio_preventa }` : "Sin preventa"
        await this.auditoriaService.registrarAccion(`Modificación de función (ID: ${ funcion.id }, Precio preventa): ${ preventaAnterior } -> ${ preventaNueva }`)
      }
      if (funcion.disponible !== datosFormulario.disponible) {
        const estadoAnterior: string = funcion.disponible ? "Disponible" : "No disponible"
        const estadoNuevo: string = datosFormulario.disponible ? "Disponible" : "No disponible"
        await this.auditoriaService.registrarAccion(`Modificación de función (ID: ${ funcion.id }, Estado): ${ estadoAnterior } -> ${ estadoNuevo }`)
      }
      this.funcionModificada.emit()
    }
  }

  protected cancelar(): void { this.cancelado.emit() }
}