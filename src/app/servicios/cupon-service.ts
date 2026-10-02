import { inject, Service, signal } from "@angular/core"
import { SupabaseService } from "./supabase-service"
import { SesionService } from "./sesion-service"
import { CuponInterface } from "../interfaces/cupon-interface"
import { UsuarioInterface } from "../interfaces/usuario-interface"
import { EntradaService } from "./entrada-service"
import { ToastService } from "./toast-service"

@Service()
export class CuponService {
  private supabaseService: SupabaseService = inject(SupabaseService)
  private sesionService: SesionService = inject(SesionService)
  private entradaService: EntradaService = inject(EntradaService)
  private toastService: ToastService = inject(ToastService)

  cuponesDisponibles = signal<CuponInterface[]>([])

  constructor() { this.cargarCupones() }

  private async cargarCupones(): Promise<void> { this.cuponesDisponibles.set(await this.obtenerCupones()) }

  private async obtenerCupones(): Promise<CuponInterface[]> {
    const respuesta = await this.supabaseService.cliente.from("cupones").select("*")
      .order("id", { ascending: true })

    if (respuesta.error || !respuesta.data) {
      if (respuesta.error) this.toastService.mostrarToast("No se pudieron cargar los cupones", "error")
      return []
    }
    return respuesta.data as CuponInterface[]
  }

  async obtenerCuponesUsuario(): Promise<CuponInterface[]> {
    const usuarioActual: UsuarioInterface | null = this.sesionService.usuarioActual()

    if (!usuarioActual) return []

    const respuesta = await this.supabaseService.cliente.from("cupones_usuarios")
      .select("cupones(*)").eq("usuario_id", usuarioActual.id).eq("utilizado", false)

    if (respuesta.error || !respuesta.data) {
      if (respuesta.error) this.toastService.mostrarToast("No se pudieron cargar los cupones del usuario", "error")
      return []
    }

    const cupones: CuponInterface[] = respuesta.data.map((fila: any): CuponInterface => fila.cupones as CuponInterface)
      .filter((cupon: CuponInterface): boolean => cupon && cupon.disponible)
    const primeraCompra: boolean = await this.verificarPrimeraCompra()

    if (!primeraCompra) {
      const cuponRegistro: CuponInterface | undefined = cupones.find((cupon: CuponInterface): boolean => cupon.id === 1)

      if (cuponRegistro) {
        await this.desactivarCuponRegistro()
        return cupones.filter((cupon: CuponInterface): boolean => cupon.id !== 1)
      }
    }
    return cupones
  }

  async verificarPrimeraCompra(): Promise<boolean> {
    const usuarioActual: UsuarioInterface | null = this.sesionService.usuarioActual()

    if (!usuarioActual) return false

    const respuestaCandybar = await this.supabaseService.cliente.from("compras_candybar")
      .select("id").eq("usuario_id", usuarioActual.id)

    if (respuestaCandybar.data?.[0]) return false
    if (this.entradaService.entradasCompradas()) return true

    const respuestaEntradas = await this.supabaseService.cliente.from("entradas")
      .select("id").eq("usuario_id", usuarioActual.id)

    return !respuestaEntradas.data?.[0]
  }

  async canjearCupon(cuponId: number): Promise<void> {
    const usuarioActual: UsuarioInterface | null = this.sesionService.usuarioActual()

    if (!usuarioActual) return this.toastService.mostrarToast("No hay una sesión activa", "error")

    const respuesta = await this.supabaseService.cliente.from("cupones_usuarios")
      .update({ utilizado: true }).eq("usuario_id", usuarioActual.id).eq("cupon_id", cuponId)

    if (respuesta.error) this.toastService.mostrarToast("No se pudo canjear el cupón", "error")
  }

  async desactivarCuponRegistro(): Promise<void> {
    const usuarioActual: UsuarioInterface | null = this.sesionService.usuarioActual()

    if (!usuarioActual) return

    const respuesta = await this.supabaseService.cliente.from("cupones_usuarios")
      .update({ utilizado: true }).eq("usuario_id", usuarioActual.id).eq("cupon_id", 1)

    if (respuesta.error) this.toastService.mostrarToast("No se pudo desactivar el cupón de registro", "error")
  }

  private validarDatosCupon(nombre: string, descuento: number): boolean {
    if (!nombre.trim()) {
      this.toastService.mostrarToast("El nombre del cupón no puede estar vacío", "error")
      return false
    }
    if (descuento === null || descuento === undefined || isNaN(descuento) || descuento <= 0 || descuento >= 1) {
      this.toastService.mostrarToast("El descuento debe ser mayor a 0 y menor a 1", "error")
      return false
    }
    return true
  }

  async crearCupon(nombre: string, descuento: number): Promise<boolean> {
    if (!this.validarDatosCupon(nombre, descuento)) return false

    const respuesta = await this.supabaseService.cliente.from("cupones")
      .insert({ nombre: nombre.trim(), descuento: descuento, disponible: true })

    if (respuesta.error) {
      this.toastService.mostrarToast("No se pudo crear el cupón: " + respuesta.error.message, "error")
      return false
    }
    await this.cargarCupones()
    this.toastService.mostrarToast("Cupón creado con éxito", "exito")
    return true
  }

  async actualizarCupon(idCupon: number, nombre: string, descuento: number): Promise<boolean> {
    if (!this.validarDatosCupon(nombre, descuento)) return false

    const respuesta = await this.supabaseService.cliente.from("cupones")
      .update({ nombre: nombre.trim(), descuento: descuento }).eq("id", idCupon)

    if (respuesta.error) {
      this.toastService.mostrarToast("No se pudo actualizar el cupón: " + respuesta.error.message, "error")
      return false
    }
    await this.cargarCupones()
    this.toastService.mostrarToast("Cupón actualizado con éxito", "exito")
    return true
  }

  actualizarEstado(idCupon: number, disponible: boolean): void {
    this.cuponesDisponibles.update(cupones =>
      cupones.map(cupon => cupon.id === idCupon ? { ...cupon, disponible: disponible } : cupon))
  }

  private calcularEdad(fechaNacimiento: string): number {
    const nacimiento: Date = new Date(fechaNacimiento)
    const hoy: Date = new Date()
    const diferenciaMeses: number = hoy.getMonth() - nacimiento.getMonth()
    let edad: number = hoy.getFullYear() - nacimiento.getFullYear()

    if (diferenciaMeses < 0 || (diferenciaMeses === 0 && hoy.getDate() < nacimiento.getDate())) edad--
    return edad
  }

  async otorgarCupones(idCupon: number, destinatario: string): Promise<boolean> {
    const mayores: boolean = destinatario === "mayores"
    const todos: boolean = destinatario === "todos"

    let usuarios: any[] = []

    if (!mayores && !todos) {
      if (!destinatario.trim()) {
        this.toastService.mostrarToast("Debés ingresar un correo electrónico", "error")
        return false
      }

      const respuesta = await this.supabaseService.cliente.from("usuarios")
        .select("id").eq("correo_electronico", destinatario.trim().toLowerCase()).maybeSingle()

      if (respuesta.error || !respuesta.data) {
        this.toastService.mostrarToast("No se encontró ningún usuario con ese correo", "error")
        return false
      }

      usuarios = [respuesta.data]

    } else {
      const respuesta = await this.supabaseService.cliente.from("usuarios")
        .select("id, fecha_nacimiento")

      if (respuesta.error || !respuesta.data) {
        this.toastService.mostrarToast("No se pudieron consultar los usuarios", "error")
        return false
      }

      usuarios = mayores ? respuesta.data.filter((usuario: any): boolean =>
          usuario.fecha_nacimiento && this.calcularEdad(usuario.fecha_nacimiento) >= 50) : respuesta.data

      if (usuarios.length === 0) {
        this.toastService.mostrarToast(
          mayores ? "No hay usuarios registrados mayores de 50 años" : "No hay usuarios registrados", "error"
        )
        return false
      }
    }

    const respuestaUsuariosExistentes = await this.supabaseService.cliente.from("cupones_usuarios")
      .select("usuario_id").eq("cupon_id", idCupon).eq("utilizado", false)
    const usuariosConCupon: number[] = respuestaUsuariosExistentes.data?.map((cupon: any): number => cupon.usuario_id) ?? []
    const usuariosSinCupon: any[] = usuarios.filter(usuario => !usuariosConCupon.includes(usuario.id))

    if (usuariosSinCupon.length === 0) {
      const mensajeError: string = mayores ? "Todos los usuarios mayores de 50 ya poseen este cupón"
        : (todos ? "Todos los usuarios ya poseen este cupón" : "El usuario ya posee este cupón disponible")

      this.toastService.mostrarToast(mensajeError, "error")
      return false
    }

    const nuevosRegistros = usuariosSinCupon.map(usuario =>
      ({ usuario_id: usuario.id, cupon_id: idCupon, utilizado: false }))

    const respuestaInsert = await this.supabaseService.cliente.from("cupones_usuarios")
      .insert(nuevosRegistros)

    if (respuestaInsert.error) {
      this.toastService.mostrarToast("Error al otorgar cupones: " + respuestaInsert.error.message, "error")
      return false
    }

    const mensajeExito: string = mayores ? `Cupón otorgado a ${ usuariosSinCupon.length } usuario(s) mayor(es) de 50`
      : (todos ? `Cupón otorgado a ${ usuariosSinCupon.length } usuario(s)` : "Cupón otorgado con éxito al usuario")

    this.toastService.mostrarToast(mensajeExito, "exito")
    return true
  }
}