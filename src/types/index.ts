export interface User {
  id: string;
  email: string;
  user_metadata: {
    name: string;
  };
}

export interface Salon {
  id: number;
  name: string;
  rating: number;
  reviews: number;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  image: string;
  services: string[];
  openTime: string;
  closeTime: string;
}

export interface Service {
  id: number;
  name: string;
  duration: string;
  price: string;
  image: string;
  category: CategoryType;
}

export interface BookingData {
  salonId: number;
  salonName: string;
  salonAddress: string;
  service: Service;
  date: string;
  time: string;
  customerDetails: {
    name: string;
    phone: string;
    email: string;
  };
}

export type ViewType = 'auth' | 'faceRecognition' | 'genderSelection' | 'hairstyleSuggestions' | 'home' | 'booking' | 'cameraPreview';
export type CategoryType = 'women' | 'men';
export type BookingStep = 'services' | 'datetime' | 'details' | 'confirmation';