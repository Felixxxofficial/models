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

const base = new Airtable({ apiKey: process.env.NEXT_PUBLIC_AIRTABLE_API_KEY }).base(
  process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID!
);

export async function fetchIGPosts(): Promise<IGPost[]> {
  try {
    const records = await base(process.env.NEXT_PUBLIC_AIRTABLE_IG!)
      .select({
        view: process.env.NEXT_PUBLIC_AIRTABLE_VIEW_MELI,
      })
      .all();

    return records.map(record => ({
      id: record.id,
      title: record.get('Title') as string,
      caption: record.get('Caption') as string,
      status: record.get('Status') as string,
      deadline: record.get('Deadline') as string,
      'Instagram GDrive': record.get('Instagram GDrive') as string,
      'Upload Content Meli': record.get('Upload Content Meli') as string,
      'Done Meli': record.get('Done Meli') as boolean,
      Thumbnail: record.get('Thumbnail') as AirtableAttachment[],
      isUrgent: record.get('isUrgent') as boolean,
      notes: record.get('Notes') as string,
      type: record.get('Content Type') as 'image' | 'video' | 'story' || 'image',
      uploaded: record.get('Uploaded') as boolean || false,
    }));
  } catch (error) {
    console.error('Error fetching IG posts:', error);
    return [];
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