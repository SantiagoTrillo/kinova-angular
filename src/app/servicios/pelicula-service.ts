import { inject, Service } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { PeliculaInterface } from "../interfaces/pelicula-interface"
import { Observable } from "rxjs"

@Service()
export class PeliculaService {
  private http: HttpClient = inject(HttpClient)

  obtenerPeliculas(): Observable<PeliculaInterface[]> {
    return this.http.get<PeliculaInterface[]>("peliculas.json")
  }
}