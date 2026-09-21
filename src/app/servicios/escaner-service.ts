import { inject, Service } from "@angular/core"
import { SupabaseService } from "./supabase-service"

@Service()
export class EscanerService {
  private supabaseService: SupabaseService = inject(SupabaseService)

  async escanearCodigo(tipo: string, codigo: string): Promise<void> {
    const tabla: string = tipo === "Entrada" ? "entradas" : "compras_candybar"
    const respuesta = await this.supabaseService.cliente.from(tabla)
      .select("valida").eq("codigo_qr", codigo).single()

    if (!respuesta.data) return alert("El código ingresado no existe")
    else if (respuesta.data.valida) {
      await this.invalidarCompra(tabla, codigo)
      return alert("Código escaneado con éxito")
    } else {
      return alert("El código ingresado ya fue escaneado")
    }
  }

  async invalidarCompra(tabla: string, codigo: string): Promise<void> {
    await this.supabaseService.cliente.from(tabla).update({valida: false}).eq("codigo_qr", codigo)
  }
}