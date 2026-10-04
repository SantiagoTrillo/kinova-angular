import { Component, inject, input, InputSignal, output, OutputEmitterRef } from "@angular/core"
import { CuponInterface } from "../../../../interfaces/cupon-interface"
import { CuponService } from "../../../../servicios/cupon-service"
import { AuditoriaService } from "../../../../servicios/auditoria-service"
import { ToastService } from "../../../../servicios/toast-service"
import { FormsModule } from "@angular/forms"

@Component({
  selector: "app-otorgar-cupon",
  templateUrl: "./otorgar-cupon.html",
  styleUrl: "./otorgar-cupon.sass",
  imports: [FormsModule]
})
export class OtorgarCupon {
  private cuponService: CuponService = inject(CuponService)
  private auditoriaService: AuditoriaService = inject(AuditoriaService)
  private toastService: ToastService = inject(ToastService)

  protected correoUsuario: string = ""

  cuponSeleccionado: InputSignal<CuponInterface | null> = input<CuponInterface | null>(null)
  volver: OutputEmitterRef<void> = output<void>()

  protected async otorgarAUsuario(): Promise<void> {
    const cupon: CuponInterface | null = this.cuponSeleccionado()

    if (!cupon) return
    if (!this.correoUsuario.trim()) return this.toastService.mostrarToast("Debés ingresar un correo electrónico", "error")

    const destinatario: string = this.correoUsuario.trim()
    const otorgado: boolean = await this.cuponService.otorgarCupones(cupon.id, destinatario)

    if (otorgado) {
      await this.auditoriaService.registrarAccion(`Cupón: "${ cupon.nombre }" otorgado a ${ destinatario }`)
      this.correoUsuario = ""
    }
  }

  protected async otorgarAMayores(): Promise<void> {
    const cupon: CuponInterface | null = this.cuponSeleccionado()

    if (!cupon) return

    const otorgado: boolean = await this.cuponService.otorgarCupones(cupon.id, "mayores")

    if (otorgado) {
      await this.auditoriaService.registrarAccion(`Cupón: "${ cupon.nombre }" otorgado a todos los usuarios mayores de 50 años`)
    }
  }

  protected async otorgarATodos(): Promise<void> {
    const cupon: CuponInterface | null = this.cuponSeleccionado()

    if (!cupon) return

    const otorgado: boolean = await this.cuponService.otorgarCupones(cupon.id, "todos")

    if (otorgado) {
      await this.auditoriaService.registrarAccion(`Cupón: "${ cupon.nombre }" otorgado a todos los usuarios`)
    }
  }

  protected regresar(): void { this.volver.emit() }
}