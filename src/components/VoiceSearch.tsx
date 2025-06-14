
import React, { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Search, Volume2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  url: string;
  snippet: string;
}

const VoiceSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onstart = () => {
        setIsListening(true);
        toast({
          title: "Listening...",
          description: "Speak now to search",
        });
      };

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        handleSearch(transcript);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Voice Recognition Error",
          description: "Please try again or use text input",
          variant: "destructive",
        });
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    } else {
      console.warn('Speech recognition not supported');
    }
  }, []);

  const startVoiceRecognition = useCallback(() => {
    if (recognition) {
      recognition.start();
    } else {
      toast({
        title: "Voice Recognition Not Supported",
        description: "Your browser doesn't support voice recognition",
        variant: "destructive",
      });
    }
  }, [recognition]);

  const stopVoiceRecognition = useCallback(() => {
    if (recognition) {
      recognition.stop();
    }
  }, [recognition]);

  // Generate real URLs based on search query
  const generateSearchResults = (query: string): SearchResult[] => {
    const encodedQuery = encodeURIComponent(query);
    
    return [
      {
        id: '1',
        title: `${query} - Wikipedia`,
        description: `Learn comprehensive information about ${query} on Wikipedia`,
        url: `https://en.wikipedia.org/wiki/${query.replace(/\s+/g, '_')}`,
        snippet: `Discover detailed information about ${query} including its history, definition, and related topics. Wikipedia provides reliable, well-sourced content that's perfect for learning and research.`
      },
      {
        id: '2',
        title: `${query} - YouTube Tutorials`,
        description: `Watch educational videos about ${query}`,
        url: `https://www.youtube.com/results?search_query=${encodedQuery}+tutorial`,
        snippet: `Visual learning made easy! Watch step-by-step tutorials, expert explanations, and practical demonstrations about ${query} from top educators and professionals.`
      },
      {
        id: '3',
        title: `${query} - Khan Academy`,
        description: `Free online courses and lessons about ${query}`,
        url: `https://www.khanacademy.org/search?page_search_query=${encodedQuery}`,
        snippet: `Access free, world-class education materials about ${query}. Khan Academy offers structured learning paths, practice exercises, and expert instruction.`
      },
      {
        id: '4',
        title: `${query} - Coursera Courses`,
        description: `Professional courses and certifications related to ${query}`,
        url: `https://www.coursera.org/search?query=${encodedQuery}`,
        snippet: `Advance your knowledge with university-level courses about ${query}. Learn from top institutions and industry experts with hands-on projects and certificates.`
      },
      {
        id: '5',
        title: `${query} - Reddit Discussions`,
        description: `Community discussions and real experiences about ${query}`,
        url: `https://www.reddit.com/search/?q=${encodedQuery}`,
        snippet: `Join the conversation! Read real experiences, ask questions, and get practical advice about ${query} from a vibrant community of learners and experts.`
      },
      {
        id: '6',
        title: `${query} - Google Scholar`,
        description: `Academic research and scholarly articles about ${query}`,
        url: `https://scholar.google.com/scholar?q=${encodedQuery}`,
        snippet: `Access peer-reviewed research papers, academic studies, and scholarly articles about ${query}. Perfect for in-depth research and academic learning.`
      }
    ];
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const results = generateSearchResults(query);
    setSearchResults(results);
    setIsLoading(false);

    // Speak the first result
    speakResult(`Found ${results.length} learning resources for ${query}. Click any result to start learning!`);
  };

  const speakResult = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  const handleResultClick = (url: string, title: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    toast({
      title: "Opening Resource",
      description: `Opening ${title} in a new tab`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Interactive Learning Hub
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Search with voice or text to discover curated learning resources. Get instant access to educational content from top platforms.
          </p>
        </div>

        {/* Search Interface */}
        <div className="max-w-4xl mx-auto mb-8">
          <Card className="p-6 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <form onSubmit={onSearchSubmit} className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="What would you like to learn today? Try 'machine learning' or 'cooking'..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 py-3 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-full"
                />
              </div>
              
              <Button
                type="button"
                onClick={isListening ? stopVoiceRecognition : startVoiceRecognition}
                className={`rounded-full p-3 transition-all duration-300 ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </Button>

              <Button
                type="submit"
                className="rounded-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                disabled={isLoading}
              >
                {isLoading ? 'Searching...' : 'Find Resources'}
              </Button>
            </form>

            {isListening && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center space-x-2 text-red-500">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">Listening for your learning topic...</span>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-800">
                Learning Resources ({searchResults.length})
              </h2>
              <Button
                variant="outline"
                onClick={() => speakResult(`Found ${searchResults.length} learning resources for ${searchQuery}. Click any result to start learning!`)}
                className="flex items-center space-x-2"
              >
                <Volume2 className="h-4 w-4" />
                <span>Read Results</span>
              </Button>
            </div>

            <div className="space-y-6">
              {searchResults.map((result, index) => (
                <Card 
                  key={result.id} 
                  className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500 bg-white/90 backdrop-blur-sm animate-in slide-in-from-bottom cursor-pointer hover:scale-[1.02]"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => handleResultClick(result.url, result.title)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-xl font-semibold text-blue-600 hover:text-blue-800">
                          {result.title}
                        </h3>
                        <ExternalLink className="h-4 w-4 text-gray-400" />
                      </div>
                      <p className="text-green-600 text-sm mb-2 break-all">{result.url}</p>
                      <p className="text-gray-700 leading-relaxed">{result.snippet}</p>
                      <div className="mt-3">
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          Click to learn more
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        speakResult(result.snippet);
                      }}
                      className="ml-4 flex-shrink-0"
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="text-lg text-gray-600">Finding the best learning resources...</span>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && searchResults.length === 0 && searchQuery === '' && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
              <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Start Your Learning Journey
              </h3>
              <p className="text-gray-600 mb-4">
                Search for any topic using voice or text to discover curated educational resources
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSearch("machine learning")}
                >
                  Machine Learning
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSearch("web development")}
                >
                  Web Development
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSearch("cooking")}
                >
                  Cooking
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSearch("photography")}
                >
                  Photography
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceSearch;
