# SecondBrain

PWA personal (sin build, sin servidor). Los datos viven solo en el dispositivo (IndexedDB) y funciona offline.

## Módulo Vehículo
- **Cargas**: odómetro, litros, precio, total (se autocalcula), tanque lleno.
- **Rendimiento** km/l por método tanque lleno → tanque lleno, costo por km, gasto mensual.
- **Servicio**: mantenimientos con costo y kilometraje.
- **Gastos**: seguro, verificación, tenencia, casetas…
- **Avisos**: recordatorios por km y/o meses ("Hecho" los reinicia).
- **Respaldo**: exportar/importar JSON y CSV de cargas (Ajustes).

## Finanzas (`finanzas/`, página propia; se abre desde **Proyectos**)
- **Gastos**: tus pagos con fecha límite, agrupados por urgencia (vencidos, hoy, esta semana…) o por categoría y mes. Arriba la **meta diaria** (lo pendiente del mes, con lo vencido, entre los días que quedan) y la gráfica de cuándo caen los pagos.
- **Abonos**: cada pago guarda su historial de abonos ("Abonar o pagar", "Pagar todo", "Deshacer último abono").
- **Metas**: ahorros con fecha y monto; cada ahorro se registra como abono, con la cuota para llegar a tiempo.
- Eliminar tiene **Deshacer**. En ⋯: modo claro/oscuro, **Importar** (JSON o CSV/Excel, agregando o reemplazando, con vista previa y Deshacer) y **Exportar** (JSON completo o CSV para Excel).
- Los datos están en IndexedDB (`movimientos` y `metas`) y entran al buscador y al respaldo.

## Respaldo
En **Respaldo** (inicio): conecta una hoja de Google Sheets de tu Drive (gratis, vía Apps Script). Se respalda sola cada vez que guardas algo, con una pestaña por tipo de dato; **Restaurar desde Drive** recupera todo en otro teléfono. También hay exportar/importar JSON.

## Uso
Local: `python3 -m http.server` y abrir `http://localhost:8000`.

Publicar: en GitHub → *Settings → Pages → Source: Deploy from a branch* → `main` / `(root)`.
En el teléfono abre la URL y usa *Agregar a pantalla de inicio*.

Al cambiar archivos, sube `CACHE` en `sw.js` para que el teléfono tome la nueva versión.
