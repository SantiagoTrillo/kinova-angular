import { Component, inject, Signal, signal, WritableSignal } from "@angular/core"
import { SupabaseService } from "../../servicios/supabase-service"
import { FuncionService } from "../../servicios/funcion-service"

@Component({
  selector: "app-compra",
  templateUrl: "./compra.html",
  styleUrl: "./compra.sass"
})
export class Compra {
  private supabaseService: SupabaseService = inject(SupabaseService)
  private funcionService: FuncionService = inject(FuncionService)

  filas: Signal<string[]> = signal([
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'
  ])
  columnas: Signal<number[][]> = signal([
    [1, 2, 3, 4],
    [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
    [25, 26, 27, 28]
  ])

  butacasOcupadas: WritableSignal<string[]> = signal<string[]>([])
  butacasSeleccionadas: WritableSignal<string[]> = signal<string[]>([])

  async obtenerButacasOcupadas(): Promise<void> {
    const respuesta = await this.supabaseService.cliente.from("entradas")
      .select("butaca").eq("funcion_id", this.funcionService.funcionSeleccionada()?.id)

    if (respuesta.data) {
      this.butacasOcupadas.set(respuesta.data.map(entrada => entrada.butaca))
    }
  }

  ngOnInit() {
    this.obtenerButacasOcupadas()
  }

  seleccionarButaca(butacaSeleccionada: string): void {
    if (!this.butacasOcupadas().includes(butacaSeleccionada)) {
      if (!this.butacasSeleccionadas().includes(butacaSeleccionada)) {
        this.butacasSeleccionadas.update((butacasSeleccionadas: string[]) =>
          [...butacasSeleccionadas, butacaSeleccionada])
      } else {
        this.butacasSeleccionadas.update((butacasSeleccionadas: string[]) =>
          [...butacasSeleccionadas].slice(0, -1))
      }
    }
  }
}