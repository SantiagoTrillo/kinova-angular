import { Component, inject, signal, TemplateRef, WritableSignal } from "@angular/core"
import { CurrencyPipe, DatePipe, NgOptimizedImage, NgTemplateOutlet, TitleCasePipe } from "@angular/common"
import { DuracionPipe } from "../../tuberias/duracion-pipe"
import { PeliculaService } from "../../servicios/pelicula-service"
import { PeliculaInterface } from "../../interfaces/pelicula-interface"
import { FuncionService } from "../../servicios/funcion-service"
import { FuncionInterface } from "../../interfaces/funcion-interface"
import { ReactiveFormsModule } from "@angular/forms"
import { CuponService } from "../../servicios/cupon-service"
import { CuponInterface } from "../../interfaces/cupon-interface"
import { EntradaService } from "../../servicios/entrada-service"
import { ProductoInterface } from "../../interfaces/producto-interface"
import { CandybarService } from "../../servicios/candybar-service"
import { ToastService } from "../../servicios/toast-service"
import { SupabaseService } from "../../servicios/supabase-service"
import { CrearPelicula } from "./plantillas/crear-pelicula/crear-pelicula"
import { ModificarPelicula } from "./plantillas/modificar-pelicula/modificar-pelicula"
import { CrearFuncion } from "./plantillas/crear-funcion/crear-funcion"
import { ModificarFuncion } from "./plantillas/modificar-funcion/modificar-funcion"
import { CrearProducto } from "./plantillas/crear-producto/crear-producto"
import { ModificarProducto } from "./plantillas/modificar-producto/modificar-producto"
import { CrearCupon } from "./plantillas/crear-cupon/crear-cupon"
import { OtorgarCupon } from "./plantillas/otorgar-cupon/otorgar-cupon"

@Component({
  selector: "app-administracion",
  templateUrl: "./administracion.html",
  styleUrl: "./administracion.sass",
  imports: [
    NgOptimizedImage, DuracionPipe, NgTemplateOutlet, DatePipe, ReactiveFormsModule, TitleCasePipe, CurrencyPipe, CrearPelicula,
    ModificarPelicula, CrearFuncion, ModificarFuncion, CrearProducto, ModificarProducto, CrearCupon, OtorgarCupon
  ]
})
export class Administracion {
  private supabaseService: SupabaseService = inject(SupabaseService)
  private toastService: ToastService = inject(ToastService)
  private peliculaService: PeliculaService = inject(PeliculaService)
  private funcionService: FuncionService = inject(FuncionService)
  private candybarService: CandybarService = inject(CandybarService)
  private cuponService: CuponService = inject(CuponService)
  private entradaService: EntradaService = inject(EntradaService)

  protected plantillaSeleccionada: WritableSignal<TemplateRef<any> | null> = signal<TemplateRef<any> | null>(null)
  protected peliculasDisponibles: WritableSignal<PeliculaInterface[]> = this.peliculaService.peliculasDisponibles
  protected peliculaSeleccionada: WritableSignal<PeliculaInterface | null> = signal<PeliculaInterface | null>(null)
  protected funcionesDisponibles: WritableSignal<FuncionInterface[]> = this.funcionService.funcionesDisponibles
  protected funcionSeleccionada: WritableSignal<FuncionInterface | null> = signal<FuncionInterface | null>(null)
  protected productosDisponibles: WritableSignal<ProductoInterface[]> = this.candybarService.productosDisponibles
  protected productosSeleccionado: WritableSignal<ProductoInterface | null> = signal<ProductoInterface | null>(null)
  protected cuponesDisponibles: WritableSignal<CuponInterface[]> = this.cuponService.cuponesDisponibles
  protected cuponSeleccionado: WritableSignal<CuponInterface | null> = signal<CuponInterface | null>(null)
  protected facturacionDiaria: WritableSignal<number> = signal<number>(0)
  protected entradasVendidasDiarias: WritableSignal<number> = signal<number>(0)

  async ngOnInit(): Promise<void> {
    this.facturacionDiaria.set(await this.entradaService.obtenerFacturacionDiaria())
    this.entradasVendidasDiarias.set(await this.entradaService.obtenerEntradasVendidasDiarias())
  }

  protected async cambiarEstadoElemento(tabla: string, idElemento: number, disponible: boolean): Promise<void> {
    const respuesta = await this.supabaseService.cliente.from(tabla).update({ disponible: disponible })
      .eq("id", idElemento)

    if (respuesta.error) {
      this.toastService.mostrarToast("No se pudo cambiar el estado del elemento", "error")
      return
    }

    switch (tabla) {
      case "peliculas":
        this.peliculaService.actualizarEstado(idElemento, disponible)
        break
      case "funciones":
        this.funcionService.actualizarEstado(idElemento, disponible)
        break
      case "candybar":
        this.candybarService.actualizarEstado(idElemento, disponible)
        break
      case "cupones":
        this.cuponService.actualizarEstado(idElemento, disponible)
        break
    }
  }

  protected obtenerFuncionesPelicula(idPelicula: number): FuncionInterface[] {
    return this.funcionesDisponibles().filter(funcion => funcion.pelicula_id === idPelicula)
  }

  protected async actualizarCupon(cupon: CuponInterface, nombre: string, descuentoTexto: string): Promise<void> {
    const nombreLimpio: string = nombre.trim()
    const descuento: number = Number(descuentoTexto)

    if (cupon.nombre.trim() === nombreLimpio && Number(cupon.descuento) === descuento) return

    if (!nombreLimpio) {
      this.toastService.mostrarToast("El nombre del cupón no puede estar vacío", "error")
      return
    }

    if (isNaN(descuento) || descuento <= 0 || descuento >= 1) {
      this.toastService.mostrarToast("El descuento debe ser mayor a 0 y menor a 1", "error")
      return
    }

    await this.cuponService.actualizarCupon(cupon.id, nombreLimpio, descuento)
  }

  protected seleccionarPlantilla(plantillaSeleccionada: TemplateRef<any>): void { this.plantillaSeleccionada.set(plantillaSeleccionada) }

  protected seleccionarPelicula(peliculaSeleccionada: PeliculaInterface): void { this.peliculaSeleccionada.set(peliculaSeleccionada) }

  protected seleccionarFuncion(funcionSeleccionada: FuncionInterface): void { this.funcionSeleccionada.set(funcionSeleccionada) }

  protected seleccionarProducto(productoSeleccionado: ProductoInterface): void { this.productosSeleccionado.set(productoSeleccionado) }

  protected seleccionarCupon(cuponSeleccionado: CuponInterface): void { this.cuponSeleccionado.set(cuponSeleccionado) }
}