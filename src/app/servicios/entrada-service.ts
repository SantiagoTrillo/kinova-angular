import { Service, signal, WritableSignal } from "@angular/core"
import { EntradaInterface } from "../interfaces/entrada-interface"

@Service()
export class EntradaService {
  entradasCompradas: WritableSignal<EntradaInterface[] | null> = signal<EntradaInterface[] | null>(null)

  comprarEntradas(entradas: EntradaInterface[]): void { this.entradasCompradas.set(entradas) }
}