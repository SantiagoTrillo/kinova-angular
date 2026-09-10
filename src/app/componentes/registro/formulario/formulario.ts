import { Component, inject } from "@angular/core"
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms"
import { SesionService } from "../../../servicios/sesion-service"
import { Router } from "@angular/router"
import { UsuarioInterface } from "../../../interfaces/usuario-interface"

@Component({
  selector: "app-formulario",
  templateUrl: "./formulario.html",
  styleUrl: "./formulario.sass",
  imports: [ReactiveFormsModule]
})
export class Formulario {
  sesionService: SesionService = inject(SesionService)
  private router: Router = inject(Router)
  formularioRegistro = new FormGroup({
    correoElectronico: new FormControl("", { nonNullable: true, validators: [Validators.required, Validators.email] }),
    nombre: new FormControl("", { nonNullable: true, validators: [Validators.required, Validators.minLength(2)] }),
    apellido: new FormControl("", { nonNullable: true, validators: [Validators.required, Validators.minLength(2)] }),
    fechaNacimiento: new FormControl("", { nonNullable: true, validators: [Validators.required] }),
    tipoSangre: new FormControl("", { nonNullable: true, validators: [Validators.required] }),
    colorOjos: new FormControl("", { nonNullable: true, validators: [Validators.required] }),
    diasVacacionesAnuales: new FormControl<number | null>(null, { nonNullable: true, validators: [Validators.required, Validators.min(0)] })
  })

  registrarUsuario(): void {
    if (this.formularioRegistro.valid) {
      const usuarioNuevo = this.formularioRegistro.getRawValue() as UsuarioInterface

      this.sesionService.registrarUsuario(usuarioNuevo)
      this.router.navigate(["/perfil"])
    }
  }
}