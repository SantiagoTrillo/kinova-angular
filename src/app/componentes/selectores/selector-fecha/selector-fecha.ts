import { Component, computed, output, OutputEmitterRef, signal, Signal, WritableSignal } from "@angular/core"

@Component({
  selector: "app-selector-fecha",
  templateUrl: "./selector-fecha.html",
  styleUrl: "./selector-fecha.sass"
})
export class SelectorFecha {
  protected readonly Number: NumberConstructor = Number

  dias: Signal<number[]> = computed((): number[] => {
    const dias: number[] = []
    const mes: number = this.mesSeleccionado()
    const anio: number = this.anioSeleccionado()
    const cantidadDias: number = new Date(anio, mes, 0).getDate()

    for (let dia: number = 1; dia <= cantidadDias; dia++) dias.push(dia)

    return dias
  })
  meses: Signal<string[]> = signal<string[]>([
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ])
  anios: Signal<number[]> = computed((): number[] => {
    const anios: number[] = []

    for (let anio: number = 2026; anio >= 1906; anio--) anios.push(anio)

    return anios
  })

  diaSeleccionado: WritableSignal<number> = signal<number>(1)
  mesSeleccionado: WritableSignal<number> = signal<number>(1)
  anioSeleccionado: WritableSignal<number> = signal<number>(2026)

  fechaSeleccionada: OutputEmitterRef<string> = output<string>()

  ngOnInit(): void { this.seleccionarFecha() }

  seleccionarDia(diaSeleccionado: number): void { this.diaSeleccionado.set(diaSeleccionado) }

  seleccionarMes(mesSeleccionado: number): void { this.mesSeleccionado.set(mesSeleccionado) }

  seleccionarAnio(anioSeleccionado: number): void { this.anioSeleccionado.set(anioSeleccionado) }

  seleccionarFecha(): void {
    this.fechaSeleccionada.emit(`${ this.anioSeleccionado() }-${ this.mesSeleccionado() }-${ this.diaSeleccionado() }`)
  }
}