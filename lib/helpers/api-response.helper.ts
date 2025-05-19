export interface ApiResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: any;
  errors?: string[];
}

export const generateApiResponse = (
  statusCode: number,
  message: string,
  data: any,
  errors?: string[]
): ApiResponse => ({
  statusCode,
  success: statusCode >= 200 && statusCode < 300,
  message,
  data,
  errors: errors || [],
});
