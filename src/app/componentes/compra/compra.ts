import { Component, inject, Signal, signal, WritableSignal } from "@angular/core"
import { SupabaseService } from "../../servicios/supabase-service"
import { FuncionService } from "../../servicios/funcion-service"
import { EntradaInterface } from "../../interfaces/entrada-interface"
import { SesionService } from "../../servicios/sesion-service"
import { Router } from "@angular/router"
import { FuncionInterface } from "../../interfaces/funcion-interface"
import { UsuarioInterface } from "../../interfaces/usuario-interface"
import { EntradaService } from "../../servicios/entrada-service"
import { CuponService } from "../../servicios/cupon-service"
import { CuponInterface } from "../../interfaces/cupon-interface"

@Component({
  selector: "app-compra",
  templateUrl: "./compra.html",
  styleUrl: "./compra.sass"
})
export class Compra {
  private supabaseService: SupabaseService = inject(SupabaseService)
  private funcionService: FuncionService = inject(FuncionService)
  private sesionService: SesionService = inject(SesionService)
  private entradaService: EntradaService = inject(EntradaService)
  private cuponService: CuponService = inject(CuponService)
  private router: Router = inject(Router)

  filas: Signal<string[]> = signal([
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'
  ])
  columnas: Signal<number[][]> = signal([
    [1, 2, 3, 4], [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24], [25, 26, 27, 28]
  ])

  butacasOcupadas: WritableSignal<string[]> = signal<string[]>([])
  butacasSeleccionadas: WritableSignal<string[]> = signal<string[]>([])

  ngOnInit(): void {
    this.obtenerButacasOcupadas()
  }

  async obtenerButacasOcupadas(): Promise<void> {
    const respuesta = await this.supabaseService.cliente.from("entradas")
      .select("butaca").eq("funcion_id", this.funcionService.funcionSeleccionada()?.id)

    if (respuesta.data) {
      this.butacasOcupadas.set(respuesta.data.map(entrada => entrada.butaca))
    }
  }

  async confirmarCompra(): Promise<void> {
    const mejorCupon: CuponInterface | null = await this.cuponService.obtenerMejorCupon()
    const descuento: number = mejorCupon ? mejorCupon.descuento : 0
    const entradas: EntradaInterface[] = this.armarEntradas(descuento)
    const totalCompra: number = this.calcularTotalEntrada(entradas)
    const butacasSeleccionadas: string = this.butacasSeleccionadas().join(", ")
    const confirmacion: boolean = confirm(mejorCupon ? `Butacas seleccionadas: ${butacasSeleccionadas}\nDescuento aplicado (${mejorCupon.nombre}): ${descuento * 100}%\nTotal: $${totalCompra.toLocaleString("es-AR")}\n¿Deseás confirmar la compra?` : `Butacas seleccionadas: ${butacasSeleccionadas}\nTotal: $${totalCompra}\n¿Deseás confirmar la compra?`)

    if (confirmacion) {
      const respuesta = await this.supabaseService.cliente.from("entradas")
        .insert(entradas)

      if (!respuesta.error) {
        this.entradaService.comprarEntradas(entradas)

        if (mejorCupon) {
          await this.cuponService.canjearCupon(mejorCupon.id)
        }

        this.router.navigate(["/candybar"])
      }
    }
  }

  armarEntradas(descuento: number = 0): EntradaInterface[] {
    const funcionComprada: FuncionInterface | null = this.funcionService.funcionSeleccionada()
    const comprador: UsuarioInterface | null = this.sesionService.usuarioActual()

    if (!funcionComprada) return []

    const precioUnitario: number = funcionComprada.precio * (1 - descuento)

    return this.butacasSeleccionadas().map(butaca => ({
      funcion_id: funcionComprada.id,
      butaca: butaca,
      usuario_id: comprador?.id,
      precio: precioUnitario,
      codigo_qr: crypto.randomUUID()
    }))
  }

  calcularTotalEntrada(entradas: EntradaInterface[]): number {
    return entradas.reduce((total: number, entrada: EntradaInterface): number => total + entrada.precio, 0)
  }

  seleccionarButaca(butacaSeleccionada: string): void {
    if (!this.butacasOcupadas().includes(butacaSeleccionada)) {
      const butacasSeleccionadas: string[] = [...this.butacasSeleccionadas()]

      let butacaEncontrada: boolean = false

      for (let i: number = 0; i < butacasSeleccionadas.length; i++) {
        if (butacasSeleccionadas[i] === butacaSeleccionada) {
          butacasSeleccionadas.splice(i, 1)

          butacaEncontrada = true

          break
        }
      }

      if (!butacaEncontrada) {
        butacasSeleccionadas.push(butacaSeleccionada)
      }

      this.butacasSeleccionadas.set(butacasSeleccionadas)
    }
  }
}