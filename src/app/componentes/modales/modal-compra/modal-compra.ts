import { Component, inject, input, InputSignal, OnInit, output, OutputEmitterRef, signal, WritableSignal } from "@angular/core"
import { CurrencyPipe } from "@angular/common"
import { SesionService } from "../../../servicios/sesion-service"
import { CuponService } from "../../../servicios/cupon-service"
import { PuntoService } from "../../../servicios/punto-service"
import { CreditoService } from "../../../servicios/credito-service"
import { CuponInterface } from "../../../interfaces/cupon-interface"
import { ToastService } from "../../../servicios/toast-service"
import { ModalConfirmacion } from "../modal-confirmacion/modal-confirmacion"

@Component({
  selector: "app-modal-compra",
  templateUrl: "./modal-compra.html",
  styleUrl: "./modal-compra.sass",
  imports: [CurrencyPipe, ModalConfirmacion]
})
export class ModalCompra implements OnInit {
  private cuponService: CuponService = inject(CuponService)
  private puntoService: PuntoService = inject(PuntoService)
  private creditoService: CreditoService = inject(CreditoService)
  private toastService: ToastService = inject(ToastService)

  tipoCompra: InputSignal<string> = input<string>("entrada")
  etiquetaElementos: InputSignal<string> = input<string>("Butacas seleccionadas")
  elementos: InputSignal<string> = input<string>("")
  totalPesos: InputSignal<number> = input<number>(0)
  totalPuntos: InputSignal<number> = input<number>(0)

  metodoPago: WritableSignal<string> = signal<string>("pesos")
  cuponesUsuario: WritableSignal<CuponInterface[]> = signal<CuponInterface[]>([])
  cuponSeleccionado: WritableSignal<CuponInterface | null> = signal<CuponInterface | null>(null)
  puntosUsuario: WritableSignal<number> = signal<number>(0)
  creditoUsuario: WritableSignal<number> = signal<number>(0)
  usarCredito: WritableSignal<boolean> = signal<boolean>(false)
  mostrarModalConfirmacion: WritableSignal<boolean> = signal<boolean>(false)

  sesionService: SesionService = inject(SesionService)
  cerrar: OutputEmitterRef<void> = output<void>()
  confirmar: OutputEmitterRef<any> = output<any>()

  async ngOnInit(): Promise<void> {
    if (this.sesionService.usuarioActual()) {
      this.cuponesUsuario.set(await this.cuponService.obtenerCuponesUsuario())
      this.puntosUsuario.set(await this.puntoService.obtenerPuntos())
      this.creditoUsuario.set(await this.creditoService.obtenerCredito())
    }
  }

  verificarCuponRegistro(): boolean {
    for (const cupon of this.cuponesUsuario()) { if (cupon.id === 1) return true }
    return false
  }

  cambiarCupon(idCupon: string): void {
    if (!idCupon) {
      this.cuponSeleccionado.set(null)
      return
    }
    const cupon: CuponInterface | null = this.cuponesUsuario().find((cupon: CuponInterface): boolean =>
      cupon.id === Number(idCupon)) || null

    this.cuponSeleccionado.set(cupon)
  }

  alternarUsarCredito(): void { this.usarCredito.update(estado => !estado) }

  calcularMontoDescontado(): number {
    const cupon: CuponInterface | null = this.cuponSeleccionado()

    if (!cupon || this.metodoPago() === "puntos") return 0

    return this.totalPesos() * cupon.descuento
  }

  calcularCreditoAplicado(): number {
    if (!this.usarCredito() || this.creditoUsuario() <= 0) return 0

    if (this.metodoPago() === "pesos") {
      const basePesos: number = this.totalPesos() - this.calcularMontoDescontado()
      return Math.min(this.creditoUsuario(), basePesos)
    }

    const basePuntos: number = this.totalPuntos()
    return Math.min(this.creditoUsuario(), basePuntos)
  }

  calcularTotal(): number {
    const creditoAplicado: number = this.calcularCreditoAplicado()

    if (this.metodoPago() === "puntos") return Math.max(0, this.totalPuntos() - creditoAplicado)

    const totalPesosConCupon: number = this.totalPesos() - this.calcularMontoDescontado()
    return Math.max(0, totalPesosConCupon - creditoAplicado)
  }

  confirmarCompra(): void {
    const registrado: boolean = !!this.sesionService.usuarioActual()
    const canje: boolean = registrado && this.metodoPago() === "puntos"
    const total: number = this.calcularTotal()

    if (canje && this.puntosUsuario() < total) return this.toastService.mostrarToast(
      "No disponés de suficientes puntos para realizar esta compra", "error"
    )
    if (registrado && this.verificarCuponRegistro() && this.cuponSeleccionado()?.id !== 1) {
      this.mostrarModalConfirmacion.set(true)
      return
    }

    this.ejecutarConfirmacion()
  }

  ejecutarConfirmacion(): void {
    this.mostrarModalConfirmacion.set(false)
    this.confirmar.emit({
      metodoPago: this.metodoPago(),
      cupon: this.cuponSeleccionado(),
      descuento: this.calcularMontoDescontado(),
      creditoUsado: this.calcularCreditoAplicado(),
      total: this.calcularTotal()
    })
  }

  seleccionarMetodoPago(metodoSeleccionado: string): void {
    this.metodoPago.set(metodoSeleccionado)

    if (metodoSeleccionado === "puntos") this.cuponSeleccionado.set(null)
  }

  cerrarModal(): void { this.cerrar.emit() }
}