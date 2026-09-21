import { Component, inject } from "@angular/core"
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms"
import { EscanerService } from "../../servicios/escaner-service"

@Component({
  selector: "app-escaner",
  templateUrl: "./escaner.html",
  styleUrl: "./escaner.sass",
  imports: [ReactiveFormsModule]
})
export class Escaner {
  private formBuilder: FormBuilder = inject(FormBuilder)
  private escanerService: EscanerService = inject(EscanerService)

  formularioEscaner = this.formBuilder.nonNullable.group({
    codigo_qr: ["", [Validators.required, Validators.minLength(36), Validators.maxLength(36)]],
    tipo_codigo_qr: ["", [Validators.required]]
  })

  async escanearCodigo(): Promise<void> {
    if (this.formularioEscaner.valid) {
      const datosFormulario = this.formularioEscaner.getRawValue()

      await this.escanerService.escanearCodigo(datosFormulario.tipo_codigo_qr, datosFormulario.codigo_qr)
    }
  }
}