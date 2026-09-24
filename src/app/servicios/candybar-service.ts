import { inject, Service, signal, WritableSignal } from "@angular/core"
import { SupabaseService } from "./supabase-service"
import { ProductoInterface } from "../interfaces/producto-interface"
import { SesionService } from "./sesion-service"
import { CompraCandybar } from "../interfaces/compra-candybar"

@Service()
export class CandybarService {
  private supabaseService: SupabaseService = inject(SupabaseService)
  private sesionService: SesionService = inject(SesionService)

  compraCandybar: WritableSignal<CompraCandybar | null> = signal<CompraCandybar | null>(null)

  async obtenerProductos(): Promise<ProductoInterface[]> {
    const respuesta = await this.supabaseService.cliente.from("candybar").select("*")

    if (respuesta.error) {
      alert("Error al procesar la solicitud: " + respuesta.error.message)
      return []
    }
    if (!respuesta.data) return []

    return respuesta.data.map(producto => ({...producto, cantidad: 0}))
  }

  async crearCompra(productos: ProductoInterface[]): Promise<void> {
    const descripcion: string = productos.map(producto =>
      producto.cantidad > 1 ? `${ producto.nombre } X${ producto.cantidad }` : producto.nombre).join("\n")
    const total: number = productos.reduce((sumaPrecios: number, producto: ProductoInterface): number =>
      sumaPrecios + (producto.precio * producto.cantidad), 0)
    const respuesta = await this.supabaseService.cliente.from("compras_candybar").insert({
      descripcion: descripcion,
      usuario_id: this.sesionService.usuarioActual()?.id,
      total: total,
      codigo_qr: crypto.randomUUID(),
      valida: true
    }).select().single()

    if (respuesta.error) return alert("Error al procesar la solicitud: " + respuesta.error.message)

    this.compraCandybar.set(respuesta.data)
  }
}