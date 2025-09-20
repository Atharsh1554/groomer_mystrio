import { Service } from '../types';

export const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM'
];

export const getServicesByCategory = (image: string) => ({
  women: [
    {
      id: 1,
      name: "Hair Cut & Style",
      duration: "45 min",
      price: "₹800",
      image,
      category: "women" as const
    },
    {
      id: 2,
      name: "Hair Color",
      duration: "2 hours",
      price: "₹2500",
      image,
      category: "women" as const
    },
    {
      id: 3,
      name: "Facial Treatment",
      duration: "60 min",
      price: "₹1200",
      image,
      category: "women" as const
    },
    {
      id: 4,
      name: "Manicure & Pedicure",
      duration: "90 min",
      price: "₹1000",
      image,
      category: "women" as const
    }
  ] as Service[],
  men: [
    {
      id: 5,
      name: "Hair Cut & Beard Trim",
      duration: "30 min",
      price: "₹500",
      image,
      category: "men" as const
    },
    {
      id: 6,
      name: "Premium Hair Cut",
      duration: "45 min",
      price: "₹800",
      image,
      category: "men" as const
    },
    {
      id: 7,
      name: "Hair Wash & Style",
      duration: "25 min",
      price: "₹300",
      image,
      category: "men" as const
    },
    {
      id: 8,
      name: "Face Cleanup",
      duration: "40 min",
      price: "₹600",
      image,
      category: "men" as const
    }
  ] as Service[]
});