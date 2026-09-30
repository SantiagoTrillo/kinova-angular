import { Routes } from '@angular/router'
import { PaginaPrincipal } from "./componentes/pagina-principal/pagina-principal"
import { PaginaPelicula } from "./componentes/pagina-pelicula/pagina-pelicula"
import { sesionGuard } from "./guardias/sesion-guard"
import { formularioGuard } from "./guardias/formulario-guard"
import { redireccionGuard } from "./guardias/redireccion-guard"

export const routes: Routes = [
  {
    path: "",
    component: PaginaPrincipal,
    canActivate: [sesionGuard]
  },
  {
    path: "película",
    component: PaginaPelicula,
    canMatch: [redireccionGuard],
    canActivate: [sesionGuard]
  },
  {
    path: "butaca",
    loadComponent: () =>
      import("./componentes/butaca/butaca")
        .then(m => m.Butaca),
    canMatch: [redireccionGuard],
    canActivate: [sesionGuard]
  },
  {
    path: "candybar",
    loadComponent: () =>
      import("./componentes/candybar/candybar")
        .then(m => m.Candybar),
    canActivate: [sesionGuard]
  },
  {
    path: "comprobante",
    loadComponent: () =>
      import("./componentes/comprobante/comprobante")
        .then(m => m.Comprobante),
    canMatch: [redireccionGuard],
    canActivate: [sesionGuard]
  },
  {
    path: "registro",
    loadComponent: () =>
      import("./componentes/registro/registro")
        .then(m => m.Registro),
    canActivate: [sesionGuard],
    canDeactivate: [formularioGuard]
  },
  {
    path: "perfil",
    loadComponent: () =>
      import("./componentes/perfil/perfil")
        .then(m => m.Perfil),
    canActivate: [sesionGuard]
  },
  {
    path: "inicio-sesión",
    loadComponent: () =>
      import("./componentes/inicio-sesion/inicio-sesion")
        .then(m => m.InicioSesion),
    canActivate: [sesionGuard]
  },
  {
    path: "reseña",
    loadComponent: () =>
      import("./componentes/resenia/resenia")
        .then(m => m.Resenia),
    canMatch: [redireccionGuard],
    canActivate: [sesionGuard]
  },
  {
    path: "escáner",
    loadComponent: () =>
      import("./componentes/escaner/escaner")
        .then(m => m.Escaner),
    canMatch: [redireccionGuard]
  },
  {
    path: "administración",
    loadComponent: () =>
      import("./componentes/administracion/administracion")
        .then(m => m.Administracion),
    canMatch: [redireccionGuard]
  },
  {
    path: "**",
    redirectTo: ""
  }
]