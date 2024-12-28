import Airtable from 'airtable';

// Initialize Airtable
const airtable = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY
});

// Update your interface definitions to use the new field name
interface IGPost {
  id: string;
  'Cloudfront URL': string;  // Changed from 'AWS URL'
  // ... other fields
}

interface RedditPost {
  id: string;
  'Cloudfront URL': string;  // Changed from 'AWS URL'
  // ... other fields
}

export async function fetchIGPosts(viewId: string) {
  try {
    const base = airtable.base(process.env.AIRTABLE_BASE_ID!);
    const records = await base(process.env.AIRTABLE_IG!)
      .select({ view: viewId })
      .all();
    
    return records.map(record => ({
      id: record.id,
      ...record.fields
    }));
  } catch (error) {
    console.error('Error fetching IG posts:', error);
    throw error;
  }
}

export async function fetchRedditPosts(viewId: string) {
  try {
    const base = airtable.base(process.env.AIRTABLE_REDDIT_BASE_ID!);
    const records = await base(process.env.AIRTABLE_REDDIT_TABLE_ID!)
      .select({ view: viewId })
      .all();
    
    return records.map(record => ({
      id: record.id,
      ...record.fields
    }));
  } catch (error) {
    console.error('Error fetching Reddit posts:', error);
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
        doneField
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update status');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating status:', error);
    throw error;
  }
} 