import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

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

describe('Design System Consistency & Architectural Rules (Vitest)', () => {
  it('no debe existir ninguna ocurrencia de max-w-4xl en clases de archivos TSX de src/', () => {
    const tsxFiles = getAllTsxFiles(srcDir);
    const offendingFiles: string[] = [];
    const classNameRegex = /(?:className|class)\s*=\s*["'`][^"'`]*\bmax-w-4xl\b/;

    for (const filePath of tsxFiles) {
      const content = fs.readFileSync(filePath, 'utf-8');
      if (classNameRegex.test(content)) {
        offendingFiles.push(path.relative(rootDir, filePath));
      }
    }

    expect(offendingFiles).toEqual([]);
  });

  it('todas las páginas y vistas principales deben implementar el ancho maestro canónico max-w-5xl', () => {
    const canonicalFiles = [
      'src/app/page.tsx',
      'src/app/about/page.tsx',
      'src/app/privacy/page.tsx',
      'src/app/terms/page.tsx',
      'src/app/techniques/[slug]/page.tsx',
      'src/app/tecnicas/[id]/page.tsx',
      'src/components/TechniquesCatalogHome.tsx',
      'src/components/FaqAndMethodology.tsx',
    ];

    for (const relPath of canonicalFiles) {
      const fullPath = path.join(rootDir, relPath);
      expect(fs.existsSync(fullPath)).toBe(true);
      const content = fs.readFileSync(fullPath, 'utf-8');
      expect(content).toContain('max-w-5xl');
    }
  });

  it('las rejillas de tarjetas multi-columna deben cumplir el patrón Equal Height (items-stretch, h-full, mt-auto)', () => {
    const catalogPath = path.join(srcDir, 'components', 'TechniquesCatalogHome.tsx');
    const content = fs.readFileSync(catalogPath, 'utf-8');

    // 1. Alineación elástica en rejilla
    expect(content).toContain('items-stretch');

    // 2. Tarjetas con flex y altura total
    expect(content).toContain('h-full');
    expect(content).toContain('flex-col');
    expect(content).toContain('justify-between');

    // 3. Anclaje de botones al fondo
    expect(content).toContain('mt-auto');
  });

  it('las miniaturas de video deben fijar la relación de aspecto aspect-video', () => {
    const catalogPath = path.join(srcDir, 'components', 'TechniquesCatalogHome.tsx');
    const content = fs.readFileSync(catalogPath, 'utf-8');
    expect(content).toContain('aspect-video');
  });

  it('los componentes interactivos en src/components/ deben incluir la directiva "use client"', () => {
    const compDir = path.join(srcDir, 'components');
    const files = fs.readdirSync(compDir).filter((f) => f.endsWith('.tsx') && !f.includes('.test.'));

    for (const file of files) {
      const fullPath = path.join(compDir, file);
      const content = fs.readFileSync(fullPath, 'utf-8');
      if (content.includes('useState') || content.includes('useEffect') || content.includes('onClick')) {
        const cleaned = content.replace(/^\uFEFF/, '').trimStart();
        const hasUseClient = cleaned.startsWith("'use client'") || cleaned.startsWith('"use client"');
        expect(hasUseClient, `El archivo ${file} debe comenzar con 'use client'`).toBe(true);
      }
    }
  });

  it('los botones de pestañas fuera de tablist deben usar aria-pressed y nunca aria-selected', () => {
    const catalogPath = path.join(srcDir, 'components', 'TechniquesCatalogHome.tsx');
    const content = fs.readFileSync(catalogPath, 'utf-8');

    expect(content).toContain('aria-pressed=');
    expect(content).not.toContain('aria-selected=');
  });
});
