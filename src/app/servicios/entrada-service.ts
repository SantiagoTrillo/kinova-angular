import { inject, Service, signal, WritableSignal } from "@angular/core"
import { EntradaInterface } from "../interfaces/entrada-interface"
import { SupabaseService } from "./supabase-service"

@Service()
export class EntradaService {
  supabaseService: SupabaseService = inject(SupabaseService)

  entradasCompradas: WritableSignal<EntradaInterface[] | null> = signal<EntradaInterface[] | null>(null)
  codigoQrGenerado: WritableSignal<string | null> = signal<string | null>(null)

  async obtenerFacturacionDiaria(): Promise<number> {
    const respuesta = await this.supabaseService.cliente.from("entradas")
      .select("precio").eq("fecha_compra", new Date().toISOString())

    if (respuesta.error) {
      alert ("Error al procesar la solicitud: " + respuesta.error.message)
      return 0
    }
    if (!respuesta.data) return 0

    return respuesta.data.reduce((total: number, entrada): number => total + entrada.precio, 0)
  }

  async obtenerEntradasVendidasDiarias(): Promise<number> {
    const respuesta = await this.supabaseService.cliente.from("entradas").select("id")
      .eq("fecha_compra", new Date().toISOString())

    if (respuesta.error) {
      alert ("Error al procesar la solicitud: " + respuesta.error.message)
      return 0
    }
    if (!respuesta.data) return 0

    return respuesta.data.reduce(total=> total + 1, 0)
  }

  comprarEntradas(entradas: EntradaInterface[]): void { this.entradasCompradas.set(entradas) }
}