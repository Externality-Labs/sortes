// scripts/fetch-metadata.js
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs/promises');

async function initMetaData() {
  const metaData = {
    abi: {},
    tokens: {},
  };
  const METADATA_PREFIX = 'https://metadata.sortes.fun/v3';
  const ABI_URL = `${METADATA_PREFIX}/beta/abis.json`;
  const TOKEN_URLS = ['sepolia'].map((chain) => ({
    name: chain,
    url: `${METADATA_PREFIX}/beta/${chain}/latest/contracts.json`,
  }));

  const abi = await fetch(ABI_URL).then((res) => res.json());
  const data = await Promise.all(TOKEN_URLS.map((token) => fetch(token.url).then((res) => res.json())));

  metaData.abi = abi;
  for (let i = 0; i < TOKEN_URLS.length; i++) {
    metaData.tokens[TOKEN_URLS[i].name] = Object.keys(data[i]).reduce((acc, key) => {
      acc[key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] = data[i][key];
      return acc;
    }, {});
  }
  return metaData;
}

(async () => {
  const data = await initMetaData();
  await fs.writeFile('src/utils/metadata.generated.json', JSON.stringify(data, null, 2), 'utf8');
  console.log('metadata.generated.json written');
})();
