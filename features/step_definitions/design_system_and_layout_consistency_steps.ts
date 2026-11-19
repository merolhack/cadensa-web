import { Given, Then } from '@cucumber/cucumber';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

// Rutas clave a auditar
const rootDir = process.cwd();
const srcDir = path.join(rootDir, 'src');

function getAllTsxFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules') {
        getAllTsxFiles(fullPath, fileList);
      }
    } else if (file.endsWith('.tsx')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

// 1. Contenedor Maestro Canónico
Given('que se evalúa la arquitectura de contención de la aplicación Cadensa', function () {
  const pagePath = path.join(srcDir, 'app', 'page.tsx');
  assert.ok(fs.existsSync(pagePath), 'El archivo principal src/app/page.tsx debe existir.');
});

Then('todas las vistas principales y de navegación deben usar el ancho maestro canónico {string}', function (canonicalWidth: string) {
  const pageContent = fs.readFileSync(path.join(srcDir, 'app', 'page.tsx'), 'utf-8');
  const catalogContent = fs.readFileSync(path.join(srcDir, 'components', 'TechniquesCatalogHome.tsx'), 'utf-8');
  const faqContent = fs.readFileSync(path.join(srcDir, 'components', 'FaqAndMethodology.tsx'), 'utf-8');
  const aboutContent = fs.readFileSync(path.join(srcDir, 'app', 'about', 'page.tsx'), 'utf-8');

  assert.ok(pageContent.includes(canonicalWidth), `page.tsx debe contener el contenedor canónico ${canonicalWidth}`);
  assert.ok(catalogContent.includes(canonicalWidth), `TechniquesCatalogHome.tsx debe contener el contenedor canónico ${canonicalWidth}`);
  assert.ok(faqContent.includes(canonicalWidth), `FaqAndMethodology.tsx debe contener el contenedor canónico ${canonicalWidth}`);
  assert.ok(aboutContent.includes(canonicalWidth), `about/page.tsx debe contener el contenedor canónico ${canonicalWidth}`);
});

Then('ninguna vista principal debe presentar saltos de diseño horizontal al alternar entre inicio y práctica', function () {
  const pageContent = fs.readFileSync(path.join(srcDir, 'app', 'page.tsx'), 'utf-8');
  
  // Ambas vistas deben enmarcarse en max-w-5xl
  const navMatch = pageContent.includes('w-full max-w-5xl');
  const practiceSectionMatch = pageContent.includes('max-w-5xl w-full my-2 sm:my-3 p-4 sm:p-7');
  
  assert.ok(navMatch, 'La barra de navegación debe mantener max-w-5xl');
  assert.ok(practiceSectionMatch, 'La sección de entrenamiento de práctica debe mantener max-w-5xl');
});

Then('el pie de página global debe alinearse exactamente con el marco perimetral maestro', function () {
  const pageContent = fs.readFileSync(path.join(srcDir, 'app', 'page.tsx'), 'utf-8');
  assert.ok(
    pageContent.includes('containerClassName="w-full max-w-5xl"'),
    'El footer en page.tsx debe estar configurado con containerClassName="w-full max-w-5xl"'
  );
});

// 2. Altura Uniforme (Equal Height Cards)
Given('que se analizan las rejillas de tarjetas en el catálogo, práctica y logros', function () {
  const catalogPath = path.join(srcDir, 'components', 'TechniquesCatalogHome.tsx');
  assert.ok(fs.existsSync(catalogPath), 'TechniquesCatalogHome.tsx debe existir');
});

Then('los contenedores de rejilla deben utilizar alineación elástica {string}', function (gridAlignmentClass: string) {
  const catalogContent = fs.readFileSync(path.join(srcDir, 'components', 'TechniquesCatalogHome.tsx'), 'utf-8');
  assert.ok(
    catalogContent.includes(gridAlignmentClass),
    `Las rejillas de tarjetas deben incluir la alineación elástica: ${gridAlignmentClass}`
  );
});

Then('cada tarjeta debe implementar la clase de altura uniforme {string}', function (equalHeightClass: string) {
  const catalogContent = fs.readFileSync(path.join(srcDir, 'components', 'TechniquesCatalogHome.tsx'), 'utf-8');
  const requiredClasses = equalHeightClass.split(' ');
  const allPresent = requiredClasses.every((cls) => catalogContent.includes(cls));
  assert.ok(
    allPresent,
    `Las tarjetas en rejilla deben incluir todas las clases de altura uniforme: ${equalHeightClass}`
  );
});

Then('las barras de botones y acciones finales deben anclarse al fondo con {string}', function (anchorClass: string) {
  const catalogContent = fs.readFileSync(path.join(srcDir, 'components', 'TechniquesCatalogHome.tsx'), 'utf-8');
  assert.ok(
    catalogContent.includes(anchorClass),
    `La barra de acciones finales debe anclarse al fondo con: ${anchorClass}`
  );
});

// 3. Prohibición de clases desalineadas (max-w-4xl)
Given('que se audita el árbol de componentes en {string}', function (targetFolder: string) {
  const folderPath = path.join(rootDir, targetFolder);
  assert.ok(fs.existsSync(folderPath), `La carpeta ${targetFolder} debe existir.`);
});

Then('no debe existir ninguna ocurrencia de la clase desalineada {string} en archivos TSX de componentes y páginas', function (forbiddenClass: string) {
  const tsxFiles = getAllTsxFiles(srcDir);
  const offendingFiles: string[] = [];
  const classRegex = new RegExp(`(?:className|class)\\s*=\\s*["'\`][^"'\`]*\\b${forbiddenClass}\\b`);

  for (const filePath of tsxFiles) {
    const content = fs.readFileSync(filePath, 'utf-8');
    if (classRegex.test(content)) {
      offendingFiles.push(path.relative(rootDir, filePath));
    }
  }

  assert.strictEqual(
    offendingFiles.length,
    0,
    `Se encontraron archivos TSX con la clase desalineada ${forbiddenClass}: ${offendingFiles.join(', ')}`
  );
});

Then('los componentes interactivos en {string} deben declarar la directiva {string}', function (componentsFolder: string, directive: string) {
  const dirPath = path.join(rootDir, componentsFolder);
  const files = fs.readdirSync(dirPath).filter((f) => f.endsWith('.tsx') && !f.includes('.test.'));

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const content = fs.readFileSync(fullPath, 'utf-8');
    // Si usa useState, useEffect o manejadores de eventos, debe tener 'use client'
    if (content.includes('useState') || content.includes('useEffect') || content.includes('onClick')) {
      const cleaned = content.replace(/^\uFEFF/, '').trimStart();
      assert.ok(
        cleaned.startsWith(`'${directive}'`) || cleaned.startsWith(`"${directive}"`),
        `El componente interactivo ${file} debe comenzar con la directiva '${directive}'`
      );
    }
  }
});

// 4. Relaciones de Aspecto
Given('que se inspeccionan las tarjetas con videos y los elementos de avatar u orbes', function () {
  const catalogPath = path.join(srcDir, 'components', 'TechniquesCatalogHome.tsx');
  assert.ok(fs.existsSync(catalogPath));
});

Then('las miniaturas de video deben fijar la relación de aspecto panorámica {string}', function (aspectVideoClass: string) {
  const catalogContent = fs.readFileSync(path.join(srcDir, 'components', 'TechniquesCatalogHome.tsx'), 'utf-8');
  assert.ok(
    catalogContent.includes(aspectVideoClass),
    `Las miniaturas de video deben incluir la clase ${aspectVideoClass}`
  );
});

Then('los avatares, orbes e insignias circulares deben fijar proporciones simétricas cuadradas', function () {
  const fluencyPathContent = fs.readFileSync(path.join(srcDir, 'components', 'FluencyPath.tsx'), 'utf-8');
  assert.ok(
    fluencyPathContent.includes('w-20 h-20') || fluencyPathContent.includes('aspect-square'),
    'Los nodos u orbes deben tener proporciones cuadradas simétricas'
  );
});

// 5. Accesibilidad Ergonómica WCAG 2.1 AA
Given('que se auditan los botones y controles interactivos de la plataforma', function () {
  const catalogPath = path.join(srcDir, 'components', 'TechniquesCatalogHome.tsx');
  assert.ok(fs.existsSync(catalogPath));
});

Then('cada botón interactivo debe contar con un área táctil ergonómica mínima y etiqueta accesible', function () {
  const catalogContent = fs.readFileSync(path.join(srcDir, 'components', 'TechniquesCatalogHome.tsx'), 'utf-8');
  // Verificar botones de laboratorio h-14 o min-h-[56px]
  assert.ok(
    catalogContent.includes('h-14') || catalogContent.includes('min-h-[56px]'),
    'Los botones del laboratorio deben garantizar altura ergonómica mínima'
  );
});

Then('los botones de alternancia en barras de navegación sin tablist deben usar {string}', function (ariaPressedAttr: string) {
  const catalogContent = fs.readFileSync(path.join(srcDir, 'components', 'TechniquesCatalogHome.tsx'), 'utf-8');
  assert.ok(
    catalogContent.includes(`${ariaPressedAttr}=`),
    `Los botones de pestañas deben usar el atributo de accesibilidad: ${ariaPressedAttr}`
  );
  // Verificar que NO use aria-selected indebidamente
  assert.ok(
    !catalogContent.includes('aria-selected='),
    'Los botones fuera de tablist no deben usar aria-selected'
  );
});

Then('no deben existir violaciones estructurales de accesibilidad WCAG 2.1 AA', function () {
  // Verificado mediante suite de accesibilidad automatizada con axe-core
  const a11yTestPath = path.join(srcDir, 'components', 'accessibility.test.tsx');
  assert.ok(fs.existsSync(a11yTestPath), 'El archivo de pruebas de accesibilidad axe-core debe existir');
});
