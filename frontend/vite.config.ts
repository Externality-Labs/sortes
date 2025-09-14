import { defineConfig, HtmlTagDescriptor } from 'vite';
import react from '@vitejs/plugin-react';
import { createHtmlPlugin } from 'vite-plugin-html';
import path from 'node:path';
import { copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const appName = process.env.VITE_APP;
const dir = `build-${appName}`;
const templateFile = `${appName}.html`;
const env = process.env.NODE_ENV;

const METADATA_PREFIX = 'https://metadata.sortes.fun/v3';
const ABI_URL = `${METADATA_PREFIX}/gamma/abis.json`;
const TOKEN_URLS = ['sepolia'].map((chain) => ({
  name: chain,
  url: `${METADATA_PREFIX}/gamma/${chain}/latest/contracts.json`,
}));

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3002,
    host: '127.0.0.1', // 使用 IPv4 地址避免 IPv6 权限问题
    strictPort: true, // 如果端口被占用则直接报错
  },
  plugins: [
    react(),
    createHtmlPlugin({
      minify: env === 'production',
      template: templateFile,
    }),
    {
      name: 'inject-head-tags',
      enforce: 'pre',
      transformIndexHtml() {
        const tags: HtmlTagDescriptor[] = [];
        const assets = [{ name: 'abi', url: ABI_URL }, ...TOKEN_URLS];

        for (const { url } of assets) {
          tags.push({
            tag: 'link',
            attrs: {
              rel: 'preload',
              href: url,
              as: 'fetch',
              crossorigin: 'anonymous',
            },
            injectTo: 'head',
          });
        }

        tags.push({
          tag: 'script',
          attrs: {
            type: 'module',
          },
          children: `
              window.__APP_METADATA__ = { tokens: {} };
              window.__APP_METADATA_READY__= (async() => {
                  const assets = ${JSON.stringify(assets)}
                  const data = await Promise.all(assets.map(asset => fetch(asset.url, {
                    mode: 'cors'
                  }).then(res => res.json())));

                  for (let i = 0; i < assets.length; i++) {
                    const asset = assets[i];
                    if (asset.name === 'abi') {
                      window.__APP_METADATA__.abi = data[i];
                    } else {
                      window.__APP_METADATA__.tokens[asset.name] = Object.keys(data[i]).reduce((acc, key) => {
                        acc[key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] = data[i][key];
                        return acc;
                      }, {});
                    }
                  }
              })();
            `,
          injectTo: 'head-prepend',
        });
        return tags;
      },
    },
    {
      name: 'vite-postbuild',
      closeBundle: async () => {
        const buildDir = path.join(__dirname, dir);
        const oldPath = path.join(buildDir, templateFile);
        const newPath = path.join(buildDir, 'index.html');
        if (existsSync(oldPath)) {
          try {
            await copyFile(oldPath, newPath);
            console.log(
              `[vite-postbuild] Copied ${templateFile} -> index.html`
            );
          } catch (err) {
            console.warn(`[vite-postbuild] Failed to copy: ${err}`);
          }
        } else {
          console.warn(`[vite-postbuild] Skipped: ${oldPath} does not exist`);
        }
      },
    },
  ],
  build: {
    target: 'esnext',
    rollupOptions: {
      input: {
        index: `./${templateFile}`,
      },
      output: [
        {
          dir: dir,
        },
      ],
    },
  },
  resolve: {
    alias: {
      '/@': path.resolve(__dirname, 'src'),
      '/@root': path.resolve(__dirname),
    },
  },
});
