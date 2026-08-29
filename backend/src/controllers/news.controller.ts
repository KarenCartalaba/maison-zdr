import { Request, Response } from "express";
import {
  CreateNewsService,
  UpdateNewsService,
  DeleteNewsService,
  GetNewsByIdService,
  GetAllNewsService,
} from "@/services/news";

export class NewsController {
  public getAllNews = async (req: Request, res: Response) => {
    const result = await GetAllNewsService(true);
    return res.status(result.code).json(result);
  };

  public getNewsById = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await GetNewsByIdService(id);
    return res.status(result.code).json(result);
  };

  public createNews = async (req: Request, res: Response) => {
    const authorId = (req as any).user?.sub;
    const { title, content, summary, imageUrl, isPublished } = req.body ?? {};

    const result = await CreateNewsService({
      title,
      content,
      summary,
      imageUrl,
      isPublished,
      authorId,
    });
    return res.status(result.code).json(result);
  };

  public updateNews = async (req: Request, res: Response) => {
    const { id, title, content, summary, imageUrl, isPublished } = req.body ?? {};

    const result = await UpdateNewsService({
      id,
      title,
      content,
      summary,
      imageUrl,
      isPublished,
    });
    return res.status(result.code).json(result);
  };

  public deleteNews = async (req: Request, res: Response) => {
    const { id } = req.body ?? {};
    const result = await DeleteNewsService(id);
    return res.status(result.code).json(result);
  };
}
