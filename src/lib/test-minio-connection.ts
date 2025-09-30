import { inspectBucketStructure, printBucketStructure, detectOrganizationPatterns, generateAdaptedCode } from './bucket-inspector';

// Función para probar la conexión y mostrar la estructura
export async function testMinioConnection() {
  console.log('🚀 Probando conexión con MinIO...');
  
  try {
    const structure = await inspectBucketStructure();
    
    if (structure.folders.length === 0) {
      console.log('❌ No se encontraron carpetas. Verifica:');
      console.log('   1. Las credenciales de MinIO en .env.local');
      console.log('   2. El nombre del bucket');
      console.log('   3. Los permisos de acceso');
      return null;
    }

    // Mostrar estructura
    printBucketStructure(structure);
    
    // Detectar patrones
    const patterns = detectOrganizationPatterns(structure);
    
    console.log('\n🔍 PATRONES DETECTADOS:');
    console.log('='.repeat(30));
    console.log(`📝 Archivos Markdown: ${patterns.markdownPattern}`);
    console.log(`🖼️  Imágenes: ${patterns.imagePattern}`);
    console.log(`📁 Nombres de carpetas: ${patterns.folderNamingPattern}`);
    
    if (patterns.recommendations.length > 0) {
      console.log('\n💡 RECOMENDACIONES:');
      patterns.recommendations.forEach((rec, i) => {
        console.log(`   ${i + 1}. ${rec}`);
      });
    }

    // Generar código adaptado
    const adaptedCode = generateAdaptedCode(structure);
    console.log('\n⚙️  CÓDIGO ADAPTADO:');
    console.log('='.repeat(20));
    console.log(adaptedCode);
    
    return {
      structure,
      patterns,
      adaptedCode
    };
    
  } catch (error) {
    console.error('❌ Error conectando con MinIO:', error);
    return null;
  }
}

// Para usar en desarrollo - llamar desde el navegador
if (typeof window !== 'undefined') {
  (window as Window & { testMinio?: typeof testMinioConnection }).testMinio = testMinioConnection;
}

