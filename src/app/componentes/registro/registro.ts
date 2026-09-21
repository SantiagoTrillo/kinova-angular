import { Component, inject, signal, WritableSignal } from "@angular/core"
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms"
import { Router, RouterLink } from "@angular/router"
import { SesionService } from "../../servicios/sesion-service"
import { UsuarioInterface } from "../../interfaces/usuario-interface"
import { SupabaseService } from "../../servicios/supabase-service"

@Component({
  selector: "app-registro",
  templateUrl: "./registro.html",
  styleUrl: "./registro.sass",
  imports: [ReactiveFormsModule, RouterLink]
})
export class Registro {
  private supabaseService: SupabaseService = inject(SupabaseService)
  private formBuilder: FormBuilder = inject(FormBuilder)
  private sesionService: SesionService = inject(SesionService)
  private router: Router = inject(Router)

  registroExitoso: WritableSignal<boolean> = signal<boolean>(false)

  formularioRegistro = this.formBuilder.nonNullable.group({
    correo_electronico: ["", [Validators.required, Validators.email]],
    contrasenia: ["", [Validators.required, Validators.minLength(4)]],
    nombre: ["", [Validators.required, Validators.minLength(2)]],
    apellido: ["", [Validators.required, Validators.minLength(2)]],
    fecha_nacimiento: ["", [Validators.required]],
    tipo_sangre: ["", Validators.required],
    color_ojos: ["", Validators.required],
    dias_vacaciones_anuales: [null as number | null, [Validators.required, Validators.min(0)]]
  })

  async registrarUsuario(): Promise<void> {
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

  async otorgarCuponRegistro(usuario: UsuarioInterface): Promise<void> {
    const cuponRegistro = {usuario_id: usuario.id, cupon_id: 1, utilizado: false}

    const respuesta = await this.supabaseService.cliente.from("cupones_usuarios").insert(cuponRegistro)

    if (respuesta.error) {
      console.error(respuesta.error)
    }
  }
}