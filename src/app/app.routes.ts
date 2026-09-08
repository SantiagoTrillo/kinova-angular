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
      import("./componentes/tarjeta-pelicula/detalle-pelicula/detalle-pelicula")
        .then((m) => m.DetallePelicula)
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