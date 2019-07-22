import jwt from 'jsonwebtoken';

import { jwtPKPassphrase } from '../../settings.json';

// Import the key pairs
import privateKey from '../../.keys/jwtRS256.key';
import publicKey from '../../.keys/jwtRS256.key.pub';

// console.log(pk);

const passphrase = jwtPKPassphrase;

const getToken = () => {
  // Sign token with private key
  const token = jwt.sign({}, { key: privateKey, passphrase }, { algorithm: 'RS256' });

  return token;
};

const validateToken = (token) => {
  // Verify the token received
  const payload = jwt.verify(token, publicKey, { algorithms: 'RS256' });

  // Pass the validation if payload is not empty
  const result = Object.keys(payload).length > 0;

  return result;
};

export {
  getToken,
  validateToken,
};
