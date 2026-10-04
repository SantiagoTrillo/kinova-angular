import { Component, inject, output, OutputEmitterRef } from "@angular/core"
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms"
import { PeliculaService } from "../../../../servicios/pelicula-service"
import { AuditoriaService } from "../../../../servicios/auditoria-service"
import { ToastService } from "../../../../servicios/toast-service"
import { SelectorFecha } from "../../../selectores/selector-fecha/selector-fecha"
import { PeliculaInterface } from "../../../../interfaces/pelicula-interface"

@Component({
  selector: "app-crear-pelicula",
  templateUrl: "./crear-pelicula.html",
  styleUrl: "./crear-pelicula.sass",
  imports: [ReactiveFormsModule, SelectorFecha]
})
export class CrearPelicula {
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
    fecha_estreno: [new Date().toISOString().split("T")[0], Validators.required]
  })

  peliculaCreada: OutputEmitterRef<void> = output<void>()
  cancelado: OutputEmitterRef<void> = output<void>()

  protected async guardarPelicula(): Promise<void> {
    if (!this.formularioPelicula.valid) return this.toastService.mostrarToast("El formulario tiene campos inválidos", "error")

    const datos: any = this.formularioPelicula.getRawValue()
    const generos: string[] = datos.generos.split(",").map(genero =>
      genero.trim()).filter(genero => genero !== "")
    const pelicula: PeliculaInterface | null = await this.peliculaService.crearPelicula({
      titulo: datos.titulo,
      sinopsis: datos.sinopsis,
      duracion: datos.duracion,
      imagen: datos.imagen,
      generos: generos,
      restriccion_edad: datos.restriccion_edad,
      fecha_estreno: datos.fecha_estreno
    })

    if (pelicula) {
      await this.auditoriaService.registrarAccion(`Creación de película (ID: ${ pelicula.id })`)
      this.peliculaCreada.emit()
    }
  }

  protected cancelar(): void { this.cancelado.emit() }
}