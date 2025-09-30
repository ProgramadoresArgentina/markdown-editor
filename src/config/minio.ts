// Configuración de MinIO - Copia este contenido a tu archivo .env.local
export const minioEnvExample = `
# Configuración de MinIO
MINIO_ENDPOINT=your-minio-endpoint.com
MINIO_PORT=9000
MINIO_USE_SSL=true
MINIO_ACCESS_KEY=your-access-key
MINIO_SECRET_KEY=your-secret-key
MINIO_BUCKET_NAME=your-bucket-name

# URL base para los artículos
ARTICLES_BASE_URL=https://programadoresargentina.com/articulos
NEXT_PUBLIC_ARTICLES_BASE_URL=https://programadoresargentina.com/articulos
`;

// Configuración por defecto para desarrollo
export const minioConfig = {
  endpoint: process.env.MINIO_ENDPOINT || 'your-minio-endpoint.com',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'your-access-key',
  secretKey: process.env.MINIO_SECRET_KEY || 'your-secret-key',
  bucketName: process.env.MINIO_BUCKET_NAME || 'your-bucket-name',
  articlesBaseUrl: process.env.NEXT_PUBLIC_ARTICLES_BASE_URL || 'https://programadoresargentina.com/articulos'
};

