import { inject, Service, signal, WritableSignal } from "@angular/core"
import { SupabaseService } from "./supabase-service"
import { ProductoInterface } from "../interfaces/producto-interface"

@Service()
export class CandybarService {
  private supabaseService: SupabaseService = inject(SupabaseService)

  productosComprados: WritableSignal<ProductoInterface[]> = signal<ProductoInterface[]>([])

  async obtenerProductos(): Promise<ProductoInterface[]> {
    const respuesta = await this.supabaseService.cliente.from("candybar")
      .select("*")

    if (!respuesta.data) return []

    return respuesta.data.map(producto => ({...producto, cantidad: 0}))
  }

  comprarProductos(productos: ProductoInterface[]): void {
    this.productosComprados.set(productos)
  }
}