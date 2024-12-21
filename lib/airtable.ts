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
  apiKey: process.env.NEXT_PUBLIC_AIRTABLE_API_KEY!,
  baseId: process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID!,
  tableId: process.env.NEXT_PUBLIC_AIRTABLE_IG!,
  viewId: process.env.NEXT_PUBLIC_AIRTABLE_VIEW_MELI!,
  endpointUrl: 'https://api.airtable.com'
};

// Add separate config for Reddit
const redditConfig = {
  apiKey: process.env.NEXT_PUBLIC_AIRTABLE_API_KEY!,
  baseId: process.env.NEXT_PUBLIC_AIRTABLE_REDDIT_BASE_ID!,
  tableId: process.env.NEXT_PUBLIC_AIRTABLE_REDDIT_TABLE_ID!,
  viewId: process.env.NEXT_PUBLIC_AIRTABLE_REDDIT_VIEW_ID!,
  endpointUrl: 'https://api.airtable.com'
};

function getAirtableBase() {
  if (airtableBase) return airtableBase;

  const apiKey = process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
  const baseId = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;

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

export async function fetchIGPosts(): Promise<IGPost[]> {
  try {
    const base = getAirtableBase();
    if (!base) {
      throw new Error('Could not initialize Airtable base');
    }

    const headers = {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_AIRTABLE_API_KEY}`,
    };

    const viewName = process.env.NEXT_PUBLIC_AIRTABLE_VIEW_MELI || DEFAULT_VIEW;
    const tableId = process.env.NEXT_PUBLIC_AIRTABLE_IG;

    if (!tableId) {
      throw new Error('Airtable table ID is not defined');
    }

    const records = await base(tableId)
      .select({
        view: viewName,
        maxRecords: 100,
        pageSize: 10,
        _options: { headers }
      })
      .all();

    // Process records with proper type annotations
    const processedRecords = records
      .map((record: AirtableRecord): IGPost | null => {
        try {
          return {
            id: record.id,
            title: record.get('Title') as string || '',
            caption: record.get('Caption') as string || '',
            status: record.get('Status') as string || '',
            deadline: record.get('Deadline') as string || '',
            'Instagram GDrive': record.get('Instagram GDrive') as string || '',
            'Upload Content Meli': record.get('Upload Content Meli') as string || '',
            'Done Meli': Boolean(record.get('Done Meli')),
            Thumbnail: record.get('Thumbnail') as AirtableAttachment[] || [],
            isUrgent: Boolean(record.get('isUrgent')),
            notes: record.get('Notes') as string || '',
            type: (record.get('Content Type') as 'image' | 'video' | 'story') || 'image',
            uploaded: Boolean(record.get('Uploaded')),
          };
        } catch (recordError) {
          console.error('Error processing record:', record.id, recordError);
          return null;
        }
      })
      .filter((record: IGPost | null): record is IGPost => record !== null);

    return processedRecords;
  } catch (error) {
    console.error('Error fetching IG posts:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    return [];
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

export async function fetchRedditPosts(): Promise<RedditPost[]> {
  try {
    const url = `https://api.airtable.com/v0/${process.env.NEXT_PUBLIC_AIRTABLE_REDDIT_BASE_ID}/${process.env.NEXT_PUBLIC_AIRTABLE_REDDIT_TABLE_ID}?view=${process.env.NEXT_PUBLIC_AIRTABLE_REDDIT_VIEW_ID}`;
    console.log('Fetching Reddit posts from:', url);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_AIRTABLE_API_KEY}`,
      },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Reddit API Error:', errorText);
      throw new Error('Failed to fetch Reddit posts');
    }

    const data = await response.json();
    console.log('Reddit data received:', data);
    
    // Map the records and ensure Image field is included
    return data.records.map((record: any) => ({
      id: record.id,
      ...record.fields,
      Image: record.fields.Image || []
    }));
  } catch (error) {
    console.error('Error fetching Reddit posts:', error);
    return [];
  }
} 