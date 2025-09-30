import AWS from 'aws-sdk';

// Configuración de MinIO
const minioConfig = {
  endpoint: process.env.MINIO_ENDPOINT || 'your-minio-endpoint.com',
  region: process.env.MINIO_REGION || 'us-east-1',
  accessKey: process.env.MINIO_ACCESS_KEY || 'your-access-key',
  secretKey: process.env.MINIO_SECRET_KEY || 'your-secret-key',
  bucketName: process.env.MINIO_BUCKET_NAME || 'your-bucket-name',
};

// Configurar cliente S3 para MinIO
const s3Client = new AWS.S3({
  endpoint: minioConfig.endpoint, // El endpoint ya incluye https://
  accessKeyId: minioConfig.accessKey,
  secretAccessKey: minioConfig.secretKey,
  s3ForcePathStyle: true, // Necesario para MinIO
  signatureVersion: 'v4',
  region: minioConfig.region
});

export interface Article {
  title: string;
  slug: string;
  content?: string;
  folderName: string;
  url: string;
}

// Función para obtener la lista de artículos desde MinIO
export async function getArticlesFromMinio(): Promise<Article[]> {
  try {
    const params = {
      Bucket: minioConfig.bucketName,
      Delimiter: '/',
    };

    const data = await s3Client.listObjectsV2(params).promise();
    const articles: Article[] = [];

    if (data.CommonPrefixes) {
      for (const prefix of data.CommonPrefixes) {
        if (prefix.Prefix) {
          const folderName = prefix.Prefix.replace('/', '');
          
          // Buscar el archivo markdown principal en la carpeta
          const folderContents = await s3Client.listObjectsV2({
            Bucket: minioConfig.bucketName,
            Prefix: prefix.Prefix,
          }).promise();

          // Buscar archivos .md en la carpeta
          const markdownFiles = folderContents.Contents?.filter(
            obj => obj.Key?.endsWith('.md')
          ) || [];

          if (markdownFiles.length > 0) {
            // Tomar el primer archivo markdown encontrado
            const markdownFile = markdownFiles[0];
            
            if (markdownFile.Key) {
              try {
                // Obtener el contenido del archivo markdown
                const fileData = await s3Client.getObject({
                  Bucket: minioConfig.bucketName,
                  Key: markdownFile.Key,
                }).promise();

                const content = fileData.Body?.toString('utf-8') || '';
                
                // Extraer el título del contenido markdown (primera línea con #)
                const titleMatch = content.match(/^#\s+(.+)$/m);
                const title = titleMatch ? titleMatch[1].trim() : folderName;

                const article: Article = {
                  title,
                  slug: folderName,
                  content,
                  folderName,
                  url: `${process.env.NEXT_PUBLIC_ARTICLES_BASE_URL || 'https://programadoresargentina.com/articulos'}/${folderName}`
                };

                articles.push(article);
              } catch (error) {
                console.error(`Error al leer archivo ${markdownFile.Key}:`, error);
                // Si no podemos leer el archivo, crear entrada básica
                const article: Article = {
                  title: folderName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                  slug: folderName,
                  folderName,
                  url: `${process.env.NEXT_PUBLIC_ARTICLES_BASE_URL || 'https://programadoresargentina.com/articulos'}/${folderName}`
                };
                articles.push(article);
              }
            }
          }
        }
      }
    }

    return articles;
  } catch (error) {
    console.error('Error al obtener artículos de MinIO:', error);
    return [];
  }
}

// Función para buscar artículos por título
export function searchArticles(articles: Article[], query: string): Article[] {
  const normalizedQuery = query.toLowerCase();
  return articles.filter(article =>
    article.title.toLowerCase().includes(normalizedQuery) ||
    article.slug.toLowerCase().includes(normalizedQuery)
  );
}

// Configuración por defecto para desarrollo/pruebas
export const defaultArticles: Article[] = [
  {
    title: "Juniors e Inteligencia Artificial: ¿Amenaza o oportunidad?",
    slug: "ai-junior-oportunidad-o-amenaza",
    folderName: "ai-junior-oportunidad-o-amenaza",
    url: "https://programadoresargentina.com/articulos/ai-junior-oportunidad-o-amenaza"
  },
  {
    title: "Guía completa de React Hooks",
    slug: "guia-react-hooks",
    folderName: "guia-react-hooks", 
    url: "https://programadoresargentina.com/articulos/guia-react-hooks"
  },
  {
    title: "Mejores prácticas en JavaScript",
    slug: "mejores-practicas-javascript",
    folderName: "mejores-practicas-javascript",
    url: "https://programadoresargentina.com/articulos/mejores-practicas-javascript"
  }
];
