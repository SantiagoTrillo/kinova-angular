import { Service, signal, WritableSignal } from "@angular/core"
import { UsuarioInterface } from "../interfaces/usuario-interface"

@Service()
export class SesionService {
  usuarioActual: WritableSignal<UsuarioInterface | undefined> = signal<UsuarioInterface | undefined>(undefined)
  usuarios: WritableSignal<UsuarioInterface[]> = signal<UsuarioInterface[]>([])

  registrarse(
    correoElectronico: string, nombre: string, apellido: string, fechaNacimiento: string, tipoSangre: string,
    colorOjos: string, diasVacacionesAnuales: number
  ): void {
    const usuarioNuevo: UsuarioInterface = {
      correoElectronico, nombre, apellido, fechaNacimiento, tipoSangre, colorOjos, diasVacacionesAnuales
    }
    this.usuarioActual.set(usuarioNuevo)
    this.usuarios.update(usuarios => [...usuarios, usuarioNuevo])
  }

  cerrarSesion(): void {
    this.usuarioActual.set(undefined)
  }
}