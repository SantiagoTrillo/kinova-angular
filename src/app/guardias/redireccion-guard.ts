import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from "@angular/router"
import { inject } from "@angular/core"
import { PeliculaService } from "../servicios/pelicula-service"
import { FuncionService } from "../servicios/funcion-service"
import { EntradaService } from "../servicios/entrada-service"

export const redireccionGuard: CanActivateFn = (_route: ActivatedRouteSnapshot, state: RouterStateSnapshot): true | UrlTree => {
  const peliculaService: PeliculaService = inject(PeliculaService)
  const funcionService: FuncionService = inject(FuncionService)
  const entradaService: EntradaService = inject(EntradaService)
  const router: Router = inject(Router)

  if (state.url === "/pelicula") {
    if (peliculaService.peliculaSeleccionada()) {
      return true
    } else {
      return router.createUrlTree([""])
    }
  } else if (state.url === "/compra") {
    if (funcionService.funcionSeleccionada()) {
      return true
    } else {
      return router.createUrlTree([""])
    }
  } else if (state.url === "/entrada") {
    if (entradaService.entradasCompradas()) {
      return true
    } else {
      return router.createUrlTree([""])
    }
  } else if (decodeURI(state.url) === "/reseña") {
    if (peliculaService.peliculaSeleccionada()) {
      return true
    } else {
      return router.createUrlTree([""])
    }
  } else {
    return true
  }
}