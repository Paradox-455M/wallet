function runFilter(fileFilter, mime) {
  return new Promise((resolve) => {
    const req = {};
    const file = { mimetype: mime };
    fileFilter(req, file, (err) => resolve(err));
  });
}

describe('upload fileFilter', () => {
  let fileFilter;

  beforeAll(() => {
    process.env.ENCRYPTION_MASTER_KEY = Buffer.from('b'.repeat(32)).toString('base64');
    jest.resetModules();
    // Require after env is set
    ({ fileFilter } = require('../upload'));
  });

  test('allows configured mime types', async () => {
    const err1 = await runFilter(fileFilter, 'image/png');
    const err2 = await runFilter(fileFilter, 'image/jpeg');
    expect(err1).toBeNull();
    expect(err2).toBeNull();
  });

  test('rejects disallowed mime types', async () => {
    const err = await runFilter(fileFilter, 'application/x-msdownload');
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toMatch(/Unsupported file type/);
  });
});