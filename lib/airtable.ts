import Airtable from 'airtable';
import { useSession } from 'next-auth/react';

interface AirtableAttachment {
  id: string;
  url: string;
  filename: string;
  size: number;
  type: string;
}

interface AirtableRecord {
  id: string;
  get(field: string): any;
}

export interface IGPost {
  id: string;
  title: string;
  caption: string;
  status: string;
  deadline: string;
  'Cloudinary URL': string;
  Thumbnail: AirtableAttachment[];
  isUrgent: boolean;
  notes: string;
  type: 'image' | 'video' | 'story';
  uploaded: boolean;
  [key: string]: any;
}

export interface RedditPost {
  id: string;
  Title: string;
  Link: string;
  Media: 'Image' | 'Gif/Video';
  Status?: string;
  Image?: {
    url: string;
    filename: string;
    type: string;
  }[];
  'Cloudinary URL': string;
  [key: string]: any;
}

const DEFAULT_VIEW = 'Grid view';
let airtableBase: any = null;

function getAirtableBase() {
  if (airtableBase) return airtableBase;

  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!apiKey) {
    console.error('Airtable API key is missing');
    return null;
  }

  if (!baseId) {
    console.error('Airtable Base ID is missing');
    return null;
  }

  try {
    Airtable.configure({
      apiKey: apiKey,
      endpointUrl: 'https://api.airtable.com',
    });
    
    airtableBase = new Airtable().base(baseId);
    return airtableBase;
  } catch (error) {
    console.error('Error initializing Airtable:', error);
    return null;
  }
}

export async function fetchIGPosts(viewId: string): Promise<IGPost[]> {
  try {
    console.log('Fetching IG posts with viewId:', viewId);
    const response = await fetch(`/api/instagram?viewId=${viewId}`);
    
    if (!response.ok) {
      console.error('IG API response not OK:', {
        status: response.status,
        statusText: response.statusText
      });
      throw new Error(`Failed to fetch IG posts: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('IG posts fetched:', {
      count: data.length,
      firstPost: data[0]
    });
    
    return data;
  } catch (error) {
    console.error('Instagram fetch failed:', {
      viewId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}

export async function updateDoneStatus(
  taskId: string,
  done: boolean,
  isInstagram: boolean,
  doneField: string
) {
  try {
    const response = await fetch('/api/update-done', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        taskId,
        done,
        isInstagram,
        doneField,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Update failed:', {
        taskId,
        done,
        isInstagram,
        doneField,
        error: data.error
      });
      throw new Error(data.error || 'Failed to update status');
    }

    return data;
  } catch (error) {
    console.error('Error updating done status:', error);
    throw error;
  }
}

export async function fetchRedditPosts(viewId: string): Promise<RedditPost[]> {
  try {
    const response = await fetch(`/api/reddit?viewId=${viewId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch Reddit posts: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Reddit fetch failed:', {
      viewId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
} 