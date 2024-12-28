import Airtable from 'airtable';

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
    // Configure with explicit authentication
    const config = {
      apiKey: apiKey,
      endpointUrl: 'https://api.airtable.com',
    };

    Airtable.configure(config);
    
    // Log configuration (but mask the API key)
    console.log('Airtable Config:', {
      ...config,
      apiKey: apiKey ? `${apiKey.slice(0, 5)}...` : 'missing',
      baseId: baseId
    });

    airtableBase = new Airtable(config).base(baseId);
    return airtableBase;
  } catch (error) {
    console.error('Error initializing Airtable:', error);
    return null;
  }
}

export async function fetchIGPosts(viewId: string): Promise<IGPost[]> {
  try {
    const response = await fetch(`/api/instagram?viewId=${viewId}`);
    if (!response.ok) throw new Error('Failed to fetch IG posts');
    return await response.json();
  } catch (error) {
    console.error('Error fetching IG posts:', error);
    throw error;
  }
}

export async function updateDoneStatus(
  taskId: string,
  done: boolean,
  isInstagram: boolean
) {
  try {
    const config = isInstagram ? instagramConfig : redditConfig;
    
    console.log('Updating task with config:', {
      taskId,
      done,
      isInstagram,
      baseId: config.baseId,
      tableId: config.tableId
    });

    const response = await fetch(
      `${config.endpointUrl}/v0/${config.baseId}/${config.tableId}/${taskId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            'Done Meli': done  // Make sure this matches your field name in Airtable
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Update failed:', errorText);
      throw new Error(`Failed to update status: ${errorText}`);
    }

    const result = await response.json();
    console.log('Update successful:', result);
    return result;
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