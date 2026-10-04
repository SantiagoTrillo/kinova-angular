import { Component, inject, OnInit, output, OutputEmitterRef, signal, WritableSignal } from "@angular/core"
import { CurrencyPipe, DatePipe, NgOptimizedImage } from "@angular/common"
import { SesionService } from "../../../servicios/sesion-service"
import { SupabaseService } from "../../../servicios/supabase-service"
import { ToastService } from "../../../servicios/toast-service"
import { CreditoService } from "../../../servicios/credito-service"
import { UsuarioInterface } from "../../../interfaces/usuario-interface"
import { ModalConfirmacion } from "../../modales/modal-confirmacion/modal-confirmacion"

@Component({
  selector: "app-historial-peliculas",
  templateUrl: "./historial-peliculas.html",
  styleUrl: "./historial-peliculas.sass",
  imports: [NgOptimizedImage, ModalConfirmacion, CurrencyPipe, DatePipe]
})
export class HistorialPeliculas implements OnInit {
  private supabaseService: SupabaseService = inject(SupabaseService)
  private sesionService: SesionService = inject(SesionService)
  private toastService: ToastService = inject(ToastService)
  private creditoService: CreditoService = inject(CreditoService)

  creditoActualizado: OutputEmitterRef<void> = output<void>()

  historialPeliculas: WritableSignal<any[]> = signal<any[]>([])
  entradasCancelables: WritableSignal<any[]> = signal<any[]>([])
  mostrarArrepentimiento: WritableSignal<boolean> = signal<boolean>(false)
  entradaSeleccionadaParaCancelar: WritableSignal<any | null> = signal<any | null>(null)
  mostrarModalConfirmacion: WritableSignal<boolean> = signal<boolean>(false)

  async ngOnInit(): Promise<void> { await this.cargarHistorial() }

  private verificarCancelabilidad(entrada: any): boolean {
    if (!entrada.funciones?.fecha_hora) return false

    const fechaFuncion: Date = new Date(entrada.funciones.fecha_hora)
    const ahora: Date = new Date()

    return fechaFuncion.getTime() - ahora.getTime() >= 2 * 60 * 60 * 1000
  }

  protected alternarArrepentimiento(): void { this.mostrarArrepentimiento.update(estado => !estado) }

  protected solicitarCancelacion(entrada: any): void {
    this.entradaSeleccionadaParaCancelar.set(entrada)
    this.mostrarModalConfirmacion.set(true)
  }

  protected async confirmarCancelacion(): Promise<void> {
    const entrada: any = this.entradaSeleccionadaParaCancelar()

    this.mostrarModalConfirmacion.set(false)

    if (!entrada) return

    const respuesta = await this.supabaseService.cliente.from("entradas").delete()
      .eq("id", entrada.id)

    if (respuesta.error) {
      this.toastService.mostrarToast("No se pudo cancelar la entrada", "error")
      return
    }

    await this.creditoService.actualizarCredito(entrada.precio, false)
    this.toastService.mostrarToast(`Compra cancelada. Se reintegraron $${ entrada.precio } en crédito`, "exito")
    this.creditoActualizado.emit()
    await this.cargarHistorial()

    if (this.entradasCancelables().length === 0) this.mostrarArrepentimiento.set(false)
  }

  private async cargarHistorial(): Promise<void> {
    const usuarioActual: UsuarioInterface | null = this.sesionService.usuarioActual()

    if (!usuarioActual) return

    const respuesta: any = await this.supabaseService.cliente.from("entradas")
      .select("*, funciones(*, peliculas(*, resenias(*)))").eq("usuario_id", usuarioActual.id)
      .order("id", { ascending: false })

    if (respuesta.error || !respuesta.data) {
      if (respuesta.error) this.toastService.mostrarToast("No se pudo cargar el historial de mis películas", "error")
      return
    }

    const peliculas: any[] = []
    const entradasCancelables: any[] = []

    for (const entrada of (respuesta.data as any[])) {
      if (this.verificarCancelabilidad(entrada)) entradasCancelables.push(entrada)

      if (entrada.fecha_compra) {
        const fecha: Date = new Date(entrada.fecha_compra)
        const funcion: any = entrada.funciones
        const pelicula: any = funcion?.peliculas

        if (pelicula) {
          const peliculaId: number = pelicula.id
          const fechaFormateada: string = `${ fecha.getDate() }/${ fecha.getMonth() + 1 }/${ fecha.getFullYear() }`

          let peliculaExistente: any = null

          for (const pelicula of peliculas) {
            if (pelicula.peliculaId === peliculaId) {
              peliculaExistente = pelicula
              break
            }
          }

          if (!peliculaExistente) {
            const resenia: any = pelicula.resenias?.[0]

            peliculas.push({
              peliculaId: peliculaId,
              titulo: pelicula.titulo,
              imagen: pelicula.imagen,
              fechasCompra: fechaFormateada,
              calificacion: resenia?.calificacion,
              comentario: resenia?.comentarios
            })
          } else {
            if (!peliculaExistente.fechasCompra.includes(fechaFormateada)) peliculaExistente.fechasCompra += `, ${ fechaFormateada }`
          }
        }
      }
    }
    this.historialPeliculas.set(peliculas)
    this.entradasCancelables.set(entradasCancelables)
  }
}