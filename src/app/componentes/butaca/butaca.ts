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
import { PuntoService } from "../../servicios/punto-service"
import { ModalCompra } from "../modal-compra/modal-compra"
import { ToastService } from "../../servicios/toast-service"

@Component({
  selector: "app-butaca",
  templateUrl: "./butaca.html",
  styleUrl: "./butaca.sass",
  imports: [ModalCompra]
})
export class Butaca {
  private supabaseService: SupabaseService = inject(SupabaseService)
  private toastService: ToastService = inject(ToastService)
  private funcionService: FuncionService = inject(FuncionService)
  private sesionService: SesionService = inject(SesionService)
  private cuponService: CuponService = inject(CuponService)
  private puntoService: PuntoService = inject(PuntoService)
  private router: Router = inject(Router)

  filas: Signal<string[]> = signal(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'])
  columnasRegulares: Signal<number[][]> = signal([
    [1, 2, 3, 4], [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24], [25, 26, 27, 28]
  ])
  columnasAccesibles: Signal<number[][]> = signal([[1, 2], [3, 4, 5, 6, 7, 8, 9, 10, 11, 12], [13, 14]])

  butacasOcupadas: WritableSignal<string[]> = signal<string[]>([])
  butacasSeleccionadas: WritableSignal<string[]> = signal<string[]>([])
  mostrarModalCompra: WritableSignal<boolean> = signal<boolean>(false)

  entradaService: EntradaService = inject(EntradaService)
  intervaloButacas: any

  ngOnInit(): void {
    this.obtenerButacasOcupadas().then(_ => this.intervaloButacas = setInterval(() =>
      this.obtenerButacasOcupadas(), 1000))
  }

  ngOnDestroy(): void { clearInterval(this.intervaloButacas) }

  async obtenerButacasOcupadas(): Promise<void> {
    const funcionActual: FuncionInterface | null = this.funcionService.funcionSeleccionada()

    if (!funcionActual) return

    const respuesta = await this.supabaseService.cliente.from("entradas")
      .select("butaca").eq("funcion_id", funcionActual.id)

    if (respuesta.error) return this.toastService.mostrarToast("No se pudieron cargar las butacas ocupadas", "error")
    if (respuesta.data) { this.butacasOcupadas.set(respuesta.data.map(entrada => entrada.butaca)) }
  }

  async finalizarCompra(datosCompra: any): Promise<void> {
    const registrado: boolean = !!this.sesionService.usuarioActual()
    const canje: boolean = registrado && datosCompra.metodoPago === "puntos"
    const descuento: number = datosCompra.cupon ? datosCompra.cupon.descuento : 0
    const entradas: EntradaInterface[] = this.armarEntradas(descuento, canje)
    const respuesta = await this.supabaseService.cliente.from("entradas").insert(entradas)

    if (respuesta.error) return this.toastService.mostrarToast("No se pudieron registrar las entradas", "error")

    this.entradaService.comprarEntradas(entradas)
    this.entradaService.cuponAplicado.set(datosCompra.cupon)
    this.entradaService.montoDescontado.set(datosCompra.descuento ?? 0)

    if (registrado) {
      await this.puntoService.actualizarPuntos(datosCompra.total, canje)

      if (datosCompra.cupon) await this.cuponService.canjearCupon(datosCompra.cupon.id)
    }

    this.mostrarModalCompra.set(false)
    this.router.navigate(["/candybar"])
  }

  armarEntradas(descuento: number = 0, canje: boolean = false): EntradaInterface[] {
    const funcionComprada: FuncionInterface | null = this.funcionService.funcionSeleccionada()
    const comprador: UsuarioInterface | null = this.sesionService.usuarioActual()

    if (!funcionComprada) return []

    const precioUnitario: number = canje ? 0 : funcionComprada.precio * (1 - descuento)
    const codigoQr: string = crypto.randomUUID()

    this.entradaService.codigoQrGenerado.set(codigoQr)

    return this.butacasSeleccionadas().map(butaca => ({
      funcion_id: funcionComprada.id,
      butaca: butaca,
      usuario_id: comprador?.id,
      precio: butaca.startsWith("R") || butaca.startsWith("S") || butaca.startsWith("T") ?
        precioUnitario * (1 + this.entradaService.recargoVip()) : precioUnitario,
      codigo_qr: codigoQr,
      valida: true,
      fecha_compra: new Date()
    }))
  }

  seleccionarButaca(butacaSeleccionada: string): void {
    if (this.butacasOcupadas().includes(butacaSeleccionada)) return
    if (this.butacasSeleccionadas().includes(butacaSeleccionada)) this.butacasSeleccionadas.update(butacas =>
      butacas.filter(butaca => butaca !== butacaSeleccionada))
    else {
      this.butacasSeleccionadas.update(butacas => [...butacas, butacaSeleccionada])

      if (butacaSeleccionada.startsWith("J")) {
        this.toastService.mostrarToast("Seleccionaste una butaca accesible", "exito")
      }
      if (
        butacaSeleccionada.startsWith("R") || butacaSeleccionada.startsWith("S")
        || butacaSeleccionada.startsWith("T")
      ) this.toastService.mostrarToast("Seleccionaste una butaca V.I.P. con precio diferencial", "exito")
    }
  }

  abrirModalCompra(): void { this.mostrarModalCompra.set(true) }

  cerrarModalCompra(): void { this.mostrarModalCompra.set(false) }
}