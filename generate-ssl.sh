#!/bin/bash
# Generate self-signed SSL certificates for local development
SSL_DIR="./ssl"
mkdir -p "$SSL_DIR"
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout "$SSL_DIR/key.pem" \
    -out "$SSL_DIR/cert.pem" \
    -subj "/C=US/ST=State/L=City/O=Org/CN=localhost" \
    -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
echo "✅ SSL certificates generated in $SSL_DIR/"
