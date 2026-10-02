import { Component, inject, input, InputSignal, OnInit, output, OutputEmitterRef } from "@angular/core"
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms"
import { PeliculaInterface } from "../../../../interfaces/pelicula-interface"
import { PeliculaService } from "../../../../servicios/pelicula-service"
import { ToastService } from "../../../../servicios/toast-service"

@Component({
  selector: "app-modificar-pelicula",
  templateUrl: "./modificar-pelicula.html",
  styleUrl: "./modificar-pelicula.sass",
  imports: [ReactiveFormsModule]
})
export class ModificarPelicula implements OnInit {
  private formBuilder: FormBuilder = inject(FormBuilder)
  private peliculaService: PeliculaService = inject(PeliculaService)
  private toastService: ToastService = inject(ToastService)

  protected formularioPelicula = this.formBuilder.nonNullable.group({
    titulo: ["", Validators.required],
    sinopsis: ["", Validators.required],
    duracion: [null as number | null, [Validators.required, Validators.min(1)]],
    imagen: ["", Validators.required],
    generos: ["", Validators.required],
    restriccion_edad: ["ATP", Validators.required],
    disponible: [true, Validators.required]
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
        disponible: pelicula.disponible
      })
    }
  }

  protected async guardarCambios(): Promise<void> {
    const pelicula: PeliculaInterface | null = this.peliculaSeleccionada()

    if (!pelicula) return
    if (!this.formularioPelicula.valid) return this.toastService.mostrarToast("El formulario tiene campos inválidos", "error")

    const datos = this.formularioPelicula.getRawValue()
    const generosArray: string[] = datos.generos.split(",").map(genero => genero.trim()).filter(genero =>
      genero !== "")
    const exito: boolean = await this.peliculaService.modificarPelicula(pelicula.id, {
      titulo: datos.titulo,
      sinopsis: datos.sinopsis,
      duracion: datos.duracion,
      imagen: datos.imagen,
      generos: generosArray,
      restriccion_edad: datos.restriccion_edad,
      disponible: datos.disponible
    })

    if (exito) this.peliculaModificada.emit()
  }

  protected cancelar(): void { this.cancelado.emit() }
}