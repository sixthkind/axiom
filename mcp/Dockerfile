# Stage 1: Extract version from config file
FROM alpine:3 AS version-reader
COPY config/version.json /tmp/version.json
RUN apk add --no-cache jq && \
    jq -r '.pocketbase' /tmp/version.json > /tmp/pb_version.txt

# Stage 2: Download PocketBase
FROM alpine:3 AS downloader

ARG OS
ARG ARCH
# VERSION can be overridden via docker build arg, otherwise uses version.json
ARG VERSION

ENV BUILDX_ARCH="${OS:-linux}_${ARCH:-amd64}"

# Install required tools
RUN apk add --no-cache wget unzip

# Copy version from previous stage if VERSION not provided
COPY --from=version-reader /tmp/pb_version.txt /tmp/pb_version.txt

# Use VERSION from build arg if provided, otherwise use version from file
RUN export PB_VERSION=${VERSION:-$(cat /tmp/pb_version.txt)} && \
    echo "Downloading PocketBase version: ${PB_VERSION}" && \
    wget https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_${BUILDX_ARCH}.zip \
    && unzip pocketbase_${PB_VERSION}_${BUILDX_ARCH}.zip \
    && chmod +x /pocketbase

# Stage 3: Final runtime image
FROM alpine:3

# Install necessary packages
RUN apk update && \
    apk add --no-cache ca-certificates && \
    rm -rf /var/cache/apk/*

# Create necessary directories
RUN mkdir -p /pb_data /pb_public /pb_hooks /pb_migrations

# Copy PocketBase binary
COPY --from=downloader /pocketbase /usr/local/bin/pocketbase

# Copy your custom migrations and hooks
COPY pb_migrations/ /pb_migrations/
COPY pb_hooks/ /pb_hooks/

# Declare volume for data persistence
# Mount this to a persistent volume in EasyPanel to retain data across redeploys
VOLUME ["/pb_data"]

EXPOSE 8090

# Start PocketBase (EasyPanel will handle restart policy)
CMD ["/usr/local/bin/pocketbase", "serve", "--http=0.0.0.0:8090", "--dir=/pb_data", "--publicDir=/pb_public", "--hooksDir=/pb_hooks", "--migrationsDir=/pb_migrations"]