import { Request, Response, NextFunction } from 'express';
import { DocumentService } from '../services/documentService';

const documentService = new DocumentService();

export const uploadDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const { buffer, originalname, mimetype } = req.file;

    // Validate file size
    const maxSize = parseInt(process.env.MAX_FILE_SIZE || '10485760'); // 10MB
    if (buffer.length > maxSize) {
      res.status(400).json({ 
        error: `File too large. Maximum size is ${maxSize / 1024 / 1024}MB` 
      });
      return;
    }

    console.log(`Received upload request: ${originalname} (${buffer.length} bytes)`);

    const result = await documentService.processUpload(
      buffer,
      originalname,
      mimetype
    );

    res.status(201).json({
      message: 'Document uploaded and processed successfully',
      document: result,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to upload document',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

export const getDocuments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const documents = await documentService.getAllDocuments();
    res.status(200).json({ 
      documents,
      count: documents.length,
    });
  } catch (error) {
    next(error);
  }
};

export const getDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const document = await documentService.getDocumentById(id);
    
    if (!document) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    res.status(200).json({ document });
  } catch (error) {
    next(error);
  }
};

export const deleteDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await documentService.deleteDocument(id);
    res.status(200).json({ message: 'Document deleted successfully' });
  } catch (error: any) {
    if (error.message === 'Document not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    next(error);
  }
};

export const getStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await documentService.getStats();
    res.status(200).json({ stats });
  } catch (error) {
    next(error);
  }
};
