export const COLOR_SELECTED = "#F7931A";

export function addBufferItems<T>(data: T[], len: number) {
  const first = data[0];
  const last = data[data.length - 1];

  for (let i = 0; i < len; i++) {
    data.unshift(first);
  }

  for (let i = 0; i < len; i++) {
    data.push(last);
  }
}

export function getNumBuffer(len: number, breakpoint: number) {
  if (breakpoint < 2) {
    return Math.floor(len / 4);
  }
  return 5;
}
