export interface RequestData {
  data?: Buffer;
  error?: string;
  createdAt: number;
}

interface RequestDataJson {
  data?: string;
  error?: string;
  createdAt: number;
}

export const requestDataToJson = ({ data, error, createdAt }: RequestData): RequestDataJson => ({
  data: data?.toString('hex'),
  error,
  createdAt,
});

export const requestDataFromJson = ({ data, error, createdAt }: RequestDataJson): RequestData => ({
  data: data ? Buffer.from(data, 'hex') : undefined,
  error,
  createdAt,
});
