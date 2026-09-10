import { Component, inject, signal, WritableSignal } from "@angular/core"
import { SupabaseService } from "../../../servicios/supabase-service"
import { PeliculaService } from "../../../servicios/pelicula-service"
import { FuncionInterface } from "../../../interfaces/funcion-interface"

@Component({
  selector: "app-funciones",
  templateUrl: "./funciones.html",
  styleUrl: "./funciones.sass"
})
export class Funciones {
  private supabaseService: SupabaseService = inject(SupabaseService)
  private peliculaService: PeliculaService = inject(PeliculaService)

  semanaActual: WritableSignal<string[]> = signal<string[]>([])
  funcionesDisponibles: WritableSignal<FuncionInterface[]> = signal<FuncionInterface[]>([])
  formatosDisponibles: WritableSignal<string[]> = signal<string[]>([])
  idiomasDisponibles: WritableSignal<string[]> = signal<string[]>([])
  horariosDisponibles: WritableSignal<string[]> = signal<string[]>([])

  fechaSeleccionada: WritableSignal<string> = signal<string>("Hoy")
  formatoSeleccionado: WritableSignal<string> = signal<string>("")
  idiomaSeleccionado: WritableSignal<string> = signal<string>("")
  horarioSeleccionado: WritableSignal<string> = signal<string>("")

  calcularSemanaActual(): void {
    const dia = new Date()
    let listaDias: string[] =[]

    for (let i = 0; i < 7; i++) {
      if (i == 0) {
        listaDias.push("Hoy")
      } else {
        dia.setDate(dia.getDate() + 1)

        listaDias.push(dia.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric' }))
      }
    }

    this.semanaActual.set(listaDias)
  }

  async obtenerFunciones(): Promise<void> {
    const respuesta = await this.supabaseService.cliente.from("funciones")
      .select("*").eq("pelicula_id", this.peliculaService.peliculaSeleccionada()?.id)

    if (respuesta.data) {
      this.funcionesDisponibles.set(respuesta.data)
      this.obtenerFormatosIdiomas()
    }
  }

  obtenerFormatosIdiomas(): void {
    const formatos: string[] = []
    const idiomas: string[] = []

    for (const funcion of this.funcionesDisponibles()) {
      if(!formatos.includes(funcion.formato)) {
        formatos.push(funcion.formato)
      }

      if(!idiomas.includes(funcion.idioma)) {
        idiomas.push(funcion.idioma)
      }
    }

    this.formatosDisponibles.set(formatos)
    this.idiomasDisponibles.set(idiomas)
  }

  ngOnInit() {
    this.calcularSemanaActual()
    this.obtenerFunciones()
  }

  seleccionarFecha(fecha: string): void {
    this.fechaSeleccionada.set(fecha)
  }

  seleccionarFormato(formato: string): void {
    this.formatoSeleccionado.set(formato)
  }

  seleccionarIdioma(idioma: string): void {
    this.idiomaSeleccionado.set(idioma)
  }

  seleccionarHorario(horario: string): void {
    this.horarioSeleccionado.set(horario)
  }
}