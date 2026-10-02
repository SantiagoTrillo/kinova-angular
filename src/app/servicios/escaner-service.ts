import { inject, Service } from "@angular/core"
import { SupabaseService } from "./supabase-service"
import { ToastService } from "./toast-service"

@Service()
export class EscanerService {
  private supabaseService: SupabaseService = inject(SupabaseService)
  private toastService: ToastService = inject(ToastService)

  async escanearCodigo(tipo: string, codigo: string): Promise<void> {
    const tabla: string = tipo === "Entrada" ? "entradas" : "compras_candybar"
    const respuesta = await this.supabaseService.cliente.from(tabla)
      .select("valida").eq("codigo_qr", codigo)

    if (respuesta.error) return this.toastService.mostrarToast("No se pudo verificar el código", "error")
    if (respuesta.data.length === 0) return this.toastService.mostrarToast("El código ingresado no existe", "error")
    else if (respuesta.data[0].valida) {
      await this.invalidarCompra(tabla, codigo)
      return this.toastService.mostrarToast("Código escaneado con éxito", "exito")
    } else return this.toastService.mostrarToast("El código ingresado ya fue escaneado", "error")
  }

  async invalidarCompra(tabla: string, codigo: string): Promise<void> {
    await this.supabaseService.cliente.from(tabla).update({ valida: false }).eq("codigo_qr", codigo)
  }
}