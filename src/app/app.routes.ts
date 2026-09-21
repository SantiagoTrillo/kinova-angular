import { Routes } from '@angular/router'
import { PaginaPrincipal } from "./componentes/pagina-principal/pagina-principal"
import { PaginaPelicula } from "./componentes/pagina-pelicula/pagina-pelicula"
import { sesionGuard } from "./guardias/sesion-guard"
import { formularioGuard } from "./guardias/formulario-guard"
import { redireccionGuard } from "./guardias/redireccion-guard"

export const routes: Routes = [
  {
    path: "",
    component: PaginaPrincipal
  },
  {
    path: "pelicula",
    component: PaginaPelicula,
    canActivate: [redireccionGuard]
  },
  {
    path: "compra",
    loadComponent: () =>
      import("./componentes/compra/compra")
        .then(m => m.Compra),
    canActivate: [redireccionGuard]
  },
  {
    path: "candybar",
    loadComponent: () =>
      import("./componentes/candybar/candybar")
        .then(m => m.Candybar),
    canActivate: [redireccionGuard]
  },
  {
    path: "entrada",
    loadComponent: () =>
      import("./componentes/entrada/entrada")
        .then(m => m.Entrada),
    canActivate: [redireccionGuard]
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
    path: "inicio-sesion",
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
    canActivate: [redireccionGuard]
  },
  {
    path: "**",
    redirectTo: ""
  }
]