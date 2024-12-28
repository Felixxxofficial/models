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
  'Instagram GDrive': string;
  'Upload Content Meli': string;
  'Done Meli': boolean;
  Thumbnail: AirtableAttachment[];
  isUrgent: boolean;
  notes: string;
  type: 'image' | 'video' | 'story';
  uploaded: boolean;
  'Cloudinary URL': string;
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
  'URL Gdrive'?: string;
  'Done Meli'?: boolean;
}

const DEFAULT_VIEW = 'Grid view';
let airtableBase: any = null;

// Add separate config for Instagram
const instagramConfig = {
  apiKey: process.env.AIRTABLE_API_KEY!,
  baseId: process.env.AIRTABLE_BASE_ID!,
  tableId: process.env.AIRTABLE_IG!,
  viewId: process.env.AIRTABLE_VIEW_MELI!,
  endpointUrl: 'https://api.airtable.com'
};

// Add separate config for Reddit
const redditConfig = {
  apiKey: process.env.AIRTABLE_API_KEY!,
  baseId: process.env.AIRTABLE_REDDIT_BASE_ID!,
  tableId: process.env.AIRTABLE_REDDIT_TABLE_ID!,
  viewId: process.env.AIRTABLE_REDDIT_VIEW_ID!,
  endpointUrl: 'https://api.airtable.com'
};

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
    const response = await fetch(`/api/instagram?viewId=${viewId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch IG posts: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Instagram fetch failed:', {
      viewId,
      error: error instanceof Error ? error.message : 'Unknown error'
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
      console.error('Update failed:', data);
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
    if (!response.ok) throw new Error('Failed to fetch Reddit posts');
    return await response.json();
  } catch (error) {
    console.error('Error fetching Reddit posts:', error);
    throw error;
  }
} 