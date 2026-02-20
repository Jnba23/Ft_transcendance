import { apiReference } from '@scalar/express-api-reference';
import fs from 'fs';
import path from 'path';

export const scalarDocs = apiReference({
    theme: 'default',
    layout: 'modern',
    defaultHttpClient: {
        targetKey: 'node',
        clientKey: 'undici',
    },
    content: () => {
        const specPath = path.join(process.cwd(), 'src/docs/openapi.json');
        const spec = fs.readFileSync(specPath, 'utf-8');
        return JSON.parse(spec);
    },
    // User Configuration
    hideClientButton: true,
    hideModels: true,
    hideTestRequestButton: true,
    showSidebar: true,
    showDeveloperTools: 'localhost',
    operationTitleSource: 'summary',
    persistAuth: false,
    telemetry: true,
    isEditable: false,
    isLoading: false,
    documentDownloadType: 'both',
    hideSearch: false,
    showOperationId: false,
    hideDarkModeToggle: false,
    withDefaultFonts: true,
    defaultOpenAllTags: false,
    expandAllModelSections: false,
    expandAllResponses: false,
    orderSchemaPropertiesBy: 'alpha',
    orderRequiredPropertiesFirst: true,
    // Attempt to hide AI in search using custom CSS
    customCss: `
    .scalar-search-ai { display: none !important; }
    .scalar-api-client__ai { display: none !important; }
  `,
});
