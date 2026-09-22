import { inject, Service, signal, WritableSignal } from "@angular/core"
import { FuncionInterface } from "../interfaces/funcion-interface"
import { SupabaseService } from "./supabase-service"

@Service()
export class FuncionService {
  private supabaseService: SupabaseService = inject(SupabaseService)

  funcionSeleccionada: WritableSignal<FuncionInterface | null> = signal<FuncionInterface | null>(null)

  async obtenerFunciones(): Promise<FuncionInterface[]> {
    const respuesta = await this.supabaseService.cliente.from("funciones")
      .select("*").gte("fecha_hora", new Date().toISOString()).order("id", { ascending: true })

    if (!respuesta.data) return []

    return respuesta.data as FuncionInterface[]
  }

  seleccionarFuncion(funcion: FuncionInterface): void {
    this.funcionSeleccionada.set(funcion)
  }
}