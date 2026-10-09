# SecondBrain

PWA personal (sin build, sin servidor). Los datos viven solo en el dispositivo (IndexedDB) y funciona offline.

## Módulo Vehículo
- **Cargas**: odómetro, litros, precio, total (se autocalcula), tanque lleno.
- **Rendimiento** km/l por método tanque lleno → tanque lleno, costo por km, gasto mensual.
- **Servicio**: mantenimientos con costo y kilometraje.
- **Gastos**: seguro, verificación, tenencia, casetas…
- **Avisos**: recordatorios por km y/o meses ("Hecho" los reinicia).
- **Respaldo**: exportar/importar JSON y CSV de cargas (Ajustes).

## Uso
Local: `python3 -m http.server` y abrir `http://localhost:8000`.

Publicar: en GitHub → *Settings → Pages → Source: Deploy from a branch* → `main` / `(root)`.
En el teléfono abre la URL y usa *Agregar a pantalla de inicio*.

Al cambiar archivos, sube `CACHE` en `sw.js` para que el teléfono tome la nueva versión.
