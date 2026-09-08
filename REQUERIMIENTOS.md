# Documento de Requerimientos

## 1. Requerimientos Funcionales

### 1.1. Películas
Cada película registrada en el sistema debe contar obligatoriamente con:
- **Título.**
- **Póster.**
- **Sinopsis.**
- **Duración**.

### 1.2. Cartelera y Control de Proyecciones
El sistema debe permitir a los administradores controlar y configurar:
- **Películas en página principal:** seleccionar qué películas aparecen exhibidas al ingresar a la página.
- **Horarios:** asignación de horarios para cada proyección.
  - **Importante**: no puede programarse ni comenzar una función en una misma sala antes de que hayan transcurrido **al menos 30 minutos** desde la finalización de la función anterior
- **Formato de proyección:** configurar si la función es en 2D, 3D, 4D o 5D.
- **Idioma:** configurar si la función se proyecta en Castellano o Subtitulada.

### 1.3. Estructura de Salas
Todas las salas comparten la misma distribución física fija:
  - **20 filas** identificadas con letras (de la A a la T).
  - **3 columnas de butacas** por fila:
    - Columna izquierda: 4 butacas.
    - Columna central: 20 butacas.
    - Columna derecha: 4 butacas.
  - Total por fila: 28 butacas (560 butacas por sala).

### 1.4. Venta y Emisión de Entradas
Los clientes deben poder seleccionar película, función y butacas para sacar sus entradas.

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

Cada usuario que se registre recibe un **cupón de 20% de descuento** para utilizar en su primera compra.