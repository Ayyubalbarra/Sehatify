import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Calendar, User } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { articles } from '../data/mockData';

const ArticlesList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = ['All', 'Cardiology', 'Mental Health', 'Nutrition', 'Fitness'];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || selectedCategory === 'All' || 
                           article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">Health Articles</h1>
          <p className="text-text-light">Expert health advice and wellness tips</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-light" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category || (selectedCategory === '' && category === 'All') ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category === 'All' ? '' : category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map((article) => (
            <Link key={article.id} to={`/articles/${article.id}`}>
              <Card hover className="h-full">
                <div className="aspect-video rounded-lg overflow-hidden mb-4">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                
                <div className="flex items-center space-x-2 mb-2">
                  <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                    {article.category}
                  </span>
                  <div className="flex items-center text-text-light text-xs">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(article.publishDate).toLocaleDateString()}
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-text mb-2 line-clamp-2">
                  {article.title}
                </h3>
                
                <p className="text-text-light text-sm mb-4 line-clamp-3">
                  {article.summary}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-text-light text-sm">
                    <User className="h-4 w-4 mr-1" />
                    {article.author}
                  </div>
                  <span className="text-primary text-sm font-medium">Read More</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* No Results */}
        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-text mb-2">No articles found</h3>
            <p className="text-text-light">
              Try adjusting your search terms or selected category
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticlesList;