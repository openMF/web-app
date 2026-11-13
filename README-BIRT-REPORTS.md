# BIRT client reports

This guide covers the BIRT reporting frontend changes introduced in
[PR #4278](https://github.com/openMF/web-app/pull/4278). Use a frontend version
that includes those changes when following these instructions.

The Angular frontend provides client number input and an integrated PDF
preview. Each build generates consistent references between `index.html`,
`main`, and lazy-loaded modules. Deploy the complete application build.

## Behavior

- The names configured in `src/app/reports/run-report/client-pdf-reports.ts`
  identify client reports. Report and parameter database IDs are not hardcoded.
- The existing `DefaultClient` parameter appears as `# client` for these BIRT
  reports. It is submitted as `R_clientId` and requires a positive integer.
  Its database definition and its use by other reports remain unchanged.
- PDF.js provides page navigation, zoom, fit-to-width, and download controls.
  The image includes the worker, fonts, CMaps, and WASM assets.
- Authentication components do not require manual changes. The build generates
  the application entry points and module references.

Retrieving all loans, enforcing office access, and combining PDFs are backend
responsibilities. Install the BIRT plugin and a backend extension for client
reports before using those capabilities. The frontend relies on those backend
validations.

## Build

```bash
npm ci
npm run build
```

Production builds generate hashed filenames automatically. Keep the generated
filenames and imports together when deploying.

To build a container image from this checkout:

```bash
docker build --build-arg BUILDER_IMAGE=node:24-alpine \
  --build-arg NGINX_IMAGE=nginx:stable-alpine \
  -t mifos/web-app:client-reports .
```

The repository Dockerfile builds the complete application. At startup, the
container generates `assets/env.js` from the environment variables. The
Dockerfile also configures the JavaScript MIME type for `.mjs` files so the
PDF.js worker can load.

## Deploy on Ubuntu

Distribute the image through a container registry or with `docker image save`
and `docker image load`. In the server's Compose configuration, assign the image
to the frontend service, named `web-dev` in the examples below. Preserve the
nginx configuration, certificates, branding image mounts, and API and tenant
environment variables required by the deployment.

Remove mounts used by earlier frontend patches:

- Custom `index.html`, `main-*.js`, and `reports.module-*.js` files.
- `assets/birt-preview`, which is replaced by the bundled Angular component.

If a customized `conf/es-MX.json` file is mounted over the image's translation
file, merge these keys from the updated image into that file:

- `labels.inputs.Client number`.
- The `reports.client` and `reports.pdf` objects.

The mounted file takes precedence over the bundled translations. Preserve
deployment-specific translations when merging the new keys.

Validate the Compose configuration:

```bash
docker compose config --quiet
```

For an image distributed through a registry, pull it before recreating the
service:

```bash
docker compose pull web-dev
docker compose up -d --no-deps --force-recreate web-dev
```

For an image imported with `docker image load`, recreate the service using the
local image:

```bash
docker compose up -d --no-deps --force-recreate web-dev
```

Use the actual project name, Compose files, and service name for the server.
Sign out and reload the browser without using its cache. An existing registered
report catalog requires no additional SQL or bundle-patching scripts.

## Validation

```bash
npm test -- --runInBand --coverage=false --runTestsByPath \
  src/app/reports/run-report/run-report.component.spec.ts \
  src/app/reports/run-report/birt/birt.component.spec.ts \
  src/app/reports/run-report/birt/pdf-preview/pdf-preview.component.spec.ts
npm run lint
```

Verify login, client number input, rejection of zero and decimal values,
nonexistent clients, clients without loans, reports containing multiple loans,
PDF preview and download, and a report outside the configured client PDF
catalog. Repository contribution guidelines require manual before/after
screenshots for UI pull request approvals.
