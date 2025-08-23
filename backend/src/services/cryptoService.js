const crypto = require('crypto');
const config = require('../config/env');

/**
 * Simple envelope encryption using AES-256-GCM.
 * - Generate random 32-byte dataKey per file
 * - Derive a wrapping key from master key using HKDF
 * - Wrap dataKey using XOR with wrapping key stream (deterministic per file salt)
 * - Store {wrappedKey, iv, tag, ciphertext}
 *
 * Note: This avoids persisting plaintext keys and does not log secrets.
 */

const HKDF_SALT = Buffer.from('escrow-file-hkdf-salt');
const HKDF_INFO = Buffer.from('escrow-file-key-wrap');

function deriveWrapKey(salt) {
  return crypto.hkdfSync('sha256', config.masterKey, Buffer.concat([HKDF_SALT, salt]), HKDF_INFO, 32);
}

function xorBuffers(bufA, bufB) {
  const out = Buffer.allocUnsafe(bufA.length);
  for (let i = 0; i < bufA.length; i++) {
    out[i] = bufA[i] ^ bufB[i % bufB.length];
  }
  return out;
}

/**
 * Encrypt a buffer with envelope encryption.
 * @param {Buffer} plaintext
 * @returns {{wrappedKey:Buffer, iv:Buffer, tag:Buffer, ciphertext:Buffer, size:number}}
 */
function encryptBuffer(plaintext) {
  const dataKey = crypto.randomBytes(32);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', dataKey, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  // Wrap data key
  const wrapSalt = crypto.randomBytes(16);
  const wrapKey = deriveWrapKey(wrapSalt);
  const wrappedKey = Buffer.concat([wrapSalt, xorBuffers(dataKey, wrapKey)]);
  return { wrappedKey, iv, tag, ciphertext, size: plaintext.length };
}

/**
 * Decrypt using wrapped key components.
 * @param {Buffer} wrappedKey
 * @param {Buffer} iv
 * @param {Buffer} tag
 * @param {Buffer} ciphertext
 * @returns {Buffer}
 */
function decryptToBuffer(wrappedKey, iv, tag, ciphertext) {
  const wrapSalt = wrappedKey.subarray(0, 16);
  const xoredKey = wrappedKey.subarray(16);
  const wrapKey = deriveWrapKey(wrapSalt);
  const dataKey = xorBuffers(xoredKey, wrapKey);
  const decipher = crypto.createDecipheriv('aes-256-gcm', dataKey, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plaintext;
}

module.exports = {
  encryptBuffer,
  decryptToBuffer,
};