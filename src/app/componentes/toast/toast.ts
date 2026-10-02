import { Component, inject } from "@angular/core"
import { ToastService } from "../../servicios/toast-service"

@Component({
  selector: "app-toast",
  templateUrl: "./toast.html",
  styleUrl: "./toast.sass"
})
export class Toast { toastService: ToastService = inject(ToastService) }