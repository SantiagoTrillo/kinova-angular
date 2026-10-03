import { inject, Service, signal, WritableSignal } from "@angular/core"
import { PeliculaInterface } from "../interfaces/pelicula-interface"
import { SupabaseService } from "./supabase-service"
import { ToastService } from "./toast-service"

@Service()
export class PeliculaService {
  private supabaseService: SupabaseService = inject(SupabaseService)
  private toastService: ToastService = inject(ToastService)

  peliculasDisponibles: WritableSignal<PeliculaInterface[]> = signal<PeliculaInterface[]>([])
  peliculaSeleccionada: WritableSignal<PeliculaInterface | null> = signal<PeliculaInterface | null>(null)

  constructor() { this.cargarPeliculas() }

  private async cargarPeliculas(): Promise<void> { this.peliculasDisponibles.set(await this.obtenerPeliculas()) }

  async obtenerPeliculas(): Promise<PeliculaInterface[]> {
    const respuesta = await this.supabaseService.cliente.from("peliculas").select("*")
      .order("id", { ascending: true })

    if (respuesta.error || !respuesta.data) {
      if (respuesta.error) this.toastService.mostrarToast("No se pudieron cargar las películas", "error")
      return []
    }
    return respuesta.data as PeliculaInterface[]
  }

  actualizarEstado(idPelicula: number, disponible: boolean): void {
    this.peliculasDisponibles.update(peliculas =>
      peliculas.map(pelicula => pelicula.id === idPelicula ? { ...pelicula, disponible: disponible } : pelicula))
  }

  async crearPelicula(datosPelicula: any): Promise<PeliculaInterface | null> {
    const respuesta = await this.supabaseService.cliente.from("peliculas").insert({
      titulo: datosPelicula.titulo,
      sinopsis: datosPelicula.sinopsis,
      duracion: datosPelicula.duracion,
      imagen: datosPelicula.imagen,
      generos: datosPelicula.generos,
      restriccion_edad: datosPelicula.restriccion_edad,
      disponible: true,
      fecha_estreno: datosPelicula.fecha_estreno
    }).select().single()

    if (respuesta.error) {
      this.toastService.mostrarToast("No se pudo crear la película", "error")
      return null
    }

    const nuevaPelicula = respuesta.data as PeliculaInterface
    this.peliculasDisponibles.update(peliculas => [...peliculas, nuevaPelicula])
    this.toastService.mostrarToast("Película creada con éxito", "exito")
    return nuevaPelicula
  }

  async modificarPelicula(idPelicula: number, datosPelicula: any): Promise<boolean> {
    const respuesta = await this.supabaseService.cliente.from("peliculas").update({
      titulo: datosPelicula.titulo,
      sinopsis: datosPelicula.sinopsis,
      duracion: datosPelicula.duracion,
      imagen: datosPelicula.imagen,
      generos: datosPelicula.generos,
      restriccion_edad: datosPelicula.restriccion_edad,
      disponible: datosPelicula.disponible,
      fecha_estreno: datosPelicula.fecha_estreno
    }).eq("id", idPelicula)

    if (respuesta.error) {
      this.toastService.mostrarToast("No se pudo actualizar la película", "error")
      return false
    }

    this.peliculasDisponibles.update(peliculas =>
      peliculas.map(pelicula => pelicula.id === idPelicula ? { ...pelicula, ...datosPelicula } : pelicula))
    this.toastService.mostrarToast("Película actualizada con éxito", "exito")
    return true
  }

  seleccionarPelicula(pelicula: PeliculaInterface): void { this.peliculaSeleccionada.set(pelicula) }

  calcularDiasEstreno(pelicula: PeliculaInterface): number | null {
    if (!pelicula.fecha_estreno) return null

    const [anio, mes, dia] = pelicula.fecha_estreno.split("-").map(Number)
    const fechaEstreno = new Date(anio, mes - 1, dia)
    const hoy = new Date()

    hoy.setHours(0, 0, 0, 0)

    return Math.round((fechaEstreno.getTime() - hoy.getTime()) / (1000 * 3600 * 24))
  }

  verificarEstadoPelicula(pelicula: PeliculaInterface): string | null {
    if (!pelicula.disponible) return null

    const diferenciaDias: number | null = this.calcularDiasEstreno(pelicula)

    if (diferenciaDias === null) return null
    if (diferenciaDias > 7) return "proximamente"
    if (diferenciaDias > 0) return "preventa"
    if (diferenciaDias >= -90) return "cartelera"

    return null
  }
}