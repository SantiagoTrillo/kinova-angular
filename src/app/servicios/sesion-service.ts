import { Service, signal, WritableSignal } from "@angular/core"
import { UsuarioInterface } from "../interfaces/usuario-interface"

@Service()
export class SesionService {
  usuarioActual: WritableSignal<UsuarioInterface | undefined> = signal<UsuarioInterface | undefined>(undefined)
  usuariosRegistrados: WritableSignal<UsuarioInterface[]> = signal<UsuarioInterface[]>([])

  registrarUsuario(usuarioNuevo: UsuarioInterface): void {
    this.usuarioActual.set(usuarioNuevo)
    this.usuariosRegistrados.update((usuariosRegistrados) =>
      [...usuariosRegistrados, usuarioNuevo,])
  }

  cerrarSesion(): void {
    this.usuarioActual.set(undefined)
  }
}