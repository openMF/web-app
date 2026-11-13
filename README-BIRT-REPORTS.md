# Reportes BIRT por cliente

Este fork incorpora la captura de cliente y la vista previa PDF al frontend
Angular. Cada compilación genera `index.html`, `main` y módulos con referencias
coherentes. No se deben montar archivos JavaScript individuales sobre la imagen.

## Comportamiento

- Los nombres configurados en `src/app/reports/run-report/client-pdf-reports.ts`
  identifican los reportes por cliente. No se fijan IDs de reportes o parámetros.
- El parámetro existente `DefaultClient` se muestra como `# cliente` solo en
  esos reportes BIRT. Se envía como `R_clientId`, obligatorio y entero positivo.
  Su definición en la BD y sus usos en otros reportes se conservan.
- Los PDFs se muestran en un componente Angular con PDF.js: paginación, zoom,
  ajuste al ancho y descarga. El worker, fuentes y WASM se incluyen en la imagen.
- No se modifican los componentes de autenticación, index ni main manualmente.

La consulta de todos los créditos, la autorización por oficina y la combinación
de PDFs corresponden al backend: requiere el plugin BIRT y una extensión Java
para reportes por cliente instalados previamente. Este fork no sustituye esas validaciones.

## Construcción

```bash
npm ci
npm run build
```

La configuración de producción genera nombres con hash automáticamente. No
renombrar los archivos después de compilar ni editar sus imports.

Construir una imagen desde este checkout:

```bash
docker build --build-arg BUILDER_IMAGE=node:24-alpine \
  --build-arg NGINX_IMAGE=nginx:stable-alpine \
  -t mifos/web-app:client-reports .
```

El proceso usa el Dockerfile del repositorio, compila toda la aplicación y
genera `assets/env.js` al arrancar con las variables del ambiente. El Dockerfile
configura el tipo MIME JavaScript de `.mjs`, necesario para cargar el worker PDF.js.

## Despliegue en Ubuntu

Entregar la imagen mediante un registro o `docker image save` / `docker image
load`. En el compose habitual del servidor, configurar esa imagen en `web-dev`
y conservar los montajes de nginx, certificados, imágenes de marca y las
variables de API/tenant del servidor.

Retirar los montajes de las correcciones anteriores:

- `index.html`, `main-*.js` y `reports.module-*.js` personalizados.
- `assets/birt-preview`, sustituido por el componente Angular incluido.

Conservar las nuevas claves de traducción de este fork si se monta un archivo
`conf/es-MX.json` personalizado sobre el incluido en la imagen:

- `labels.inputs.Client number`.
- El objeto `reports.client` y el objeto `reports.pdf` de `es-MX.json`.

Si el archivo externo no se actualiza, ocultará las traducciones de la imagen.
Fusionar esas claves conservando las traducciones propias del servidor.

```bash
docker compose config --quiet
```

Si la imagen se distribuye mediante un registro, descargarla antes de recrear
el servicio:

```bash
docker compose pull web-dev
docker compose up -d --no-deps --force-recreate web-dev
```

Si la imagen se cargó con `docker image load`, utilizar la imagen local:

```bash
docker compose up -d --no-deps --force-recreate web-dev
```

Utilizar el nombre de proyecto y los archivos Compose reales del servidor.
Cerrar sesión y recargar el navegador sin caché. No se requieren scripts de
parcheo de bundles ni SQL nuevo si el catálogo ya está registrado.

## Validación

```bash
npm test -- --runInBand --coverage=false --runTestsByPath \
  src/app/reports/run-report/run-report.component.spec.ts \
  src/app/reports/run-report/birt/birt.component.spec.ts \
  src/app/reports/run-report/birt/pdf-preview/pdf-preview.component.spec.ts
npm run lint
```

Comprobar inicio de sesión, captura del cliente, rechazo de cero/decimales,
cliente inexistente, cliente sin créditos, generación con varios créditos,
visor/descarga y un reporte fuera del catálogo PDF por cliente. Las instrucciones del repositorio
requieren capturas manuales de antes/después para aprobar un PR de interfaz.
