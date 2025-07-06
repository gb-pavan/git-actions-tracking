import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Simulate fetching stats from the repository
    await new Promise(resolve => setTimeout(resolve, 150));

    const stats = {
      totalActivities: Math.floor(Math.random() * 1000) + 500,
      uniqueAuthors: Math.floor(Math.random() * 20) + 15,
      branchOperations: Math.floor(Math.random() * 200) + 100,
      recentActivity: Math.floor(Math.random() * 50) + 25,
      todayActivities: Math.floor(Math.random() * 50) + 20,
      weeklyGrowth: (Math.random() * 20 - 10).toFixed(1),
    };

    return NextResponse.json(
      { 
        data: stats,
        timestamp: new Date().toISOString()
      },
      {
        headers: {
          'Cache-Control': 's-maxage=15, stale-while-revalidate=30',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching git stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch git statistics' },
      { status: 500 }
    );
  }
}