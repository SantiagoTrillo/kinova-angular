import { Pipe, PipeTransform } from "@angular/core"

@Pipe({ name: "duracion" })
export class DuracionPipe implements PipeTransform {
  transform(duracion: number): string {
    const horas: number = Math.floor(duracion / 60)
    const minutos: number = Math.floor(duracion % 60)

    if (horas > 0) {
      if (minutos > 0) return `${horas}h ${minutos}m`
      else return `${horas}h`
    } else return `${minutos}m`
  }
}