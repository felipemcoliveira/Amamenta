export interface EnvironmentConfig {
  isDevelopment: boolean;
  isProduction: boolean;
  httpPort: number;
}

export default () => {
  return {
    env: <EnvironmentConfig>{
      isDevelopment: (process.env.NODE_ENV || 'development') === 'development',
      isProduction: process.env.NODE_ENV === 'production',
      httpPort: parseInt(process.env.HTTP_PORT) || 80
    }
  };
};
