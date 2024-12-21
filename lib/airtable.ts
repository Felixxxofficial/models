import Airtable from 'airtable';

interface AirtableAttachment {
  id: string;
  url: string;
  filename: string;
  size: number;
  type: string;
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

// Add default view name as fallback
const DEFAULT_VIEW = 'Grid view';

let airtableBase: any = null;

function getAirtableBase() {
  if (airtableBase) return airtableBase;

  const apiKey = process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
  const baseId = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;

  if (!apiKey || !baseId) {
    console.error('Airtable credentials not found');
    return null;
  }

  airtableBase = new Airtable({ apiKey }).base(baseId);
  return airtableBase;
}

export async function fetchIGPosts(): Promise<IGPost[]> {
  try {
    const base = getAirtableBase();
    if (!base) {
      console.error('Could not initialize Airtable base');
      return [];
    }

    const viewName = process.env.NEXT_PUBLIC_AIRTABLE_VIEW_MELI || DEFAULT_VIEW;
    const tableId = process.env.NEXT_PUBLIC_AIRTABLE_IG;

    if (!tableId) {
      console.error('Airtable table ID is not defined');
      return [];
    }

    console.log('Using view:', viewName);
    console.log('Table ID:', tableId);

    const records = await base(tableId)
      .select({
        view: viewName,
        maxRecords: 100,
        pageSize: 10
      })
      .all();

    console.log('Fetched records:', records.length);

    return records.map(record => ({
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
    }));
  } catch (error) {
    console.error('Error fetching IG posts:', error);
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