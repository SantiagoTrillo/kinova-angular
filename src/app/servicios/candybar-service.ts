import { inject, Service, signal, WritableSignal } from "@angular/core"
import { SupabaseService } from "./supabase-service"
import { ProductoInterface } from "../interfaces/producto-interface"
import { SesionService } from "./sesion-service"
import { CompraCandybar } from "../interfaces/compra-candybar"
import { EntradaService } from "./entrada-service"
import { UsuarioInterface } from "../interfaces/usuario-interface"

@Service()
export class CandybarService {
  private supabaseService: SupabaseService = inject(SupabaseService)
  private sesionService: SesionService = inject(SesionService)
  private entradaService: EntradaService = inject(EntradaService)

  compraCandybar: WritableSignal<CompraCandybar | null> = signal<CompraCandybar | null>(null)
  puntosGastados: WritableSignal<number> = signal<number>(0)

  async obtenerProductos(): Promise<ProductoInterface[]> {
    const respuesta = await this.supabaseService.cliente.from("candybar").select("*")

    if (respuesta.error) {
      alert("Error al procesar la solicitud: " + respuesta.error.message)
      return []
    }
    if (!respuesta.data) return []

    return respuesta.data.map(producto => ({...producto, cantidad: 0}))
  }

  async obtenerProductosCanjeados(): Promise<CompraCandybar[]> {
    const usuarioActual: UsuarioInterface | null = this.sesionService.usuarioActual()

    if (!usuarioActual) return []

    const respuesta = await this.supabaseService.cliente.from("compras_candybar").select("*")
      .eq("usuario_id", usuarioActual.id).eq("total", 0)

    if (respuesta.error) {
      alert("Error al procesar la solicitud: " + respuesta.error.message)
      return []
    }
    if (!respuesta.data) return []

    return respuesta.data as CompraCandybar[]
  }

  calcularTotalProductos(productos: ProductoInterface[]): number {
    return productos.reduce((total: number, producto: ProductoInterface): number =>
      total + (this.sesionService.modoCanjeActivado() ? producto.precio_puntos * producto.cantidad :
        producto.precio * producto.cantidad), 0)
  }

  async crearCompra(productos: ProductoInterface[]): Promise<void> {
    const descripcion: string = productos.map(producto =>
      producto.cantidad > 1 ? `${ producto.nombre } X${ producto.cantidad }` : producto.nombre).join("\n")
    const totalCompra: number = this.calcularTotalProductos(productos)
    const respuesta = await this.supabaseService.cliente.from("compras_candybar").insert({
      descripcion: descripcion,
      usuario_id: this.sesionService.usuarioActual()?.id,
      total: this.sesionService.modoCanjeActivado() ? 0 : totalCompra,
      codigo_qr: this.entradaService.codigoQrGenerado(),
      valida: true
    }).select().single()

    if (respuesta.error) return alert("Error al procesar la solicitud: " + respuesta.error.message)
    if (!respuesta.data) return
    if (this.sesionService.modoCanjeActivado()) this.puntosGastados.set(totalCompra)

    this.compraCandybar.set(respuesta.data)
  }

  async actualizarPrecioPuntos(nuevoPrecio: number, idProducto: number): Promise<void> {
    const respuesta = await this.supabaseService.cliente.from("candybar")
      .update({ precio_puntos: nuevoPrecio}).eq("id", idProducto)

    if (respuesta.error) return alert("Error al procesar la solicitud: " + respuesta.error.message)
  }
}