name: Publish Image in Docker Hub

on:
  push:
    branches: [main, dev, angular-update]

jobs:
  build:
    runs-on: ubuntu-latest
    env:
      DOCKER_ORGANIZATION: ${{ secrets.DOCKER_ORGANIZATION }}

    steps:
      - uses: actions/checkout@v2

      - name: Set up QEMU
        uses: docker/setup-qemu-action@v2

      - name: Set up Docker Buildx
        id: buildx
        uses: docker/setup-buildx-action@v2
        with:
          install: true

      - name: Log in to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USER }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Extract branch name
        shell: bash
        run: echo "branch=${GITHUB_HEAD_REF:-${GITHUB_REF#refs/heads/}}" >> $GITHUB_OUTPUT
        id: extract_branch

      - name: Get Git Hashes
        run: |
          echo "short_hash=$(git rev-parse --short HEAD)" >> $GITHUB_OUTPUT
          echo "long_hash=$(git rev-parse HEAD)" >> $GITHUB_OUTPUT
        id: git_hashes

      - name: Build and Push Multi-Arch Docker Image
        run: |
          TAGS="--tag $DOCKER_ORGANIZATION/web-app:${{ steps.extract_branch.outputs.branch }}"

          if [ "${{ steps.extract_branch.outputs.branch }}" == "main" ]; then
            TAGS="$TAGS --tag $DOCKER_ORGANIZATION/web-app:${{ steps.git_hashes.outputs.short_hash }} --tag $DOCKER_ORGANIZATION/web-app:${{ steps.git_hashes.outputs.long_hash }}"
          else
            TAGS="$TAGS --tag $DOCKER_ORGANIZATION/web-app:${{ steps.extract_branch.outputs.branch }}-${{ steps.git_hashes.outputs.short_hash }}"
          fi

          docker build --push --build-arg="PUPPETEER_SKIP_DOWNLOAD_ARG=true" --platform linux/amd64,linux/arm64 $TAGS .
