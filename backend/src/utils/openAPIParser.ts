import SwaggerParser from '@apidevtools/swagger-parser';

export class OpenAPIParser {
  static async parse(content: string, fileName: string) {
    const chunks: Array<{ content: string; metadata: any }> = [];

    try {
      const api = await SwaggerParser.parse(JSON.parse(content));

      // Parse API info
      if (api.info) {
        const infoContent = `API: ${api.info.title}\n${api.info.description || ''}\nVersion: ${api.info.version}`;
        const infoChunks = this.chunkText(infoContent, 500);
        
        infoChunks.forEach((chunk, index) => {
          chunks.push({
            content: chunk,
            metadata: {
              fileName,
              section: 'info',
              type: 'openapi',
              chunkIndex: index,
            },
          });
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
                  if (param.required) content += `  Required: ${param.required}\n`;
                  if (param.schema) {
                    const schemaType = param.schema.type || 'any';
                    content += `  Type: ${schemaType}\n`;
                    if (param.schema.enum) content += `  Enum: ${param.schema.enum.join(', ')}\n`;
                    if (param.schema.default !== undefined) content += `  Default: ${param.schema.default}\n`;
                  }
                });
              }

              if (endpoint.requestBody) {
                content += '\nRequest Body:\n';
                const reqBody = endpoint.requestBody as any;
                if (reqBody.required) content += `Required: ${reqBody.required}\n`;
                if (reqBody.description) content += `Description: ${reqBody.description}\n`;
                
                // Serialize request body schema more intelligently
                if (reqBody.content) {
                  for (const [mediaType, mediaTypeObj] of Object.entries(reqBody.content)) {
                    content += `Content-Type: ${mediaType}\n`;
                    if ((mediaTypeObj as any).schema) {
                      content += this.formatSchema((mediaTypeObj as any).schema);
                    }
                  }
                }
              }

              if (endpoint.responses) {
                content += '\nResponses:\n';
                for (const [code, response] of Object.entries(endpoint.responses)) {
                  const resp = response as any;
                  content += `- ${code}: ${resp.description || ''}\n`;
                  if (resp.content) {
                    for (const [mediaType, mediaTypeObj] of Object.entries(resp.content)) {
                      content += `  Content-Type: ${mediaType}\n`;
                      if ((mediaTypeObj as any).schema) {
                        content += this.formatSchema((mediaTypeObj as any).schema, '    ');
                      }
                    }
                  }
                }
              }

              // Chunk the endpoint content
              const endpointChunks = this.chunkText(content, 500);
              endpointChunks.forEach((chunk, index) => {
                chunks.push({
                  content: chunk,
                  metadata: {
                    fileName,
                    section: `${method.toUpperCase()} ${path}`,
                    type: 'openapi',
                    endpoint: path,
                    method,
                    chunkIndex: index,
                  },
                });
              });
            }
          }
        }
      }

      // Parse schemas
      const apiDoc = api as any;
      if (apiDoc.components?.schemas) {
        for (const [schemaName, schema] of Object.entries(apiDoc.components.schemas)) {
          let schemaContent = `Schema: ${schemaName}\n`;
          schemaContent += this.formatSchema(schema as any);
          
          // Chunk the schema content
          const schemaChunks = this.chunkText(schemaContent, 500);
          schemaChunks.forEach((chunk, index) => {
            chunks.push({
              content: chunk,
              metadata: {
                fileName,
                section: `schema-${schemaName}`,
                type: 'openapi',
                schemaName,
                chunkIndex: index,
              },
            });
          });
        }
      }

      return chunks;
    } catch (error) {
      console.error('Error parsing OpenAPI spec:', error);
      // Fallback: chunk as plain text
      const fallbackChunks = this.chunkText(content, 500);
      return fallbackChunks.map((chunk, index) => ({
        content: chunk,
        metadata: {
          fileName,
          section: 'raw',
          type: 'openapi',
          parseError: true,
          chunkIndex: index,
        },
      }));
    }
  }

  private static formatSchema(schema: any, indent: string = ''): string {
    let result = '';
    
    if (schema.$ref) {
      result += `${indent}Reference: ${schema.$ref}\n`;
      return result;
    }

    if (schema.type) {
      result += `${indent}Type: ${schema.type}\n`;
    }

    if (schema.description) {
      result += `${indent}Description: ${schema.description}\n`;
    }

    if (schema.enum) {
      result += `${indent}Enum: ${schema.enum.join(', ')}\n`;
    }

    if (schema.format) {
      result += `${indent}Format: ${schema.format}\n`;
    }

    if (schema.required && Array.isArray(schema.required)) {
      result += `${indent}Required fields: ${schema.required.join(', ')}\n`;
    }

    if (schema.properties) {
      result += `${indent}Properties:\n`;
      for (const [propName, propSchema] of Object.entries(schema.properties)) {
        result += `${indent}  - ${propName}:\n`;
        result += this.formatSchema(propSchema as any, indent + '    ');
      }
    }

    if (schema.items) {
      result += `${indent}Items:\n`;
      result += this.formatSchema(schema.items, indent + '  ');
    }

    if (schema.minimum !== undefined) {
      result += `${indent}Minimum: ${schema.minimum}\n`;
    }

    if (schema.maximum !== undefined) {
      result += `${indent}Maximum: ${schema.maximum}\n`;
    }

    if (schema.minLength !== undefined) {
      result += `${indent}Min Length: ${schema.minLength}\n`;
    }

    if (schema.maxLength !== undefined) {
      result += `${indent}Max Length: ${schema.maxLength}\n`;
    }

    if (schema.default !== undefined) {
      result += `${indent}Default: ${schema.default}\n`;
    }

    return result;
  }

  private static chunkText(text: string, maxTokens: number): string[] {
    // Simple word-based chunking (approximate tokens)
    const words = text.split(/\s+/);
    const chunks: string[] = [];
    let currentChunk: string[] = [];

    for (const word of words) {
      currentChunk.push(word);
      
      if (currentChunk.length >= maxTokens) {
        chunks.push(currentChunk.join(' '));
        // Overlap: keep last 50 words for context continuity
        currentChunk = currentChunk.slice(-50);
      }
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk.join(' '));
    }

    return chunks.length > 0 ? chunks : [text];
  }
}

