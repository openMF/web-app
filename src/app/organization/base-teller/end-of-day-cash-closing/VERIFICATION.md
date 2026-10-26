# WEB-1258 local verification

The backend documents named `docs/WEB-1258-end-of-day-closing.md` and `docs/WEB-1258-verification.md` were absent from the supplied Savings Plugin checkout. The API source and DTOs were inspected directly. The plugin was built with `./mvnw package -Dmaven.test.skip=true`, copied to the running `PropertiesLauncher` loader path, and Fineract health returned `UP`.

The real backend run on the 2026-10-11 business date verified context, eligible checks, balanced/overage/shortage previews, invalid authorization (403), valid authorization, idempotent retry, retrieval, report, and identical reprint. The final Chrome run used the local Angular proxy and recorded 20 closing API responses; all were 200 except the expected invalid authorization 403. It completed closing IDs 11 (balanced), 12 (EUR overage + USD shortage), and 13 (shortage with vouchers). The results and screenshots are in `/private/tmp/web1258-final-evidence/`. The report and reprint bodies matched each completion snapshot. The browser check confirmed that the authorization credential appeared in neither browser storage nor console output. A separate accounting check found one native allocation and one settlement at the backend expected total per currency and no discrepancy adjustment.

For another real browser run, prepare three open, funded cashier sessions using the actual tenant currency and denomination catalogs. Supply their context, declaration, eligible checks, and preview response as `EOD_FIXTURES` JSON with the shape of `/private/tmp/web1258-web-fixtures.json`. Then set `E2E_USERNAME`, `E2E_PASSWORD`, `EOD_AUTHORIZATION_KEY`, and `EOD_RESULTS_DIR`, and run:

```sh
node src/app/organization/base-teller/end-of-day-cash-closing/real-backend.acceptance.cjs
```

The script uses Chrome and the real local proxy. It does not intercept requests or store credentials in its evidence files. Running it completes the supplied sessions. It exercises the checks dialog, declaration inputs, preview, invalid authorization, double-click protection, completion, report, reprint, and credential absence from browser storage and console output.

No cashier had an eligible check during the local run, so selection of a nonempty check was not observed. Creating a legitimate check through the real Base Teller deposit API returned 500 because this local database lacks `m_savings_account_summary`. Positive check selection needs an eligible check fixture or that database migration before it can be accepted. The empty-check dialog and real `GET /checks` response were verified.

## Live connection on 2026-10-12

The WEB-1258 worktree is served at `http://localhost:4200/#/organization/base-teller/end-of-day-cash-closing` using `npx ng serve --proxy-config proxy.localhost.conf.js --host 127.0.0.1 --port 4200`. The prior server for the separate shared checkout was stopped so the WEB-1258 Base Teller card is available on the port used in the browser. A second WEB-1258 server remains available on port 4201. Chrome confirmed the permission-controlled Base Teller card, loaded EUR and USD from the backend, and observed successful same-origin calls to `/fineract-provider/api/v2/base-teller/end-of-day-closing/context`, `/checks`, and `/preview`; the preview status was `PREVIEW`. The local proxy targets `https://localhost:8443`, whose health endpoint returned `UP`. The JAR under the running process's `loader.path` matched the freshly built Savings Plugin JAR by SHA-256. This smoke test made no closing.
