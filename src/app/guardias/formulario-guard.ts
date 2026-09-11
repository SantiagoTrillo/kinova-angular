import { ActivatedRouteSnapshot, CanDeactivateFn, RouterStateSnapshot } from "@angular/router"
import { Registro } from "../componentes/registro/registro"

export const formularioGuard: CanDeactivateFn<Registro> = (
  component: Registro, _currentRoute: ActivatedRouteSnapshot, _currentState: RouterStateSnapshot,
  _nextState: RouterStateSnapshot
): boolean => {
  if (component.formularioRegistro.dirty && !component.registroExitoso()) {
    return confirm("Tenés cambios sin guardar. ¿Estás seguro de que querés abandonar la página?")
  } else {
    return true
  }
}