import { inject, Service } from "@angular/core"
import { SupabaseService } from "./supabase-service"
import { SalaInterface } from "../interfaces/sala-interface"

@Service()
export class SalaService {
  private supabaseService: SupabaseService = inject(SupabaseService)

  async obtenerSalas(): Promise<SalaInterface[]> {
    const respuesta = await this.supabaseService.cliente
      .from("salas").select("*")

    if (respuesta.error) alert(respuesta.error)
    if (!respuesta.data) return []

    return respuesta.data as SalaInterface[]
  }
}