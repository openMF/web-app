# Release Process for Mifos X Web App

This document outlines the standard procedure for releasing new versions of the Mifos X Web App.

## Versioning Strategy
We use Semantic Versioning (SemVer) for all releases.
- **MAJOR** (`v2.0.0`): Breaking UI/API contract changes for integrators.
- **MINOR** (`v1.16.0`): New features, non-breaking.
- **PATCH** (`v1.15.1`): Bug fixes.

> [!NOTE]
> The release version source of truth is the Git tag. The `package.json` version metadata is independent of Git and Docker tags and is not used for Docker Hub releases.

## Release Steps (GitHub)

When you are ready to publish a new stable release:

1. **Merge your changes:** Ensure all code for the release is merged into the stable branch (e.g., `main` or `dev` depending on the current branch layout).

2. **Tag the release:** Create an annotated Git tag using the `vX.Y.Z` format and push it to the repository.
   ```bash
   git tag -a v1.15.0 -m "Release 1.15.0 - supports Fineract 1.15"
   git push origin v1.15.0
   ```

3. **Create a GitHub Release:** Navigate to the GitHub UI (or use `gh release create`) and create a release from the tag you just pushed.
   - **Title:** `1.15.0`
   - **Body:** Include the changelog, supported Fineract version(s), known limitations, and upgrade notes.

## Docker Hub Workflow
Pushing a `vX.Y.Z` tag or publishing a GitHub Release automatically triggers the `.github/workflows/create-docker-hub-image.yml` GitHub Action. 
This action builds multi-arch images and publishes them to Docker Hub with the following tags:
- `1.15.0`
- `1.15`
- `1`
- `latest`

Continuous builds on the `dev` branch will continue to publish `dev` and `dev-<short-sha>` tags.
