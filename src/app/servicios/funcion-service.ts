import { Service, signal, WritableSignal } from "@angular/core"
import { FuncionInterface } from "../interfaces/funcion-interface"

@Service()
export class FuncionService {
  funcionSeleccionada: WritableSignal<FuncionInterface | null> = signal<FuncionInterface | null>(null)

  seleccionarFuncion(funcion: FuncionInterface) {
    this.funcionSeleccionada.set(funcion)
  }
}