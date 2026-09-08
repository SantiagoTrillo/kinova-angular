import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { Navbar } from "./componentes/navbar/navbar"

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.sass',
  imports: [RouterOutlet, Navbar]
})
export class App {}