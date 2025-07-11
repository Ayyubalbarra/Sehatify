import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Trash2, 
  MoreVertical, 
  Mic, 
  Paperclip,
  Smile,
  Settings,
  Volume2,
  VolumeX,
  Shield,
  Clock,
  Stethoscope,
  Heart,
  Activity
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { ChatMessage } from '../types';

const ChatbotAI: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      message: 'Hello! I\'m Sehatify AI, your intelligent health assistant. I can help you with medical information, symptom assessment, and wellness guidance. How can I assist you today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [showOptions, setShowOptions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const maxCharacters = 500;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxCharacters) {
      setInputMessage(value);
      setCharacterCount(value.length);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setCharacterCount(0);
    setIsTyping(true);

    // Auto-resize textarea
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    // Simulate AI response
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: generateBotResponse(inputMessage),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('headache') || input.includes('head pain')) {
      return 'Headaches can have various causes including stress, dehydration, lack of sleep, or tension. For immediate relief, try resting in a quiet, dark room, applying a cold compress, and staying hydrated. If headaches persist or are severe, please consult with a healthcare professional.';
    }
    
    if (input.includes('fever') || input.includes('temperature')) {
      return 'A fever is often a sign that your body is fighting an infection. Rest, stay hydrated, and consider taking acetaminophen or ibuprofen if appropriate. Seek medical attention if fever is high (over 103°F/39.4°C), persists for more than 3 days, or is accompanied by severe symptoms.';
    }
    
    if (input.includes('cold') || input.includes('cough') || input.includes('sore throat')) {
      return 'Common cold symptoms typically include runny nose, cough, and sore throat. Rest, drink plenty of fluids, and consider throat lozenges or warm salt water gargles. If symptoms worsen or persist beyond 10 days, consult a healthcare provider.';
    }
    
    if (input.includes('stomach') || input.includes('nausea') || input.includes('vomiting')) {
      return 'Stomach issues can be caused by various factors including food poisoning, stress, or viral infections. Stay hydrated with clear fluids, eat bland foods like crackers or toast, and rest. Seek medical attention if symptoms are severe or persistent.';
    }
    
    if (input.includes('diet') || input.includes('nutrition') || input.includes('healthy eating')) {
      return 'A healthy diet includes plenty of fruits, vegetables, whole grains, lean proteins, and healthy fats. Stay hydrated, limit processed foods, and maintain portion control. Consider consulting with a nutritionist for personalized dietary advice.';
    }
    
    if (input.includes('exercise') || input.includes('workout') || input.includes('fitness')) {
      return 'Regular exercise is important for overall health. Aim for at least 150 minutes of moderate-intensity exercise or 75 minutes of vigorous exercise per week. Include both cardio and strength training. Always consult with a healthcare provider before starting a new exercise program.';
    }
    
    if (input.includes('sleep') || input.includes('insomnia') || input.includes('tired')) {
      return 'Good sleep hygiene is crucial for health. Aim for 7-9 hours per night, maintain a consistent sleep schedule, avoid screens before bedtime, and create a comfortable sleep environment. If sleep problems persist, consider consulting a healthcare provider.';
    }
    
    return 'Thank you for your question. While I can provide general health information, I\'d recommend consulting with a healthcare professional for personalized medical advice. Is there anything else I can help you with regarding general health and wellness?';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChatHistory = () => {
    setMessages([
      {
        id: '1',
        message: 'Hello! I\'m Sehatify AI, your intelligent health assistant. I can help you with medical information, symptom assessment, and wellness guidance. How can I assist you today?',
        sender: 'bot',
        timestamp: new Date()
      }
    ]);
    setShowOptions(false);
  };

  const quickSuggestions = [
    "I have a headache",
    "Healthy diet tips",
    "Exercise recommendations",
    "Sleep problems"
  ];

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [inputMessage]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background py-8">
      {/* Floating Medical Icons Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-primary/10 animate-float">
          <Stethoscope className="h-16 w-16" />
        </div>
        <div className="absolute top-40 right-20 text-accent/10 animate-float" style={{ animationDelay: '1s' }}>
          <Heart className="h-12 w-12" />
        </div>
        <div className="absolute bottom-40 left-20 text-primary/10 animate-float" style={{ animationDelay: '2s' }}>
          <Activity className="h-14 w-14" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="bg-medical-gradient rounded-2xl p-4 shadow-medical">
              <Stethoscope className="h-10 w-10 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                Sehatify AI Assistant
              </h1>
              <p className="text-text-light text-lg">Your Intelligent Health Companion</p>
            </div>
          </div>
          <p className="text-text-light max-w-2xl mx-auto">
            Get instant medical guidance, symptom assessment, and health advice powered by advanced AI technology
          </p>
          <div className="flex items-center justify-center space-x-2 mt-4">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse-slow"></div>
            <span className="text-sm text-green-600 font-medium">AI Doctor Online</span>
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-medical border border-primary/10 overflow-hidden">
          {/* Chat Header */}
          <div className="bg-medical-gradient p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Bot className="h-7 w-7 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div className="text-white">
                  <h3 className="font-bold text-lg">Sehatify AI</h3>
                  <p className="text-white/80 text-sm">Medical Assistant • Always Available</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                  className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm"
                >
                  {isSoundEnabled ? (
                    <Volume2 className="h-5 w-5 text-white" />
                  ) : (
                    <VolumeX className="h-5 w-5 text-white" />
                  )}
                </button>
                
                <div className="relative">
                  <button
                    onClick={() => setShowOptions(!showOptions)}
                    className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm"
                  >
                    <MoreVertical className="h-5 w-5 text-white" />
                  </button>
                  
                  {showOptions && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-medical border border-gray-100 z-20 overflow-hidden">
                      <button
                        onClick={clearChatHistory}
                        className="w-full px-4 py-3 text-left text-sm text-text hover:bg-secondary/50 flex items-center space-x-3 transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-accent" />
                        <span>Clear Chat History</span>
                      </button>
                      <button className="w-full px-4 py-3 text-left text-sm text-text hover:bg-secondary/50 flex items-center space-x-3 transition-colors">
                        <Settings className="h-4 w-4 text-accent" />
                        <span>Settings</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-6 bg-chat-gradient">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div
                  className={`max-w-xs md:max-w-md lg:max-w-lg flex items-start space-x-3 ${
                    message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-chat ${
                    message.sender === 'user' 
                      ? 'bg-medical-gradient text-white' 
                      : 'bg-white border-2 border-primary/20 text-primary'
                  }`}>
                    {message.sender === 'user' ? (
                      <User className="h-5 w-5" />
                    ) : (
                      <Stethoscope className="h-5 w-5" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className={`px-5 py-4 rounded-2xl max-w-full shadow-chat ${
                    message.sender === 'user'
                      ? 'bg-medical-gradient text-white rounded-br-md'
                      : 'bg-white border border-primary/10 text-text rounded-bl-md'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.message}</p>
                    <p className={`text-xs mt-2 ${
                      message.sender === 'user' ? 'text-white/70' : 'text-text-light'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start animate-fade-in">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-white border-2 border-primary/20 rounded-full flex items-center justify-center shadow-chat">
                    <Stethoscope className="h-5 w-5 text-primary" />
                  </div>
                  <div className="bg-white border border-primary/10 rounded-2xl rounded-bl-md px-5 py-4 shadow-chat">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {messages.length === 1 && (
            <div className="px-6 py-4 bg-secondary/30 border-t border-primary/10">
              <p className="text-xs text-text-light mb-3 font-medium">Quick Health Topics:</p>
              <div className="flex flex-wrap gap-2">
                {quickSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setInputMessage(suggestion)}
                    className="px-4 py-2 text-xs bg-white border border-primary/20 rounded-full hover:bg-primary hover:text-white hover:border-primary transition-all duration-200 shadow-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-6 bg-white border-t border-primary/10">
            <div className="flex items-end space-x-4">
              {/* Attachment Button */}
              <button className="p-3 text-text-light hover:text-primary transition-colors rounded-xl hover:bg-secondary/50">
                <Paperclip className="h-5 w-5" />
              </button>

              {/* Input Container */}
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Describe your symptoms or ask a health question..."
                  className="w-full px-5 py-4 pr-24 rounded-2xl border-2 border-primary/20 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none resize-none min-h-[56px] max-h-32 bg-secondary/20 placeholder-text-light/60"
                  disabled={isTyping}
                  rows={1}
                />
                
                {/* Character Counter */}
                <div className="absolute bottom-3 right-16 text-xs text-text-light">
                  {characterCount}/{maxCharacters}
                </div>

                {/* Emoji Button */}
                <button className="absolute bottom-4 right-4 text-text-light hover:text-primary transition-colors">
                  <Smile className="h-4 w-4" />
                </button>
              </div>

              {/* Voice Input Button */}
              <button className="p-3 text-text-light hover:text-primary transition-colors rounded-xl hover:bg-secondary/50">
                <Mic className="h-5 w-5" />
              </button>

              {/* Send Button */}
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="bg-medical-gradient text-white p-4 rounded-2xl hover:shadow-medical transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-chat"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
            
            {/* Disclaimer */}
            <p className="text-xs text-text-light mt-4 text-center bg-secondary/30 rounded-lg p-3">
              🏥 This AI provides general health information only. For medical emergencies, contact emergency services immediately.
            </p>
          </div>
        </div>

        {/* Features Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-chat p-6 text-center border border-primary/10">
            <div className="bg-medical-gradient rounded-xl w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-bold text-text mb-2">AI-Powered Diagnosis</h3>
            <p className="text-text-light text-sm">Advanced medical AI for accurate symptom assessment</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-chat p-6 text-center border border-primary/10">
            <div className="bg-medical-gradient rounded-xl w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-bold text-text mb-2">Secure & Private</h3>
            <p className="text-text-light text-sm">HIPAA compliant with end-to-end encryption</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-chat p-6 text-center border border-primary/10">
            <div className="bg-medical-gradient rounded-xl w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-bold text-text mb-2">24/7 Available</h3>
            <p className="text-text-light text-sm">Round-the-clock medical assistance</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotAI;