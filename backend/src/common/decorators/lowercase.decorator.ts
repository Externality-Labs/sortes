import { Transform } from 'class-transformer';

export function Lowercase() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase().trim();
    }
    return value;
  });
}
