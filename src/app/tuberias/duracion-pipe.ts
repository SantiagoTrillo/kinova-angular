import { Pipe, PipeTransform } from "@angular/core"

@Pipe({ name: "duracion" })
export class DuracionPipe implements PipeTransform {
  transform(minutos: number): string {
    return `${Math.floor(minutos / 60)}h ${minutos % 60}m`
  }
}