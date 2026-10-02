import { inject, Service, signal, WritableSignal } from "@angular/core"
import { EntradaInterface } from "../interfaces/entrada-interface"
import { SupabaseService } from "./supabase-service"
import { SesionService } from "./sesion-service"
import { UsuarioInterface } from "../interfaces/usuario-interface"
import { FuncionService } from "./funcion-service"
import { CuponInterface } from "../interfaces/cupon-interface"
import { ToastService } from "./toast-service"
import {FuncionInterface} from "../interfaces/funcion-interface";

@Service()
export class EntradaService {
  private supabaseService: SupabaseService = inject(SupabaseService)
  private sesionService: SesionService = inject(SesionService)
  private funcionService: FuncionService = inject(FuncionService)
  private toastService: ToastService = inject(ToastService)

  recargoVip: WritableSignal<number> = signal<number>(0.5)
  entradasCompradas: WritableSignal<EntradaInterface[] | null> = signal<EntradaInterface[] | null>(null)
  codigoQrGenerado: WritableSignal<string | null> = signal<string | null>(null)
  cuponAplicado: WritableSignal<CuponInterface | null> = signal<CuponInterface | null>(null)
  montoDescontado: WritableSignal<number> = signal<number>(0)

  async obtenerEntradasCanjeadas(): Promise<any[]> {
    const usuarioActual: UsuarioInterface | null = this.sesionService.usuarioActual()

    if (!usuarioActual) return []

    const respuesta = await this.supabaseService.cliente.from("entradas")
      .select("*, funciones(sala_id, fecha_hora, peliculas(titulo))").eq("usuario_id", usuarioActual.id)
      .eq("precio", 0)

    if (respuesta.error || !respuesta.data) {
      if (respuesta.error) this.toastService.mostrarToast("No se pudieron obtener las entradas canjeadas", "error")
      return []
    }

    return respuesta.data
  }

  async obtenerFacturacionDiaria(): Promise<number> {
    const respuesta = await this.supabaseService.cliente.from("entradas")
      .select("precio").eq("fecha_compra", new Date().toISOString())

    if (respuesta.error) {
      this.toastService.mostrarToast("No se pudo obtener la facturación diaria", "error")
      return 0
    }
    if (!respuesta.data) return 0

    return respuesta.data.reduce((total: number, entrada): number => total + entrada.precio, 0)
  }

  async obtenerEntradasVendidasDiarias(): Promise<number> {
    const respuesta = await this.supabaseService.cliente.from("entradas").select("id")
      .eq("fecha_compra", new Date().toISOString())

    if (respuesta.error) {
      this.toastService.mostrarToast("No se pudieron obtener las entradas vendidas", "error")
      return 0
    }
    if (!respuesta.data) return 0

    return respuesta.data.reduce(total => total + 1, 0)
  }

  calcularTotalEntradas(entradas: EntradaInterface[] | string[], canje: boolean): number {
    const funcion: FuncionInterface | null = this.funcionService.funcionSeleccionada()
    const precioPuntos: number = funcion?.precio_puntos ?? 0
    const precioPesos: number = funcion?.precio ?? 0

    return entradas.reduce((total: number, entrada: any): number => {
      const precio: number | undefined = entrada.precio

      if (precio !== undefined && precio > 0) return total + precio

      const precioBase: number = (canje || precio === 0) ? precioPuntos : precioPesos
      const butaca: string = entrada.butaca ?? entrada
      const butacaVip: boolean = butaca.startsWith("R") || butaca.startsWith("S") || butaca.startsWith("T")

      return total + (butacaVip ? precioBase * (1 + this.recargoVip()) : precioBase)
    }, 0)
  }

  comprarEntradas(entradas: EntradaInterface[]): void { this.entradasCompradas.set(entradas) }
}