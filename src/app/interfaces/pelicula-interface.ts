export interface PeliculaInterface {
  id: number
  titulo: string
  sinopsis: string
  duracion: number
  disponible: boolean
  imagen: string
  puntuacion_promedio?: number
  generos: string[]
  restriccion_edad: string
  fecha_estreno: string
}