export interface ErrorLogParams {
  level?: 'error' | 'warn' | 'info';
  message: string;
  stack?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  userId?: any;
}