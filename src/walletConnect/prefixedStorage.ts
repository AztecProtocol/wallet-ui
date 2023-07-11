import { serialize, deserialize } from 'wagmi'

export class PrefixedStorage {
  constructor(private prefix: string) { }



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
        .map(([key, value]) => [key.slice(this.prefix.length), deserialize(value)] as [string, T]),
    );
  }

  public getItem<T = any>(key: string): Promise<T | undefined> {
    const item = localStorage.getItem(key);
    if (item === null) {
      return Promise.resolve(undefined);
    }

    return Promise.resolve(deserialize(item) as T);
  }

  public setItem<T>(key: string, value: T): Promise<void> {
    console.log({ key, value: serialize(value) })
    localStorage.setItem(key, serialize(value));
    return Promise.resolve();
  }

  public removeItem(key: string): Promise<void> {
    localStorage.removeItem(key);
    return Promise.resolve();
  }
}
