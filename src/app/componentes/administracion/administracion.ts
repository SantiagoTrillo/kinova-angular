import { Component, ElementRef, inject, signal, TemplateRef, ViewChild, WritableSignal } from "@angular/core"
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
import { AuditoriaService } from "../../servicios/auditoria-service"
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
import { Chart } from "chart.js/auto"
import * as XLSX from "xlsx"
import { WorkBook, WorkSheet } from "xlsx"

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
  private funcionService: FuncionService = inject(FuncionService)
  private entradaService: EntradaService = inject(EntradaService)
  private graficoSemana?: Chart
  private graficoMes?: Chart

  protected plantillaSeleccionada: WritableSignal<TemplateRef<any> | null> = signal<TemplateRef<any> | null>(null)
  protected peliculaSeleccionada: WritableSignal<PeliculaInterface | null> = signal<PeliculaInterface | null>(null)
  protected funcionSeleccionada: WritableSignal<FuncionInterface | null> = signal<FuncionInterface | null>(null)
  protected productosSeleccionado: WritableSignal<ProductoInterface | null> = signal<ProductoInterface | null>(null)
  protected cuponSeleccionado: WritableSignal<CuponInterface | null> = signal<CuponInterface | null>(null)
  protected facturacionDiaria: WritableSignal<number> = signal<number>(0)
  protected entradasVendidasDiarias: WritableSignal<number> = signal<number>(0)
  protected productoMasVendido: WritableSignal<any | null> = signal<any | null>(null)

  protected peliculaService: PeliculaService = inject(PeliculaService)
  protected candybarService: CandybarService = inject(CandybarService)
  protected cuponService: CuponService = inject(CuponService)
  protected auditoriaService: AuditoriaService = inject(AuditoriaService)

  @ViewChild("canvasSemana") canvasSemana?: ElementRef<HTMLCanvasElement>
  @ViewChild("canvasMes") canvasMes?: ElementRef<HTMLCanvasElement>

  async ngOnInit(): Promise<void> {
    this.facturacionDiaria.set(await this.entradaService.obtenerFacturacionDiaria())
    this.entradasVendidasDiarias.set(await this.entradaService.obtenerEntradasVendidasDiarias())
  }

  protected async cargarEstadisticasReportes(): Promise<void> {
    await this.cargarProductoMasVendido()
    await this.cargarGraficosPeliculas()
  }

  private async cargarGraficosPeliculas(): Promise<void> {
    const respuesta = await this.supabaseService.cliente.from("entradas")
      .select("fecha_compra, funciones(fecha_hora, peliculas(titulo))")

    if (respuesta.error || !respuesta.data) return

    const hoy: number = Date.now()
    const topSemana: any[] = this.obtenerTopPeliculas(respuesta.data, hoy - 7 * 86400000)
    const topMes: any[] = this.obtenerTopPeliculas(respuesta.data, hoy - 30 * 86400000)

    setTimeout((): void => {
      if (this.canvasSemana?.nativeElement) {
        this.graficoSemana?.destroy()
        this.graficoSemana = this.crearGrafico(this.canvasSemana.nativeElement, topSemana)
      }
      if (this.canvasMes?.nativeElement) {
        this.graficoMes?.destroy()
        this.graficoMes = this.crearGrafico(this.canvasMes.nativeElement, topMes)
      }
    })
  }

  private crearGrafico(canvas: HTMLCanvasElement, datos: any[]): Chart {
    return new Chart(canvas, {
      type: "bar",
      data: {
        labels: datos.map(pelicula => pelicula.titulo),
        datasets: [{ data: datos.map(pelicula => pelicula.cantidad), backgroundColor: "#ff7f00" }]
      },
      options: { plugins: { legend: { display: false } } }
    })
  }

  private obtenerTopPeliculas(entradas: any[], desdeMs: number): any[] {
    const listaPeliculas: any[] = []

    for (const entrada of entradas) {
      const fechaEntrada: number = new Date(entrada.fecha_compra ?? entrada.funciones?.fecha_hora).getTime()
      const tituloPelicula: string = entrada.funciones?.peliculas?.titulo

      if (tituloPelicula && fechaEntrada >= desdeMs) {
        const peliculaExistente = listaPeliculas.find(pelicula => pelicula.titulo === tituloPelicula)
        if (peliculaExistente) peliculaExistente.cantidad++
        else listaPeliculas.push({ titulo: tituloPelicula, cantidad: 1 })
      }
    }

    return listaPeliculas.sort((a, b): number => b.cantidad - a.cantidad).slice(0, 5)
  }

  private async cargarProductoMasVendido(): Promise<void> {
    const respuesta = await this.supabaseService.cliente.from("compras_candybar")
      .select("descripcion")
    const productos: ProductoInterface[] = await this.candybarService.obtenerProductos()

    if (respuesta.error || !respuesta.data) return

    let productoMasVendido: ProductoInterface | null = null
    let mayorNumeroVentas: number = 0

    for (const producto of productos) {
      let ventasProducto: number = 0

      for (const compra of (respuesta.data as any[])) {
        if (compra.descripcion && compra.descripcion.toLowerCase().includes(producto.nombre.toLowerCase())) ventasProducto++
      }

      if (ventasProducto > mayorNumeroVentas) {
        mayorNumeroVentas = ventasProducto
        productoMasVendido = producto
      }
    }

    if (productoMasVendido) this.productoMasVendido.set({ ...productoMasVendido, ventas: mayorNumeroVentas })
  }

  protected exportarPdf(): void { window.print() }

  protected async exportarExcel(): Promise<void> {
    const ventas: any[] = await this.entradaService.obtenerVentasDiariasDetalladas()
    const filas: any[] = ventas.map(venta => ({
      "ID": venta.id, "Película": venta.funciones?.peliculas?.titulo ?? "", "Sala": venta.funciones?.sala_id ?? "",
      "Butaca": venta.butaca ?? "", "Precio": venta.precio ?? 0, "Fecha de Compra": venta.fecha_compra ?? ""
    }))

    const libro: WorkBook = XLSX.utils.book_new()
    const hoja: WorkSheet = XLSX.utils.json_to_sheet(filas)

    XLSX.utils.book_append_sheet(libro, hoja, "Ventas")
    XLSX.writeFile(libro, `reporte_ventas_${ new Date().toISOString().slice(0, 10) }.xlsx`)
  }

  protected async cambiarEstadoElemento(tabla: string, elemento: any, disponible: boolean): Promise<void> {
    const idElemento: number = elemento.id
    const respuesta = await this.supabaseService.cliente.from(tabla).update({ disponible: disponible })
      .eq("id", idElemento)

    if (respuesta.error) return this.toastService.mostrarToast("No se pudo cambiar el estado del elemento", "error")

    const estadoAnterior: string = elemento.disponible ? "Disponible" : "No disponible"
    const estadoNuevo: string = disponible ? "Disponible" : "No disponible"

    let nombreEntidad: string = ""

    if (tabla === "peliculas") {
      nombreEntidad = "película"
      this.peliculaService.actualizarEstado(idElemento, disponible)
    } else if (tabla === "funciones") {
      nombreEntidad = "función"
      this.funcionService.actualizarEstado(idElemento, disponible)
    } else if (tabla === "candybar") {
      nombreEntidad = "producto del candybar"
      this.candybarService.actualizarEstado(idElemento, disponible)
    } else if (tabla === "cupones") {
      nombreEntidad = "cupón"
      this.cuponService.actualizarEstado(idElemento, disponible)
    }

    await this.auditoriaService.registrarAccion(`Modificación de ${ nombreEntidad } (ID: ${ idElemento }, Estado): ${ estadoAnterior } -> ${ estadoNuevo }`)
  }

  protected obtenerFuncionesPelicula(idPelicula: number): FuncionInterface[] {
    return this.funcionService.funcionesDisponibles().filter(funcion => funcion.pelicula_id === idPelicula)
  }

  protected async actualizarCupon(cupon: CuponInterface, nombre: string, descuentoTexto: string): Promise<void> {
    const nombreLimpio: string = nombre.trim()
    const descuento: number = Number(descuentoTexto)

    if (cupon.nombre.trim() === nombreLimpio && Number(cupon.descuento) === descuento) return
    if (!nombreLimpio) return this.toastService.mostrarToast("El nombre del cupón no puede estar vacío", "error")
    if (isNaN(descuento) || descuento <= 0 || descuento >= 1) return this.toastService.mostrarToast("El descuento debe ser mayor a 0 y menor a 1", "error")

    const exito: boolean = await this.cuponService.actualizarCupon(cupon.id, nombreLimpio, descuento)
    if (exito) {
      if (cupon.nombre !== nombreLimpio) await this.auditoriaService.registrarAccion(`Modificación de cupón (ID: ${ cupon.id }, Nombre): "${ cupon.nombre }" -> "${ nombreLimpio }"`)
      if (Number(cupon.descuento) !== descuento) await this.auditoriaService.registrarAccion(`Modificación de cupón (ID: ${ cupon.id }, Descuento): ${ Number(cupon.descuento) * 100 }% -> ${ descuento * 100 }%`)
    }
  }

  protected formatearFecha(fechaIso: string): string {
    if (!fechaIso) return ""

    const fecha: Date = new Date(fechaIso)
    const minutos: number = fecha.getMinutes()
    const segundos: number = fecha.getSeconds()

    return `${ fecha.getDate() }/${ fecha.getMonth() + 1 }/${ fecha.getFullYear() } ${ fecha.getHours() }:${ minutos < 10 ? `0${ minutos }` : minutos }:${ segundos < 10 ? `0${ segundos }` : segundos }`
  }

  protected seleccionarPlantilla(plantilla: TemplateRef<any>): void { this.plantillaSeleccionada.set(plantilla) }

  protected seleccionarPelicula(pelicula: PeliculaInterface): void { this.peliculaSeleccionada.set(pelicula) }

  protected seleccionarFuncion(funcion: FuncionInterface): void { this.funcionSeleccionada.set(funcion) }

  protected seleccionarProducto(producto: ProductoInterface): void { this.productosSeleccionado.set(producto) }

  protected seleccionarCupon(cupon: CuponInterface): void { this.cuponSeleccionado.set(cupon) }
}