export interface GitActivity {
  id: string;
  request_id: string;
  author: string;
  action: string;
  from_branch: string;
  to_branch: string;
  timestamp: string;
}

export interface GitStats {
  totalActivities: number;
  uniqueAuthors: number;
  branchOperations: number;
  recentActivity: number;
  todayActivities: number;
  weeklyGrowth: string;
}

export interface ApiResponse<T> {
  data: T;
  timestamp: string;
  total?: number;
}

export async function fetchGitActivity(): Promise<ApiResponse<GitActivity[]>> {
  const response = await fetch('/api/git-activity', {
    next: { revalidate: 15 } // ISR with 15-second revalidation
  });

  if (!response.ok) {
    throw new Error('Failed to fetch git activity');
  }

  return response.json();
}

export async function fetchGitStats(): Promise<ApiResponse<GitStats>> {
  const response = await fetch('/api/git-activity/stats', {
    next: { revalidate: 15 } // ISR with 15-second revalidation
  });

  if (!response.ok) {
    throw new Error('Failed to fetch git statistics');
  }

  return response.json();
}

// Client-side fetch functions (for real-time updates)
export async function fetchGitActivityClient(): Promise<ApiResponse<GitActivity[]>> {
  const response = await fetch('/api/git-activity');

  if (!response.ok) {
    throw new Error('Failed to fetch git activity');
  }

  return response.json();
}

export async function fetchGitStatsClient(): Promise<ApiResponse<GitStats>> {
  const response = await fetch('/api/git-activity/stats');

  if (!response.ok) {
    throw new Error('Failed to fetch git statistics');
  }

  return response.json();
}