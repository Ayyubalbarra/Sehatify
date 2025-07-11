import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  MessageCircle, 
  FileText, 
  Heart, 
  User, 
  Clock, 
  Activity,
  Bell
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';

const Dashboard: React.FC = () => {
  const dashboardCards = [
    {
      icon: Calendar,
      title: 'Book Appointment',
      description: 'Schedule a visit with your preferred doctor',
      link: '/book-appointment',
      color: 'bg-blue-500'
    },
    {
      icon: MessageCircle,
      title: 'AI Health Assistant',
      description: 'Get instant health advice and symptom assessment',
      link: '/chatbot',
      color: 'bg-green-500'
    },
    {
      icon: FileText,
      title: 'Medical Records',
      description: 'View your complete medical history',
      link: '/medical-records',
      color: 'bg-purple-500'
    },
    {
      icon: Heart,
      title: 'Health Articles',
      description: 'Read expert health tips and articles',
      link: '/articles',
      color: 'bg-red-500'
    }
  ];

  const recentActivities = [
    {
      type: 'appointment',
      message: 'Upcoming appointment with Dr. Sarah Johnson',
      time: '2 hours ago',
      icon: Calendar
    },
    {
      type: 'record',
      message: 'Lab results uploaded to your records',
      time: '1 day ago',
      icon: FileText
    },
    {
      type: 'article',
      message: 'New article: "Heart Health Tips"',
      time: '3 days ago',
      icon: Heart
    }
  ];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text">Welcome back, John!</h1>
              <p className="text-text-light mt-1">Here's what's happening with your health today</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <div className="flex items-center space-x-3">
                <img
                  src="https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=150"
                  alt="Profile"
                  className="h-10 w-10 rounded-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="flex items-center">
              <div className="bg-primary/10 rounded-full p-3">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-text">3</p>
                <p className="text-text-light">Upcoming Appointments</p>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center">
              <div className="bg-green-100 rounded-full p-3">
                <Activity className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-text">12</p>
                <p className="text-text-light">Health Records</p>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-full p-3">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-text">2</p>
                <p className="text-text-light">Pending Results</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Dashboard Cards */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-text mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dashboardCards.map((card, index) => (
                <Link key={index} to={card.link}>
                  <Card hover className="h-full">
                    <div className="flex items-center mb-4">
                      <div className={`${card.color} rounded-full p-3 text-white`}>
                        <card.icon className="h-8 w-8" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-text mb-2">{card.title}</h3>
                    <p className="text-text-light">{card.description}</p>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-2xl font-bold text-text mb-6">Recent Activity</h2>
            <Card>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="bg-primary/10 rounded-full p-2">
                      <activity.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-text font-medium">{activity.message}</p>
                      <p className="text-text-light text-sm">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Next Appointment */}
            <Card className="mt-6">
              <h3 className="text-lg font-semibold text-text mb-4">Next Appointment</h3>
              <div className="bg-primary/5 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <img
                    src="https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=100"
                    alt="Dr. Sarah Johnson"
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-text">Dr. Sarah Johnson</p>
                    <p className="text-text-light text-sm">Cardiology</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-primary/10">
                  <p className="text-sm text-text-light">
                    <Clock className="inline h-4 w-4 mr-1" />
                    Tomorrow, 2:00 PM
                  </p>
                  <p className="text-sm text-text-light">
                    Queue Number: <span className="font-medium text-primary">A-015</span>
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;