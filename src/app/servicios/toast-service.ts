import { Service, signal, WritableSignal } from "@angular/core"

@Service()
export class ToastService {
  mensaje: WritableSignal<string> = signal<string>("")
  tipo: WritableSignal<string> = signal<string>("")
  visible: WritableSignal<boolean> = signal<boolean>(false)

  private temporizador: any = null

  mostrarToast(mensaje: string, tipo: string): void {
    if (this.temporizador) clearTimeout(this.temporizador)

    this.mensaje.set(mensaje)
    this.tipo.set(tipo)
    this.visible.set(true)
    this.temporizador = setTimeout((): void => { this.visible.set(false) }, 4000)
  }
}