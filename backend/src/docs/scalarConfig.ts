import { apiReference } from '@scalar/express-api-reference';
import fs from 'fs';
import path from 'path';

export const scalarDocs = apiReference({
  content: () => {
    const specPath = path.join(process.cwd(), 'src/docs/openapi.json');
    const spec = fs.readFileSync(specPath, 'utf-8');
    return JSON.parse(spec);
  },
  // User Configuration
  hideClientButton: true,
  theme: 'deepSpace',
});
