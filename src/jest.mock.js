import 'jest-fetch-mock';
import { jest } from '@jest/globals';
import crypto from 'crypto';
import { setupWorker, rest } from 'msw';

const worker = setupWorker(
  rest.get('/aztec-connect.wasm', async (req, res, ctx) => {
    const fileBuffer = await fetch(base64Image).then(res => res.arrayBuffer());
    return res(
      ctx.status(202, 'Mocked status'),
      ctx.json({
        message: 'Mocked response JSON body',
      }),
    );
  }),
);

worker.start();

Object.defineProperty(global.self, 'crypto', {
  value: {
    subtle: crypto.webcrypto.subtle,
    getRandomValues: function (arrayToFill) {
      const data = crypto.randomBytes(arrayToFill.length);
      for (let i = 0; i < data.length; i++) {
        arrayToFill[i] = data[i];
      }
      return arrayToFill;
    },
  },
});

window.opener = {
  postMessage: jest.fn(),
};

export {}; // ESM compatibility
