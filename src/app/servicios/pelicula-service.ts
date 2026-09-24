import { inject, Service, signal, WritableSignal } from "@angular/core"
import { PeliculaInterface } from "../interfaces/pelicula-interface"
import { SupabaseService } from "./supabase-service"

@Service()
export class PeliculaService {
  private supabaseService: SupabaseService = inject(SupabaseService)

  peliculaSeleccionada: WritableSignal<PeliculaInterface | null> = signal<PeliculaInterface | null>(null)

  async obtenerPeliculas(): Promise<PeliculaInterface[]> {
    const respuesta = await this.supabaseService.cliente.from("peliculas").select("*")
      .order("id", { ascending: true })

    if (respuesta.error) {
      alert("Error al procesar la solicitud: " + respuesta.error.message)
      return []
    }
    if (!respuesta.data) return []

    return respuesta.data as PeliculaInterface[]
  }

  async cambiarEstadoPelicula(estado: boolean, idPelicula: number): Promise<void> {
    const respuesta = await this.supabaseService.cliente.from("peliculas")
      .update({ principal: estado }).eq("id", idPelicula)

    if (respuesta.error) return alert("Error al procesar la solicitud: " + respuesta.error.message)
  }

  seleccionarPelicula(pelicula: PeliculaInterface): void { this.peliculaSeleccionada.set(pelicula) }
}