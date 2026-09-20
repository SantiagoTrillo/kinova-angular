import {Component, computed, inject, Signal, signal, WritableSignal} from "@angular/core"
import { CurrencyPipe, NgOptimizedImage } from "@angular/common"
import { ProductoInterface } from "../../interfaces/producto-interface"
import { CandybarService } from "../../servicios/candybar-service"
import { Router } from "@angular/router"

@Component({
  selector: "app-candybar",
  templateUrl: "./candybar.html",
  styleUrl: "./candybar.sass",
  imports: [NgOptimizedImage, CurrencyPipe]
})
export class Candybar {
  private candybarService: CandybarService = inject(CandybarService)
  private router: Router = inject(Router)

  categorias: Signal<string[]> = signal<string[]>(["Combos", "Pochoclos", "Bebidas", "Snacks Salados", "Snacks Dulces"])

  productos: WritableSignal<ProductoInterface[]> = signal<ProductoInterface[]>([])
  productoSeleccionado: Signal<boolean> = computed((): boolean => {
    for (const producto of this.productos()) {
      if (producto.cantidad > 0) {
        return true
      }
    }

    return false
  })

  ngOnInit(): void {
    this.candybarService.obtenerProductos().then(productos => this.productos.set(productos))
  }

  aumentarProducto(productoSeleccionado: ProductoInterface): void {
    productoSeleccionado.cantidad++

    this.productos.set([...this.productos()])
  }

  decrementarProducto(productoSeleccionado: ProductoInterface): void {
    if (productoSeleccionado.cantidad > 0) {
      productoSeleccionado.cantidad--

      this.productos.set([...this.productos()])
    }
  }

  comprarProductos(): void {
    const productosComprados: ProductoInterface[] = this.productos().filter(producto => producto.cantidad > 0)
    const totalCompra: number = this.calcularTotalProductos(productosComprados)
    const nombreProductos: string = productosComprados.map(producto => producto.nombre).join(", ")
    const confirmacion: boolean = confirm(`Productos seleccionados: ${nombreProductos}\nTotal: $${totalCompra.toLocaleString("es-AR")}\n¿Deseás confirmar la compra?`)

    if (confirmacion) {
      this.candybarService.comprarProductos(productosComprados)
      this.router.navigate(["/entrada"])
    }
  }

  calcularTotalProductos(productos: ProductoInterface[]): number {
    return productos.reduce((total: number, producto: ProductoInterface): number => total + producto.precio, 0)
  }
}