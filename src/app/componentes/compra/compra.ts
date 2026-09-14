import { Component, inject, Signal, signal, WritableSignal } from "@angular/core"
import { SupabaseService } from "../../servicios/supabase-service"
import { FuncionService } from "../../servicios/funcion-service"
import { EntradaInterface } from "../../interfaces/entrada-interface"
import { SesionService } from "../../servicios/sesion-service"
import { Router } from "@angular/router"
import { FuncionInterface } from "../../interfaces/funcion-interface"
import { UsuarioInterface } from "../../interfaces/usuario-interface"
import { EntradaService } from "../../servicios/entrada-service"

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
  private router: Router = inject(Router)

  filas: Signal<string[]> = signal([
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'
  ])
  columnas: Signal<number[][]> = signal([
    [1, 2, 3, 4], [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24], [25, 26, 27, 28]
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

  ngOnInit(): void {
    this.obtenerButacasOcupadas()
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

  async confirmarCompra(): Promise<void> {
    const butacasSeleccionadas: string = this.butacasSeleccionadas().join(', ')
    const confirmacion: boolean = confirm(`Seleccionaste las butacas ${butacasSeleccionadas}. ¿Deseás confirmar la compra?`)

    if (confirmacion) {
      const entradas: EntradaInterface[] = this.armarEntradas()
      const respuesta = await this.supabaseService.cliente.from("entradas").insert(entradas)

      if (!respuesta.error) {
        this.router.navigate(["/entrada"])
      }
    }
  }

  armarEntradas(): EntradaInterface[] {
    const funcionComprada: FuncionInterface | null = this.funcionService.funcionSeleccionada()

    if (funcionComprada) {
      const entradasNuevas: EntradaInterface[] = []
      const comprador: UsuarioInterface | null = this.sesionService.usuarioActual()
      const precioFuncion: number = funcionComprada.precio
      const cupon: boolean | undefined = comprador?.cupon_primera_compra
      const precioFinal: number = cupon ? precioFuncion * 0.8 : precioFuncion

      for (const butaca of this.butacasSeleccionadas()) {
        const entradaNueva: EntradaInterface = {
          funcion_id: funcionComprada.id,
          butaca: butaca,
          usuario_id: this.sesionService.usuarioActual()?.id,
          precio: precioFinal,
          codigo_qr: crypto.randomUUID()
        }

        entradasNuevas.push(entradaNueva)
      }

      this.entradaService.comprarEntradas(entradasNuevas)

      return entradasNuevas
    } else {
      return []
    }
  }
}