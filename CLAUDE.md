# CLAUDE.md — Laboratorio JEAL

Repo "laboratorio" personal: aquí se prueba de todo. Proyecto principal actual: **SecondBrain**, una PWA de uso propio que crecerá por módulos.

## Usuario
- Habla español (México). Respuestas **cortas y concisas**.
- Ideas sueltas; propón alcance concreto y pregunta solo lo que cambie el diseño.
- Moneda MXN. Su auto usa **gas LP como combustible principal** (gasolina solo arranque/respaldo).

## SecondBrain (estado al 2026-10-15, v2.6.0)
- **Sin build ni dependencias**: HTML + CSS + JS (ES modules) puros. Se sirve tal cual.
- Datos en el dispositivo (IndexedDB, `js/db.js`) + respaldo automático en Google Sheets (ver Respaldo).
- Offline con `sw.js` (stale-while-revalidate). **Sube `CACHE` en `sw.js` en cada cambio** o el teléfono no se actualiza.
- Publicado en GitHub Pages desde `main` (root): https://jeal1498.github.io/JEAL/
- **Cada cambio terminado se sube directo a `main`** (lo pidió el usuario). Vercel está desactivado con `vercel.json`.
- Respaldo (`#/respaldo`, `js/backup.js`): Google Sheets del usuario vía Apps Script (web app, token en el script). POST text/plain (sin preflight) con pestañas legibles (incl. "Apartado por mes") + JSON exacto en hoja oculta `_respaldo`; GET restaura. Automático tras cada cambio (`refresh(changed)`) y al abrir si pasó >1 día. Al conectar nunca sobrescribe una hoja con datos sin preguntar.
- Archivos: **Agregar** (`db.mergeData`) suma sin borrar; acepta `delete: {store: [ids]}`, `deleteWhere: {store: {campo: valor}}`, `replace: [stores]` (vacía esos stores antes) y `vehicle: {...}` (se combina con los ajustes). **Importar** (`db.importAll`) solo reemplaza si el archivo es respaldo completo (`exportedAt`); si no, hace merge. Aun así reemplaza solo los stores/ajustes que trae.
- Íconos solo SVG (no se pudieron subir PNG; ver "Git" abajo).

### Archivos
- `index.html` — shell (header, `#view`, tabs, FAB, `<dialog>` de formularios).
- `js/app.js` — router por hash (`#/`, `#/vehiculo/<tab>`, `#/finanzas/<tab>`, `#/respaldo`, `#/buscar`, `#/pendientes`, `#/notas`, `#/dia`, `#/proyectos`), vistas, formularios por esquema (`SCHEMAS`), gráficas SVG propias.
- `js/finance.js` — finanzas puras: pagos repetidos, reparto del ingreso por fecha, metas, meta diaria.
- `js/backup.js` — respaldo/restauración en Google Sheets y texto del Apps Script (`scriptFor`).
- `js/calc.js` — cálculos puros (rendimiento tanque lleno→tanque lleno, gasto mensual, recordatorios).
- `js/db.js` — IndexedDB `secondbrain`: stores `fuel`, `maintenance`, `expenses`, `reminders`, `income`, `bills`, `goals`, `budgets`, `spending` (en desuso: al cargar se convierte en `bills`), `notes`, `tasks`, `habits`, `journal`, `projects`, `settings` (claves `vehicle`, `finance` (incl. `savings` {'YYYY-MM': monto}), `backup`). DB `VERSION` 6.
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

### Inicio = tablero del día (v2.4.0, `renderHome`)
Saludo + fecha; tiles Meta de hoy / Pendientes (hoy+vencidos) / Hábitos x/y; "¿Cómo te sientes hoy?" (guarda mood en `journal`); Pendientes de hoy y Hábitos de hoy con check directo; Pagos de esta semana (≤7 días, sin cubrir); Avisos del auto (no ok); cuadrícula de módulos 2×. Secciones vacías se ocultan.

### Pendientes, Notas, Mi día (v2.3.0)
- **Pendientes** (`tasks`: title, due opcional, done, doneAt): grupos Vencidos/Hoy/Próximos/Sin fecha + Hechos; círculo para marcar.
- **Notas** (`notes`: title, body, tags "a, b", pinned): filtro por etiqueta (chips), fijadas arriba.
- **Mi día**: navegar por día (no futuro). Hábitos (`habits`: name, emoji, done ['YYYY-MM-DD']) con racha 🔥; Diario (`journal`, id `dia-YYYY-MM-DD`: mood de 5 emojis + text).
- Todo entra al buscador y al respaldo (pestañas Notas/Pendientes/Hábitos/Diario; el Apps Script crea pestañas solo, no requiere nueva versión).

### Proyectos (v2.5.0, `#/proyectos`, `renderProjects`)
- `projects`: name, emoji, status (`activo|pausa|terminado|idea`), description, links (textarea, un acceso por renglón "Nombre https://…"; sin nombre se deduce: github.com→Repositorio, github.io/vercel→Página), tags, notes, pinned.
- Tarjetas con botones de acceso (abren en pestaña nueva), filtro por estado, fijados arriba. Vacío: botón "Agregar SecondBrain" (id `proj-secondbrain`). En buscador y respaldo (pestaña Proyectos).

### Buscador (`#/buscar`, lupa en Inicio)
- `renderSearch`/`SEARCH` en `app.js`: busca en todos los stores (menos budgets) sin acentos, todas las palabras deben aparecer; incluye fechas en texto ("octubre") y montos ("$1,490" → 1490). Tocar abre el formulario. Al agregar un módulo, súmalo a `SEARCH`.

### Agregar un módulo nuevo
Home (`renderHome`) lista módulos; agrega su tarjeta, una ruta `#/<modulo>` en `render()`, sus stores en `db.js` (subir `VERSION` de la DB y crear stores en `onupgradeneeded`) y sus esquemas de formulario.

## Estado de los datos del usuario (2026-10-10)
- Vehículo: Cavalier (Chevrolet Cavalier), placas UTN260R, ~90,810 km, LP 60 L, gasolina 41 L. Placas/datos personales **no** van en el código (repo público): se pasan por JSON.
- Finanzas = su Excel tal cual (hojas 1026/1126/1226 + BUDGET FAMILIAR): 75 pagos oct–dic sin repetición (ids `xl-<hoja>-<fila>`, Combustible como renglones), 5 ingresos de oct (`xl-in-<fecha>`, el 30/9 con `month`), 10 metas (`xl-meta-<fila>`), sin tope de combustible, apartado por mes vacío. Verificado oct: Objetivo 37,176 / Generado 8,990 / Faltante 28,186; diaria del budget = Excel.
- Cargas LP: 11 `hist-lp-0..10` (15-jul a 9-sep; 15-jul no-llena) + 13 `lp-YYYY-MM-DD` (12-sep a 9-oct, de sus tickets; 20-sep sin km en ticket → 88,340 estimado y no-llena). Llenado no viene en los tickets: se marcaron llenas.
- Archivos que se le dieron (en el scratchpad de la sesión, no en el repo): `secondbrain-completo.json` (vehículo + 11 cargas + finanzas con `replace`) y `cargas-sep-oct.json` (13 cargas). Por accidentes con "Importar" perdió datos dos veces; se le indicó subir ambos con **Agregar** (probado: 24 cargas, sin duplicados).
- **Decidió (10-oct): opción 1** — combustible = cargas reales del Cavalier. Se le dio `combustible-real.json` (`deleteWhere` bills concept "Combustible" + budget `tope-combustible` $6,700 kind `fuel`); confirmar que lo subió con Agregar.
- Cargas hist de 15/7, 18/7, 25/7, 1/8 y 9/9: no está seguro si existen; se dejan (no cuentan en finanzas, son anteriores a oct).
- Respaldo en Google Sheets **conectado y funcionando**. Si cambia el código del Apps Script debe hacer "Nueva versión" en la implementación; "Clave incorrecta" = TOKEN distinto al de la app.
- Para pasarle datos: JSON `{app:'secondbrain', <store>: [...]}` con ids estables y `createdAt`; decirle siempre **Respaldo → Agregar desde archivo**.

- Proyectos (14-oct): `proyectos.json` con `proj-checa` (app Android en repo privado `jeal1498/Mi-Ruta`, web en `jeal1498/checa-web`) y `proj-reservas` = **Cartera de clientes**. El usuario de CHECA es **Eduardo (Lalo)** según el CLAUDE.md de Mi-Ruta; aquí se ha escrito «ella»: usar lenguaje neutro.

## Cartera 2.0 (`cartera-2/`, v2.6.0)
- Carpeta con los archivos de la versión 2.0: `cartera-completa.html` (app todo-en-uno, igual a `cartera/cartera-completa.html` al 15-oct) y `perfil-conductor.html` (perfil público de Eduardo; usa Leaflet de unpkg, requiere internet).
- Publicados en https://jeal1498.github.io/JEAL/cartera-2/ . Aparecen en Proyectos como `proj-cartera-2` (se siembra una vez por dispositivo desde `load()` con la clave `seeds` en `settings`; es el patrón para proyectos de fábrica).

## Cartera de clientes (`cartera/`, tercer proyecto, v1.2)
- PWA aparte para conductores: gestionar su cartera de **clientes privados** (los que les piden viajes por fuera de Uber/DiDi). No es venta de tarjetas impresas ni captar pasajeros de la app.
- Publicada en https://jeal1498.github.io/JEAL/cartera/ . Archivos: `index.html`, `app.js`, `styles.css`, `sw.js` (**subir `CACHE`** en cada cambio), `manifest.webmanifest`, `icon.svg`.
- Datos en `localStorage` clave `cartera`: `clients` (name, phone, places, rate, notes), `trips` (clientId, date, time, from, to, km, price, status `agendado|hecho|cancelado`, pay `''|efectivo|transferencia|tarjeta`; hecho + pay '' = me debe), `settings` (driver, lada 52, perKm, bank). Exportar/cargar copia JSON (merge por id).
- Pestañas: Agenda (sin cerrar/hoy/mañana/semana; Confirmar y "Ya llegué" por WhatsApp; Terminar → ¿cómo te pagó?), Clientes (buscar, filtros Me deben / +30 días; ficha con WhatsApp, Llamar, Nuevo viaje, Repetir), Cobros (por cliente, recordatorio por WhatsApp), Resumen (mes, mejores clientes, forma de pago, para reactivar). Precio sugerido: último del mismo cliente+ruta o km × perKm.
- v1.1 **Servicios frecuentes** (`client.services`: name, a/b {label,lat,lon}, km, min, path, price|null=sugerido) y punto A→B en viajes (`fromPt`, `toPt`, `min`, `path`). `maps.js`: Nominatim (búsqueda, debounce 650 ms, sesgo cerca de lugares usados) + OSRM (ruta; tiempo ×1.25 por tráfico), mini mapa SVG sin mosaicos, link "Ver en Google Maps"/"Ruta". Google Maps pendiente: falta clave del usuario (cambiar solo `maps.js`).
- v1.2 **Tarifa como CHECA** (`quote()`): precio = mayor entre km×`perKm` y horas×`perHour`; «Más detalles» opcionales en `settings.extra` {base, minimum, airport, night %, wait $/min} con `on`/`v`; redondeo a $10. Migra la tarifa vieja (base/perMin/minimum) al cargar.
- **Inicio rápido** (`renderOnboarding`, si `!settings.onboarded`): bienvenida + 4 pasos (Tú, Tu auto, Tu tarifa, Cómo cobras) + listo (primer cliente / contactos con Contact Picker / agenda). **Mi perfil** `#/perfil` (avatar del encabezado): datos, auto, tarifa, cobro (bank+clabe → mensaje de cobro) y «Compartir mi tarjeta por WhatsApp»; «Editar» reusa `stepHtml`/`wireStep` en una hoja. Ajustes: lada, copia, contactos, ver inicio rápido otra vez. Maquetas: artifacts «Servicios frecuentes» y «Perfil e inicio rápido».
- Siguientes etapas: cuenta en la nube (Supabase, como CHECA), link de reserva para el cliente + anticipo con Mercado Pago.

## Clientela (en marcha desde el 18 oct 2026)
Nombre nuevo de **Cartera de clientes**. Usuario: **Eduardo** (Lalo, hombre). Plan: llevarla por el camino de Checa (repo `jeal1498/Mi-Ruta`, solo lectura, con su CLAUDE.md y skills). **Una aprobación de Eduardo por etapa; no se adelanta la siguiente.** Maqueta en artifact antes de cualquier cambio grande. **Nada a `main` sin su OK** (rama `ccr-116b0b7d-3jd0bm`; esto prima sobre la regla de subir directo a `main` de SecondBrain). **No tocar SecondBrain** (raíz, `js/`, `css/`, `sw.js`). Repo público: nada de datos personales en el código.
- **Plan y avance: `clientela/PLAN.md`** (marcar `[x]` en cada avance y cambiar la fecha).
- **Orden (aprobado 18 oct):** 1 skills ✅ · 2 contexto ✅ · 3 marca ✅ · 4 rediseño PWA ✅ (falta su OK y pasarlo a `main`) · 5 **acceso con Google obligatorio + nube** (Supabase, como Checa; los datos locales se suben solos la primera vez; maqueta antes) · 6 APK · 7 link de reserva + anticipo con Mercado Pago · 8 web (repo propio) · 9 redes y videos (`videos-clientela`, molde `videos-checa`). Los pushes a `.github/workflows/` pueden rechazarse: avisar qué subir a mano.
- **Contexto:** `.agents/product-marketing.md` (gratis por ahora para recibir comentarios; sin ciudad ni país en la marca).
- **Marca:** familia Checa; logo A (tarjeta de contacto con la luz verde y ✓), lema «Tus clientes, en orden», verde cobrado / amarillo te debe / rojo atrasado (≥ 15 días), firma «de la familia Checa» solo en web y videos. Fuente única `marca/` (tokens, SVG, PNG, fuentes woff2); skill `marca-clientela`; láminas https://claude.ai/artifact/SwF2P53ZQBTpXnVZCQqzqL.
- **Skills** en `.claude/skills/` (copiadas de Mi-Ruta): ui-ux-pro-max, copywriting, copy-editing, product-marketing, marketing-psychology, cro, pricing, ab-testing, social, video, media-use, `hyperframes*` y `marca-clientela`. `skills-lock.json` en la raíz.

### App (`clientela/`, v2.0, rediseño del 18 oct)
- Maqueta aprobada: https://claude.ai/artifact/AmJLsuWugR1ZEeznZxBBmZ. Solo oscuro. Carga `../marca/tokens.css` (no copiar la marca). Instalable: `manifest.webmanifest` + `sw.js` (**sube `CACHE` clientela-vN en cada cambio**; la lista `ASSETS` debe tener todos los módulos de `js/`).
- `index.html` + `css/cartera.css` + `js/cartera.js` (orquesta) y módulos: `interfaz.js` (encabezado con QR y avatar; barra con **botón + central**), `agenda-vista.js` (Hoy, franja «Te deben», «¿Se hizo?» con Sí/No), `viaje-vistas.js` (tarjeta de viaje con **un paso**: Confirmar → Ya llegué → Terminar; `t.confirmedAt` al confirmar), Cotizar (`quoteForm` en `cartera.js`: cliente opcional, sus viajes de siempre, De/A, precio con tu tarifa, «Mandar precio» y «Agendar»), `cobros-vista.js` (amarillo reciente, rojo `lateDebt` ≥ 15 días, sello «Cobrado» con `t.paidAt`), `clientes-vista.js`, `cliente-detalle-vista.js`, `resumen.js`, `yo-vista.js` (Yo = perfil + ajustes, `settings.lastBackup`), `tarjeta-vista.js` (`#/tarjeta`, QR grande, wake lock) y `tarjeta.html` (página pública que lee los datos del enlace `#j…`/`#z…`, guardar contacto .vcf, pedir viaje por WhatsApp).
- Datos: `localStorage` clave `cartera` (mismo origen que `cartera/` v1 y la vieja `cartera-2/`: se comparten). `cartera-2/cartera-completa.html` ahora redirige a `clientela/`. `cartera/` v1 sigue igual (no se tocó).
- `cartera-2/perfil-conductor.html` (datos personales) se borró el 18 oct; **sigue en el historial de git** del repo público.
- La `cartera-2` publicada en `main` sale en blanco desde el 15 oct (corregido en la rama); cuando Eduardo apruebe, se pasa todo a `main`.
- Probar: `python3 -m http.server 8765` en la raíz y Playwright (`npm root -g`/playwright) a 390 px; sembrar `localStorage` y hacer `reload()`.

## Probar
`python3 -m http.server 8765` y Playwright con Chromium en `/opt/pw-browsers/chromium` (`playwright-core` en el scratchpad). Revisar capturas a 390px, claro y oscuro.

## Git
- `git push` a veces da 403; reintentar. Si persiste, subir con la API de GitHub (MCP `push_files`), que **solo acepta texto** (no binarios).
- Pushes de `.github/workflows/` fueron rechazados (token sin scope `workflow`).

## Ideas pendientes
- Captura rápida (anotar en 1 toque y luego convertir en nota/pendiente): propuesta, no elegida aún.
- Leer tickets de gas por foto (hoy ella manda fotos y se genera el JSON a mano).
