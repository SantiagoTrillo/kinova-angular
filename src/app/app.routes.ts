import { Routes } from '@angular/router'
import { PaginaPrincipal } from "./componentes/pagina-principal/pagina-principal"

export const routes: Routes = [
  {
    path: "",
    component: PaginaPrincipal
  },
  {
    path: "pelicula",
    loadComponent: () =>
      import("./componentes/pagina-pelicula/pagina-pelicula")
        .then((m) => m.PaginaPelicula)
  },
  {
    path: "registro",
    loadComponent: () =>
      import("./componentes/registro/registro")
        .then((m) => m.Registro)
  },
  {
    path: "perfil",
    loadComponent: () =>
      import("./componentes/perfil/perfil")
        .then((m) => m.Perfil)
  },
  {
    path: "**",
    redirectTo: ""
  }
]