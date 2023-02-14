import { safeJsonParse, safeJsonStringify } from 'safe-json-utils';

export class PrefixedStorage {
  constructor(private prefix: string) {}

  private generatePrefixedKey(key: string) {
    return `${this.prefix}-${key}`;
  }

  public getKeys(): Promise<string[]> {
    return Promise.resolve(
      Object.keys(localStorage)
        .filter(key => key.startsWith(this.prefix))
        .map(key => key.slice(this.prefix.length)),
    );
  }

  public getEntries<T>(): Promise<[string, T][]> {
    return Promise.resolve(
      Object.entries(localStorage)
        .filter(([key]) => key.startsWith(this.prefix))
        .map(([key, value]) => [key.slice(this.prefix.length), safeJsonParse(value)] as [string, T]),
    );
  }

  public getItem<T = any>(key: string): Promise<T | undefined> {
    const item = localStorage.getItem(this.generatePrefixedKey(key));
    if (item === null) {
      return Promise.resolve(undefined);
    }

    return Promise.resolve(safeJsonParse(item) as T);
  }

  public setItem<T>(key: string, value: T): Promise<void> {
    localStorage.setItem(this.generatePrefixedKey(key), safeJsonStringify(value));
    return Promise.resolve();
  }

  public removeItem(key: string): Promise<void> {
    localStorage.removeItem(this.generatePrefixedKey(key));
    return Promise.resolve();
  }
}
