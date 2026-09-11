import { Component, inject, signal, WritableSignal } from "@angular/core"
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms"
import { Router } from "@angular/router"
import { SesionService } from "../../servicios/sesion-service"
import { UsuarioInterface } from "../../interfaces/usuario-interface"

@Component({
  selector: "app-registro",
  templateUrl: "./registro.html",
  styleUrl: "./registro.sass",
  imports: [ReactiveFormsModule]
})
export class Registro {
  private formBuilder: FormBuilder = inject(FormBuilder)
  private sesionService: SesionService = inject(SesionService)
  private router: Router = inject(Router)

  registroExitoso: WritableSignal<boolean> = signal<boolean>(false)

  formularioRegistro = this.formBuilder.nonNullable.group({
    correo_electronico: ["", [Validators.required, Validators.email]],
    nombre: ["", [Validators.required, Validators.minLength(2)]],
    apellido: ["", [Validators.required, Validators.minLength(2)]],
    fecha_nacimiento: ["", [Validators.required]],
    tipo_sangre: ["", Validators.required],
    color_ojos: ["", Validators.required],
    dias_vacaciones_anuales: [null as number | null, [Validators.required, Validators.min(0)]]
  })

  registrarUsuario(): void {
    if (this.formularioRegistro.valid) {
      const usuarioNuevo = this.formularioRegistro.getRawValue() as UsuarioInterface

      this.sesionService.registrarUsuario(usuarioNuevo).then(_ => {
        this.registroExitoso.set(true)

        this.router.navigate(["/perfil"])
      })
    }
  }
}