import { safeJsonParse, safeJsonStringify } from 'safe-json-utils';

export class MemoryStorage {
  private storage: Map<string, string>;

  constructor() {
    this.storage = new Map();
  }

  public getKeys(): Promise<string[]> {
    return Promise.resolve([...this.storage.keys()]);
  }

  public getEntries<T>(): Promise<[string, T][]> {
    return Promise.resolve(
      [...this.storage.entries()].map(([key, value]) => [key, safeJsonParse(value)] as [string, T]),
    );
  }

  public getItem<T = any>(key: string): Promise<T | undefined> {
    const item = this.storage.get(key);
    if (item === undefined) {
      return Promise.resolve(item);
    }

    return Promise.resolve(safeJsonParse(item) as T);
  }

  public setItem<T>(key: string, value: T): Promise<void> {
    this.storage.set(key, safeJsonStringify(value));
    return Promise.resolve();
  }

  public removeItem(key: string): Promise<void> {
    this.storage.delete(key);
    return Promise.resolve();
  }
}
