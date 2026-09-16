import { inject, Service } from "@angular/core"
import { SupabaseService } from "./supabase-service"
import { ReseniaInterface } from "../interfaces/resenia-interface"
import { PeliculaService } from "./pelicula-service"

@Service()
export class ReseniaService {
  private supabaseService: SupabaseService = inject(SupabaseService)
  private peliculaService: PeliculaService = inject(PeliculaService)

  async obtenerResenias(): Promise<ReseniaInterface[]> {
    const respuesta = await this.supabaseService.cliente.from("resenias")
      .select("*").eq("pelicula_id", this.peliculaService.peliculaSeleccionada()?.id)

    if (respuesta.data) {
      return respuesta.data as ReseniaInterface[]
    } else {
      return []
    }
  }
}