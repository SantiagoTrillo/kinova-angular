import { inject, Service } from "@angular/core"
import { SupabaseService } from "./supabase-service"
import { SesionService } from "./sesion-service"
import { UsuarioInterface } from "../interfaces/usuario-interface"
import { ToastService } from "./toast-service"

@Service()
export class CreditoService {
  private supabaseService: SupabaseService = inject(SupabaseService)
  private sesionService: SesionService = inject(SesionService)
  private toastService: ToastService = inject(ToastService)

  async obtenerCredito(): Promise<number> {
    const usuarioActual: UsuarioInterface | null = this.sesionService.usuarioActual()

    if (!usuarioActual) return 0

    const respuesta = await this.supabaseService.cliente.from("usuarios")
      .select("credito").eq("id", usuarioActual.id).single()

    if (respuesta.error || !respuesta.data) {
      if (respuesta.error) this.toastService.mostrarToast("No se pudo obtener el crédito del usuario", "error")
      return 0
    }

    return respuesta.data.credito ?? 0
  }

  async actualizarCredito(monto: number, descontar: boolean): Promise<void> {
    const usuarioActual: UsuarioInterface | null = this.sesionService.usuarioActual()

    if (!usuarioActual) return

    const creditoActual: number = await this.obtenerCredito()
    const nuevoCredito: number = descontar ? Math.max(0, creditoActual - monto) : creditoActual + monto
    const respuesta = await this.supabaseService.cliente.from("usuarios")
      .update({ credito: nuevoCredito }).eq("id", usuarioActual.id)

    if (respuesta.error) return this.toastService.mostrarToast("No se pudo actualizar el crédito", "error")
  }
}