import { inject, Service, signal, WritableSignal } from "@angular/core"
import { FuncionInterface } from "../interfaces/funcion-interface"
import { SupabaseService } from "./supabase-service"
import { SalaInterface } from "../interfaces/sala-interface"
import { SalaService } from "./sala-service"
import { PeliculaService } from "./pelicula-service"
import { PeliculaInterface } from "../interfaces/pelicula-interface"

@Service()
export class FuncionService {
  private supabaseService: SupabaseService = inject(SupabaseService)
  private salaService: SalaService = inject(SalaService)
  private peliculaService: PeliculaService = inject(PeliculaService)

  funcionSeleccionada: WritableSignal<FuncionInterface | null> = signal<FuncionInterface | null>(null)

  async obtenerFunciones(): Promise<FuncionInterface[]> {
    const respuesta = await this.supabaseService.cliente.from("funciones").select("*")
      .gte("fecha_hora", new Date().toISOString()).order("id", { ascending: true })

    if (respuesta.error) {
      alert("Error al procesar la solicitud: " + respuesta.error.message)
      return []
    }
    if (!respuesta.data) return []

    return respuesta.data as FuncionInterface[]
  }

  async crearFuncion(datosFormulario: any, pelicula: PeliculaInterface): Promise<boolean> {
    const inicioFuncion: number = new Date(`${datosFormulario.fecha}T${datosFormulario.hora}`).getTime()
    const finFuncion: number = inicioFuncion + (pelicula.duracion + 30) * 60 * 1000
    const idSala: number | null = await this.buscarSalaLibre(inicioFuncion, finFuncion)

    if (!idSala) {
      alert("No hay salas disponibles en el horario solicitado")
      return false
    }

    const respuesta = await this.supabaseService.cliente.from("funciones").insert({
      pelicula_id: pelicula.id,
      fecha_hora: new Date(inicioFuncion).toISOString(),
      formato: datosFormulario.formato,
      idioma: datosFormulario.idioma,
      precio: datosFormulario.precio,
      sala_id: idSala
    })

    if (respuesta.error) {
      alert("Error al procesar la solicitud: " + respuesta.error.message)
      return false
    }

    return true
  }

  async buscarSalaLibre(inicioFuncionNueva: number, finFuncionNueva: number): Promise<number | null> {
    const salasDisponibles: SalaInterface[] = await this.salaService.obtenerSalas()
    const funcionesDisponibles: FuncionInterface[] = await this.obtenerFunciones()
    const peliculasDisponibles: PeliculaInterface[] = await this.peliculaService.obtenerPeliculas()

    for (const sala of salasDisponibles) {
      if (!this.verificarConflictoHorarios(sala.id, inicioFuncionNueva, finFuncionNueva, funcionesDisponibles, peliculasDisponibles))
        return sala.id
    }
    return null
  }

  private verificarConflictoHorarios(
    idSala: number, inicioFuncionNueva: number, finFuncionNueva: number, funcionesDisponibles: FuncionInterface[],
    peliculasDisponibles: PeliculaInterface[]
  ): boolean {
    for (const funcion of funcionesDisponibles) {
      if (funcion.sala_id === idSala) {
        const pelicula: PeliculaInterface | undefined = peliculasDisponibles.find(pelicula =>
          pelicula.id === funcion.pelicula_id)

        if (!pelicula) return false

        const inicioFuncionExistente: number = new Date(funcion.fecha_hora).getTime()
        const finFuncionExistente: number = inicioFuncionExistente + (pelicula.duracion + 30) * 60 * 1000

        if (inicioFuncionNueva < finFuncionExistente && finFuncionNueva > inicioFuncionExistente) return true
      }
    }
    return false
  }

  seleccionarFuncion(funcion: FuncionInterface): void { this.funcionSeleccionada.set(funcion) }
}