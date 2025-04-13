"use client";
import React, { useState } from 'react';
import { Filter, Search } from 'lucide-react';

interface FilterOption {
  label: string;
  options: string[] | { value: string; label: string }[];
  filterKey: string;
}

interface JobFilterBarProps {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  filters: Record<string, string>;
  setFilters: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  filterOptions: FilterOption[];
}

const JobFilterBar: React.FC<JobFilterBarProps> = ({
  searchTerm,
  setSearchTerm,
  filters,
  setFilters,
  filterOptions
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    const emptyFilters: Record<string, string> = {};
    filterOptions.forEach(option => {
      emptyFilters[option.filterKey] = '';
    });
    setFilters(emptyFilters);
  };

  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search jobs by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-border text-sm text-text bg-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-sm"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textLight" size={20} />
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-3 bg-white border border-border rounded-lg text-textLight hover:text-text focus:outline-none"
        >
          <Filter size={20} />
          <span>Filters</span>
        </button>
      </div>
      
      {showFilters && (
        <div className="mt-4 p-4 bg-white border border-border rounded-lg">
          <div className="flex flex-wrap gap-4">
            {filterOptions.map((option) => (
              <div key={option.filterKey} className="flex-1 min-w-[200px]">
                <label htmlFor={option.filterKey} className="block text-sm font-medium text-textLight mb-1">
                  {option.label}
                </label>
                <select
                  id={option.filterKey}
                  value={filters[option.filterKey]}
                  onChange={(e) => handleFilterChange(option.filterKey, e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none bg-white"
                >
                  <option value="">All {option.label}</option>
                  {option.options.map((opt, index) => {
                    if (typeof opt === 'string') {
                      return (
                        <option key={index} value={opt}>
                          {opt}
                        </option>
                      );
                    } else {
                      return (
                        <option key={index} value={opt.value}>
                          {opt.label}
                        </option>
                      );
                    }
                  })}
                </select>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end mt-4">
            <button
              onClick={clearFilters}
              className="px-3 py-1 text-sm text-secondary hover:text-opacity-80"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobFilterBar;
