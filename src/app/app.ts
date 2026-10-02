import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { Navbar } from "./componentes/navbar/navbar"
import { Toast } from "./componentes/toast/toast"

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.sass',
  imports: [RouterOutlet, Navbar, Toast]
})
export class App {}