import { inject, Service, signal, WritableSignal } from "@angular/core"
import { EntradaInterface } from "../interfaces/entrada-interface"
import { SupabaseService } from "./supabase-service"
import { SesionService } from "./sesion-service"
import { UsuarioInterface } from "../interfaces/usuario-interface"
import { FuncionService } from "./funcion-service"

@Service()
export class EntradaService {
  private supabaseService: SupabaseService = inject(SupabaseService)
  private sesionService: SesionService = inject(SesionService)
  private funcionService: FuncionService = inject(FuncionService)

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

  calcularTotalEntradas(entradas: EntradaInterface[] | string[], esCanje: boolean = false): number {
    const funcion = this.funcionService.funcionSeleccionada()
    const precioPuntos: number = funcion?.precio_puntos ?? 0
    const precioPesos: number = funcion?.precio ?? 0

    return entradas.reduce((total: number, item: EntradaInterface | string): number => {
      if (typeof item !== "string" && item.precio > 0) return total + item.precio

      const precioBase: number = (esCanje || (typeof item !== "string" && item.precio === 0)) ? precioPuntos : precioPesos
      const butaca: string = typeof item === "string" ? item : item.butaca
      const butacaVip: boolean = butaca.startsWith("R") || butaca.startsWith("S") || butaca.startsWith("T")

      return total + (butacaVip ? precioBase * (1 + this.recargoVip()) : precioBase)
    }, 0)
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