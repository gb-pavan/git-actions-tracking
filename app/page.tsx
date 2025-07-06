'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, RefreshCw, GitCommit, GitBranch, GitPullRequest, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, TrendingUp, TrendingDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GitActivity, GitStats, fetchGitActivityClient, fetchGitStatsClient } from '@/lib/api';
import { DashboardSkeleton } from '@/components/skeletons/dashboard-skeleton';
import { StatsSkeleton } from '@/components/skeletons/stats-skeleton';
import { FiltersSkeleton } from '@/components/skeletons/filters-skeleton';
import { TableSkeleton } from '@/components/skeletons/table-skeleton';

type SortConfig = {
  key: keyof GitActivity;
  direction: 'asc' | 'desc';
};

const getActivityIcon = (action: string) => {
  switch (action.toLowerCase()) {
    case 'push':
      return <GitCommit className="w-4 h-4" />;
    case 'merge':
      return <GitPullRequest className="w-4 h-4" />;
    case 'create_branch':
    case 'delete_branch':
      return <GitBranch className="w-4 h-4" />;
    default:
      return <GitCommit className="w-4 h-4" />;
  }
};

const getActivityColor = (action: string) => {
  switch (action.toLowerCase()) {
    case 'push':
      return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    case 'merge':
      return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    case 'create_branch':
      return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
    case 'delete_branch':
      return 'bg-red-500/10 text-red-600 border-red-500/20';
    default:
      return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
  }
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

export default function GitActivityDashboard() {
  const [activities, setActivities] = useState<GitActivity[]>([]);
  const [stats, setStats] = useState<GitStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterAuthor, setFilterAuthor] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'timestamp', direction: 'desc' });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);

  // Fetch data from API
  const fetchData = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    
    try {
      const [activityResponse, statsResponse] = await Promise.all([
        fetchGitActivityClient(),
        fetchGitStatsClient()
      ]);

      setActivities(activityResponse.data);
      setStats(statsResponse.data);
      setLastUpdated(new Date(activityResponse.timestamp));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 15000);
    return () => clearInterval(interval);
  }, []);

  const authors = useMemo(() => {
    const uniqueAuthors = Array.from(new Set(activities.map(activity => activity.author)));
    return uniqueAuthors.sort();
  }, [activities]);


  console.log("activities",activities);

  const filteredAndSortedActivities = useMemo(() => {
    let filtered = activities.filter(activity => {
      const matchesSearch = activity.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           activity.from_branch.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           activity.to_branch.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAction = filterAction === 'all' || activity.action.toLowerCase() === filterAction.toLowerCase();
      const matchesAuthor = filterAuthor === 'all' || activity.author === filterAuthor;
      return matchesSearch && matchesAction && matchesAuthor;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === 'timestamp') {
          aValue = new Date(aValue as string).getTime().toString();
          bValue = new Date(bValue as string).getTime().toString();
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [activities, searchTerm, filterAction, filterAuthor, sortConfig]);

  const paginatedActivities = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedActivities.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedActivities, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredAndSortedActivities.length / pageSize);

  const handleSort = (key: keyof GitActivity) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (key: keyof GitActivity) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="w-4 h-4" />;
    return sortConfig.direction === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  const handleRefresh = () => {
    fetchData(true);
  };

  if (isLoading && activities.length === 0) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Data</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={handleRefresh} className="bg-blue-500 hover:bg-blue-600">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Git Activity Dashboard
              </h1>
              <p className="text-gray-600 mt-2">Real-time repository activity monitoring(Activity Log works as git webhook triggers, Filters & Search works. Remaining just showcase)</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {isRefreshing && !stats ? (
          <StatsSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {stats && [
              { 
                title: 'Total Activities', 
                value: stats.totalActivities, 
                color: 'from-blue-500 to-cyan-500',
                change: `+${stats.todayActivities} today`
              },
              { 
                title: 'Unique Authors', 
                value: stats.uniqueAuthors, 
                color: 'from-emerald-500 to-teal-500',
                change: 'Active contributors'
              },
              { 
                title: 'Branch Operations', 
                value: stats.branchOperations, 
                color: 'from-purple-500 to-pink-500',
                change: `${stats.weeklyGrowth}% this week`
              },
              { 
                title: 'Recent Activity', 
                value: stats.recentActivity, 
                color: 'from-orange-500 to-red-500',
                change: 'Last 24 hours'
              },
            ].map((stat, index) => (
              <Card key={index} className="backdrop-blur-sm bg-white/80 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                      <div className="flex items-center mt-1">
                        {stat.change.includes('+') || stat.change.includes('%') ? (
                          <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                        ) : null}
                        <p className="text-xs text-gray-500">{stat.change}</p>
                      </div>
                    </div>
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                      <div className="w-6 h-6 bg-white/20 rounded-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Filters */}
        {isRefreshing && activities.length === 0 ? (
          <FiltersSkeleton />
        ) : (
          <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-lg mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search activities, authors, or branches..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-0 bg-white/50 focus:bg-white/80 transition-all duration-300"
                    />
                  </div>
                </div>
                <Select value={filterAction} onValueChange={setFilterAction}>
                  <SelectTrigger className="w-full md:w-48 border-0 bg-white/50 focus:bg-white/80">
                    <SelectValue placeholder="Filter by action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="push">Push</SelectItem>
                    <SelectItem value="merge">Merge</SelectItem>
                    <SelectItem value="create_branch">Create Branch</SelectItem>
                    <SelectItem value="delete_branch">Delete Branch</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterAuthor} onValueChange={setFilterAuthor}>
                  <SelectTrigger className="w-full md:w-48 border-0 bg-white/50 focus:bg-white/80">
                    <SelectValue placeholder="Filter by author" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Authors</SelectItem>
                    {authors.map(author => (
                      <SelectItem key={author} value={author}>{author}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data Table */}
        {isRefreshing && activities.length === 0 ? (
          <TableSkeleton />
        ) : (
          <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Activity Log</CardTitle>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Show</span>
                  <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                    <SelectTrigger className="w-20 border-0 bg-white/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-gray-500">entries</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-4 font-semibold text-gray-700">
                        <button
                          onClick={() => handleSort('action')}
                          className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                        >
                          <span>Action</span>
                          {getSortIcon('action')}
                        </button>
                      </th>
                      <th className="text-left p-4 font-semibold text-gray-700">
                        <button
                          onClick={() => handleSort('author')}
                          className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                        >
                          <span>Author</span>
                          {getSortIcon('author')}
                        </button>
                      </th>
                      <th className="text-left p-4 font-semibold text-gray-700">Branch Flow</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Request ID</th>
                      <th className="text-left p-4 font-semibold text-gray-700">
                        <button
                          onClick={() => handleSort('timestamp')}
                          className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                        >
                          <span>Time</span>
                          {getSortIcon('timestamp')}
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedActivities.map((activity, index) => (
                      <tr
                        key={activity.id}
                        className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors duration-200"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="p-4">
                          <Badge className={`flex items-center space-x-1 ${getActivityColor(activity.action)}`}>
                            {getActivityIcon(activity.action)}
                            <span className="capitalize">{activity.action.replace('_', ' ')}</span>
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                              {activity.author.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium">{activity.author}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                              {activity.from_branch}
                            </span>
                            <span className="text-gray-400">→</span>
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                              {activity.to_branch}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                            {activity.request_id.substring(0, 8)}...
                          </code>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-gray-500">
                            {formatTimestamp(activity.timestamp)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredAndSortedActivities.length)} of {filteredAndSortedActivities.length} entries
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="border-0 bg-white/50 hover:bg-white/80"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <div className="flex space-x-1">
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 p-0 ${currentPage === page 
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white' 
                            : 'border-0 bg-white/50 hover:bg-white/80'}`}
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="border-0 bg-white/50 hover:bg-white/80"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}