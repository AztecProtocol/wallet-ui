import { RequestData, requestDataFromJson, requestDataToJson } from './request_data.js';

const REQUESTS_STORAGE_KEY = 'KEY_SOURCE_CREATOR_REQUEST_IDS';

export class Database {
  public getRequestData(reqId: string) {
    const jsonStr = localStorage.getItem(reqId);
    return jsonStr ? requestDataFromJson(JSON.parse(jsonStr)) : undefined;
  }

  public addRequestData(reqId: string, data: RequestData) {
    const reqIds = this.getRequestIds();
    if (reqIds.some(id => id === reqId)) {
      throw new Error('Duplicated reqId.');
    }

    this.updateRequestIds([...reqIds, reqId]);
    localStorage.setItem(reqId, JSON.stringify(requestDataToJson(data)));
  }

  public updateRequestData(reqId: string, data?: Buffer, error?: string) {
    const requestData = this.getRequestData(reqId);
    if (!requestData) {
      return;
    }

    localStorage.setItem(reqId, JSON.stringify(requestDataToJson({ ...requestData, data, error })));
    const event = new CustomEvent('storage', { detail: { key: reqId } });
    dispatchEvent(event);
  }

  public removeRequestData(reqId: string) {
    const reqIds = this.getRequestIds().filter(id => id !== reqId);
    localStorage.removeItem(reqId);
    this.updateRequestIds(reqIds);
  }

  public removeOutdatedRequestData(requestTimeout: number) {
    const now = Date.now();
    const reqIds = this.getRequestIds();
    reqIds.forEach(reqId => {
      const { createdAt } = JSON.parse(localStorage.getItem(reqId) || '{}');
      if (createdAt && createdAt + requestTimeout <= now) {
        this.removeRequestData(reqId);
      }
    });
  }

  private getRequestIds() {
    const reqIds: string[] = JSON.parse(localStorage.getItem(REQUESTS_STORAGE_KEY) || '[]');
    return reqIds;
  }

  private updateRequestIds(reqIds: string[]) {
    localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(reqIds));
  }
}
