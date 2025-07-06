import { NextRequest, NextResponse } from 'next/server';

const DATA_SOURCE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/updates`;

interface GitActivity {
  id: string;
  request_id: string;
  author: string;
  action: 'PUSH' | 'MERGE' | 'PULL' | 'DELETE_BRANCH';
  from_branch: string;
  to_branch: string;
  timestamp: string;
}

interface RawGitActivity {
  _id: string;
  request_id: string;
  author: string;
  action: string;
  from_branch: string;
  to_branch: string;
  timestamp: string;
}

export async function GET(request: NextRequest) {
  try {
    await new Promise(resolve => setTimeout(resolve, 200));

    const response = await fetch(DATA_SOURCE_URL, {
  cache: 'no-store',
});

    if (!response.ok) {
      throw new Error(`Failed to fetch data. Status: ${response.status}`);
    }

    const rawData: RawGitActivity[] = await response.json();

    const activities: GitActivity[] = rawData.map((item) => ({
      id: item._id,
      request_id: item.request_id,
      author: item.author,
      action: item.action as GitActivity['action'],
      from_branch: item.from_branch,
      to_branch: item.to_branch,
      timestamp: item.timestamp,
    }));

    activities.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json(
      {
        data: activities,
        total: activities.length,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 's-maxage=15, stale-while-revalidate=30',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching git activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch git activity' },
      { status: 500 }
    );
  }
}
