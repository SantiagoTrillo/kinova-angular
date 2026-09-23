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

    if (respuesta.error) alert("Error al procesar la solicitud: " + respuesta.error.message)
    if (!respuesta.data) return []

    return respuesta.data as FuncionInterface[]
  }

  async crearFuncion(datosFormulario: any, pelicula: PeliculaInterface): Promise<FuncionInterface | null> {
    const fechaHora: string = new Date(`${datosFormulario.fecha}T${datosFormulario.hora}`).toISOString()
    const idSala: number = await this.asignarSala(fechaHora, pelicula.duracion)
    const nuevaFuncion = {
      pelicula_id: pelicula.id,
      fecha_hora: fechaHora,
      formato: datosFormulario.formato,
      idioma: datosFormulario.idioma,
      precio: datosFormulario.precio,
      sala_id: idSala
    }
    const respuesta = await this.supabaseService.cliente.from("funciones").insert(nuevaFuncion)
      .select().single()

    if (respuesta.error) alert("Error al procesar la solicitud: " + respuesta.error.message)
    if (!respuesta.data) return null

    return respuesta.data as FuncionInterface
  }

  async asignarSala(horarioFuncionNueva: string, duracionPeliculaFuncionNueva: number): Promise<number> {
    const funcionesDisponibles: FuncionInterface[] = await this.obtenerFunciones()
    const salasDisponibles: SalaInterface[] = await this.salaService.obtenerSalas()
    const peliculasDisponibles: PeliculaInterface[] = await this.peliculaService.obtenerPeliculas()

    if (salasDisponibles.length === 0) return 0
    if (funcionesDisponibles.length === 0) return funcionesDisponibles[0].id

    for (const sala of salasDisponibles) {
      let salaOcupada = false
      for (const funcion of funcionesDisponibles) {
        if (funcion.sala_id === sala.id) {
          const peliculaFuncionExistente = peliculasDisponibles.filter(pelicula =>
            pelicula.id === funcion.pelicula_id)
          const duracionFuncionExistente = peliculaFuncionExistente[0].duracion

          if (this.verificarCoincidenciaHorarios(
            horarioFuncionNueva, duracionPeliculaFuncionNueva, funcion.fecha_hora, duracionFuncionExistente
          )) {
            salaOcupada = true
            break
          }
        }
      }

      if (!salaOcupada) {
        return sala.id
      }
    }

    return 0
  }

  private verificarCoincidenciaHorarios(
    fechaFuncionNueva: string, duracionFuncionNueva: number, fechaFuncionExistente: string, duracionFuncionExistente: number
  ): boolean {
    const inicioFuncionNueva: Date = new Date(fechaFuncionNueva)
    const finFuncionNueva: Date = new Date(fechaFuncionNueva)

    finFuncionNueva.setMinutes(inicioFuncionNueva.getMinutes() + duracionFuncionNueva + 30)

    const inicioFuncionExistente: Date = new Date(fechaFuncionExistente)
    const finFuncionExistente: Date = new Date(fechaFuncionExistente)

    finFuncionExistente.setMinutes(inicioFuncionExistente.getMinutes() + duracionFuncionExistente + 30)

    return (inicioFuncionNueva < finFuncionExistente) && (finFuncionNueva > inicioFuncionExistente)
  }

  seleccionarFuncion(funcion: FuncionInterface): void {
    this.funcionSeleccionada.set(funcion)
  }
}