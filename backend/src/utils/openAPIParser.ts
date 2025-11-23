import SwaggerParser from '@apidevtools/swagger-parser';

export class OpenAPIParser {
  static async parse(content: string, fileName: string) {
    const chunks: Array<{ content: string; metadata: any }> = [];

    try {
      const api = await SwaggerParser.parse(JSON.parse(content));

      // Parse API info
      if (api.info) {
        chunks.push({
          content: `API: ${api.info.title}\n${api.info.description || ''}\nVersion: ${api.info.version}`,
          metadata: {
            fileName,
            section: 'info',
            type: 'openapi',
          },
        });
      }

      // Parse paths/endpoints
      if (api.paths) {
        for (const [path, methods] of Object.entries(api.paths)) {
          for (const [method, details] of Object.entries(methods as any)) {
            if (typeof details === 'object' && details !== null) {
              const endpoint = details as any;
              let content = `Endpoint: ${method.toUpperCase()} ${path}\n`;
              
              if (endpoint.summary) content += `Summary: ${endpoint.summary}\n`;
              if (endpoint.description) content += `Description: ${endpoint.description}\n`;
              
              if (endpoint.parameters) {
                content += '\nParameters:\n';
                endpoint.parameters.forEach((param: any) => {
                  content += `- ${param.name} (${param.in}): ${param.description || ''}\n`;
                });
              }

              if (endpoint.requestBody) {
                content += '\nRequest Body: ' + JSON.stringify(endpoint.requestBody, null, 2) + '\n';
              }

              if (endpoint.responses) {
                content += '\nResponses:\n';
                for (const [code, response] of Object.entries(endpoint.responses)) {
                  content += `- ${code}: ${(response as any).description || ''}\n`;
                }
              }

              chunks.push({
                content,
                metadata: {
                  fileName,
                  section: `${method.toUpperCase()} ${path}`,
                  type: 'openapi',
                  endpoint: path,
                  method,
                },
              });
            }
          }
        }
      }

      // Parse schemas
      if (api.components?.schemas) {
        for (const [schemaName, schema] of Object.entries(api.components.schemas)) {
          chunks.push({
            content: `Schema: ${schemaName}\n${JSON.stringify(schema, null, 2)}`,
            metadata: {
              fileName,
              section: `schema-${schemaName}`,
              type: 'openapi',
              schemaName,
            },
          });
        }
      }

      return chunks;
    } catch (error) {
      console.error('Error parsing OpenAPI spec:', error);
      // Fallback: treat as plain text
      return [
        {
          content,
          metadata: {
            fileName,
            section: 'raw',
            type: 'openapi',
            parseError: true,
          },
        },
      ];
    }
  }
}

