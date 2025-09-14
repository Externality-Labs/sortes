import { atom, getDefaultStore } from 'jotai';
import { getPriceFromExternal } from '../services/api/price';

export const priceAtom = atom<{ [key in string]: number }>({
  wbtc: 82000,
  weth: 2000,
  wbnb: 600,
  usdt: 1,
  usdc: 1,
  xWbtc: 0,
});

const store = getDefaultStore();
let isPriceAtomInitialized = false;

function initializePriceAtom() {
  Promise.all([
    getPriceFromExternal('BTC'),
    getPriceFromExternal('ETH'),
    getPriceFromExternal('BNB'),
  ]).then(([btc, eth, bnb]) => {
    store.set(priceAtom, {
      ...store.get(priceAtom),
      wbtc: btc,
      weth: eth,
      wbnb: bnb,
    });
    isPriceAtomInitialized = true;
  });
}

initializePriceAtom();
const timer = setInterval(() => {
  if (isPriceAtomInitialized) {
    clearInterval(timer);
    return;
  } else initializePriceAtom();
}, 10000);
