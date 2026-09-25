# Kinova - Primer Parcial de Programación IV

Single Page Application desarrollada en Angular como proyecto académico para el segundo parcial de la materia Programación I en la UTN FRA.

## Descripción
Aplicación de administración y consumo de un cine, con cartelera, selección de horarios, reserva de butacas en tiempo real, candy bar y administración desarrollada en base a una arquitectura basada en componentes Standalone y señales.
## Tecnologías
- Angular 22
- TypeScript
- SASS
- Supabase
- Firebase Hosting
- PWA
- Font Awesome & Google Fonts

## Estructura del proyecto
- `src/app/`: código fuente principal de la aplicación Angular
  - `componentes/`: vistas modulares y componentes de la interfaz de usuario
  - `servicios/`: lógica de negocio
  - `guardias/`: protección de rutas de navegación
  - `interfaces/`: contratos de datos
  - `directivas/`: directivas de comportamiento personalizadas
  - `app.config.ts` y `app.routes.ts`: configuración global de proveedores y rutas
- `public/`: recursos estáticos públicos
- `angular.json` & `firebase.json`: configuraciones de compilación del proyecto y reglas de despliegue

## Ejecución

### 1. Clonar el repositorio
Clonate el repositorio en tu máquina local y posicionate en el directorio raíz del mismo:
```bash
git clone <SantiagoTrillo/kinova-angular>
cd kinova-angular
```

### 2. Instalar dependencias
Instalá los paquetes necesarios respetando la resolución de dependencias entre módulos:
```bash
npm install --legacy-peer-deps
```

### 3. Iniciar el servidor de desarrollo
Iniciá el servidor local de Angular CLI:
```bash
ng serve -o
```
La aplicación va a estar disponible y lista para usar en `http://localhost:4200/`.

## Soluciones técnicas
- **Asignación automática de salas:** algoritmo que detecta salas libres asegurando que no existan superposiciones, considerando la duración de la película más los 30 de descanso entre cada función.
- **Matriz de 560 butacas y cambio de estado en tiempo real:** representación de la cuadrícula física 4-20-4 mediante señales reactivas y sincronización de butacas ocupadas en tiempo real entre múltiples clientes concurrentes mediante actualización periódica a Supabase.
- **Emisión de tickets con código QR y PDF:** generación de identificadores únicos UUID para entradas y compras del candybar y exportación a PDF.
- **Validación de código QR vía escáner:** módulo de escáner para empleados que consulta la compra en Supabase y marca el comprobante como no válido para impedir su reutilización tras la entrega.
- **Cálculo de calificaciones y promedios de películas:** sistema de calificación de 1 a 5 estrellas con cálculo de la puntuación promedio de las películas ante cada nueva reseña.
- **Gestión de cupones:** detección y aplicación automática del mejor cupón de descuento disponible para el usuario autenticado sobre el total de la compra.