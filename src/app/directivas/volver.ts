import { Directive, HostListener, inject } from "@angular/core"
import { Location } from "@angular/common"

@Directive({selector: "[appVolver]"})
export class Volver {
  private location: Location = inject(Location)

  @HostListener("click")
  volverAtras(): void { this.location.back() }
}