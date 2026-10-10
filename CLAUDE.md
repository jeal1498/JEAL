# CLAUDE.md — Laboratorio JEAL

Repo "laboratorio" personal: aquí se prueba de todo. Proyecto principal actual: **SecondBrain**, una PWA de uso propio que crecerá por módulos.

## Usuario
- Habla español (México). Respuestas **cortas y concisas**.
- Ideas sueltas; propón alcance concreto y pregunta solo lo que cambie el diseño.
- Moneda MXN. Su auto usa **gas LP como combustible principal** (gasolina solo arranque/respaldo).

## SecondBrain (estado al 2026-10-10, v2.1.4)
- **Sin build ni dependencias**: HTML + CSS + JS (ES modules) puros. Se sirve tal cual.
- Datos en el dispositivo (IndexedDB, `js/db.js`) + respaldo automático en Google Sheets (ver Respaldo).
- Offline con `sw.js` (stale-while-revalidate). **Sube `CACHE` en `sw.js` en cada cambio** o el teléfono no se actualiza.
- Publicado en GitHub Pages desde `main` (root): https://jeal1498.github.io/JEAL/
- **Cada cambio terminado se sube directo a `main`** (lo pidió el usuario). Vercel está desactivado con `vercel.json`.
- Respaldo (`#/respaldo`, `js/backup.js`): Google Sheets del usuario vía Apps Script (web app, token en el script). POST text/plain (sin preflight) con pestañas legibles (incl. "Apartado por mes") + JSON exacto en hoja oculta `_respaldo`; GET restaura. Automático tras cada cambio (`refresh(changed)`) y al abrir si pasó >1 día. Al conectar nunca sobrescribe una hoja con datos sin preguntar.
- Archivos: **Agregar** (`db.mergeData`) suma sin borrar; acepta `delete: {store: [ids]}`, `replace: [stores]` (vacía esos stores antes) y `vehicle: {...}` (se combina con los ajustes). **Importar** (`db.importAll`) solo reemplaza si el archivo es respaldo completo (`exportedAt`); si no, hace merge. Aun así reemplaza solo los stores/ajustes que trae.
- Íconos solo SVG (no se pudieron subir PNG; ver "Git" abajo).

### Archivos
- `index.html` — shell (header, `#view`, tabs, FAB, `<dialog>` de formularios).
- `js/app.js` — router por hash (`#/`, `#/vehiculo/<tab>`, `#/finanzas/<tab>`, `#/respaldo`), vistas, formularios por esquema (`SCHEMAS`), gráficas SVG propias.
- `js/finance.js` — finanzas puras: pagos repetidos, reparto del ingreso por fecha, metas, meta diaria.
- `js/backup.js` — respaldo/restauración en Google Sheets y texto del Apps Script (`scriptFor`).
- `js/calc.js` — cálculos puros (rendimiento tanque lleno→tanque lleno, gasto mensual, recordatorios).
- `js/db.js` — IndexedDB `secondbrain`: stores `fuel`, `maintenance`, `expenses`, `reminders`, `income`, `bills`, `goals`, `budgets`, `spending` (en desuso: al cargar se convierte en `bills`), `settings` (claves `vehicle`, `finance` (incl. `savings` {'YYYY-MM': monto}), `backup`). DB `VERSION` 4.
- `css/styles.css` — tokens en `:root` con modo oscuro; series de gráficas `--s1..--s4` (paleta validada).

### Módulo Vehículo
- Primero pide configurar el vehículo (`renderSetup`); sin nombre no deja registrar.
- Cargas con `fuelType` `gasolina|lp`. Con LP activo: km/l solo con cargas LP; gasolina = gasto; "Ahorro con LP": km/l gasolina = `vehicle.kmlGas` (opcional en Ajustes) o el de sus cargas de gasolina o LP×1.25 estimado. No se pide en la configuración inicial.
- Servicio, Gastos, Avisos (por km y/o meses, botón "Hecho" los reinicia).

### Módulo Finanzas (`#/finanzas`) — réplica de su Excel (v2, pedido por ella: "así tal cual me funciona")
- Es conductora de **Uber y Didi**: captura solo el **total generado por día** (`income`).
- Pestañas: **Hoy** (meta diaria + registrar lo de hoy) / **Mes** (`#/finanzas/mes`, = hoja `1026`: Objetivo/Generado/Faltante, calendario semanal, lista de pagos) / **Budget familiar** (`#/finanzas/metas`).
- Mes (`monthPlan`): lo generado en el mes abona los pagos **del mismo mes** en orden de fecha (fórmula ABONADO); no se arrastra nada entre meses. Meta diaria = faltante (con lo generado antes de hoy) / días que quedan contando hoy. Botones: "Copiar pagos del mes anterior" (no repetidos) y "Pasar sobrante" (ingreso `fromMonth` el día 1 del siguiente, "Saldo de <mes>").
- Vehículo → finanzas: cargas/servicios/gastos del Vehículo salen solos como pagos del mes (`vehicleItems`); pagos 🚗 iguales (fecha+monto) se ocultan. Tope opcional (`budgets` kind `fuel`) cuyo resto se reserva a fin de mes, en Ajustes de finanzas. Un pago 🚗 capturado en finanzas se manda a Vehículo.
- Ingreso con `month: 'YYYY-MM'` cuenta en esa hoja aunque su fecha sea de otro mes (el 30/9 $1,490 cuenta en octubre, como el Excel); se muestra en el calendario de esa hoja.
- Budget familiar (`goalsPlan`): lo **apartado a mano** cada mes (`finance.savings`) abona metas por fecha. Diaria = cuotas de metas a ≤120 días; semanal ×7, mensual ×24, anual ×24×12 (igual que el Excel).
- Se retiraron la vista estilo MonAi y los presupuestos por categoría (no le gustaron).

### Agregar un módulo nuevo
Home (`renderHome`) lista módulos; agrega su tarjeta, una ruta `#/<modulo>` en `render()`, sus stores en `db.js` (subir `VERSION` de la DB y crear stores en `onupgradeneeded`) y sus esquemas de formulario.

## Estado de los datos del usuario (2026-10-10)
- Vehículo: Cavalier (Chevrolet Cavalier), placas UTN260R, ~90,810 km, LP 60 L, gasolina 41 L. Placas/datos personales **no** van en el código (repo público): se pasan por JSON.
- Finanzas = su Excel tal cual (hojas 1026/1126/1226 + BUDGET FAMILIAR): 75 pagos oct–dic sin repetición (ids `xl-<hoja>-<fila>`, Combustible como renglones), 5 ingresos de oct (`xl-in-<fecha>`, el 30/9 con `month`), 10 metas (`xl-meta-<fila>`), sin tope de combustible, apartado por mes vacío. Verificado oct: Objetivo 37,176 / Generado 8,990 / Faltante 28,186; diaria del budget = Excel.
- Cargas LP: 11 `hist-lp-0..10` (15-jul a 9-sep; 15-jul no-llena) + 13 `lp-YYYY-MM-DD` (12-sep a 9-oct, de sus tickets; 20-sep sin km en ticket → 88,340 estimado y no-llena). Llenado no viene en los tickets: se marcaron llenas.
- Archivos que se le dieron (en el scratchpad de la sesión, no en el repo): `secondbrain-completo.json` (vehículo + 11 cargas + finanzas con `replace`) y `cargas-sep-oct.json` (13 cargas). Por accidentes con "Importar" perdió datos dos veces; se le indicó subir ambos con **Agregar** (probado: 24 cargas, sin duplicados).
- **Pendiente que decida:** las 3 cargas de octubre ($1,415.45) se suman encima de los renglones "Combustible" del Excel (oct sube a 38,591). Opción 1: quitar esos renglones y usar cargas reales + tope $6,700. Opción 2: no contar las cargas de octubre. También preguntó si existen las cargas hist de 15/7, 18/7, 25/7, 1/8 y 9/9 (no venían en sus tickets).
- Respaldo en Google Sheets **conectado y funcionando**. Si cambia el código del Apps Script debe hacer "Nueva versión" en la implementación; "Clave incorrecta" = TOKEN distinto al de la app.
- Para pasarle datos: JSON `{app:'secondbrain', <store>: [...]}` con ids estables y `createdAt`; decirle siempre **Respaldo → Agregar desde archivo**.

## Probar
`python3 -m http.server 8765` y Playwright con Chromium en `/opt/pw-browsers/chromium` (`playwright-core` en el scratchpad). Revisar capturas a 390px, claro y oscuro.

## Git
- `git push` a veces da 403; reintentar. Si persiste, subir con la API de GitHub (MCP `push_files`), que **solo acepta texto** (no binarios).
- Pushes de `.github/workflows/` fueron rechazados (token sin scope `workflow`).

## Ideas pendientes
- Otros módulos para el SecondBrain (notas, hábitos…).
- Leer tickets de gas por foto (hoy ella manda fotos y se genera el JSON a mano).
