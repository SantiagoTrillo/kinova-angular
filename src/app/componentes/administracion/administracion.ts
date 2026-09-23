import { Component, inject, signal, TemplateRef, WritableSignal } from "@angular/core"
import { DatePipe, NgOptimizedImage, NgTemplateOutlet, TitleCasePipe } from "@angular/common"
import { DuracionPipe } from "../../tuberias/duracion-pipe"
import { PeliculaService } from "../../servicios/pelicula-service"
import { PeliculaInterface } from "../../interfaces/pelicula-interface"
import { FuncionService } from "../../servicios/funcion-service"
import { FuncionInterface } from "../../interfaces/funcion-interface"
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms"

@Component({
  selector: "app-administracion",
  templateUrl: "./administracion.html",
  styleUrl: "./administracion.sass",
  imports: [NgOptimizedImage, DuracionPipe, NgTemplateOutlet, DatePipe, ReactiveFormsModule, TitleCasePipe]
})
export class Administracion {
  private peliculaService: PeliculaService = inject(PeliculaService)
  private funcionService: FuncionService = inject(FuncionService)
  private formBuilder: FormBuilder = inject(FormBuilder)

  plantillaSeleccionada: WritableSignal<TemplateRef<any> | null> = signal<TemplateRef<any> | null>(null)
  peliculasDisponibles: WritableSignal<PeliculaInterface[]> = signal<PeliculaInterface[]>([])
  peliculaSeleccionada: WritableSignal<PeliculaInterface | null> = signal<PeliculaInterface | null>(null)
  funcionesDisponibles: WritableSignal<FuncionInterface[]> = signal<FuncionInterface[]>([])

  formularioCreacionFuncion = this.formBuilder.nonNullable.group({
    fecha: ["", Validators.required],
    formato: ["", Validators.required],
    idioma: ["", Validators.required],
    hora: ["", Validators.required],
    precio: [null as number | null, [Validators.required, Validators.min(0)]]
  })

  async ngOnInit(): Promise<void> {
    this.peliculasDisponibles.set(await this.peliculaService.obtenerPeliculas())
    this.funcionesDisponibles.set(await this.funcionService.obtenerFunciones())
  }

  seleccionarPlantilla(plantillaSeleccionada: TemplateRef<any>): void {
    this.plantillaSeleccionada.set(plantillaSeleccionada)
  }

  cambiarEstadoPelicula(estado: boolean, idPelicula: number): void {
    this.peliculaService.cambiarEstadoPelicula(estado, idPelicula).then(_ =>
      this.peliculasDisponibles.update(peliculas => peliculas.map(pelicula =>
        pelicula.id === idPelicula ? {...pelicula, principal: estado} : pelicula)))
  }

  obtenerFuncionesPelicula(idPelicula: number): FuncionInterface[] {
    return this.funcionesDisponibles().filter(funcion => funcion.pelicula_id === idPelicula)
  }

  async crearFuncion(): Promise<void> {
    if (this.formularioCreacionFuncion.valid) {
      const datosFormulario = this.formularioCreacionFuncion.getRawValue()
      const peliculaSeleccionada: PeliculaInterface | null = this.peliculaSeleccionada()

      if (!peliculaSeleccionada) return

      const funcionCreada: FuncionInterface | null = await this.funcionService.crearFuncion(datosFormulario, peliculaSeleccionada)

      if (funcionCreada) {
        alert("Función creada con éxito")
        this.funcionesDisponibles.set(await this.funcionService.obtenerFunciones())
      }
    }
  }

  seleccionarPelicula(peliculaSeleccionada: PeliculaInterface): void {
    this.peliculaSeleccionada.set(peliculaSeleccionada)
  }
}