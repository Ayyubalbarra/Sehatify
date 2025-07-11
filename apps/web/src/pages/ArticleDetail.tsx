import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, ArrowLeft, Share2, Bookmark } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { articles } from '../data/mockData';

const ArticleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const article = articles.find(a => a.id === id);

  if (!article) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-text mb-2">Article Not Found</h1>
            <p className="text-text-light mb-8">The article you're looking for doesn't exist.</p>
            <Link to="/articles">
              <Button>Back to Articles</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link to="/articles">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Articles
            </Button>
          </Link>
        </div>

        {/* Article */}
        <Card>
          {/* Article Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <span className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full">
                {article.category}
              </span>
              <div className="flex items-center text-text-light text-sm">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(article.publishDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-text mb-4">
              {article.title}
            </h1>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center text-text-light">
                <User className="h-5 w-5 mr-2" />
                <span className="font-medium">By {article.author}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="ghost" size="sm">
                  <Bookmark className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          </div>

          {/* Article Image */}
          <div className="aspect-video rounded-lg overflow-hidden mb-8">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Article Content */}
          <div className="prose max-w-none">
            <p className="text-lg text-text-light mb-8 leading-relaxed">
              {article.summary}
            </p>
            
            <div className="text-text leading-relaxed space-y-6">
              <p>
                Heart disease remains one of the leading causes of death worldwide, but the good news is that many heart conditions can be prevented through proper lifestyle choices and regular medical care. Understanding the risk factors and taking proactive steps can significantly reduce your chances of developing cardiovascular problems.
              </p>
              
              <h2 className="text-2xl font-bold text-text mt-8 mb-4">Understanding Heart Disease</h2>
              <p>
                Heart disease encompasses various conditions that affect the heart and blood vessels. The most common type is coronary artery disease, which occurs when the arteries that supply blood to the heart become narrowed or blocked by plaque buildup.
              </p>
              
              <h2 className="text-2xl font-bold text-text mt-8 mb-4">Risk Factors</h2>
              <p>
                Several factors can increase your risk of heart disease:
              </p>
              <ul className="list-disc list-inside space-y-2 text-text-light">
                <li>High blood pressure</li>
                <li>High cholesterol levels</li>
                <li>Smoking</li>
                <li>Diabetes</li>
                <li>Obesity</li>
                <li>Physical inactivity</li>
                <li>Poor diet</li>
                <li>Excessive alcohol consumption</li>
                <li>Stress</li>
              </ul>
              
              <h2 className="text-2xl font-bold text-text mt-8 mb-4">Prevention Strategies</h2>
              <p>
                The good news is that many risk factors for heart disease can be controlled through lifestyle changes:
              </p>
              
              <h3 className="text-xl font-semibold text-text mt-6 mb-3">1. Maintain a Healthy Diet</h3>
              <p>
                Focus on eating plenty of fruits, vegetables, whole grains, and lean proteins. Limit saturated fats, trans fats, sodium, and added sugars. The Mediterranean diet has been shown to be particularly beneficial for heart health.
              </p>
              
              <h3 className="text-xl font-semibold text-text mt-6 mb-3">2. Stay Physically Active</h3>
              <p>
                Aim for at least 150 minutes of moderate-intensity aerobic activity or 75 minutes of vigorous activity per week. Regular exercise helps strengthen the heart muscle, lower blood pressure, and improve circulation.
              </p>
              
              <h3 className="text-xl font-semibold text-text mt-6 mb-3">3. Don't Smoke</h3>
              <p>
                Smoking is one of the most significant risk factors for heart disease. If you smoke, quitting is one of the best things you can do for your heart health. If you don't smoke, don't start.
              </p>
              
              <h3 className="text-xl font-semibold text-text mt-6 mb-3">4. Manage Stress</h3>
              <p>
                Chronic stress can contribute to heart disease. Find healthy ways to manage stress, such as meditation, yoga, deep breathing exercises, or engaging in hobbies you enjoy.
              </p>
              
              <h2 className="text-2xl font-bold text-text mt-8 mb-4">Regular Health Checkups</h2>
              <p>
                Regular medical checkups are essential for early detection and management of heart disease risk factors. Your healthcare provider can monitor your blood pressure, cholesterol levels, and other important indicators of heart health.
              </p>
              
              <h2 className="text-2xl font-bold text-text mt-8 mb-4">When to Seek Medical Attention</h2>
              <p>
                If you experience chest pain, shortness of breath, fatigue, or other symptoms that concern you, don't hesitate to seek medical attention. Early intervention can make a significant difference in outcomes.
              </p>
              
              <p className="text-lg font-medium text-text mt-8">
                Remember, taking care of your heart is an investment in your overall health and quality of life. Small changes in your daily habits can lead to significant improvements in your cardiovascular health over time.
              </p>
            </div>
          </div>
        </Card>

        {/* Related Articles */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-text mb-6">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.filter(a => a.id !== article.id && a.category === article.category).slice(0, 2).map((relatedArticle) => (
              <Link key={relatedArticle.id} to={`/articles/${relatedArticle.id}`}>
                <Card hover>
                  <div className="flex space-x-4">
                    <img
                      src={relatedArticle.image}
                      alt={relatedArticle.title}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-text mb-2 line-clamp-2">
                        {relatedArticle.title}
                      </h3>
                      <p className="text-text-light text-sm line-clamp-2">
                        {relatedArticle.summary}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;