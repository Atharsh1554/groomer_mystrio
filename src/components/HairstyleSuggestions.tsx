import React, { useState } from 'react';
import { ArrowLeft, Heart, BookOpen, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';


interface Hairstyle {
  id: string;
  name: string;
  description: string;
  image: string;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  duration: string;
  category: string;
}

interface HairstyleSuggestionsProps {
  gender: 'male' | 'female';
  onBack: () => void;
  onContinue: () => void;
}

// Curated hairstyles with Unsplash search terms
const maleHairstyles: Omit<Hairstyle, 'image'>[] = [
  {
    id: 'fade-cut',
    name: 'Classic Fade',
    description: 'A timeless cut that blends short sides into longer hair on top',
    difficulty: 'Easy',
    duration: '30 min',
    category: 'Modern'
  },
  {
    id: 'pompadour',
    name: 'Modern Pompadour',
    description: 'Voluminous styled hair swept back from the face',
    difficulty: 'Medium',
    duration: '45 min',
    category: 'Vintage'
  },
  {
    id: 'buzz-cut',
    name: 'Buzz Cut',
    description: 'Clean, short cut perfect for low maintenance',
    difficulty: 'Easy',
    duration: '15 min',
    category: 'Classic'
  },
  {
    id: 'textured-crop',
    name: 'Textured Crop',
    description: 'Short, textured cut with natural movement',
    difficulty: 'Medium',
    duration: '40 min',
    category: 'Trendy'
  },
  {
    id: 'side-part',
    name: 'Side Part',
    description: 'Professional look with hair parted to one side',
    difficulty: 'Easy',
    duration: '25 min',
    category: 'Professional'
  },
  {
    id: 'quiff',
    name: 'Modern Quiff',
    description: 'Stylish upward sweep with shorter back and sides',
    difficulty: 'Medium',
    duration: '35 min',
    category: 'Trendy'
  }
];

const femaleHairstyles: Omit<Hairstyle, 'image'>[] = [
  {
    id: 'layered-cut',
    name: 'Layered Cut',
    description: 'Versatile layers that add movement and volume',
    difficulty: 'Medium',
    duration: '60 min',
    category: 'Classic'
  },
  {
    id: 'bob-cut',
    name: 'Modern Bob',
    description: 'Chic shoulder-length cut that frames the face',
    difficulty: 'Easy',
    duration: '45 min',
    category: 'Trendy'
  },
  {
    id: 'pixie-cut',
    name: 'Pixie Cut',
    description: 'Bold, short cut that highlights facial features',
    difficulty: 'Advanced',
    duration: '50 min',
    category: 'Bold'
  },
  {
    id: 'long-waves',
    name: 'Long Waves',
    description: 'Flowing waves with natural texture and bounce',
    difficulty: 'Medium',
    duration: '90 min',
    category: 'Romantic'
  },
  {
    id: 'beach-waves',
    name: 'Beach Waves',
    description: 'Effortless, tousled waves perfect for any occasion',
    difficulty: 'Easy',
    duration: '40 min',
    category: 'Casual'
  },
  {
    id: 'straight-blowout',
    name: 'Sleek Blowout',
    description: 'Smooth, straight hair with professional finish',
    difficulty: 'Medium',
    duration: '70 min',
    category: 'Professional'
  }
];

const searchTerms = {
  male: {
    'fade-cut': 'men fade haircut salon',
    'pompadour': 'men pompadour hairstyle',
    'buzz-cut': 'men buzz cut haircut',
    'textured-crop': 'men textured crop haircut',
    'side-part': 'men side part hairstyle',
    'quiff': 'men quiff hairstyle modern'
  },
  female: {
    'layered-cut': 'women layered haircut salon',
    'bob-cut': 'women bob haircut modern',
    'pixie-cut': 'women pixie cut hairstyle',
    'long-waves': 'women long wavy hair',
    'beach-waves': 'women beach waves hairstyle',
    'straight-blowout': 'women straight hair blowout'
  }
};

export function HairstyleSuggestions({ gender, onBack, onContinue }: HairstyleSuggestionsProps) {
  const [selectedHairstyles, setSelectedHairstyles] = useState<string[]>([]);
  const [loadedImages, setLoadedImages] = useState<Record<string, string>>({});
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({});

  const hairstyles = gender === 'male' ? maleHairstyles : femaleHairstyles;
  const terms = searchTerms[gender];

  // Predefined image URLs from Unsplash searches
  const imageUrls = {
    male: {
      'fade-cut': 'https://images.unsplash.com/photo-1693591936914-14645081663a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW4lMjBmYWRlJTIwaGFpcmN1dCUyMHNhbG9ufGVufDF8fHx8MTc1NjgyNjcxOHww&ixlib=rb-4.1.0&q=80&w=1080',
      'pompadour': 'https://images.unsplash.com/photo-1594910344569-a542a5f4bdff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW4lMjBwb21wYWRvdXIlMjBoYWlyc3R5bGV8ZW58MXx8fHwxNzU2ODI2NzIxfDA&ixlib=rb-4.1.0&q=80&w=1080',
      'buzz-cut': 'https://images.unsplash.com/photo-1543697506-6729425f7265?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW4lMjBidXp6JTIwY3V0JTIwaGFpcmN1dHxlbnwxfHx8fDE3NTY4MjY3MjR8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'textured-crop': 'https://images.unsplash.com/photo-1599011176306-4a96f1516d4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW4lMjB0ZXh0dXJlZCUyMGNyb3AlMjBoYWlyY3V0fGVufDF8fHx8MTc1NjgyNjc5Nnww&ixlib=rb-4.1.0&q=80&w=1080',
      'side-part': 'https://images.unsplash.com/photo-1706381088587-4501cc2948dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW4lMjBzaWRlJTIwcGFydCUyMGhhaXJzdHlsZXxlbnwxfHx8fDE3NTY4MjY4MDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'quiff': 'https://images.unsplash.com/photo-1659355751282-5ca7807af9e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW4lMjBxdWlmZiUyMGhhaXJzdHlsZSUyMG1vZGVybnxlbnwxfHx8fDE3NTY4MjY4MDN8MA&ixlib=rb-4.1.0&q=80&w=1080'
    },
    female: {
      'layered-cut': 'https://images.unsplash.com/photo-1563798163029-5448a0ffd596?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMGxheWVyZWQlMjBoYWlyY3V0JTIwc2Fsb258ZW58MXx8fHwxNzU2ODI2NzI3fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'bob-cut': 'https://images.unsplash.com/photo-1731951039647-94f50eea1fd5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMGJvYiUyMGhhaXJjdXQlMjBtb2Rlcm58ZW58MXx8fHwxNzU2ODI2NzMwfDA&ixlib=rb-4.1.0&q=80&w=1080',
      'pixie-cut': 'https://images.unsplash.com/photo-1599042426110-03e7730293cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMHBpeGllJTIwY3V0JTIwaGFpcnN0eWxlfGVufDF8fHx8MTc1NjgyNjczM3ww&ixlib=rb-4.1.0&q=80&w=1080',
      'long-waves': 'https://images.unsplash.com/photo-1676665721763-6bb3496a3ec3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMGxvbmclMjB3YXZ5JTIwaGFpcnxlbnwxfHx8fDE3NTY4MjY4MDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'beach-waves': 'https://images.unsplash.com/photo-1746253077211-6fbd1730cbf8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMGJlYWNoJTIwd2F2ZXMlMjBoYWlyc3R5bGV8ZW58MXx8fHwxNzU2ODI2ODEwfDA&ixlib=rb-4.1.0&q=80&w=1080',
      'straight-blowout': 'https://images.unsplash.com/photo-1602501025442-a4899b5e0b71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMHN0cmFpZ2h0JTIwaGFpciUyMGJsb3dvdXR8ZW58MXx8fHwxNzU2ODI2ODE0fDA&ixlib=rb-4.1.0&q=80&w=1080'
    }
  };

  // Load images on mount
  const loadHairstyleImages = () => {
    const currentGenderImages = imageUrls[gender];
    const initialImages: Record<string, string> = {};
    
    hairstyles.forEach(hairstyle => {
      const imageUrl = currentGenderImages[hairstyle.id as keyof typeof currentGenderImages];
      if (imageUrl) {
        initialImages[hairstyle.id] = imageUrl;
      }
    });
    
    setLoadedImages(initialImages);
  };

  // Load images on mount
  React.useEffect(() => {
    loadHairstyleImages();
  }, [gender]);

  const toggleHairstyle = (hairstyleId: string) => {
    setSelectedHairstyles(prev => 
      prev.includes(hairstyleId)
        ? prev.filter(id => id !== hairstyleId)
        : [...prev, hairstyleId]
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="font-medium">Suggested Hairstyles</h1>
              <p className="text-sm text-muted-foreground">
                Based on your {gender === 'male' ? 'masculine' : 'feminine'} features
              </p>
            </div>
          </div>
          <Button
            onClick={onContinue}
            disabled={selectedHairstyles.length === 0}
            size="sm"
          >
            Continue
            {selectedHairstyles.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-4 px-1.5 text-xs">
                {selectedHairstyles.length}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-4 flex items-start space-x-3">
            <BookOpen className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <h3 className="font-medium text-blue-900">
                Personalized Recommendations
              </h3>
              <p className="text-sm text-blue-700">
                These hairstyles are curated based on your facial features. 
                Select your favorites to help stylists recommend the best services.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Hairstyles Grid */}
        <div className="space-y-4">
          <h2 className="font-medium">
            Recommended {gender === 'male' ? 'Men\'s' : 'Women\'s'} Hairstyles
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {hairstyles.map((hairstyle) => {
              const isSelected = selectedHairstyles.includes(hairstyle.id);
              const isLoading = loadingImages[hairstyle.id];
              const imageUrl = loadedImages[hairstyle.id];

              return (
                <Card 
                  key={hairstyle.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'ring-2 ring-primary shadow-md' 
                      : 'hover:shadow-sm'
                  }`}
                  onClick={() => toggleHairstyle(hairstyle.id)}
                >
                  <CardContent className="p-0">
                    {/* Image */}
                    <div className="relative h-40 bg-muted rounded-t-lg overflow-hidden">
                      {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                        </div>
                      ) : imageUrl ? (
                        <ImageWithFallback
                          src={imageUrl}
                          alt={hairstyle.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          <div className="text-center space-y-2">
                            <BookOpen className="w-8 h-8 mx-auto opacity-50" />
                            <p className="text-xs">Tap to preview</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Selection Overlay */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                          <div className="bg-primary text-primary-foreground rounded-full p-2">
                            <Check className="w-4 h-4" />
                          </div>
                        </div>
                      )}

                      {/* Heart Icon for Selection */}
                      <div className="absolute top-2 right-2">
                        <div className={`p-1.5 rounded-full transition-colors ${
                          isSelected 
                            ? 'bg-red-500 text-white' 
                            : 'bg-white/80 text-gray-600 hover:bg-white'
                        }`}>
                          <Heart 
                            className={`w-4 h-4 ${isSelected ? 'fill-current' : ''}`} 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-medium">{hairstyle.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {hairstyle.description}
                        </p>
                      </div>

                      {/* Tags */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant="secondary" 
                            className={getDifficultyColor(hairstyle.difficulty)}
                          >
                            {hairstyle.difficulty}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {hairstyle.category}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {hairstyle.duration}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Selected Count */}
        {selectedHairstyles.length > 0 && (
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-green-800">
                <Check className="w-4 h-4 inline mr-2" />
                {selectedHairstyles.length} hairstyle{selectedHairstyles.length !== 1 ? 's' : ''} selected
              </p>
              <p className="text-xs text-green-700 mt-1">
                Stylists will use these preferences to recommend services
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}