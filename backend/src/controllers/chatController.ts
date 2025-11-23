import { Request, Response, NextFunction } from 'express';
import { ChatService } from '../services/chatService';

const chatService = new ChatService();

export const chat = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { message, sessionId } = req.body;

    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const result = await chatService.processMessage(message, sessionId);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getChatHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const history = await chatService.getChatHistory(sessionId);
    res.status(200).json({ history });
  } catch (error) {
    next(error);
  }
};

