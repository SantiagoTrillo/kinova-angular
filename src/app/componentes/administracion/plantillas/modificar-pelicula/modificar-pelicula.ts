import { Component, inject, input, InputSignal, OnInit, output, OutputEmitterRef } from "@angular/core"
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms"
import { PeliculaInterface } from "../../../../interfaces/pelicula-interface"
import { PeliculaService } from "../../../../servicios/pelicula-service"
import { AuditoriaService } from "../../../../servicios/auditoria-service"
import { ToastService } from "../../../../servicios/toast-service"
import { SelectorFecha } from "../../../selectores/selector-fecha/selector-fecha"

@Component({
  selector: "app-modificar-pelicula",
  templateUrl: "./modificar-pelicula.html",
  styleUrl: "./modificar-pelicula.sass",
  imports: [ReactiveFormsModule, SelectorFecha]
})
export class ModificarPelicula implements OnInit {
  private formBuilder: FormBuilder = inject(FormBuilder)
  private peliculaService: PeliculaService = inject(PeliculaService)
  private auditoriaService: AuditoriaService = inject(AuditoriaService)
  private toastService: ToastService = inject(ToastService)

  protected formularioPelicula = this.formBuilder.nonNullable.group({
    titulo: ["", Validators.required],
    sinopsis: ["", Validators.required],
    duracion: [null as number | null, [Validators.required, Validators.min(1)]],
    imagen: ["", Validators.required],
    generos: ["", Validators.required],
    restriccion_edad: ["ATP", Validators.required],
    disponible: [true, Validators.required],
    fecha_estreno: [new Date().toISOString().split("T")[0], Validators.required]
  })

  peliculaSeleccionada: InputSignal<PeliculaInterface | null> = input<PeliculaInterface | null>(null)
  peliculaModificada: OutputEmitterRef<void> = output<void>()
  cancelado: OutputEmitterRef<void> = output<void>()

  ngOnInit(): void {
    const pelicula: PeliculaInterface | null = this.peliculaSeleccionada()

    if (pelicula) {
      this.formularioPelicula.patchValue({
        titulo: pelicula.titulo,
        sinopsis: pelicula.sinopsis,
        duracion: pelicula.duracion,
        imagen: pelicula.imagen,
        generos: pelicula.generos.join(", "),
        restriccion_edad: pelicula.restriccion_edad,
        disponible: pelicula.disponible,
        fecha_estreno: pelicula.fecha_estreno ?? new Date().toISOString().split("T")[0]
      })
    }
  }

  protected async guardarCambios(): Promise<void> {
    const pelicula: PeliculaInterface | null = this.peliculaSeleccionada()

    if (!pelicula) return
    if (!this.formularioPelicula.valid) return this.toastService.mostrarToast("El formulario tiene campos inválidos", "error")

    const datos: any = this.formularioPelicula.getRawValue()
    const generosArray: string[] = datos.generos.split(",").map((genero: string) => genero.trim()).filter((genero: string) =>
      genero !== "")
    const exito: boolean = await this.peliculaService.modificarPelicula(pelicula.id, {
      titulo: datos.titulo,
      sinopsis: datos.sinopsis,
      duracion: datos.duracion,
      imagen: datos.imagen,
      generos: generosArray,
      restriccion_edad: datos.restriccion_edad,
      disponible: datos.disponible,
      fecha_estreno: datos.fecha_estreno
    })

    if (exito) {
      if (pelicula.titulo !== datos.titulo) {
        await this.auditoriaService.registrarAccion(`Modificación de película (ID: ${ pelicula.id }, Título): "${ pelicula.titulo }" -> "${ datos.titulo }"`)
      }
      if (pelicula.sinopsis !== datos.sinopsis) {
        await this.auditoriaService.registrarAccion(`Modificación de película (ID: ${ pelicula.id }, Sinopsis): "${ pelicula.sinopsis }" -> "${ datos.sinopsis }"`)
      }
      if (pelicula.duracion !== datos.duracion) {
        await this.auditoriaService.registrarAccion(`Modificación de película (ID: ${ pelicula.id }, Duración): ${ pelicula.duracion } min -> ${ datos.duracion } min`)
      }
      if (pelicula.imagen !== datos.imagen) {
        await this.auditoriaService.registrarAccion(`Modificación de película (ID: ${ pelicula.id }, Imagen): "${ pelicula.imagen }" -> "${ datos.imagen }"`)
      }

      const generosPrevios: string = pelicula.generos.join(", ")
      const generosNuevos: string = generosArray.join(", ")

      if (generosPrevios !== generosNuevos) {
        await this.auditoriaService.registrarAccion(`Modificación de película (ID: ${ pelicula.id }, Géneros): ${ generosPrevios } -> ${ generosNuevos }`)
      }
      if (pelicula.restriccion_edad !== datos.restriccion_edad) {
        await this.auditoriaService.registrarAccion(`Modificación de película (ID: ${ pelicula.id }, Restricción de edad): ${ pelicula.restriccion_edad } -> ${ datos.restriccion_edad }`)
      }
      if (pelicula.fecha_estreno !== datos.fecha_estreno) {
        await this.auditoriaService.registrarAccion(`Modificación de película (ID: ${ pelicula.id }, Fecha de estreno): ${ pelicula.fecha_estreno } -> ${ datos.fecha_estreno }`)
      }
      if (pelicula.disponible !== datos.disponible) {
        const estadoAnterior: string = pelicula.disponible ? "Disponible" : "No disponible"
        const estadoNuevo: string = datos.disponible ? "Disponible" : "No disponible"
        await this.auditoriaService.registrarAccion(`Modificación de película (ID: ${ pelicula.id }, Estado): ${ estadoAnterior } -> ${ estadoNuevo }`)
      }
      this.peliculaModificada.emit()
    }
  }

  protected cancelar(): void { this.cancelado.emit() }
}