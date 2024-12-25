import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import Airtable from "airtable";
import { userConfigs } from "@/lib/user-config";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  try {
    // Get the user's session
    const session = await getServerSession(authOptions);
    console.log("Session:", session);
    
    if (!session?.user?.email) {
      console.log("No session or email found");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get user-specific config
    const userConfig = userConfigs[session.user.email];
    console.log("User config:", userConfig);

    if (!userConfig) {
      console.log("No user config found for:", session.user.email);
      return NextResponse.json({ error: "User not configured" }, { status: 403 });
    }

    // Initialize Airtable bases for both Instagram and Reddit
    const igBase = new Airtable({ 
      apiKey: process.env.AIRTABLE_API_KEY 
    }).base(process.env.AIRTABLE_BASE_ID!);

    const redditBase = new Airtable({ 
      apiKey: process.env.AIRTABLE_API_KEY 
    }).base(process.env.AIRTABLE_REDDIT_BASE_ID!);

    console.log("Attempting to fetch from Airtable...");

    // Fetch data from both bases
    const [igRecords, redditRecords] = await Promise.all([
      igBase(process.env.AIRTABLE_IG!).select({
        view: process.env.AIRTABLE_VIEW_MELI
      }).all(),
      
      redditBase(process.env.AIRTABLE_REDDIT_TABLE_ID!).select({
        view: process.env.AIRTABLE_REDDIT_VIEW_ID
      }).all()
    ]);

    console.log("Records fetched:", {
      igCount: igRecords.length,
      redditCount: redditRecords.length
    });

    // Transform the records
    const instagram = igRecords.map(record => ({
      id: record.id,
      ...record.fields,
      [`Done ${userConfig.name}`]: record.fields[`Done ${userConfig.name}`] || false,
      [`Upload Content ${userConfig.name}`]: record.fields[`Upload Content ${userConfig.name}`] || ''
    }));

    const reddit = redditRecords.map(record => ({
      id: record.id,
      ...record.fields,
      [`Done ${userConfig.name}`]: record.fields[`Done ${userConfig.name}`] || false,
      [`Upload Content ${userConfig.name}`]: record.fields[`Upload Content ${userConfig.name}`] || ''
    }));

    return NextResponse.json({ instagram, reddit });

  } catch (error: any) {
    console.error('Detailed API Error:', {
      message: error.message,
      stack: error.stack,
      error
    });
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userConfig = userConfigs[session.user.email];
    if (!userConfig) {
      return NextResponse.json({ error: "User not configured" }, { status: 403 });
    }

    const { taskId, done, isInstagram } = await req.json();
    
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
      isInstagram ? process.env.AIRTABLE_BASE_ID! : process.env.AIRTABLE_REDDIT_BASE_ID!
    );
    
    const tableId = isInstagram ? process.env.AIRTABLE_IG! : process.env.AIRTABLE_REDDIT_TABLE_ID!;
    
    await base(tableId).update(taskId, {
      [`Done ${userConfig.name}`]: done
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
} 