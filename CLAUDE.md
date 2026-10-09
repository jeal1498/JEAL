# CLAUDE.md — Laboratorio JEAL

Repo "laboratorio" personal: aquí se prueba de todo. Proyecto principal actual: **SecondBrain**, una PWA de uso propio que crecerá por módulos.

## Usuario
- Habla español (México). Respuestas **cortas y concisas**.
- Ideas sueltas; propón alcance concreto y pregunta solo lo que cambie el diseño.
- Moneda MXN. Su auto usa **gas LP como combustible principal** (gasolina solo arranque/respaldo).

## SecondBrain (estado al 2026-10-09, v1.5.0)
- **Sin build ni dependencias**: HTML + CSS + JS (ES modules) puros. Se sirve tal cual.
- Datos **solo en el dispositivo** (IndexedDB, `js/db.js`). Respaldo manual JSON/CSV en Ajustes.
- Offline con `sw.js` (stale-while-revalidate). **Sube `CACHE` en `sw.js` en cada cambio** o el teléfono no se actualiza.
- Publicado en GitHub Pages desde `main` (root): https://jeal1498.github.io/JEAL/
- **Cada cambio terminado se sube directo a `main`** (lo pidió el usuario). Vercel está desactivado con `vercel.json`.
- Íconos solo SVG (no se pudieron subir PNG; ver "Git" abajo).

### Archivos
- `index.html` — shell (header, `#view`, tabs, FAB, `<dialog>` de formularios).
- `js/app.js` — router por hash (`#/`, `#/vehiculo/<tab>`), vistas, formularios por esquema (`SCHEMAS`), gráficas SVG propias.
- `js/finance.js` — finanzas puras: pagos repetidos, reparto del ingreso por fecha, metas, meta diaria.
- `js/calc.js` — cálculos puros (rendimiento tanque lleno→tanque lleno, gasto mensual, recordatorios).
- `js/db.js` — IndexedDB `secondbrain`: stores `fuel`, `maintenance`, `expenses`, `reminders`, `income`, `bills`, `goals`, `budgets`, `settings` (claves `vehicle`, `finance`).
- `css/styles.css` — tokens en `:root` con modo oscuro; series de gráficas `--s1..--s4` (paleta validada).

### Módulo Vehículo
- Primero pide configurar el vehículo (`renderSetup`); sin nombre no deja registrar.
- Cargas con `fuelType` `gasolina|lp`. Con LP activo: km/l solo con cargas LP; gasolina = gasto; "Ahorro con LP" usa `vehicle.kmlGas`.
- Servicio, Gastos, Avisos (por km y/o meses, botón "Hecho" los reinicia).

### Módulo Finanzas (`#/finanzas`)
- Hoy / Ingresos (calendario) / Pagos (repetición semanal, quincenal, mensual; "Omitir" un día) / Metas.
- El ingreso de cada mes cubre pagos en orden de fecha (vencidos primero); el sobrante al cerrar el mes va a metas por fecha.
- Presupuestos (`budgets`): tope mensual; `kind` `fuel` (cargas + pagos 🚗 tipo combustible) o `category`. Lo gastado ya está en la lista; se reserva solo lo que queda, a fin de mes (meses pasados: 0).
- Meta de hoy = pendiente del mes / días restantes + cuota de metas a ≤120 días. Vehículo es la única fuente de sus gastos: cargas/servicios/gastos salen solos en Pagos (`vehicleItems`); un pago 🚗 en finanzas se captura en Vehículo; pagos 🚗 iguales (fecha+monto) a un registro de Vehículo se ocultan.

### Agregar un módulo nuevo
Home (`renderHome`) lista módulos; agrega su tarjeta, una ruta `#/<modulo>` en `render()`, sus stores en `db.js` (subir `VERSION` de la DB y crear stores en `onupgradeneeded`) y sus esquemas de formulario.

## Probar
`python3 -m http.server 8765` y Playwright con Chromium en `/opt/pw-browsers/chromium` (`playwright-core` en el scratchpad). Revisar capturas a 390px, claro y oscuro.

## Git
- `git push` a veces da 403; reintentar. Si persiste, subir con la API de GitHub (MCP `push_files`), que **solo acepta texto** (no binarios).
- Pushes de `.github/workflows/` fueron rechazados (token sin scope `workflow`).

## Ideas pendientes
- Otros módulos para el SecondBrain (notas, hábitos…).
- Sincronizar/respaldar en la nube si algún día lo necesita.
