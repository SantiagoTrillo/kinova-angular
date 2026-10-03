# Documento de Requerimientos

## 1. Requerimientos Funcionales

### 1.1. Películas
Cada película registrada en el sistema debe contar obligatoriamente con:
- **Título.**
- **Póster.**
- **Sinopsis.**
- **Duración**.
- **Puntuación promedio.**
- **Géneros.**
- **Restricción de edad**.

### 1.2. Cartelera
La página principal del cine debe contar con:
- **Éxitos taquilleros**: sección donde se muestran las **3 películas más vendidas**.
- **Búsqueda y filtrado:** el listado de películas debe incorporar una barra de búsqueda para filtrar la cartelera en tiempo real según el título ingresado y/o el género seleccionado.
- **Películas en preventa**: las entradas deben habilitarse 7 días antes del estreno y deberán contar con un precio especial, que volverá al normal al finalizar el período.
- **Películas a estrenar**: sección con películas que saldrán en el cine próximamente con envío de notificaciones a los clientes que deseen recibir novedades.

### 1.3. Estructura de Salas
Todas las salas comparten la misma distribución física fija:
  - **20 filas** identificadas con letras (de la A a la T).
  - **3 columnas de butacas** por fila:
    - Columna izquierda: 4 butacas.
    - Columna central: 20 butacas.
    - Columna derecha: 4 butacas.
      - **Importante**: la fila J es de butacas accesibles, con disposición 2-10-2, y la fila K debe estar vacía.
      - **Importante**: las filas R, S y T son de butacas V.I.P. y deberán contar con un precio más elevado que el de una butaca regular o accesible.
  - Total por fila: 28 butacas/14 butacas accesibles (518 butacas por sala).

### 1.4. Venta y Emisión de Entradas
Los clientes deben poder seleccionar película, función, butacas y productos del candybar para sacar sus entradas. Las butacas ocupadas por otros usuarios deberán marcarse en tiempo real. La venta de películas que sean para mayores de 13 y 18 años deberá estar prohibida para usuarios anónimos y usuarios registrados menores de dichos rangos.

Al concretar la compra, el sistema debe generar automáticamente un comprobante en PDF con los datos de la entrada y un **código QR** que el cliente presentará para acceder a la sala.

Además, los clientes pueden comprar de forma anónima (sin registrarse) o iniciando sesión con su cuenta para aplicar sus beneficios.

### 1.5. Registro de Usuarios y Beneficios
Los clientes deben poder registrarse en el sistema para obtener acceso a beneficios.

Datos obligatorios solicitados en el registro:
  - **Correo electrónico.**
  - **Nombre.**
  - **Apellido.**
  - **Fecha de nacimiento.**
  - **Tipo de sangre.**
  - **Color de ojos.**
  - **Cantidad de días de vacaciones por año.**

Cada usuario que se registre recibe un **cupón de descuento** para utilizar en su primera compra. Los usuarios **mayores de 50 años** pueden conseguir cupones exclusivos.

Además, cada usuario contará con un **rol**, que le permitirá hacer diferentes acciones dentro de la página.

Por otro lado, cada vez que un usuario haga compras, podrá acumular puntos **(1 punto por peso gastado)** canjeables por entradas y productos del candybar. Dichos puntos deben poder verse en el perfil junto con el historial de canjes.

También debe existir una sección "mis películas" donde el cliente pueda ver todas las películas cuyas entradas compró junto con su reseña, si es que redactó una.

### 1.6. Reseñas y Calificaciones
Los clientes deben poder consultar y dejar valoraciones sobre las películas:
- **Calificación:** asignación de puntuación mediante un sistema de estrellas (de 1 a 5).
- **Comentarios:** reseña escrita corta.
- **Visualización:** las opiniones deben poder verse antes de iniciar la compra de entradas.
- **Puntuación promedio:** se debe calcular el promedio de estrellas de cada película en base a todas sus calificaciones recibidas.

### 1.7. Candybar
Los clientes deben poder comprar comida y bebida junto con sus entradas o por separado:
- Cada producto debe contar con un nombre, imagen, precio y categoría.
- Los combos deben mostrarse destacados en la parte superior de la página.
- Deben poder retirarse con el código QR.
  - **Importante**: los números del código QR deben de estar presentes por si el lector llega a fallar.
  - **Importante**: una vez escaneado, el código QR debe dejar de ser válido.

### 1.8. Administración
El sistema debe permitir al administrador controlar y configurar:
- **CRUD completo:** para películas, funciones, productos del candybar y cupones.
- **Películas en página principal:** seleccionar qué películas aparecen exhibidas al ingresar a la página.
- **Horarios:** asignación de horarios para cada proyección.
  - **Importante:** no puede programarse ni comenzar una función en una misma sala antes de que hayan transcurrido **al menos 30 minutos** desde la finalización de la función anterior
- **Formato de proyección:** configurar si la función es en 2D, 3D, 4D o 5D.
- **Idioma:** configurar si la función se proyecta en Castellano o Subtitulada.
- **Distribución:** salas, funciones, butacas, productos.
  - **Importante:** la distribución de salas debe de ser automática, asegurándose de que dos funciones no se proyecten al mismo tiempo y en la misma sala.
- **Reportes de ventas:** indican cuánto se facturó y cuántas entradas se vendieron por día.
- **Costo de puntos de los canjes:** modificar los puntos necesarios para hacer canjes por entradas o productos del candybar.
- **Precio de los combos del candybar:** modificar los precios de los combos del candybar.
- **Precio de preventa:** modificar los precios de las películas que están a una semana de estrenarse.

## 2. Requerimientos No Funcionales

### 2.1. Experiencia del Usuario
La página no debe contar con los selectores de fechas y horas ni las alertas y confirmaciones predeterminadas del navegador.

## 3. Requerimientos Fuera del Alcance

### 3.1. Mapa del Cine
Luego de comprar las entradas, el usuario debe poder acceder al mapa del cine en donde se le indique la sala en la que se proyectará su función.