export async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function simulateApiCall<T>(data: T, ms = 2000): Promise<T> {
  await delay(ms);
  return data;
}
