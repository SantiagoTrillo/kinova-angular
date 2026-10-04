import { inject, Service, signal, WritableSignal } from "@angular/core"
import { SupabaseService } from "./supabase-service"
import { ProductoInterface } from "../interfaces/producto-interface"
import { SesionService } from "./sesion-service"
import { CompraCandybar } from "../interfaces/compra-candybar"
import { EntradaService } from "./entrada-service"
import { UsuarioInterface } from "../interfaces/usuario-interface"
import { CuponInterface } from "../interfaces/cupon-interface"
import { ToastService } from "./toast-service"

@Service()
export class CandybarService {
  private supabaseService: SupabaseService = inject(SupabaseService)
  private sesionService: SesionService = inject(SesionService)
  private entradaService: EntradaService = inject(EntradaService)
  private toastService: ToastService = inject(ToastService)

  productosDisponibles: WritableSignal<ProductoInterface[]> = signal<ProductoInterface[]>([])
  compraCandybar: WritableSignal<CompraCandybar | null> = signal<CompraCandybar | null>(null)
  puntosGastados: WritableSignal<number> = signal<number>(0)
  cuponAplicado: WritableSignal<CuponInterface | null> = signal<CuponInterface | null>(null)
  montoDescontado: WritableSignal<number> = signal<number>(0)

  constructor() { this.cargarProductos() }

  private async cargarProductos(): Promise<void> { this.productosDisponibles.set(await this.obtenerProductos()) }

  async obtenerProductos(): Promise<ProductoInterface[]> {
    const respuesta = await this.supabaseService.cliente.from("candybar").select("*").order("id", { ascending: true })

    if (respuesta.error || !respuesta.data) {
      if (respuesta.error) this.toastService.mostrarToast("No se pudieron cargar los productos del candybar", "error")
      return []
    }

    return respuesta.data.map(producto => ({ ...producto, cantidad: 0 }))
  }

  async obtenerProductosCanjeados(): Promise<CompraCandybar[]> {
    const usuarioActual: UsuarioInterface | null = this.sesionService.usuarioActual()

    if (!usuarioActual) return []

    const respuesta = await this.supabaseService.cliente.from("compras_candybar").select("*")
      .eq("usuario_id", usuarioActual.id).eq("total", 0)

    if (respuesta.error || !respuesta.data) {
      if (respuesta.error) this.toastService.mostrarToast("No se pudieron cargar los productos canjeados", "error")
      return []
    }

    return respuesta.data as CompraCandybar[]
  }

  calcularTotalProductos(productos: ProductoInterface[], canje: boolean): number {
    return productos.reduce((total: number, producto: ProductoInterface): number =>
      total + (canje ? producto.precio_puntos : producto.precio) * producto.cantidad, 0)
  }

  async crearCompra(productos: ProductoInterface[], total: number = 0, canje: boolean = false): Promise<void> {
    if (!this.entradaService.codigoQrGenerado()) this.entradaService.codigoQrGenerado.set(crypto.randomUUID())

    const descripcion: string = productos.map(producto =>
      producto.cantidad > 1 ? `${ producto.nombre } X${ producto.cantidad }` : producto.nombre).join("\n")

    this.puntosGastados.set(canje ? total : 0)

    const respuesta = await this.supabaseService.cliente.from("compras_candybar").insert({
      descripcion: descripcion,
      usuario_id: this.sesionService.usuarioActual()?.id,
      total: canje ? 0 : (total > 0 ? total : this.calcularTotalProductos(productos, false)),
      codigo_qr: this.entradaService.codigoQrGenerado(),
      valida: true
    }).select().single()

    if (respuesta.error) return this.toastService.mostrarToast("No se pudo registrar la compra del candybar", "error")
    if (!respuesta.data) return

    this.compraCandybar.set(respuesta.data)
  }

  async crearProducto(datosFormulario: any): Promise<ProductoInterface | null> {
    const respuesta = await this.supabaseService.cliente.from("candybar").insert({
      nombre: datosFormulario.nombre,
      categoria: datosFormulario.categoria,
      precio: datosFormulario.precio,
      precio_puntos: datosFormulario.precio_puntos,
      imagen: datosFormulario.imagen,
      disponible: true
    }).select().single()

    if (respuesta.error || !respuesta.data) {
      this.toastService.mostrarToast("No se pudo crear el producto", "error")
      return null
    }

    await this.cargarProductos()
    this.toastService.mostrarToast("Producto creado con éxito", "exito")

    return respuesta.data as ProductoInterface
  }

  async modificarProducto(idProducto: number, datosFormulario: any): Promise<boolean> {
    const respuesta = await this.supabaseService.cliente.from("candybar").update({
      nombre: datosFormulario.nombre,
      categoria: datosFormulario.categoria,
      precio: datosFormulario.precio,
      precio_puntos: datosFormulario.precio_puntos,
      imagen: datosFormulario.imagen,
      disponible: datosFormulario.disponible
    }).eq("id", idProducto)

    if (respuesta.error) {
      this.toastService.mostrarToast("No se pudo modificar el producto", "error")
      return false
    }

    await this.cargarProductos()
    this.toastService.mostrarToast("Producto modificado con éxito", "exito")

    return true
  }

  actualizarEstado(idProducto: number, disponible: boolean): void {
    this.productosDisponibles.update(productos =>
      productos.map(producto => producto.id === idProducto ? { ...producto, disponible: disponible } : producto))
  }
}