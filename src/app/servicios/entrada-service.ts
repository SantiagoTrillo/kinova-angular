import { inject, Service, signal, WritableSignal } from "@angular/core"
import { EntradaInterface } from "../interfaces/entrada-interface"
import { CuponService } from "./cupon-service"
import { SesionService } from "./sesion-service"

@Service()
export class EntradaService {
  private sesionService: SesionService = inject(SesionService)
  private cuponService: CuponService = inject(CuponService)

  entradasCompradas: WritableSignal<EntradaInterface[] | null> = signal<EntradaInterface[] | null>(null)

  comprarEntradas(entradas: EntradaInterface[]): void {
    this.entradasCompradas.set(entradas)
  }
}