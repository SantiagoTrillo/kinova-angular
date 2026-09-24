import { inject, Service, Signal, signal } from "@angular/core"
import { SupabaseService } from "./supabase-service"
import { ReseniaInterface } from "../interfaces/resenia-interface"
import { PeliculaService } from "./pelicula-service"

@Service()
export class ReseniaService {
  private supabaseService: SupabaseService = inject(SupabaseService)
  private peliculaService: PeliculaService = inject(PeliculaService)

  estrellas: Signal<number[]> = signal<number[]>([1, 2, 3, 4, 5])

  async obtenerResenias(): Promise<ReseniaInterface[]> {
    const respuesta = await this.supabaseService.cliente.from("resenias").select("*")
      .eq("pelicula_id", this.peliculaService.peliculaSeleccionada()?.id).order("id", { ascending: false })

    if (respuesta.error) {
      alert("Error al procesar la solicitud: " + respuesta.error.message)
      return []
    }
    if (!respuesta.data) return []

    return respuesta.data as ReseniaInterface[]
  }
}