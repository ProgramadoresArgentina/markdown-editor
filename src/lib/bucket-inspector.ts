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
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
  region: minioConfig.region
});

export interface BucketStructure {
  folders: string[];
  files: Array<{
    key: string;
    folder: string;
    fileName: string;
    size: number;
    lastModified: Date;
  }>;
  structure: Record<string, string[]>;
}

// Función para inspeccionar la estructura completa del bucket
export async function inspectBucketStructure(): Promise<BucketStructure> {
  try {
    console.log('🔍 Inspeccionando estructura del bucket:', minioConfig.bucketName);
    
    // Obtener todos los objetos del bucket
    const allObjects = await s3Client.listObjectsV2({
      Bucket: minioConfig.bucketName,
    }).promise();

    const folders = new Set<string>();
    const files: BucketStructure['files'] = [];
    const structure: Record<string, string[]> = {};

    if (allObjects.Contents) {
      for (const obj of allObjects.Contents) {
        if (obj.Key) {
          const parts = obj.Key.split('/');
          
          // Si tiene más de una parte, es un archivo en una carpeta
          if (parts.length > 1) {
            const folder = parts[0];
            const fileName = parts.slice(1).join('/');
            
            folders.add(folder);
            
            if (!structure[folder]) {
              structure[folder] = [];
            }
            structure[folder].push(fileName);
            
            files.push({
              key: obj.Key,
              folder,
              fileName,
              size: obj.Size || 0,
              lastModified: obj.LastModified || new Date()
            });
          } else {
            // Archivo en la raíz
            files.push({
              key: obj.Key,
              folder: '',
              fileName: obj.Key,
              size: obj.Size || 0,
              lastModified: obj.LastModified || new Date()
            });
          }
        }
      }
    }

    const result: BucketStructure = {
      folders: Array.from(folders).sort(),
      files,
      structure
    };

    console.log('📁 Estructura encontrada:');
    console.log('Carpetas:', result.folders);
    console.log('Estructura detallada:', result.structure);
    
    return result;
  } catch (error) {
    console.error('❌ Error inspeccionando bucket:', error);
    return {
      folders: [],
      files: [],
      structure: {}
    };
  }
}

// Función para mostrar la estructura de forma legible
export function printBucketStructure(structure: BucketStructure): void {
  console.log('\n📊 ESTRUCTURA DEL BUCKET:');
  console.log('='.repeat(50));
  
  if (structure.folders.length === 0) {
    console.log('❌ No se encontraron carpetas');
    return;
  }

  for (const folder of structure.folders) {
    console.log(`\n📁 ${folder}/`);
    
    const folderFiles = structure.structure[folder] || [];
    
    // Separar por tipo de archivo
    const markdownFiles = folderFiles.filter(f => f.endsWith('.md'));
    const imageFiles = folderFiles.filter(f => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f));
    const otherFiles = folderFiles.filter(f => 
      !f.endsWith('.md') && 
      !/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f)
    );

    if (markdownFiles.length > 0) {
      console.log('   📝 Archivos Markdown:');
      markdownFiles.forEach(file => console.log(`      - ${file}`));
    }

    if (imageFiles.length > 0) {
      console.log('   🖼️  Imágenes:');
      imageFiles.forEach(file => console.log(`      - ${file}`));
    }

    if (otherFiles.length > 0) {
      console.log('   📄 Otros archivos:');
      otherFiles.forEach(file => console.log(`      - ${file}`));
    }

    if (folderFiles.length === 0) {
      console.log('   ⚠️  Carpeta vacía');
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`📊 Resumen: ${structure.folders.length} carpetas, ${structure.files.length} archivos`);
}

// Función para detectar patrones en la organización
export function detectOrganizationPatterns(structure: BucketStructure): {
  markdownPattern: string;
  imagePattern: string;
  folderNamingPattern: string;
  recommendations: string[];
} {
  const markdownFiles = structure.files.filter(f => f.fileName.endsWith('.md'));
  const imageFiles = structure.files.filter(f => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f.fileName));
  
  // Detectar patrón de archivos markdown
  const markdownNames = markdownFiles.map(f => f.fileName);
  let markdownPattern = 'mixed';
  
  if (markdownNames.every(name => name === 'index.md')) {
    markdownPattern = 'index.md';
  } else if (markdownNames.every(name => name === 'README.md')) {
    markdownPattern = 'README.md';
  } else if (markdownNames.every(name => name.toLowerCase().includes('article'))) {
    markdownPattern = 'article-based';
  }

  // Detectar patrón de imágenes
  let imagePattern = 'mixed';
  const hasImageFolders = structure.folders.some(folder => 
    structure.structure[folder]?.some(file => file.startsWith('images/'))
  );
  
  if (hasImageFolders) {
    imagePattern = 'images-folder';
  } else if (imageFiles.length > 0) {
    imagePattern = 'root-level';
  }

  // Detectar patrón de nombres de carpetas
  const folderNames = structure.folders;
  let folderNamingPattern = 'mixed';
  
  if (folderNames.every(name => name.includes('-'))) {
    folderNamingPattern = 'kebab-case';
  } else if (folderNames.every(name => name.includes('_'))) {
    folderNamingPattern = 'snake_case';
  } else if (folderNames.every(name => /^[a-z]+$/.test(name))) {
    folderNamingPattern = 'lowercase';
  }

  // Generar recomendaciones
  const recommendations: string[] = [];
  
  if (markdownPattern === 'mixed') {
    recommendations.push('Estandarizar nombres de archivos markdown (recomendado: index.md)');
  }
  
  if (imagePattern === 'mixed') {
    recommendations.push('Organizar imágenes en carpetas "images/" dentro de cada artículo');
  }
  
  if (folderNamingPattern === 'mixed') {
    recommendations.push('Estandarizar nombres de carpetas (recomendado: kebab-case)');
  }

  return {
    markdownPattern,
    imagePattern,
    folderNamingPattern,
    recommendations
  };
}

// Función para generar código adaptado a la estructura actual
export function generateAdaptedCode(structure: BucketStructure): string {
  const patterns = detectOrganizationPatterns(structure);
  
  let code = `// Código adaptado a tu estructura de MinIO\n\n`;
  
  // Adaptar la función de lectura de archivos markdown
  if (patterns.markdownPattern === 'index.md') {
    code += `// Tu estructura usa index.md como archivo principal\n`;
    code += `const markdownFiles = folderContents.Contents?.filter(\n`;
    code += `  obj => obj.Key?.endsWith('/index.md')\n`;
    code += `) || [];\n\n`;
  } else if (patterns.markdownPattern === 'README.md') {
    code += `// Tu estructura usa README.md como archivo principal\n`;
    code += `const markdownFiles = folderContents.Contents?.filter(\n`;
    code += `  obj => obj.Key?.endsWith('/README.md')\n`;
    code += `) || [];\n\n`;
  } else {
    code += `// Tu estructura usa archivos markdown variados\n`;
    code += `const markdownFiles = folderContents.Contents?.filter(\n`;
    code += `  obj => obj.Key?.endsWith('.md')\n`;
    code += `) || [];\n\n`;
  }
  
  // Adaptar el manejo de imágenes
  if (patterns.imagePattern === 'images-folder') {
    code += `// Tu estructura organiza imágenes en carpetas "images/"\n`;
    code += `const imageFiles = folderContents.Contents?.filter(\n`;
    code += `  obj => obj.Key?.includes('/images/') && /\\.(jpg|jpeg|png|gif|webp|svg)$/i.test(obj.Key || '')\n`;
    code += `) || [];\n\n`;
  }

  return code;
}
