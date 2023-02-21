export type DeferredPromise<T> = {
  resolve: (value?: T) => void;
  reject: (error?: Error) => void;
};

export function createDeferredPromise<T>(): { promise: Promise<T>; deferredPromise: DeferredPromise<T> } {
  let cacheResolve: undefined | ((value: T | PromiseLike<T>) => void);
  let cacheReject: undefined | ((value?: Error) => void);
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    cacheResolve = promiseResolve;
    cacheReject = promiseReject;
  });

  const resolve = (value?: T) => {
    if (cacheResolve) {
      cacheResolve(value as T);
    }
  };
  const reject = (error?: Error) => {
    if (cacheReject) {
      cacheReject(error);
    }
  };

  return {
    promise,
    deferredPromise: {
      resolve,
      reject,
    },
  };
}
