import { currentChainInfo } from './env';

export const readableAddr = (str: string, bit = 4): string => {
  const len = str.length;

  if (len <= 2 * bit) return str;
  else return str.substring(0, bit) + '...' + str.substring(len - bit, len);
};

export const convertName = (chainName?: string) => {
  if (!chainName) return '';

  // 处理全大写缩写和常规驼峰命名
  // 1. 确保第一个字符大写
  // 2. 匹配以下模式：
  //    - 连续的大写字母（如BNB）
  //    - 大写字母后跟小写字母（常规驼峰命名）
  const match = chainName
    .replace(/^\S/, (s) => s.toUpperCase())
    .match(/([A-Z]+(?![a-z]))|([A-Z][a-z]+)/g);
  return match ? match.join(' ') : '';
};

export const formatTime = (ts: number): string => {
  const d = new Date(ts);

  // console.log('时区信息：', {
  //   // 获取时区偏移量（分钟）
  //   timezoneOffset: d.getTimezoneOffset(),
  //   // 获取时区名称
  //   timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  //   // 原始时间戳
  //   timestamp: ts,
  //   // UTC 时间字符串
  //   utc: d.toUTCString(),
  //   // 本地时间字符串
  //   local: d.toLocaleString(),
  //   // 分别打印日期和时间
  //   localDate: d.toLocaleDateString(),
  //   localTime: d.toLocaleTimeString(),
  // });

  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
};
export const transactionHash2Url = (hash: string): string =>
  currentChainInfo().scanner + hash;

export const address2Url = (address: string): string => {
  const scanner = currentChainInfo().scanner;
  // Replace /tx/ with /address/ for address links
  return scanner.replace('/tx/', '/address/') + address;
};

export const formatUSD = (num: number | string | null): string =>
  num === null
    ? ''
    : (typeof num === 'string' ? Number(num) : num).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      });

export const formatGood = (num: number | string | null): string => {
  if (num === null) return '---';

  const value = typeof num === 'string' ? Number(num) : num;

  // 对于非常小的数值，直接显示为0.00
  if (Math.abs(value) < 0.000001 && value !== 0) {
    return '0.00';
  }

  // 处理整数部分超过6位的情况
  if (Math.abs(value) >= 1000000) {
    // 将数值转换为带单位的形式，如 1.23M
    const units = ['', 'K', 'M', 'B', 'T'];
    let unitIndex = 0;
    let scaledValue = Math.abs(value);

    while (scaledValue >= 1000 && unitIndex < units.length - 1) {
      scaledValue /= 1000;
      unitIndex++;
    }

    // 保留两位小数，并添加单位
    return `${value < 0 ? '-' : ''}${scaledValue.toFixed(2)}${units[unitIndex]}`;
  }

  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    // 不再使用maximumSignificantDigits来限制有效数字
  });
};
export const formatTokenAmount = (num: number | string | null): string =>
  num === null
    ? '---'
    : Number(num).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6,
        maximumSignificantDigits: 6,
      });

export const expToUsd = (expAmount: number | string | null): number => {
  if (expAmount === null) return 0;
  const exp = typeof expAmount === 'string' ? Number(expAmount) : expAmount;
  // Use parseFloat and toFixed to handle floating point precision issues
  return parseFloat((exp * 0.0000001).toFixed(8));
};

export const UsdToExp = (UsdAmount: number | string | null): number => {
  if (UsdAmount === null) return 0;
  const Usd = typeof UsdAmount === 'string' ? Number(UsdAmount) : UsdAmount;
  return Usd / 0.01;
};

export const formatGoodBalance = (num: number | string | null): string => {
  if (num === null || num === undefined) return '0';

  const value = typeof num === 'string' ? Number(num) : num;

  // Handle special cases
  if (isNaN(value) || value === 0) return '0';

  // Get integer part length for display decision
  const integerPart = Math.floor(Math.abs(value));
  const integerPartStr = integerPart.toString();

  // If integer part has more than 3 digits, use compact format with T unit
  if (integerPartStr.length > 3) {
    // For values >= 10.52T but < 10.53T, show as 10.52T+
    if (value >= 10520000000000 && value < 10530000000000) {
      return '10.52T+';
    }

    // For very large numbers (trillions), use T unit
    if (value >= 1000000000000) {
      const scaledValue = value / 1000000000000;
      const formatted = scaledValue.toFixed(2);
      return `${formatted}T`;
    }

    // For billions, use B unit
    if (value >= 1000000000) {
      const scaledValue = value / 1000000000;
      const formatted = scaledValue.toFixed(2);
      return `${formatted}B`;
    }

    // For millions, use M unit
    if (value >= 1000000) {
      const scaledValue = value / 1000000;
      const formatted = scaledValue.toFixed(2);
      return `${formatted}M`;
    }

    // For thousands, use K unit
    if (value >= 1000) {
      const scaledValue = value / 1000;
      const formatted = scaledValue.toFixed(2);
      return `${formatted}K`;
    }
  }

  // For smaller numbers (up to 3 digits integer part), show normally
  // If it's an integer, don't show decimal places
  if (Number.isInteger(value)) {
    return value.toString();
  }

  // Show up to 2 decimal places, but remove trailing zeros
  const formatted = value.toFixed(2);
  return formatted.replace(/\.?0+$/, '');
};

export const formatExpBalance = (num: number | string | null): string => {
  if (num === null || num === undefined) return '0';

  const value = typeof num === 'string' ? Number(num) : num;

  // Handle special cases
  if (isNaN(value) || value === 0) return '0';

  // Get integer part length for display decision
  const integerPart = Math.floor(Math.abs(value));
  const integerPartStr = integerPart.toString();

  // If integer part has more than 4 digits, use compact format
  if (integerPartStr.length > 4) {
    // For values >= 10.52T but < 10.53T, show as 10.52T+
    if (value >= 10520000000000 && value < 10530000000000) {
      return '10.52T+';
    }

    // For very large numbers (trillions), use T unit
    if (value >= 1000000000000) {
      const scaledValue = value / 1000000000000;
      const formatted = scaledValue.toFixed(2);
      return `${formatted}T`;
    }

    // For billions, use B unit
    if (value >= 1000000000) {
      const scaledValue = value / 1000000000;
      const formatted = scaledValue.toFixed(2);
      return `${formatted}B`;
    }

    // For millions, use M unit
    if (value >= 1000000) {
      const scaledValue = value / 1000000;
      const formatted = scaledValue.toFixed(2);
      return `${formatted}M`;
    }

    // For ten thousands, use K unit (only when more than 4 digits)
    if (value >= 10000) {
      const scaledValue = value / 1000;
      const formatted = scaledValue.toFixed(2);
      return `${formatted}K`;
    }
  }

  // For smaller numbers (up to 4 digits integer part), show normally without thousand separators
  // If it's an integer, don't show decimal places
  if (Number.isInteger(value)) {
    return value.toString();
  }

  // Show up to 2 decimal places, but remove trailing zeros
  const formatted = value.toFixed(2);
  return formatted.replace(/\.?0+$/, '');
};

/**
 * Pad a number or string to 6 digits with leading zeros
 * @param num - number or string to pad
 * @returns string padded to 6 digits with leading zeros
 * @example
 * padToSixDigits(123) // "000123"
 * padToSixDigits("45") // "000045"
 * padToSixDigits(1234567) // "1234567"
 */
export const padToSixDigits = (num: number | string): string => {
  const numStr = typeof num === 'string' ? num : num.toString();
  return numStr.padStart(6, '0');
};

export const formatObjectId = (id: string): string =>
  id.slice(-6).toUpperCase();
