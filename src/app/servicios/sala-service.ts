import { inject, Service } from "@angular/core"
import { SupabaseService } from "./supabase-service"
import { SalaInterface } from "../interfaces/sala-interface"
import { ToastService } from "./toast-service"

@Service()
export class SalaService {
  private supabaseService: SupabaseService = inject(SupabaseService)
  private toastService: ToastService = inject(ToastService)

  async obtenerSalas(): Promise<SalaInterface[]> {
    const respuesta = await this.supabaseService.cliente.from("salas").select("*")

    if (respuesta.error) {
      this.toastService.mostrarToast("No se pudieron cargar las salas", "error")
      return []
    }
    if (!respuesta.data) return []

    return respuesta.data as SalaInterface[]
  }
}