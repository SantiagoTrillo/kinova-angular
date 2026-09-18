import { Component, inject, signal, WritableSignal } from "@angular/core"
import { Cartelera } from "./cartelera/cartelera"
import { PeliculaInterface } from "../../interfaces/pelicula-interface"
import { PeliculaService } from "../../servicios/pelicula-service"
import { SupabaseService } from "../../servicios/supabase-service"
import { TarjetaPelicula } from "./cartelera/tarjeta-pelicula/tarjeta-pelicula"

@Component({
  selector: "app-pagina-principal",
  templateUrl: "./pagina-principal.html",
  styleUrl: "./pagina-principal.sass",
  imports: [Cartelera, TarjetaPelicula]
})
export class PaginaPrincipal {
  private peliculaService: PeliculaService = inject(PeliculaService)
  private supabaseService: SupabaseService = inject(SupabaseService)

  peliculas: WritableSignal<PeliculaInterface[]> = signal<PeliculaInterface[]>([])
  exitosTaquilleros: WritableSignal<PeliculaInterface[]> = signal<PeliculaInterface[]>([])

  ngOnInit(): void {
    this.peliculaService.obtenerPeliculas().then(peliculas => {
      this.peliculas.set(peliculas)

      this.calcularExitosTaquilleros()
    })
  }

  async calcularExitosTaquilleros(): Promise<void> {
    const respuesta = await this.supabaseService.cliente.from("entradas")
      .select("funciones(pelicula_id)")

    if (respuesta.data) {
      const idsPeliculasVendidas: number[] = respuesta.data.map((fila: any): number => fila.funciones.pelicula_id)
      const peliculasOrdenadas: PeliculaInterface[] = [...this.peliculas()].sort(
        (peliculaA: PeliculaInterface, peliculaB: PeliculaInterface
      ): number => {
        const ventasPeliculaA: number = idsPeliculasVendidas.filter(id => id === peliculaA.id).length
        const ventasPeliculaB: number = idsPeliculasVendidas.filter(id => id === peliculaB.id).length
        return ventasPeliculaB - ventasPeliculaA
      })

      this.exitosTaquilleros.set(peliculasOrdenadas.slice(0, 3))
    }
  }
}