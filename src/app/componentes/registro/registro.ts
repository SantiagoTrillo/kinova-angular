import { Component, inject, signal, WritableSignal } from "@angular/core"
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms"
import { Router } from "@angular/router"
import { SesionService } from "../../servicios/sesion-service"
import { UsuarioInterface } from "../../interfaces/usuario-interface"
import { SupabaseService } from "../../servicios/supabase-service"
import { SelectorFecha } from "../selectores/selector-fecha/selector-fecha"
import { ToastService } from "../../servicios/toast-service"
import { ModalConfirmacion } from "../modales/modal-confirmacion/modal-confirmacion"

@Component({
  selector: "app-registro",
  templateUrl: "./registro.html",
  styleUrl: "./registro.sass",
  imports: [ReactiveFormsModule, SelectorFecha, ModalConfirmacion]
})
export class Registro {
  private supabaseService: SupabaseService = inject(SupabaseService)
  private formBuilder: FormBuilder = inject(FormBuilder)
  private sesionService: SesionService = inject(SesionService)
  private toastService: ToastService = inject(ToastService)
  private router: Router = inject(Router)

  registroExitoso: WritableSignal<boolean> = signal<boolean>(false)
  confirmacionAceptada: WritableSignal<boolean> = signal<boolean>(false)
  mostrarModalConfirmacion: WritableSignal<boolean> = signal<boolean>(false)
  rutaDestino: WritableSignal<string> = signal<string>("")

  formularioRegistro = this.formBuilder.nonNullable.group({
    correo_electronico: ["", [Validators.required, Validators.email]],
    contrasenia: ["", [Validators.required, Validators.minLength(4)]],
    nombre: ["", [Validators.required, Validators.minLength(2)]],
    apellido: ["", [Validators.required, Validators.minLength(2)]],
    fecha_nacimiento: [new Date().toISOString().split("T")[0], Validators.required],
    tipo_sangre: ["", Validators.required],
    color_ojos: ["", Validators.required],
    dias_vacaciones_anuales: [null as number | null, [Validators.required, Validators.min(0)]]
  })

  protected async registrarUsuario(): Promise<void> {
    if (this.formularioRegistro.valid) {
      const datosFormulario = this.formularioRegistro.getRawValue() as UsuarioInterface
      const usuarioRegistrado: UsuarioInterface | null = await this.sesionService.registrarUsuario(datosFormulario)

      if (usuarioRegistrado) {
        this.registroExitoso.set(true)
        await this.otorgarCuponRegistro(usuarioRegistrado)
        this.router.navigate(["/perfil"])
      }
    }
  }

  protected async otorgarCuponRegistro(usuario: UsuarioInterface): Promise<void> {
    const cuponRegistro = { usuario_id: usuario.id, cupon_id: 1, utilizado: false }
    const respuesta = await this.supabaseService.cliente.from("cupones_usuarios").insert(cuponRegistro)

    if (respuesta.error) return this.toastService.mostrarToast("No se pudo otorgar el cupón de registro", "error")
  }

  solicitarConfirmacionSalida(url: string): void {
    this.rutaDestino.set(url)
    this.mostrarModalConfirmacion.set(true)
  }

  protected aceptarSalida(): void {
    this.confirmacionAceptada.set(true)
    this.mostrarModalConfirmacion.set(false)
    this.router.navigate([this.rutaDestino()])
  }

  protected cancelarSalida(): void { this.mostrarModalConfirmacion.set(false) }
}