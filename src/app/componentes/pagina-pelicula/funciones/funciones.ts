import { Component, inject, input, InputSignal, signal, WritableSignal } from "@angular/core"
import { FuncionInterface } from "../../../interfaces/funcion-interface"
import { DatePipe, TitleCasePipe } from "@angular/common"
import { RouterLink } from "@angular/router"
import { FuncionService } from "../../../servicios/funcion-service"
import { PeliculaInterface } from "../../../interfaces/pelicula-interface"

@Component({
  selector: "app-funciones",
  templateUrl: "./funciones.html",
  styleUrl: "./funciones.sass",
  imports: [DatePipe, RouterLink, TitleCasePipe]
})
export class Funciones {
  private funcionService: FuncionService = inject(FuncionService)

  peliculaActual: InputSignal<PeliculaInterface> = input.required<PeliculaInterface>()
  funcionesDisponibles: WritableSignal<FuncionInterface[]> = signal<FuncionInterface[]>([])
  fechasDisponibles: WritableSignal<string[]> = signal<string[]>([])
  formatosDisponibles: WritableSignal<string[]> = signal<string[]>([])
  idiomasDisponibles: WritableSignal<string[]> = signal<string[]>([])
  horariosDisponibles: WritableSignal<string[]> = signal<string[]>([])
  fechaSeleccionada: WritableSignal<string> = signal<string>("")
  formatoSeleccionado: WritableSignal<string> = signal<string>("")
  idiomaSeleccionado: WritableSignal<string> = signal<string>("")
  horarioSeleccionado: WritableSignal<string> = signal<string>("")

  async ngOnInit(): Promise<void> {
    const funcionesDisponibles: FuncionInterface[] = await this.funcionService.obtenerFunciones()
    const funcionesPelicula: FuncionInterface[] = funcionesDisponibles
      .filter(funcion => funcion.pelicula_id === this.peliculaActual().id)

    this.funcionesDisponibles.set(funcionesPelicula)
    this.fechaSeleccionada.set(this.funcionesDisponibles()[0].fecha_hora.slice(0, 10))
    this.obtenerDetallesFunciones()
  }

  obtenerDetallesFunciones(): void {
    const fechas: string[] = []
    const formatos: string[] = []
    const idiomas: string[] = []

    for (const funcion of this.funcionesDisponibles()) {
      const dia: string = funcion.fecha_hora.slice(0, 10)

      if (!fechas.includes(dia)) fechas.push(dia)
      if (funcion.fecha_hora.startsWith(this.fechaSeleccionada())) {
        if (!formatos.includes(funcion.formato)) formatos.push(funcion.formato)
        if (!idiomas.includes(funcion.idioma)) idiomas.push(funcion.idioma)
      }
    }

    this.fechasDisponibles.set(fechas)
    this.formatosDisponibles.set(formatos)
    this.idiomasDisponibles.set(idiomas)

    this.obtenerHorarios()
  }

  obtenerHorarios(): void {
    const horarios: string[] = this.funcionesDisponibles().filter(funcion =>
      funcion.fecha_hora.startsWith(this.fechaSeleccionada()) && funcion.formato === this.formatoSeleccionado() &&
      funcion.idioma === this.idiomaSeleccionado()).map(funcion => funcion.fecha_hora)

    this.horariosDisponibles.set(horarios)
  }

  seleccionarFecha(fecha: string): void {
    if (this.fechaSeleccionada() === fecha) return

    this.fechaSeleccionada.set(fecha)
    this.limpiarSelecciones()
    this.obtenerDetallesFunciones()
  }

  seleccionarFormato(formato: string): void {
    if (this.formatoSeleccionado() === formato) return

    this.formatoSeleccionado.set(formato)
    this.limpiarHorarios()
    this.obtenerHorarios()
  }

  seleccionarIdioma(idioma: string): void {
    if (this.idiomaSeleccionado() === idioma) return

    this.idiomaSeleccionado.set(idioma)
    this.limpiarHorarios()
    this.obtenerHorarios()
  }

  seleccionarHorario(horario: string): void { this.horarioSeleccionado.set(horario) }

  seleccionarFuncion(): void {
    const funcionSeleccionada: FuncionInterface | undefined = this.funcionesDisponibles().find(funcion =>
      funcion.fecha_hora === this.horarioSeleccionado() && funcion.formato === this.formatoSeleccionado() &&
      funcion.idioma === this.idiomaSeleccionado())

    if (funcionSeleccionada) this.funcionService.seleccionarFuncion(funcionSeleccionada)
  }

  limpiarSelecciones(): void {
    this.formatoSeleccionado.set("")
    this.idiomaSeleccionado.set("")
    this.horarioSeleccionado.set("")
  }

  limpiarHorarios(): void { this.horarioSeleccionado.set("") }
}