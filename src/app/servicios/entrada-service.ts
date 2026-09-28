import { inject, Service, signal, WritableSignal } from "@angular/core"
import { EntradaInterface } from "../interfaces/entrada-interface"
import { SupabaseService } from "./supabase-service"
import { SesionService } from "./sesion-service"
import { UsuarioInterface } from "../interfaces/usuario-interface"

@Service()
export class EntradaService {
  private supabaseService: SupabaseService = inject(SupabaseService)
  private sesionService: SesionService = inject(SesionService)

  recargoVip: WritableSignal<number> = signal<number>(0.5)
  entradasCompradas: WritableSignal<EntradaInterface[] | null> = signal<EntradaInterface[] | null>(null)
  codigoQrGenerado: WritableSignal<string | null> = signal<string | null>(null)

  async obtenerEntradasCanjeadas(): Promise<any[]> {
    const usuarioActual: UsuarioInterface | null = this.sesionService.usuarioActual()

    if (!usuarioActual) return []

    const respuesta = await this.supabaseService.cliente.from("entradas")
      .select("*, funciones(sala_id, fecha_hora, peliculas(titulo))").eq("usuario_id", usuarioActual.id)
      .eq("precio", 0)

    if (respuesta.error) {
      alert("Error al procesar la solicitud: " + respuesta.error.message)
      return []
    }
    if (!respuesta.data) return []

    return respuesta.data
  }

  calcularTotalEntradas(entradas: EntradaInterface[]): number {
    return entradas.reduce((total: number, entrada: EntradaInterface): number => total + entrada.precio, 0)
  }

  comprarEntradas(entradas: EntradaInterface[]): void { this.entradasCompradas.set(entradas) }

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
}