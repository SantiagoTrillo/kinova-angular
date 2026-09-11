import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from "@angular/router"
import { SesionService } from "../servicios/sesion-service"
import { inject } from "@angular/core"

export const sesionGuard: CanActivateFn = (_route: ActivatedRouteSnapshot, state: RouterStateSnapshot): true | UrlTree => {
  const sesionService: SesionService = inject(SesionService)
  const router: Router = inject(Router)

  if (state.url === "/registro") {
    if (!sesionService.usuarioActual()) {
      return true
    } else {
      return router.createUrlTree(["/perfil"])
    }
  } else if (state.url === "/perfil") {
    if (sesionService.usuarioActual()) {
      return true
    } else {
      return router.createUrlTree(["/registro"])
    }
  } else {
    return true
  }
}