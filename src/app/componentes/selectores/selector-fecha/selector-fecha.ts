import { Component, computed, input, InputSignal, OnInit, output, OutputEmitterRef, signal, Signal, WritableSignal } from "@angular/core"

@Component({
  selector: "app-selector-fecha",
  templateUrl: "./selector-fecha.html",
  styleUrl: "./selector-fecha.sass"
})
export class SelectorFecha implements OnInit {
  protected dias: Signal<number[]> = computed((): number[] => {
    const dias: number[] = []
    const mes: number = this.mesSeleccionado()
    const anio: number = this.anioSeleccionado()
    const cantidadDias: number = new Date(anio, mes, 0).getDate()

    for (let dia: number = 1; dia <= cantidadDias; dia++) dias.push(dia)

    return dias
  })
  protected meses: Signal<string[]> = signal<string[]>([
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ])
  protected anios: Signal<number[]> = computed((): number[] => {
    const anios: number[] = []

    for (let anio: number = 2030; anio >= 1906; anio--) anios.push(anio)

    return anios
  })
  protected diaSeleccionado: WritableSignal<number> = signal<number>(0)
  protected mesSeleccionado: WritableSignal<number> = signal<number>(0)
  protected anioSeleccionado: WritableSignal<number> = signal<number>(0)

  fechaInicial: InputSignal<string | undefined> = input<string | undefined>()

  fechaSeleccionada: OutputEmitterRef<string> = output<string>()

  ngOnInit(): void {
    const valor: string | undefined = this.fechaInicial()

    if (valor) {
      if (valor.includes("-")) {
        const partes: string[] = valor.split("T")[0].split("-")

        if (partes.length === 3) {
          this.anioSeleccionado.set(Number(partes[0]))
          this.mesSeleccionado.set(Number(partes[1]))
          this.diaSeleccionado.set(Number(partes[2]))
        }
      } else {
        const fecha = new Date(valor)

        if (!isNaN(fecha.getTime())) {
          this.diaSeleccionado.set(fecha.getDate())
          this.mesSeleccionado.set(fecha.getMonth() + 1)
          this.anioSeleccionado.set(fecha.getFullYear())
        }
      }
    }
    this.seleccionarFecha()
  }

  protected seleccionarDia(diaSeleccionado: string | number): void { this.diaSeleccionado.set(Number(diaSeleccionado)) }

  protected seleccionarMes(mesSeleccionado: string | number): void { this.mesSeleccionado.set(Number(mesSeleccionado)) }

  protected seleccionarAnio(anioSeleccionado: string | number): void { this.anioSeleccionado.set(Number(anioSeleccionado)) }

  protected seleccionarFecha(): void {
    this.fechaSeleccionada.emit(`${ this.anioSeleccionado() }-${ this.mesSeleccionado() }-${ this.diaSeleccionado() }`)
  }
}