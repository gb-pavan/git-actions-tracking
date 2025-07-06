// import { NextRequest, NextResponse } from 'next/server';

// // Mock git activity data generator based on the actual API structure
// const generateGitActivity = () => {
//   const authors = [
//     'gb-pavan', 'john.doe', 'jane.smith', 'mike.wilson', 'sarah.brown', 'david.lee',
//     'emma.davis', 'alex.johnson', 'lisa.garcia', 'tom.anderson', 'nina.rodriguez',
//     'chris.taylor', 'olivia.white', 'ryan.martin', 'sophia.lee', 'james.clark'
//   ];

//   const branches = ['main', 'develop', 'staging', 'feature/auth', 'feature/ui-redesign', 'hotfix/security', 'feature/api-v2', 'feature/mobile-sync'];
//   const actions = ['PUSH', 'MERGE', 'CREATE_BRANCH', 'DELETE_BRANCH'];

//   const activities = [];
//   const now = new Date();

//   // Generate 50 random activities
//   for (let i = 0; i < 50; i++) {
//     const randomHours = Math.floor(Math.random() * 72); // Last 3 days
//     const timestamp = new Date(now.getTime() - (randomHours * 60 * 60 * 1000));
    
//     // Generate a realistic request ID
//     const requestId = Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
//     const id = Array.from({length: 24}, () => Math.floor(Math.random() * 16).toString(16)).join('');

//     const fromBranch = branches[Math.floor(Math.random() * branches.length)];
//     let toBranch = fromBranch;
    
//     // For merge operations, use different branches
//     const action = actions[Math.floor(Math.random() * actions.length)];
//     if (action === 'MERGE') {
//       toBranch = branches[Math.floor(Math.random() * branches.length)];
//     }

//     activities.push({
//       id,
//       request_id: requestId,
//       author: authors[Math.floor(Math.random() * authors.length)],
//       action,
//       from_branch: fromBranch,
//       to_branch: toBranch,
//       timestamp: timestamp.toISOString(),
//     });
//   }

//   // Sort by timestamp (newest first)
//   return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
// };

// export async function GET(request: NextRequest) {
//   try {
//     // Simulate API delay
//     await new Promise(resolve => setTimeout(resolve, 200));

//     const activities = generateGitActivity();

//     // Add cache headers for ISR
//     return NextResponse.json(
//       { 
//         data: activities,
//         timestamp: new Date().toISOString(),
//         total: activities.length
//       },
//       {
//         headers: {
//           'Cache-Control': 's-maxage=15, stale-while-revalidate=30',
//         },
//       }
//     );
//   } catch (error) {
//     console.error('Error fetching git activity:', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch git activity' },
//       { status: 500 }
//     );
//   }
// }

import { NextRequest, NextResponse } from 'next/server';

const DATA_SOURCE_URL = 'https://capture-webhook.onrender.com/api/updates';

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

    // const response = await fetch(DATA_SOURCE_URL);
    const response = await fetch(DATA_SOURCE_URL, {
  cache: 'no-store', // 👈 Important: disables caching entirely
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
