import { CanMatchFn, Route, UrlSegment } from "@angular/router"
import { inject } from "@angular/core"
import { PeliculaService } from "../servicios/pelicula-service"
import { FuncionService } from "../servicios/funcion-service"
import { EntradaService } from "../servicios/entrada-service"
import { SesionService } from "../servicios/sesion-service"
import { CandybarService } from "../servicios/candybar-service"

export const redireccionGuard: CanMatchFn = (route: Route, _segments: UrlSegment[]): boolean => {
  const peliculaService: PeliculaService = inject(PeliculaService)
  const funcionService: FuncionService = inject(FuncionService)
  const entradaService: EntradaService = inject(EntradaService)
  const candybarService: CandybarService = inject(CandybarService)
  const sesionService: SesionService = inject(SesionService)

  if (route.path === "película" || route.path === "reseña") {
    return !!peliculaService.peliculaSeleccionada()
  } else if (route.path === "butaca") {
    return !!funcionService.funcionSeleccionada()
  } else if (route.path === "comprobante") {
    return !!entradaService.entradasCompradas() || !!candybarService.compraCandybar()
  } else if (route.path === "escáner") {
    return sesionService.usuarioActual()?.rol === "Empleado" || sesionService.usuarioActual()?.rol === "Administrador"
  } else if (route.path === "administración") {
    return sesionService.usuarioActual()?.rol === "Administrador"
  } else return true
}