mkdir -p .keys/

# Generate Private Key
ssh-keygen -t rsa -b 4096 -m PEM -f .keys/jwtRS256.key

# Generate Public key
openssl rsa -in .keys/jwtRS256.key -pubout -outform PEM -out .keys/jwtRS256.key.pub

# Change permission
chmod 444 .keys/jwtRS256.key
chmod 444 .keys/jwtRS256.key.pub

# Show the keys
cat .keys/jwtRS256.key
cat .keys/jwtRS256.key.pub
