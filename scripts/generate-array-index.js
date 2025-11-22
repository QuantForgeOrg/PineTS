// SPDX-License-Identifier: AGPL-3.0-only
import { readdir, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const arrayDir = join(__dirname, '../src/namespaces/array');
const gettersDir = join(arrayDir, 'getters');
const methodsDir = join(arrayDir, 'methods');
const outputFile = join(arrayDir, 'array.index.ts');

async function generateIndex() {
    try {
        // Read getters directory (if it exists)
        let getters = [];
        try {
            const getterFiles = await readdir(gettersDir);
            getters = getterFiles.filter((f) => f.endsWith('.ts') && f !== 'array.index.ts' && f !== 'index.ts').map((f) => f.replace('.ts', ''));
        } catch (error) {
            // Getters directory doesn't exist, that's fine
            getters = [];
        }

        // Read methods directory
        const methodFiles = await readdir(methodsDir);
        const methods = methodFiles
            .filter((f) => f.endsWith('.ts'))
            .map((f) => {
                const name = f.replace('.ts', '');
                // Handle 'new' which is a reserved keyword - file is named 'new.ts' but exports as 'new_fn'
                return name === 'new' ? { file: name, export: 'new_fn', classProp: 'new' } : { file: name, export: name, classProp: name };
            });

        // Generate imports
        const getterImports = getters.length > 0 ? getters.map((name) => `import { ${name} } from './getters/${name}';`).join('\n') : '';
        const methodImports = methods.map((m) => {
            if (m.file === 'new') {
                return `import { new_fn } from './methods/${m.file}';`;
            }
            return `import { ${m.export} } from './methods/${m.file}';`;
        }).join('\n');

        // Generate getters object
        const gettersObj = getters.map((name) => `  ${name}`).join(',\n');
        const gettersObjStr = getters.length > 0 ? `const getters = {\n${gettersObj}\n};` : '';

        // Generate methods object - handle 'new' specially
        const methodsObj = methods.map((m) => {
            if (m.file === 'new') {
                return `  new: new_fn`;
            }
            return `  ${m.classProp}`;
        }).join(',\n');
        const methodsObjStr = `const methods = {\n${methodsObj}\n};`;

        // Generate type declarations for getters (as readonly properties)
        const getterTypes = getters.map((name) => `  readonly ${name}: ReturnType<ReturnType<typeof getters.${name}>>;`).join('\n');

        // Generate type declarations for methods - handle 'new' specially
        const methodTypes = methods.map((m) => {
            if (m.file === 'new') {
                return `  new: ReturnType<typeof methods.new>;`;
            }
            return `  ${m.classProp}: ReturnType<typeof methods.${m.classProp}>;`;
        }).join('\n');

        // Generate the class
        const classCode = `// SPDX-License-Identifier: AGPL-3.0-only
// This file is auto-generated. Do not edit manually.
// Run: npm run generate:array-index

export { PineArrayObject } from './PineArrayObject';

${getterImports ? getterImports + '\n' : ''}${methodImports}

${gettersObjStr ? gettersObjStr + '\n' : ''}${methodsObjStr}

export class PineArray {
  private _cache = {};
${getterTypes ? getterTypes + '\n' : ''}${methodTypes}

  constructor(private context: any) {
${getters.length > 0 ? `    // Install getters
    Object.entries(getters).forEach(([name, factory]) => {
      Object.defineProperty(this, name, {
        get: factory(context),
        enumerable: true
      });
    });
    ` : ''}    // Install methods
    Object.entries(methods).forEach(([name, factory]) => {
      this[name] = factory(context);
    });
  }
}

export default PineArray;
`;

        await writeFile(outputFile, classCode, 'utf-8');
        console.log(`✅ Generated ${outputFile}`);
        if (getters.length > 0) {
            console.log(`   - ${getters.length} getters: ${getters.join(', ')}`);
        }
        console.log(`   - ${methods.length} methods: ${methods.map(m => m.classProp).join(', ')}`);
    } catch (error) {
        console.error('Error generating Array index:', error);
        process.exit(1);
    }
}

generateIndex();

