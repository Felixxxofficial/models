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

export async function fetchIGPosts(): Promise<IGPost[]> {
  try {
    const viewName = process.env.NEXT_PUBLIC_AIRTABLE_VIEW_MELI;
    
    if (!process.env.NEXT_PUBLIC_AIRTABLE_API_KEY) {
      throw new Error('Airtable API key is not defined');
    }

    if (!process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID) {
      throw new Error('Airtable Base ID is not defined');
    }

    if (!process.env.NEXT_PUBLIC_AIRTABLE_IG) {
      throw new Error('Airtable table ID is not defined');
    }

    if (!viewName) {
      throw new Error('Airtable view name is not defined');
    }

    const base = new Airtable({ 
      apiKey: process.env.NEXT_PUBLIC_AIRTABLE_API_KEY 
    }).base(process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID);

    const records = await base(process.env.NEXT_PUBLIC_AIRTABLE_IG)
      .select({
        view: viewName,
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
    throw error;
  }
}

export async function updateDoneStatus(recordId: string, done: boolean) {
  try {
    await base(process.env.NEXT_PUBLIC_AIRTABLE_IG!).update(recordId, {
      'Done Meli': done
    });
    return true;
  } catch (error) {
    console.error('Error updating done status:', error);
    return false;
  }
} 