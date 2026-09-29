import { Component, inject, signal, TemplateRef, WritableSignal } from "@angular/core"
import {CurrencyPipe, DatePipe, NgOptimizedImage, NgTemplateOutlet, TitleCasePipe} from "@angular/common"
import { DuracionPipe } from "../../tuberias/duracion-pipe"
import { PeliculaService } from "../../servicios/pelicula-service"
import { PeliculaInterface } from "../../interfaces/pelicula-interface"
import { FuncionService } from "../../servicios/funcion-service"
import { FuncionInterface } from "../../interfaces/funcion-interface"
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms"
import { CuponService } from "../../servicios/cupon-service"
import { CuponInterface}  from "../../interfaces/cupon-interface"
import {EntradaService} from "../../servicios/entrada-service";
import {SelectorFecha} from "../selectores/selector-fecha/selector-fecha";
import {SelectorHora} from "../selectores/selector-hora/selector-hora";
import {ProductoInterface} from "../../interfaces/producto-interface";
import {CandybarService} from "../../servicios/candybar-service";

@Component({
  selector: "app-administracion",
  templateUrl: "./administracion.html",
  styleUrl: "./administracion.sass",
  imports: [NgOptimizedImage, DuracionPipe, NgTemplateOutlet, DatePipe, ReactiveFormsModule, TitleCasePipe, CurrencyPipe, SelectorFecha, SelectorHora]
})
export class Administracion {
  private peliculaService: PeliculaService = inject(PeliculaService)
  private funcionService: FuncionService = inject(FuncionService)
  private candybarService: CandybarService = inject(CandybarService)
  private cuponService: CuponService = inject(CuponService)
  private entradaService: EntradaService = inject(EntradaService)
  private formBuilder: FormBuilder = inject(FormBuilder)

  plantillaSeleccionada: WritableSignal<TemplateRef<any> | null> = signal<TemplateRef<any> | null>(null)
  peliculasDisponibles: WritableSignal<PeliculaInterface[]> = signal<PeliculaInterface[]>([])
  peliculaSeleccionada: WritableSignal<PeliculaInterface | null> = signal<PeliculaInterface | null>(null)
  funcionesDisponibles: WritableSignal<FuncionInterface[]> = signal<FuncionInterface[]>([])
  funcionSeleccionada: WritableSignal<FuncionInterface | null> = signal<FuncionInterface | null>(null)
  productosDisponibles: WritableSignal<ProductoInterface[]> = signal<ProductoInterface[]>([])
  productosSeleccionado: WritableSignal<ProductoInterface | null> = signal<ProductoInterface | null>(null)
  cuponesDisponibles: WritableSignal<CuponInterface[]> = signal<CuponInterface[]>([])
  facturacionDiaria: WritableSignal<number> = signal<number>(0)
  entradasVendidasDiarias: WritableSignal<number> = signal<number>(0)

  formularioCreacionFuncion = this.formBuilder.nonNullable.group({
    fecha: ["", Validators.required],
    formato: ["", Validators.required],
    idioma: ["", Validators.required],
    hora: ["", Validators.required],
    precio: [null as number | null, [Validators.required, Validators.min(0)]],
    precio_puntos: [null as number | null, [Validators.required, Validators.min(0)]]
  })

  async ngOnInit(): Promise<void> {
    this.peliculasDisponibles.set(await this.peliculaService.obtenerPeliculas())
    this.funcionesDisponibles.set(await this.funcionService.obtenerFunciones())
    this.productosDisponibles.set(await this.candybarService.obtenerProductos())
    this.cuponesDisponibles.set(await this.cuponService.obtenerCupones())
    this.facturacionDiaria.set(await this.entradaService.obtenerFacturacionDiaria())
    this.entradasVendidasDiarias.set(await this.entradaService.obtenerEntradasVendidasDiarias())
  }

  seleccionarPlantilla(plantillaSeleccionada: TemplateRef<any>): void { this.plantillaSeleccionada.set(plantillaSeleccionada) }

  cambiarEstadoPelicula(estado: boolean, idPelicula: number): void {
    this.peliculaService.cambiarEstadoPelicula(estado, idPelicula).then(_ => this.actualizarSenialPeliculas(idPelicula, estado))
  }

  private actualizarSenialPeliculas(idPelicula: number, estado: boolean): void {
    this.peliculasDisponibles.update(peliculas =>
      peliculas.map(pelicula => pelicula.id === idPelicula ? { ...pelicula, principal: estado } : pelicula))
  }

  obtenerFuncionesPelicula(idPelicula: number): FuncionInterface[] {
    return this.funcionesDisponibles().filter(funcion => funcion.pelicula_id === idPelicula)
  }

  async crearFuncion(): Promise<void> {
    if (!this.formularioCreacionFuncion.valid) return alert("El formulario tiene campos inválidos")

    const datosFormulario = this.formularioCreacionFuncion.getRawValue()
    const peliculaSeleccionada: PeliculaInterface | null = this.peliculaSeleccionada()

    if (!peliculaSeleccionada) return

    const funcionCreada: boolean = await this.funcionService.crearFuncion(datosFormulario, peliculaSeleccionada)

    if (funcionCreada) {
      alert("Función creada con éxito")
      this.funcionesDisponibles.set(await this.funcionService.obtenerFunciones())
    }
  }

  actualizarPrecioPuntos(nuevoPrecio: number, id: number, objeto: string): void {
    if (!nuevoPrecio || nuevoPrecio <= 0) return alert("El nuevo precio debe ser mayor a 0")

    if (objeto === "funcion") {
      this.funcionService.actualizarPrecioPuntos(nuevoPrecio, id).then(_ =>
        this.actualizarSenialFunciones(id, nuevoPrecio))
    } else {
      this.candybarService.actualizarPrecioPuntos(nuevoPrecio, id).then(_ =>
        this.actualizarSenialProductos(id, nuevoPrecio))
    }
  }

  private actualizarSenialFunciones(idFuncion: number, precioPuntos: number): void {
    this.funcionesDisponibles.update(funciones =>
      funciones.map(funcion => funcion.id === idFuncion ? { ...funcion, precio_puntos: precioPuntos } : funcion))
    this.funcionSeleccionada.update(funcion => funcion ? { ...funcion, precio_puntos: precioPuntos } : null)
  }

  private actualizarSenialProductos(idProducto: number, precioPuntos: number): void {
    this.productosDisponibles.update(productos =>
      productos.map(producto => producto.id === idProducto ? { ...producto, precio_puntos: precioPuntos } : producto))
    this.productosSeleccionado.update(producto => producto ? { ...producto, precio_puntos: precioPuntos } : null)
  }

  actualizarDescuentoCupon(nombreCupon: string, nuevoDescuento: number): void {
    if (!nuevoDescuento || nuevoDescuento < 0.1 || nuevoDescuento > 1) return alert("El descuento debe ser mayor que 0 y menor que 1")

    this.cuponService.actualizarDescuentoCupon(nombreCupon, nuevoDescuento).then(_ =>
      this.actualizarSenialCupones(nombreCupon, nuevoDescuento))
  }

  private actualizarSenialCupones(nombreCupon: string, nuevoDescuento: number): void {
    this.cuponesDisponibles.update(cupones => cupones.map(cupon =>
      cupon.nombre === nombreCupon ? { ...cupon, descuento: nuevoDescuento } : cupon))
  }

  seleccionarPelicula(peliculaSeleccionada: PeliculaInterface): void { this.peliculaSeleccionada.set(peliculaSeleccionada) }

  seleccionarFuncion(funcionSeleccionada: FuncionInterface): void { this.funcionSeleccionada.set(funcionSeleccionada) }

  seleccionarProducto(productoSeleccionado: ProductoInterface): void { this.productosSeleccionado.set(productoSeleccionado) }
}