# Dashboard de Movimientos Contables — Neb Chile

Dashboard con Next.js que muestra Ingresos / Gastos / Resultado por mes y por
centro de negocio, leyendo directamente desde las planillas de Google Sheets
de Defontana:

- `Movimientos Contables - 2026`
- `Movimientos Contables - Histórico 2021 - 2025`
- `centros_negocios` (traducción de `businessCenterId`)
- `Defontana - Movimientos contables` → hoja `pnl_data` (resumen mensual ya
  agregado por área, usado para el histórico 2021-2026)

## Cómo funciona el "auto-update"

La app **no** guarda una copia estática de los datos. Cada carga de página
(o cada 10 minutos, lo que ocurra primero) vuelve a consultar los Google
Sheets vía la API oficial de Google (`googleapis`), así que cuando alguien
edita una planilla, el dashboard refleja el cambio solo. También hay un botón
"Actualizar datos" que fuerza el refresco al instante.

Mientras no haya credenciales configuradas, la app cae automáticamente a un
modo de **datos de muestra** (carpeta `data/`, ignorada por git) para poder
desarrollar y probar la UI sin acceso a Google.

## Configurar el acceso en vivo (Service Account)

1. Ir a [Google Cloud Console](https://console.cloud.google.com/) y crear
   (o reusar) un proyecto.
2. Habilitar la **Google Sheets API** para ese proyecto (APIs & Services →
   Enable APIs → buscar "Google Sheets API" → Enable).
3. Crear una **Service Account** (IAM & Admin → Service Accounts → Create
   Service Account). No necesita ningún rol de proyecto, solo la identidad.
4. Entrar a la cuenta de servicio creada → pestaña **Keys** → Add Key → Create
   new key → JSON. Se descarga un archivo `.json` con `client_email` y
   `private_key`.
5. Abrir cada una de estas planillas en Google Sheets y compartirlas
   (botón "Compartir") con el email de la service account
   (`algo@tu-proyecto.iam.gserviceaccount.com`) como **Lector**:
   - `Movimientos Contables - 2026`
   - `Movimientos Contables - Histórico 2021 - 2025` (no se usa hoy, pero
     déjala compartida para cuando se agregue detalle histórico)
   - `centros_negocios`
   - `Defontana - Movimientos contables`
6. Copiar `.env.local.example` a `.env.local` y completar:
   ```
   GOOGLE_SERVICE_ACCOUNT_EMAIL=algo@tu-proyecto.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```
   (el `private_key` del JSON viene con `\n` literales — se pueden pegar tal
   cual, entre comillas dobles).
7. Reiniciar `npm run dev`. El encabezado del dashboard debería decir
   "Datos en vivo desde Google Sheets" en vez de "Datos de muestra".

## Desarrollo local

```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Despliegue en Vercel

```bash
vercel link
vercel env add GOOGLE_SERVICE_ACCOUNT_EMAIL
vercel env add GOOGLE_PRIVATE_KEY
vercel deploy --prod
```

En Vercel, `GOOGLE_PRIVATE_KEY` debe pegarse con saltos de línea reales (no
`\n` escapados) o mantenerse igual que en `.env.local` — la app hace
`.replace(/\\n/g, "\n")` así que ambos formatos funcionan.

## Estructura

- `src/lib/sheets.ts` — cliente de Google Sheets API + fallback a CSV local.
- `src/lib/centros.ts`, `src/lib/pnl.ts`, `src/lib/movimientos.ts` — parsing
  y agregación de cada planilla.
- `src/lib/getDashboardData.ts` — orquestador con cache (`unstable_cache`,
  revalida cada 10 min o al llamar `POST /api/refresh`).
- `src/app/page.tsx` — la página del dashboard.
- `data/` — snapshots CSV de muestra para desarrollo local (no se sube a git).
