import { Component, computed, input, InputSignal, OnInit, output, OutputEmitterRef, signal, Signal, WritableSignal } from "@angular/core"

@Component({
  selector: "app-selector-hora",
  templateUrl: "./selector-hora.html",
  styleUrl: "./selector-hora.sass"
})
export class SelectorHora implements OnInit {
  protected horas: Signal<number[]> = signal<number[]>([12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
  protected minutos: Signal<number[]> = computed((): number[] => {
    const minutos: number[] = []

    for (let minuto: number = 0; minuto <= 59; minuto++) minutos.push(minuto)

    return minutos
  })
  protected abreviaturas: Signal<string[]> = signal<string[]>(["a. m.", "p. m."])
  protected horaSeleccionada: WritableSignal<number> = signal<number>(0)
  protected minutoSeleccionado: WritableSignal<number> = signal<number>(0)
  protected abreviaturaSeleccionada: WritableSignal<string> = signal<string>("")

  horaInicial: InputSignal<string | undefined> = input<string | undefined>()

  momentoSeleccionado: OutputEmitterRef<string> = output<string>()

  ngOnInit(): void {
    const valor: string | undefined = this.horaInicial()

    if (valor) {
      let horas: number = 0
      let minutos: number = 0

      if (valor.includes(":") && !valor.includes("-") && !valor.includes("T")) {
        const [horasTexto, minutosTexto] = valor.split(":")
        horas = Number(horasTexto)
        minutos = Number(minutosTexto)
      } else {
        const fecha = new Date(valor)

        if (!isNaN(fecha.getTime())) {
          horas = fecha.getHours()
          minutos = fecha.getMinutes()
        }
      }

      const pm: boolean = horas >= 12

      if (horas === 0) horas = 12
      else if (horas > 12) horas -= 12

      this.horaSeleccionada.set(horas)
      this.minutoSeleccionado.set(minutos)
      this.abreviaturaSeleccionada.set(pm ? "p. m." : "a. m.")
    }
    this.seleccionarMomento()
  }

  protected seleccionarHora(horaSeleccionada: string | number): void { this.horaSeleccionada.set(Number(horaSeleccionada)) }

  protected seleccionarMinuto(minutoSeleccionado: string | number): void { this.minutoSeleccionado.set(Number(minutoSeleccionado)) }

  protected seleccionarAbreviatura(abreviaturaSeleccionada: string): void { this.abreviaturaSeleccionada.set(abreviaturaSeleccionada) }

  protected seleccionarMomento(): void {
    let hora: number = this.horaSeleccionada()

    if (this.abreviaturaSeleccionada() === "a. m." && hora === 12) hora = 0
    if (this.abreviaturaSeleccionada() === "p. m." && hora !== 12) hora += 12

    const minutoTexto: string = this.minutoSeleccionado() < 10 ? `0${ this.minutoSeleccionado() }` : `${ this.minutoSeleccionado() }`
    this.momentoSeleccionado.emit(`${ hora }:${ minutoTexto }`)
  }
}