import { Component, computed, inject, Signal, signal, WritableSignal } from "@angular/core"
import { CurrencyPipe, NgOptimizedImage } from "@angular/common"
import { ProductoInterface } from "../../interfaces/producto-interface"
import { CandybarService } from "../../servicios/candybar-service"
import { Router } from "@angular/router"
import { PuntoService } from "../../servicios/punto-service"
import { SesionService } from "../../servicios/sesion-service"
import { CuponService } from "../../servicios/cupon-service"
import { EntradaService } from "../../servicios/entrada-service"
import { ModalCompra } from "../modales/modal-compra/modal-compra"
import { ModalConfirmacion } from "../modales/modal-confirmacion/modal-confirmacion"
import { CuponInterface } from "../../interfaces/cupon-interface"
import { EntradaInterface } from "../../interfaces/entrada-interface"
import { CreditoService } from "../../servicios/credito-service"

@Component({
  selector: "app-candybar",
  templateUrl: "./candybar.html",
  styleUrl: "./candybar.sass",
  imports: [NgOptimizedImage, CurrencyPipe, ModalCompra, ModalConfirmacion]
})
export class Candybar {
  private puntoService: PuntoService = inject(PuntoService)
  private cuponService: CuponService = inject(CuponService)
  private sesionService: SesionService = inject(SesionService)
  private entradaService: EntradaService = inject(EntradaService)
  private creditoService: CreditoService = inject(CreditoService)
  private router: Router = inject(Router)

  categorias: Signal<string[]> = signal<string[]>(["Combos", "Pochoclos", "Bebidas", "Snacks Salados", "Snacks Dulces"])
  productoSeleccionado: Signal<boolean> = computed((): boolean => {
    for (const producto of this.productosDisponibles()) { if (producto.cantidad > 0) return true }
    return false
  })
  entradasCompradas: Signal<boolean> = computed((): boolean => {
    const entradas: EntradaInterface[] | null = this.entradaService.entradasCompradas()
    return !!(entradas && entradas.length > 0)
  })

  productosDisponibles: WritableSignal<ProductoInterface[]> = signal<ProductoInterface[]>([])
  mostrarModalCompra: WritableSignal<boolean> = signal<boolean>(false)
  mostrarModalConfirmacion: WritableSignal<boolean> = signal<boolean>(false)

  candybarService: CandybarService = inject(CandybarService)

  ngOnInit(): void { this.candybarService.obtenerProductos().then(productos => this.productosDisponibles.set(productos)) }

  obtenerProductosSeleccionados(): ProductoInterface[] {
    return this.productosDisponibles().filter(producto => producto.cantidad > 0)
  }

  obtenerDescripcionProductos(): string {
    return this.obtenerProductosSeleccionados().map(producto =>
      producto.cantidad > 1 ? `${ producto.nombre } X${ producto.cantidad }` : producto.nombre).join(", ")
  }

  async comprarProductos(): Promise<void> {
    if (!this.productoSeleccionado()) {
      if (this.sesionService.usuarioActual()) {
        const cupones: CuponInterface[] = await this.cuponService.obtenerCuponesUsuario()
        const cuponRegistro: CuponInterface | undefined = cupones.find((cupon: CuponInterface): boolean => cupon.id === 1)

        if (cuponRegistro) {
          this.mostrarModalConfirmacion.set(true)
          return
        }
      }
      this.router.navigate(["/comprobante"])
    } else this.abrirModalCompra()
  }

  async confirmarNavegacionComprobante(): Promise<void> {
    this.mostrarModalConfirmacion.set(false)
    await this.cuponService.desactivarCuponRegistro()
    this.router.navigate(["/comprobante"])
  }

  async finalizarCompra(datosCompra: any): Promise<void> {
    const registrado: boolean = !!this.sesionService.usuarioActual()
    const canje: boolean = registrado && datosCompra.metodoPago === "puntos"
    const productosComprados: ProductoInterface[] = this.obtenerProductosSeleccionados()

    await this.candybarService.crearCompra(productosComprados, datosCompra.total, canje)
    this.candybarService.cuponAplicado.set(datosCompra.cupon)
    this.candybarService.montoDescontado.set(datosCompra.descuento ?? 0)

    if (registrado) {
      if (datosCompra.creditoUsado && datosCompra.creditoUsado > 0) {
        await this.creditoService.actualizarCredito(datosCompra.creditoUsado, true)
      }

      await this.puntoService.actualizarPuntos(datosCompra.total, canje)

      if (datosCompra.cupon) await this.cuponService.canjearCupon(datosCompra.cupon.id)

      await this.cuponService.desactivarCuponRegistro()
    }

    this.mostrarModalCompra.set(false)
    this.router.navigate(["/comprobante"])
  }

  aumentarProducto(productoSeleccionado: ProductoInterface): void {
    productoSeleccionado.cantidad++
    this.productosDisponibles.set([...this.productosDisponibles()])
  }

  decrementarProducto(productoSeleccionado: ProductoInterface): void {
    if (productoSeleccionado.cantidad > 0) productoSeleccionado.cantidad--
    this.productosDisponibles.set([...this.productosDisponibles()])
  }

  abrirModalCompra(): void { this.mostrarModalCompra.set(true) }

  cerrarModalCompra(): void { this.mostrarModalCompra.set(false) }
}