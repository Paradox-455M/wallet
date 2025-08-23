describe('cryptoService', () => {
  const TEST_KEY = Buffer.from('a'.repeat(32)).toString('base64');

  beforeAll(() => {
    process.env.ENCRYPTION_MASTER_KEY = TEST_KEY;
    // Ensure module cache resets to pick up env
    jest.resetModules();
  });

  test('encrypt -> decrypt returns original', () => {
    const { encryptBuffer, decryptToBuffer } = require('../cryptoService');
    const input = Buffer.from('hello world');
    const { wrappedKey, iv, tag, ciphertext } = encryptBuffer(input);
    const out = decryptToBuffer(wrappedKey, iv, tag, ciphertext);
    expect(out.equals(input)).toBe(true);
  });

  test('tampered ciphertext throws', () => {
    const { encryptBuffer, decryptToBuffer } = require('../cryptoService');
    const input = Buffer.from('secret data');
    const { wrappedKey, iv, tag, ciphertext } = encryptBuffer(input);
    const tampered = Buffer.from(ciphertext);
    tampered[0] = tampered[0] ^ 0xff;
    expect(() => decryptToBuffer(wrappedKey, iv, tag, tampered)).toThrow();
  });
});