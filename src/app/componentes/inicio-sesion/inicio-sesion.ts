import { Component, inject } from "@angular/core"
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms"
import { SesionService } from "../../servicios/sesion-service"
import { Router } from "@angular/router"
import { UsuarioInterface } from "../../interfaces/usuario-interface"

@Component({
  selector: "app-inicio-sesion",
  templateUrl: "./inicio-sesion.html",
  styleUrl: "./inicio-sesion.sass",
  imports: [ReactiveFormsModule]
})
export class InicioSesion {
  private formBuilder: FormBuilder = inject(FormBuilder)
  private sesionService: SesionService = inject(SesionService)
  private router: Router = inject(Router)

  formularioInicioSesion = this.formBuilder.nonNullable.group({
    correo_electronico: ["", [Validators.required, Validators.email]],
    contrasenia: ["", [Validators.required, Validators.minLength(4)]]
  })

  async iniciarSesion(): Promise<void> {
    if (this.formularioInicioSesion.valid) {
      const datosFormulario = this.formularioInicioSesion.getRawValue()
      const usuarioAutenticado: UsuarioInterface | null = await this.sesionService.iniciarSesion(
        datosFormulario.correo_electronico, datosFormulario.contrasenia
      )

      if (usuarioAutenticado) this.router.navigate(["/perfil"])
    }
  }
}