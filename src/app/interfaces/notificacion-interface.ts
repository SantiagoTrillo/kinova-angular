import { PeliculaInterface } from "./pelicula-interface"

export interface NotificacionInterface {
  id?: number
  usuario_id: number
  pelicula_id: number
  mensaje: string
  fecha?: string
  leida?: boolean
  peliculas?: PeliculaInterface
}