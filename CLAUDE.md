# CLAUDE.md — Laboratorio JEAL

Repo "laboratorio" personal: aquí se prueba de todo. Proyecto principal actual: **SecondBrain**, una PWA de uso propio que crecerá por módulos.

## Usuario
- Habla español (México). Respuestas **cortas y concisas**.
- Ideas sueltas; propón alcance concreto y pregunta solo lo que cambie el diseño.
- Moneda MXN. Su auto usa **gas LP como combustible principal** (gasolina solo arranque/respaldo).

## SecondBrain (estado al 2026-10-09, v1.7.0)
- **Sin build ni dependencias**: HTML + CSS + JS (ES modules) puros. Se sirve tal cual.
- Datos en el dispositivo (IndexedDB, `js/db.js`) + respaldo automático en Google Sheets (ver Respaldo).
- Offline con `sw.js` (stale-while-revalidate). **Sube `CACHE` en `sw.js` en cada cambio** o el teléfono no se actualiza.
- Publicado en GitHub Pages desde `main` (root): https://jeal1498.github.io/JEAL/
- **Cada cambio terminado se sube directo a `main`** (lo pidió el usuario). Vercel está desactivado con `vercel.json`.
- Respaldo (`#/respaldo`, `js/backup.js`): Google Sheets del usuario vía Apps Script (web app, token en el script). POST text/plain (sin preflight) con pestañas legibles + JSON exacto en hoja oculta `_respaldo`; GET restaura. "Agregar desde archivo" (`db.mergeData`) suma registros de cualquier store sin borrar. Automático tras cada cambio (`refresh(changed)`) y al abrir si pasó >1 día. Al conectar nunca sobrescribe una hoja con datos sin preguntar.
- Íconos solo SVG (no se pudieron subir PNG; ver "Git" abajo).

### Archivos
- `index.html` — shell (header, `#view`, tabs, FAB, `<dialog>` de formularios).
- `js/app.js` — router por hash (`#/`, `#/vehiculo/<tab>`, `#/finanzas/<tab>`, `#/respaldo`), vistas, formularios por esquema (`SCHEMAS`), gráficas SVG propias.
- `js/finance.js` — finanzas puras: pagos repetidos, reparto del ingreso por fecha, metas, meta diaria.
- `js/backup.js` — respaldo/restauración en Google Sheets y texto del Apps Script (`scriptFor`).
- `js/calc.js` — cálculos puros (rendimiento tanque lleno→tanque lleno, gasto mensual, recordatorios).
- `js/db.js` — IndexedDB `secondbrain`: stores `fuel`, `maintenance`, `expenses`, `reminders`, `income`, `bills`, `goals`, `budgets`, `settings` (claves `vehicle`, `finance`, `backup`). DB `VERSION` 3.
- `css/styles.css` — tokens en `:root` con modo oscuro; series de gráficas `--s1..--s4` (paleta validada).

### Módulo Vehículo
- Primero pide configurar el vehículo (`renderSetup`); sin nombre no deja registrar.
- Cargas con `fuelType` `gasolina|lp`. Con LP activo: km/l solo con cargas LP; gasolina = gasto; "Ahorro con LP" usa `vehicle.kmlGas`.
- Servicio, Gastos, Avisos (por km y/o meses, botón "Hecho" los reinicia).

### Módulo Finanzas (`#/finanzas`)
- Hoy / Ingresos (calendario) / Pagos (repetición semanal, quincenal, mensual; "Omitir" un día) / Metas.
- El ingreso de cada mes cubre pagos en orden de fecha (vencidos primero); el sobrante al cerrar el mes va a metas por fecha.
- Presupuestos (`budgets`): tope mensual; `kind` `fuel` (cargas + pagos 🚗 tipo combustible) o `category`. Lo gastado ya está en la lista; se reserva solo lo que queda, a fin de mes (meses pasados: 0).
- Meta de hoy = pendiente del mes / días restantes + cuota de metas a ≤120 días. Vehículo es la única fuente de sus gastos: cargas/servicios/gastos salen solos en Pagos (`vehicleItems`); un pago 🚗 en finanzas se captura en Vehículo; pagos 🚗 iguales (fecha+monto) a un registro de Vehículo se ocultan. Registros de Vehículo anteriores al primer mes de finanzas (primer ingreso/pago) no cuentan.

### Agregar un módulo nuevo
Home (`renderHome`) lista módulos; agrega su tarjeta, una ruta `#/<modulo>` en `render()`, sus stores en `db.js` (subir `VERSION` de la DB y crear stores en `onupgradeneeded`) y sus esquemas de formulario.

## Estado de los datos del usuario (2026-10-09)
- Ya cargó en su teléfono (vía "Agregar desde archivo"): 11 cargas de gas LP jul–sep 2026, ingresos/pagos de octubre 2026 y metas de su Excel (pestañas `10/26` y `BUDGET FAMILIAR`), presupuesto Combustible $6,000/mes. **No volver a generarle esos archivos.**
- Supuestos a confirmar si pregunta: Colegiatura y Gym mensuales, Psicóloga (👤 Yo) semanal; carga del 15-jul marcada como no-llena.
- Respaldo en Google Sheets **conectado y funcionando**. Si cambia el código del Apps Script debe hacer "Nueva versión" en la implementación; "Clave incorrecta" = TOKEN distinto al de la app.
- Para pasarle datos: generar JSON `{app:'secondbrain', <store>: [...]}` con ids estables y `createdAt`; ella lo sube en Respaldo → **Agregar** (no borra). `delete: {<store>: [ids]}` para quitar.

## Probar
`python3 -m http.server 8765` y Playwright con Chromium en `/opt/pw-browsers/chromium` (`playwright-core` en el scratchpad). Revisar capturas a 390px, claro y oscuro.

## Git
- `git push` a veces da 403; reintentar. Si persiste, subir con la API de GitHub (MCP `push_files`), que **solo acepta texto** (no binarios).
- Pushes de `.github/workflows/` fueron rechazados (token sin scope `workflow`).

## Ideas pendientes
- Otros módulos para el SecondBrain (notas, hábitos…).
- Ideas mencionadas en finanzas: presupuestos para súper/comida fuera.
