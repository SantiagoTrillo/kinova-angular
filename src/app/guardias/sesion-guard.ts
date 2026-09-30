import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from "@angular/router"
import { SesionService } from "../servicios/sesion-service"
import { inject } from "@angular/core"

export const sesionGuard: CanActivateFn = (_route: ActivatedRouteSnapshot, state: RouterStateSnapshot): true | UrlTree => {
  const sesionService: SesionService = inject(SesionService)
  const router: Router = inject(Router)
  const rutasCliente: string[] = ["/", "/película", "/reseña", "/butaca", "/comprobante", "/candybar"]

  if (sesionService.usuarioActual()?.rol === "Empleado" && rutasCliente.includes(decodeURI(state.url))) {
    return router.createUrlTree(["/escáner"])
  } else if (state.url === "/registro" || decodeURI(state.url) === "/inicio-sesión") {
    if (!sesionService.usuarioActual()) return true
    else return router.createUrlTree(["/perfil"])
  } else if (state.url === "/perfil") {
    if (sesionService.usuarioActual()) return true
    else return router.createUrlTree(["/inicio-sesión"])
  } else return true
}