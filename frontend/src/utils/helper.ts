export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const debounce = (func: (...args: any) => void, wait: number) => {
  let timer: NodeJS.Timeout | null = null;

  return (...args: any) => {
    if (timer !== null) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      func(...args);
      timer = null;
    }, wait);
  };
};

export const once = (func: (...args: any) => void) => {
  let called = false;

  return (...args: any) => {
    if (!called) {
      called = true;
      func(...args);
    }
  };
};

export const retry = async (
  promise: Promise<any>,
  retries: number = 3,
  interval: number = 2000
) => {
  let error: any;

  for (let i = 0; i < retries; i++) {
    try {
      return await promise;
    } catch (e) {
      error = e;
      await sleep(interval);
    }
  }

  throw error;
};
