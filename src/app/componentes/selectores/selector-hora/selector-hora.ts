import { Component, computed, output, OutputEmitterRef, signal, Signal, WritableSignal } from "@angular/core"

@Component({
  selector: "app-selector-hora",
  templateUrl: "./selector-hora.html",
  styleUrl: "./selector-hora.sass"
})
export class SelectorHora {
  protected readonly Number: NumberConstructor = Number

  horas: Signal<number[]> = signal<number[]>([12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
  minutos: Signal<number[]> = computed((): number[] => {
    const minutos: number[] = []

    for (let minuto: number = 0; minuto <= 59; minuto++) minutos.push(minuto)

    return minutos
  })
  abreviaturas: Signal<string[]> = signal<string[]>(["a. m.", "p. m."])

  horaSeleccionada: WritableSignal<number> = signal<number>(12)
  minutoSeleccionado: WritableSignal<number> = signal<number>(0)
  abreviaturaSeleccionada: WritableSignal<string> = signal<string>("a. m.")

  momentoSeleccionado: OutputEmitterRef<string> = output<string>()

  ngOnInit(): void { this.seleccionarMomento() }

  seleccionarHora(horaSeleccionada: number): void { this.horaSeleccionada.set(horaSeleccionada) }

  seleccionarMinuto(minutoSeleccionado: number): void { this.minutoSeleccionado.set(minutoSeleccionado) }

  seleccionarAbreviatura(abreviaturaSeleccionada: string): void { this.abreviaturaSeleccionada.set(abreviaturaSeleccionada) }

  seleccionarMomento(): void {
    let hora: number = this.horaSeleccionada()

    if (this.abreviaturaSeleccionada() === "a. m." && hora === 12) hora = 0
    if (this.abreviaturaSeleccionada() === "p. m." && hora !== 12) hora += 12

    this.momentoSeleccionado.emit(`${ hora }:${ this.minutoSeleccionado() }`)
  }
}