import { marked } from 'marked';

export class MarkdownParser {
  static parse(content: string, fileName: string) {
    const chunks: Array<{ content: string; metadata: any }> = [];
    
    // Split by headers to create semantic chunks
    const sections = this.splitByHeaders(content);
    
    sections.forEach((section, index) => {
      // Further split large sections
      const subChunks = this.chunkText(section.content, 500);
      
      subChunks.forEach((chunk, subIndex) => {
        chunks.push({
          content: chunk,
          metadata: {
            fileName,
            section: section.title,
            chunkIndex: index,
            subChunkIndex: subIndex,
            type: 'markdown',
          },
        });
      });
    });
    
    return chunks;
  }

  private static splitByHeaders(content: string) {
    const lines = content.split('\n');
    const sections: Array<{ title: string; content: string }> = [];
    let currentSection = { title: 'Introduction', content: '' };

    for (const line of lines) {
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
      
      if (headerMatch) {
        // Save previous section if it has content
        if (currentSection.content.trim()) {
          sections.push({ ...currentSection });
        }
        
        // Start new section
        currentSection = {
          title: headerMatch[2],
          content: line + '\n',
        };
      } else {
        currentSection.content += line + '\n';
      }
    }

    // Add last section
    if (currentSection.content.trim()) {
      sections.push(currentSection);
    }

    return sections;
  }

  private static chunkText(text: string, maxTokens: number) {
    // Simple word-based chunking (approximate tokens)
    const words = text.split(/\s+/);
    const chunks: string[] = [];
    let currentChunk: string[] = [];

    for (const word of words) {
      currentChunk.push(word);
      
      if (currentChunk.length >= maxTokens) {
        chunks.push(currentChunk.join(' '));
        // Overlap: keep last 50 words
        currentChunk = currentChunk.slice(-50);
      }
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk.join(' '));
    }

    return chunks.length > 0 ? chunks : [text];
  }
}

