import { Component, inject } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { SesionService } from "../../../servicios/sesion-service"

@Component({
  selector: "app-formulario",
  templateUrl: "./formulario.html",
  styleUrl: "./formulario.sass",
  imports: [ReactiveFormsModule],
})
export class Formulario {
  sesionService: SesionService = inject(SesionService);
  formularioRegistro = new FormGroup({
    correoElectronico: new FormControl("", [Validators.required, Validators.email]),
    nombre: new FormControl("", [Validators.required, Validators.minLength(2)]),
    apellido: new FormControl("", [Validators.required, Validators.minLength(2)]),
    fechaNacimiento: new FormControl("", [Validators.required]),
    tipoSangre: new FormControl("", [Validators.required]),
    colorOjos: new FormControl("", [Validators.required]),
    diasVacacionesAnuales: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
  });

  registrarUsuario(): void {
    const valoresFormulario = this.formularioRegistro.value;
    if (this.formularioRegistro.valid) {
      const usuarioNuevo = {
        correoElectronico: valoresFormulario.correoElectronico!,
        nombre: valoresFormulario.nombre!,
        apellido: valoresFormulario.apellido!,
        fechaNacimiento: valoresFormulario.fechaNacimiento!,
        tipoSangre: valoresFormulario.tipoSangre!,
        colorOjos: valoresFormulario.colorOjos!,
        diasVacacionesAnuales: valoresFormulario.diasVacacionesAnuales!,
      };

      this.sesionService.registrarUsuario(usuarioNuevo)
    }
  }
}