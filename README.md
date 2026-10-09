# SecondBrain

PWA personal (sin build, sin servidor). Los datos viven solo en el dispositivo (IndexedDB) y funciona offline.

## Módulo Vehículo
- **Cargas**: odómetro, litros, precio, total (se autocalcula), tanque lleno.
- **Rendimiento** km/l por método tanque lleno → tanque lleno, costo por km, gasto mensual.
- **Servicio**: mantenimientos con costo y kilometraje.
- **Gastos**: seguro, verificación, tenencia, casetas…
- **Avisos**: recordatorios por km y/o meses ("Hecho" los reinicia).
- **Respaldo**: exportar/importar JSON y CSV de cargas (Ajustes).

## Módulo Finanzas
- **Hoy**: meta del día (pagos del mes + apartado para metas), lo que llevas hoy y próximos pagos.
- **Ingresos**: calendario del mes con total por semana; toca un día para registrar.
- **Pagos**: con fecha límite y repetición (semanal, quincenal, mensual). El ingreso del mes los cubre en orden de fecha; muestra pagado, pendiente y cuánto juntar por día.
- **Metas**: lo que sobra cada mes se aparta para las metas en orden de fecha; cuota diaria/semanal/mensual (metas a 120 días o menos).
- **Conectado con Vehículo**: cargas, servicios y gastos del vehículo aparecen solos en Pagos; un pago de 🚗 Vehículo capturado en finanzas se guarda en Vehículo. Sin duplicados.
- **Ajustes**: importar movimientos (JSON) sin borrar nada.

## Uso
Local: `python3 -m http.server` y abrir `http://localhost:8000`.

Publicar: en GitHub → *Settings → Pages → Source: Deploy from a branch* → `main` / `(root)`.
En el teléfono abre la URL y usa *Agregar a pantalla de inicio*.

Al cambiar archivos, sube `CACHE` en `sw.js` para que el teléfono tome la nueva versión.
