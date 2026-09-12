import { Component, inject, signal, WritableSignal } from "@angular/core"
import { SupabaseService } from "../../../servicios/supabase-service"
import { PeliculaService } from "../../../servicios/pelicula-service"
import { FuncionInterface } from "../../../interfaces/funcion-interface"
import { DatePipe, TitleCasePipe } from "@angular/common"
import { RouterLink } from "@angular/router"
import { FuncionService } from "../../../servicios/funcion-service"

@Component({
  selector: "app-funciones",
  templateUrl: "./funciones.html",
  styleUrl: "./funciones.sass",
  imports: [DatePipe, RouterLink, TitleCasePipe]
})
export class Funciones {
  private supabaseService: SupabaseService = inject(SupabaseService)
  private peliculaService: PeliculaService = inject(PeliculaService)
  private funcionService: FuncionService = inject(FuncionService)

  funcionesDisponibles: WritableSignal<FuncionInterface[]> = signal<FuncionInterface[]>([])
  fechasDisponibles: WritableSignal<string[]> = signal<string[]>([])
  formatosDisponibles: WritableSignal<string[]> = signal<string[]>([])
  idiomasDisponibles: WritableSignal<string[]> = signal<string[]>([])
  horariosDisponibles: WritableSignal<string[]> = signal<string[]>([])

  fechaSeleccionada: WritableSignal<string> = signal<string>("")
  formatoSeleccionado: WritableSignal<string> = signal<string>("")
  idiomaSeleccionado: WritableSignal<string> = signal<string>("")
  horarioSeleccionado: WritableSignal<string> = signal<string>("")

  async obtenerFunciones(): Promise<void> {
    const respuesta = await this.supabaseService.cliente.from("funciones")
      .select("*").eq("pelicula_id", this.peliculaService.peliculaSeleccionada()?.id).order("fecha_hora")

    if (respuesta.data) {
      this.funcionesDisponibles.set(respuesta.data)
    }
  }

  obtenerDetallesFunciones(): void {
    const fechas: string[] = []
    const formatos: string[] = []
    const idiomas: string[] = []

    for (const funcion of this.funcionesDisponibles()) {
      const fechaActual: string = funcion.fecha_hora
      const dia: string = fechaActual.slice(0, 10)

      if (!fechas.includes(dia)) {
        fechas.push(dia)
      }

      if (fechaActual.startsWith(this.fechaSeleccionada())) {
        if (!formatos.includes(funcion.formato)) {
          formatos.push(funcion.formato)
        }

        if (!idiomas.includes(funcion.idioma)) {
          idiomas.push(funcion.idioma)
        }
      }
    }

    this.fechasDisponibles.set(fechas)
    this.formatosDisponibles.set(formatos)
    this.idiomasDisponibles.set(idiomas)

    this.obtenerHorarios()
  }

  obtenerHorarios(): void {
    const horarios: string[] = []

    for (const funcion of this.funcionesDisponibles()) {
      const coincideFecha = funcion.fecha_hora.startsWith(this.fechaSeleccionada())
      const coincideFormato = funcion.formato === this.formatoSeleccionado()
      const coincideIdioma = funcion.idioma === this.idiomaSeleccionado()

      if (coincideFecha && coincideFormato && coincideIdioma) {
        if (!horarios.includes(funcion.fecha_hora)) {
          horarios.push(funcion.fecha_hora)
        }
      }
    }

    this.horariosDisponibles.set(horarios)
  }

  ngOnInit() {
    this.obtenerFunciones().then(_ => {
      this.fechaSeleccionada.set(this.funcionesDisponibles()[0].fecha_hora.slice(0, 10))

      this.obtenerDetallesFunciones()
    })
  }

  seleccionarFecha(fecha: string): void {
    this.fechaSeleccionada.set(fecha)
    this.limpiarSelecciones()
    this.obtenerDetallesFunciones()
  }

  seleccionarFormato(formato: string): void {
    this.formatoSeleccionado.set(formato)
    this.obtenerHorarios()
  }

  seleccionarIdioma(idioma: string): void {
    this.idiomaSeleccionado.set(idioma)
    this.obtenerHorarios()
  }

  seleccionarHorario(horario: string): void {
    this.horarioSeleccionado.set(horario)
  }

  seleccionarFuncion(): void {
    for (const funcion of this.funcionesDisponibles()) {
      const coincideFecha = funcion.fecha_hora.startsWith(this.fechaSeleccionada())
      const coincideFormato = funcion.formato === this.formatoSeleccionado()
      const coincideIdioma = funcion.idioma === this.idiomaSeleccionado()
      const coincideHorario = funcion.fecha_hora === this.horarioSeleccionado()

      if (coincideFecha && coincideFormato && coincideIdioma && coincideHorario) {
        this.funcionService.seleccionarFuncion(funcion)
        break
      }
    }
  }

  limpiarSelecciones(): void {
    this.formatoSeleccionado.set("")
    this.idiomaSeleccionado.set("")
    this.horarioSeleccionado.set("")
  }
}