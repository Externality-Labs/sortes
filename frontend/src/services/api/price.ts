import axios from 'axios';

const api = axios.create();

export const getPriceFromExternal = async (token = 'ETH'): Promise<number> => {
  const res = await api.get(
    `https://min-api.cryptocompare.com/data/price?fsym=${token}&tsyms=USD`
  );
  return res.data.USD;
};
