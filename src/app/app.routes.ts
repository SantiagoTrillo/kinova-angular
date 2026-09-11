import { Routes } from '@angular/router'
import { PaginaPrincipal } from "./componentes/pagina-principal/pagina-principal"
import { PaginaPelicula } from "./componentes/pagina-pelicula/pagina-pelicula"
import { sesionGuard } from "./guardias/sesion-guard"
import { formularioGuard } from "./guardias/formulario-guard"

export const routes: Routes = [
  {
    path: "",
    component: PaginaPrincipal
  },
  {
    path: "pelicula",
    component: PaginaPelicula
  },
  {
    path: "compra",
    loadComponent: () =>
      import("./componentes/compra/compra")
        .then((m) => m.Compra)
  },
  {
    path: "registro",
    loadComponent: () =>
      import("./componentes/registro/registro")
        .then((m) => m.Registro),
    canActivate: [sesionGuard],
    canDeactivate: [formularioGuard]
  },
  {
    path: "perfil",
    loadComponent: () =>
      import("./componentes/perfil/perfil")
        .then((m) => m.Perfil),
    canActivate: [sesionGuard]
  },
  {
    path: "**",
    redirectTo: ""
  }
]