import { DestroyRef, inject, Service, signal, WritableSignal } from "@angular/core"
import { AuditoriaInterface } from "../interfaces/auditoria-interface"
import { SesionService } from "./sesion-service"
import { SupabaseService } from "./supabase-service"
import { ToastService } from "./toast-service"
import { UsuarioInterface } from "../interfaces/usuario-interface"

@Service()
export class AuditoriaService {
  private supabaseService: SupabaseService = inject(SupabaseService)
  private sesionService: SesionService = inject(SesionService)
  private toastService: ToastService = inject(ToastService)
  private destroyRef: DestroyRef = inject(DestroyRef)
  private intervaloAuditorias: any

  auditoriasDisponibles: WritableSignal<AuditoriaInterface[]> = signal<AuditoriaInterface[]>([])

  constructor() {
    this.cargarAuditorias().then(_ => this.intervaloAuditorias = setInterval((): Promise<void> =>
      this.cargarAuditorias(), 1000))

    this.destroyRef.onDestroy((): void => clearInterval(this.intervaloAuditorias))
  }

  async cargarAuditorias(): Promise<void> { this.auditoriasDisponibles.set(await this.obtenerAuditorias()) }

  async obtenerAuditorias(): Promise<AuditoriaInterface[]> {
    const respuesta = await this.supabaseService.cliente.from("auditoria").select("*")
      .order("id", { ascending: false })

    if (respuesta.error || !respuesta.data) {
      if (respuesta.error) this.toastService.mostrarToast("No se pudieron cargar los registros de auditoría", "error")
      return []
    }

    return respuesta.data as AuditoriaInterface[]
  }

  async registrarAccion(accion: string): Promise<void> {
    const usuarioActual: UsuarioInterface | null = this.sesionService.usuarioActual()

    if (!usuarioActual) return

    const respuesta = await this.supabaseService.cliente.from("auditoria").insert({
      usuario_email: usuarioActual.correo_electronico,
      accion: accion
    }).select().single()

    if (!respuesta.error && respuesta.data) {
      this.auditoriasDisponibles.update(registros => [respuesta.data as AuditoriaInterface, ...registros])
    }
  }
}