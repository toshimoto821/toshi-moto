export function splitIntoChunks<T>(array: T[], chunkSize: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
}

export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
