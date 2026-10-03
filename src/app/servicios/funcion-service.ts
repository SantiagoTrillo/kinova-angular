import { inject, Service, signal, WritableSignal } from "@angular/core"
import { FuncionInterface } from "../interfaces/funcion-interface"
import { SupabaseService } from "./supabase-service"
import { SalaInterface } from "../interfaces/sala-interface"
import { SalaService } from "./sala-service"
import { PeliculaService } from "./pelicula-service"
import { PeliculaInterface } from "../interfaces/pelicula-interface"
import { formatDate } from "@angular/common"
import { ToastService } from "./toast-service"

@Service()
export class FuncionService {
  private supabaseService: SupabaseService = inject(SupabaseService)
  private salaService: SalaService = inject(SalaService)
  private peliculaService: PeliculaService = inject(PeliculaService)
  private toastService: ToastService = inject(ToastService)

  funcionesDisponibles: WritableSignal<FuncionInterface[]> = signal<FuncionInterface[]>([])
  funcionSeleccionada: WritableSignal<FuncionInterface | null> = signal<FuncionInterface | null>(null)

  constructor() { this.cargarFunciones() }

  private async cargarFunciones(): Promise<void> { this.funcionesDisponibles.set(await this.obtenerFunciones()) }

  async obtenerFunciones(): Promise<FuncionInterface[]> {
    const respuesta = await this.supabaseService.cliente.from("funciones").select("*")
      .gte("fecha_hora", new Date().toISOString()).order("id", { ascending: true })

    if (respuesta.error || !respuesta.data) {
      if (respuesta.error) this.toastService.mostrarToast("No se pudieron cargar las funciones", "error")
      return []
    }
    return respuesta.data as FuncionInterface[]
  }

  async crearFuncion(datosFormulario: any, pelicula: PeliculaInterface): Promise<boolean> {
    const idSala: number | null = await this.asignarSala(datosFormulario, pelicula)

    if (!idSala) return false

    const respuesta = await this.supabaseService.cliente.from("funciones").insert({
      pelicula_id: pelicula.id,
      fecha_hora: new Date(`${ datosFormulario.fecha } ${ datosFormulario.hora }`).toISOString(),
      formato: datosFormulario.formato,
      idioma: datosFormulario.idioma,
      precio: datosFormulario.precio,
      sala_id: idSala,
      precio_puntos: datosFormulario.precio_puntos,
      precio_preventa: datosFormulario.precio_preventa,
      disponible: true
    })

    if (respuesta.error) {
      this.toastService.mostrarToast("No se pudo registrar la función", "error")
      return false
    }

    await this.cargarFunciones()
    return true
  }

  async modificarFuncion(idFuncion: number, datosFormulario: any, pelicula: PeliculaInterface): Promise<boolean> {
    const idSala: number | null = await this.asignarSala(datosFormulario, pelicula, idFuncion)

    if (!idSala) return false

    const respuesta = await this.supabaseService.cliente.from("funciones").update({
      fecha_hora: new Date(`${ datosFormulario.fecha } ${ datosFormulario.hora }`).toISOString(),
      formato: datosFormulario.formato,
      idioma: datosFormulario.idioma,
      precio: datosFormulario.precio,
      sala_id: idSala,
      precio_puntos: datosFormulario.precio_puntos,
      precio_preventa: datosFormulario.precio_preventa,
      disponible: datosFormulario.disponible
    }).eq("id", idFuncion)

    if (respuesta.error) {
      this.toastService.mostrarToast("No se pudo modificar la función", "error")
      return false
    }

    await this.cargarFunciones()
    this.toastService.mostrarToast("Función modificada con éxito", "exito")
    return true
  }

  actualizarEstado(idFuncion: number, disponible: boolean): void {
    this.funcionesDisponibles.update(funciones =>
      funciones.map(funcion => funcion.id === idFuncion ? { ...funcion, disponible: disponible } : funcion))
  }

  private async asignarSala(datosFormulario: any, pelicula: PeliculaInterface, idFuncionActual?: number): Promise<number | null> {
    const inicio: number = new Date(`${ datosFormulario.fecha } ${ datosFormulario.hora }`).getTime()
    const fin: number = inicio + (pelicula.duracion + 30) * 60 * 1000
    return this.buscarSalaLibre(inicio, fin, idFuncionActual)
  }

  async buscarSalaLibre(inicioFuncionNueva: number, finFuncionNueva: number, idFuncionActual?: number): Promise<number | null> {
    const salasDisponibles: SalaInterface[] = await this.salaService.obtenerSalas()
    const funcionesDisponibles: FuncionInterface[] = await this.obtenerFunciones()
    const peliculasDisponibles: PeliculaInterface[] = await this.peliculaService.obtenerPeliculas()
    const conflictos: string[] = []

    for (const sala of salasDisponibles) {
      const conflictosSala: string[] = this.verificarConflictoHorarios(
        sala.id, inicioFuncionNueva, finFuncionNueva, funcionesDisponibles, peliculasDisponibles, idFuncionActual
      )

      if (conflictosSala.length === 0) return sala.id

      conflictos.push(...conflictosSala)
    }

    if (conflictos.length === 0) { this.toastService.mostrarToast("No hay salas disponibles", "error") }

    for (const conflicto of conflictos) { this.toastService.mostrarToast(conflicto, "error") }

    return null
  }

  private evaluarConflictoFuncion(
    funcion: FuncionInterface, idSala: number, inicioFuncionNueva: number, finFuncionNueva: number,
    peliculasDisponibles: PeliculaInterface[], idFuncionActual?: number
  ): string | null {
    if (idFuncionActual && funcion.id === idFuncionActual) return null
    if (!funcion.disponible || funcion.sala_id !== idSala) return null

    const pelicula: PeliculaInterface | undefined = peliculasDisponibles.find(p => p.id === funcion.pelicula_id)

    if (!pelicula) return null

    const inicioFuncionExistente: number = new Date(funcion.fecha_hora).getTime()
    const finFuncionExistente: number = inicioFuncionExistente + (pelicula.duracion + 30) * 60 * 1000

    if (inicioFuncionNueva >= finFuncionExistente || finFuncionNueva <= inicioFuncionExistente) return null

    const fechaConflicto: string = formatDate(inicioFuncionExistente, "EEEE d", "es-AR")
    const inicioConflicto: string = formatDate(inicioFuncionExistente, "shortTime", "es-AR")
    const finConflicto: string = formatDate(finFuncionExistente, "shortTime", "es-AR")

    return `Sala ${ idSala } ocupada por ${ pelicula.titulo } en ${ funcion.formato } y ${ funcion.idioma } el ${ fechaConflicto } de ${ inicioConflicto } a ${ finConflicto }`
  }

  private verificarConflictoHorarios(
    idSala: number, inicioFuncionNueva: number, finFuncionNueva: number, funcionesDisponibles: FuncionInterface[],
    peliculasDisponibles: PeliculaInterface[], idFuncionActual?: number
  ): string[] {
    const conflictos: string[] = []

    for (const funcion of funcionesDisponibles) {
      const conflicto: string | null = this.evaluarConflictoFuncion(
        funcion, idSala, inicioFuncionNueva, finFuncionNueva, peliculasDisponibles, idFuncionActual
      )

      if (conflicto) conflictos.push(conflicto)
    }

    return conflictos
  }

  seleccionarFuncion(funcion: FuncionInterface): void { this.funcionSeleccionada.set(funcion) }
}