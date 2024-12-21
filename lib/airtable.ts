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

const DEFAULT_VIEW = 'Grid view';
let airtableBase: any = null;

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

export async function updateDoneStatus(recordId: string, done: boolean): Promise<boolean> {
  try {
    const base = getAirtableBase();
    if (!base) return false;

    const tableId = process.env.NEXT_PUBLIC_AIRTABLE_IG;
    if (!tableId) return false;

    await base(tableId).update(recordId, {
      'Done Meli': done
    });
    return true;
  } catch (error) {
    console.error('Error updating done status:', error);
    return false;
  }
} 