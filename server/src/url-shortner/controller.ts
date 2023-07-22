import { Request, Response } from "express";

import { getShortUrl, retrieveOriginalUrl } from "./service";

export const createShortUrl = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { originalUrl } = req.body;

  const shortUrl = await getShortUrl(originalUrl);
  res.json({ shortUrl });
};

export const getOriginalUrl = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { shortUrl } = req.params;

  const urlData = await retrieveOriginalUrl(shortUrl);

  if (!urlData) {
    res.status(404).json({ error: "URL not found!" });
    return;
  }

  res.json(urlData);
};
