type EventListener = (handlers: MessageEvent) => void;
let lastEventListener: EventListener = () => {};

export type SendReply = (reply: any) => void;
/**
 * setEventListenerMessageRpc:
 *  Implements a singleton pattern for a single RPC listener
 *  This is used to make an idempotent useEffect that can rerun safely
 *  @param handlers the RPC functions to access via postMessage
 */
export function setEventListenerMessageRpc(handlers: any) {
  // singleton pattern: keep only one listener
  window.removeEventListener('message', lastEventListener);
  lastEventListener = event => {
    if (event.origin !== window.location.origin) {
      // enforce same origin
      // we expect to only communicate to iframe-modal
      return;
    }
    try {
      const { fn, args } = JSON.parse(event.data);

      const sendReply = (reply: any) => {
        if (event.source) {
          event.source.postMessage(reply, { targetOrigin: event.origin });
        }
      };
      handlers[fn](sendReply, ...args);
    } catch (error) {
      console.error('Error handling RPC over message:', error, event.data);
    }
  };
  window.addEventListener('message', lastEventListener);
}
