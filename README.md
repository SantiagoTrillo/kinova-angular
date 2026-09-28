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
- **Asignación automática de salas:** algoritmo que detecta salas libres asegurando que no existan superposiciones horarias, considerando la duración de la película más los 30 minutos de descanso entre cada función, e informando las funciones en conflicto cuando no hay disponibilidad.
- **Matriz de 518 butacas con sector accesible y tiempo real:** representación de la cuadrícula física 4-20-4 junto con la fila J de butacas accesibles (disposición 2-10-2) y espacio en fila K mediante señales reactivas, con sincronización de butacas ocupadas en tiempo real hacia Supabase.
- **Ranking de éxitos taquilleros y filtrado en tiempo real:** determinación de las 3 películas con mayor cantidad de entradas vendidas y filtrado dinámico de la cartelera combinando búsqueda por título y selección de género.
- **Validación de restricción de edad:** verificación automática de la clasificación de la película (`ATP`, `+13`, `+18`) calculando la edad del usuario a partir de su fecha de nacimiento y restringiendo la compra a usuarios anónimos o menores de la edad requerida.
- **Emisión de ticket unificado con código QR y PDF:** generación de un UUID compartido para las entradas y la compra del candybar dentro de un mismo comprobante exportable a PDF.
- **Validación de código QR vía escáner:** módulo de escáner para empleados que verifica la validez de las entradas o compras del candybar en Supabase e invalida el código tras su uso para impedir su reutilización.
- **Cálculo de calificaciones y promedios de películas:** sistema de valoración de 1 a 5 estrellas con actualización automática de la puntuación promedio de cada película ante cada nueva reseña publicada.
- **Gestión de cupones y beneficios:** otorgamiento de cupones de bienvenida, cupones para mayores de 50 años y aplicación automática del mejor cupón de descuento disponible sobre el total de la compra, con porcentaje configurable desde administración.
- **Reportes diarios de ventas y facturación:** cálculo en el panel de administración del total recaudado y la cantidad de entradas vendidas en el día a partir de la fecha de compra registrada.
- **Selectores personalizados de fecha y hora:** componentes basados en señales computadas que reemplazan los selectores predeterminados del navegador