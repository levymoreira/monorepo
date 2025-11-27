# 1) Generate RSA private key (traditional) and convert to PKCS8
mkdir -p keys
openssl genrsa -out keys/private_rsa.pem 2048
openssl pkcs8 -topk8 -inform PEM -outform PEM -in keys/private_rsa.pem -out keys/private.pkcs8.pem -nocrypt

# 2) Derive SPKI public key
openssl rsa -in keys/private_rsa.pem -pubout -out keys/public.spki.pem

# 3) Write PEMs into .env.local with \n-escaped lines (Edge-safe)
PRIV=$(awk 'BEGIN{RS="\n"; ORS="\\n"} {print}' keys/private.pkcs8.pem)
PUB=$(awk 'BEGIN{RS="\n"; ORS="\\n"} {print}' keys/public.spki.pem)
printf 'JWT_PRIVATE_KEY_PEM="%s"\nJWT_PUBLIC_KEY_PEM="%s"\n' "$PRIV" "$PUB" >> .env.local