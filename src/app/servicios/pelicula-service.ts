import { inject, Service, signal, WritableSignal } from "@angular/core"
import { PeliculaInterface } from "../interfaces/pelicula-interface"
import { SupabaseService } from "./supabase-service"

@Service()
export class PeliculaService {
  private supabaseService: SupabaseService = inject(SupabaseService)

  peliculaSeleccionada: WritableSignal<PeliculaInterface | null> = signal<PeliculaInterface | null>(null)

  async obtenerPeliculas(): Promise<PeliculaInterface[]> {
    const respuesta = await this.supabaseService.cliente.from("peliculas").select("*")

    if (respuesta.data) {
      return respuesta.data as PeliculaInterface[]
    } else {
      return []
    }
  }

  seleccionarPelicula(pelicula: PeliculaInterface): void {
    this.peliculaSeleccionada.set(pelicula)
  }
}