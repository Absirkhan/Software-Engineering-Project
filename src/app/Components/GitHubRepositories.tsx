"use client";
import React, { useState, useEffect } from 'react';
import { ChevronRight, Star, GitFork, Code, ExternalLink } from 'lucide-react';

interface Repository {
  id: string;
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  language: string | null;
  stars: number;
  forks: number;
  isPrivate: boolean;
  updatedAt: string;
}

interface GitHubRepositoriesProps {
  username?: string;
}

const GitHubRepositories: React.FC<GitHubRepositoriesProps> = ({ username }) => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchRepositories();
  }, []);

  const fetchRepositories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/get-github-repositories');
      if (!response.ok) {
        throw new Error('Failed to fetch repositories');
      }
      
      const data = await response.json();
      setRepositories(data.repositories || []);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching repositories');
      console.error('Error fetching GitHub repositories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError(null);
      
      const response = await fetch('/refresh-github-repositories', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to refresh repositories');
      }
      
      const data = await response.json();
      setRepositories(data.repositories || []);
    } catch (err: any) {
      setError(err.message || 'An error occurred while refreshing repositories');
      console.error('Error refreshing GitHub repositories:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Function to get language color
  const getLanguageColor = (language: string | null) => {
    const colors: {[key: string]: string} = {
      'JavaScript': '#f7df1e',
      'TypeScript': '#3178c6',
      'Python': '#3572A5',
      'Java': '#b07219',
      'C#': '#178600',
      'PHP': '#4F5D95',
      'HTML': '#e34c26',
      'CSS': '#563d7c',
      'Ruby': '#701516',
      'Go': '#00ADD8',
      'Rust': '#dea584',
      'Swift': '#ffac45',
      'Kotlin': '#A97BFF'
    };
    
    return language ? colors[language] || '#8e949e' : '#8e949e';
  };

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading && repositories.length === 0) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold text-gray-800">GitHub Repositories</h2>
        </div>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
        </div>
      </div>
    );
  }

  if (error && repositories.length === 0) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold text-gray-800">GitHub Repositories</h2>
        </div>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error: {error}</p>
          <p className="mt-2">Please make sure you're logged in with GitHub</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold text-gray-800">GitHub Repositories</h2>
        <button 
          onClick={handleRefresh} 
          disabled={refreshing}
          className="bg-secondary hover:bg-buttonHover text-white py-2 px-4 rounded-md flex items-center transition-colors disabled:bg-gray-400"
        >
          {refreshing ? 
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> : 
            null
          }
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      
      {repositories.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
          <Code size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600">No GitHub Repositories Found</h3>
          <p className="text-gray-500 mt-2">
            {username ? `${username} doesn't have any public repositories yet` : 'You don\'t have any repositories yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {repositories.map((repo) => (
            <div
              key={repo.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-secondary hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-lg text-gray-900 truncate max-w-[70%]">
                  {repo.name}
                </h3>
                <span className={`text-xs px-2 py-1 rounded-full ${repo.isPrivate ? 'bg-gray-200 text-gray-700' : 'bg-green-100 text-green-800'}`}>
                  {repo.isPrivate ? 'Private' : 'Public'}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mt-2 line-clamp-2 h-10">
                {repo.description || 'No description provided'}
              </p>
              
              <div className="mt-4 flex items-center text-gray-500 text-xs">
                {repo.language && (
                  <div className="flex items-center mr-4">
                    <span 
                      className="w-3 h-3 rounded-full mr-1" 
                      style={{ backgroundColor: getLanguageColor(repo.language) }}
                    ></span>
                    <span>{repo.language}</span>
                  </div>
                )}
                
                {repo.stars > 0 && (
                  <div className="flex items-center mr-3">
                    <Star size={14} className="mr-1" />
                    <span>{repo.stars}</span>
                  </div>
                )}
                
                {repo.forks > 0 && (
                  <div className="flex items-center">
                    <GitFork size={14} className="mr-1" />
                    <span>{repo.forks}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Updated {formatDate(repo.updatedAt)}
                </span>
                <a 
                  href={repo.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-secondary hover:text-buttonHover flex items-center text-sm transition-colors"
                >
                  View <ExternalLink size={14} className="ml-1" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GitHubRepositories;
