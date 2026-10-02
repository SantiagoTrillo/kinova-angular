import { ActivatedRouteSnapshot, CanDeactivateFn, RouterStateSnapshot } from "@angular/router"
import { Registro } from "../componentes/registro/registro"

export const formularioGuard: CanDeactivateFn<Registro> = (
  component: Registro, _currentRoute: ActivatedRouteSnapshot, _currentState: RouterStateSnapshot, nextState: RouterStateSnapshot
): boolean => {
  if (component.formularioRegistro.dirty && !component.registroExitoso() && !component.confirmacionAceptada()) {
    component.solicitarConfirmacionSalida(nextState.url)
    return false
  } else return true
}