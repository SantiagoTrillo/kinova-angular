import { Component, inject, signal, WritableSignal } from "@angular/core"
import { CuponService } from "../../../servicios/cupon-service"
import { CuponInterface } from "../../../interfaces/cupon-interface"

@Component({
  selector: "app-cupones",
  templateUrl: "./cupones.html",
  styleUrl: "./cupones.sass",
})
export class Cupones {
  private cuponService: CuponService = inject(CuponService)

  cuponesDisponibles: WritableSignal<CuponInterface[]> = signal<CuponInterface[]>([])

  async ngOnInit() { this.cuponesDisponibles.set(await this.cuponService.obtenerCuponesUsuario()) }
}