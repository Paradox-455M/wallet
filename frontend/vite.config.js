import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFile } from 'node:fs/promises';

const stripThreeStdlibSourceMaps = () => ({
  name: 'strip-three-stdlib-sourcemaps',
  enforce: 'pre',
  async load(id) {
    const cleanId = id.startsWith('/@fs/') ? id.slice(4) : id;
    const [filePath] = cleanId.split('?');
    if (filePath.includes('/node_modules/three-stdlib/') && filePath.endsWith('.js')) {
      const code = await readFile(filePath, 'utf-8');
      return code.replace(/\/\/# sourceMappingURL=.*$/gm, '');
    }
    return null;
  },
});

export default defineConfig({
  plugins: [stripThreeStdlibSourceMaps(), react()],
  optimizeDeps: {
    exclude: ['three-stdlib'],
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});