import type { VercelRequest, VercelResponse } from '@vercel/node';
import yts from 'yt-search';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  try {
    const query = request.query.q as string;
    if (!query) {
      return response.status(400).json({ error: 'Query is required' });
    }
    
    const r = await yts(query);
    const videos = r.videos.slice(0, 5);
    return response.status(200).json({ videos });
  } catch (error) {
    console.error('Search error:', error);
    return response.status(500).json({ error: 'Failed to search' });
  }
}
