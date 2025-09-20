import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Create Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// User signup endpoint
app.post("/make-server-a5b926ad/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    if (!email || !password || !name) {
      return c.json({ error: "Email, password, and name are required" }, 400);
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log(`Signup error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ user: data.user });
  } catch (error) {
    console.log(`Server error during signup: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get salons endpoint
app.get("/make-server-a5b926ad/salons", async (c) => {
  try {
    let salons = await kv.get("salons");
    
    // Check if salons exist and have the correct structure
    const needsUpdate = !salons || 
      !Array.isArray(salons) || 
      salons.length === 0 ||
      salons.some(salon => !salon.location || typeof salon.location.lng !== 'number');
    
    if (needsUpdate) {
      // Initialize sample salon data
      const sampleSalons = [
        {
          id: 1,
          name: "Glamour Studio",
          rating: 4.8,
          reviews: 450,
          address: "123 Fashion Street, Mumbai, Maharashtra",
          location: { lat: 19.0760, lng: 72.8777 },
          image: "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWxvbiUyMGludGVyaW9yJTIwbW9kZXJufGVufDF8fHx8MTc1NjY1ODc1NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
          services: ["Hair Cut", "Hair Color", "Facial", "Manicure"],
          openTime: "09:00 AM",
          closeTime: "07:00 PM"
        },
        {
          id: 2,
          name: "Elite Beauty Salon",
          rating: 4.6,
          reviews: 320,
          address: "456 Beauty Avenue, Delhi, Delhi",
          location: { lat: 28.7041, lng: 77.1025 },
          image: "https://images.unsplash.com/photo-1702236240794-58dc4c6895e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHhhaXIlMjBzYWxvbiUyMHdvbWVufGVufDF8fHx8MTc1NjY1ODc1Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
          services: ["Hair Styling", "Spa Treatment", "Bridal Makeup", "Threading"],
          openTime: "10:00 AM",
          closeTime: "08:00 PM"
        },
        {
          id: 3,
          name: "Men's Grooming Hub",
          rating: 4.7,
          reviews: 280,
          address: "789 Gents Corner, Bangalore, Karnataka",
          location: { lat: 12.9716, lng: 77.5946 },
          image: "https://images.unsplash.com/photo-1638383257199-5772f668ec73?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHhiYXJiZXIlMjBzaG9wJTIwbWVufGVufDF8fHx8MTc1NjY1ODc1Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
          services: ["Hair Cut", "Beard Trim", "Face Cleanup", "Hair Wash"],
          openTime: "09:00 AM",
          closeTime: "09:00 PM"
        },
        {
          id: 4,
          name: "Unisex Salon & Spa",
          rating: 4.9,
          reviews: 520,
          address: "321 Wellness Street, Pune, Maharashtra",
          location: { lat: 18.5204, lng: 73.8567 },
          image: "https://images.unsplash.com/photo-1559185590-d545a0c5a1dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHhzcGElMjB0cmVhdG1lbnQlMjBtYXNzYWdlfGVufDF8fHx8MTc1NjY1ODc1Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
          services: ["Hair Services", "Spa Treatments", "Skin Care", "Nail Art"],
          openTime: "08:00 AM",
          closeTime: "10:00 PM"
        },
        {
          id: 5,
          name: "Urban Style Lounge",
          rating: 4.5,
          reviews: 185,
          address: "567 Modern Plaza, Chennai, Tamil Nadu",
          location: { lat: 13.0827, lng: 80.2707 },
          image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWxvbiUyMGNoYWlyc3xlbnwwfHx8fDE3NTY2NTg3NTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
          services: ["Hair Cut", "Hair Styling", "Coloring", "Hair Treatment"],
          openTime: "10:00 AM",
          closeTime: "08:00 PM"
        },
        {
          id: 6,
          name: "Luxury Beauty Center",
          rating: 4.8,
          reviews: 340,
          address: "890 Elegance Road, Hyderabad, Telangana",
          location: { lat: 17.3850, lng: 78.4867 },
          image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWF1dHklMjBzYWxvbiUyMGx1eHVyeXxlbnwwfHx8fDE3NTY2NTg3NTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
          services: ["Facial", "Makeup", "Spa", "Hair Services"],
          openTime: "09:00 AM",
          closeTime: "09:00 PM"
        }
      ];
      
      await kv.set("salons", sampleSalons);
      return c.json({ salons: sampleSalons });
    }

    return c.json({ salons });
  } catch (error) {
    console.log(`Error fetching salons: ${error}`);
    return c.json({ error: "Failed to fetch salons" }, 500);
  }
});

// Create booking endpoint
app.post("/make-server-a5b926ad/bookings", async (c) => {
  try {
    console.log('Received booking request');
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      console.log('No access token provided');
      return c.json({ error: "Authorization header missing" }, 401);
    }

    console.log('Verifying user authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError) {
      console.log(`Auth error: ${authError.message}`);
      return c.json({ error: `Authentication failed: ${authError.message}` }, 401);
    }
    
    if (!user?.id) {
      console.log('No user found in token');
      return c.json({ error: "Invalid user token" }, 401);
    }

    console.log(`User verified: ${user.id}`);

    const bookingData = await c.req.json();
    console.log('Booking data received:', bookingData);

    // Validate required booking data
    if (!bookingData.salonId || !bookingData.service || !bookingData.date || !bookingData.time || !bookingData.customerDetails) {
      console.log('Missing required booking data');
      return c.json({ error: "Missing required booking information" }, 400);
    }

    const bookingId = `booking_${Date.now()}_${user.id}`;
    
    const booking = {
      id: bookingId,
      userId: user.id,
      ...bookingData,
      createdAt: new Date().toISOString(),
      status: 'confirmed'
    };

    console.log('Saving booking to KV store...');
    await kv.set(bookingId, booking);
    
    // Also store in user's bookings list
    const userBookingsKey = `user_bookings_${user.id}`;
    const existingBookings = await kv.get(userBookingsKey) || [];
    existingBookings.push(bookingId);
    await kv.set(userBookingsKey, existingBookings);

    console.log('Booking created successfully:', bookingId);
    return c.json({ booking });
  } catch (error) {
    console.log(`Error creating booking: ${error.message || error}`);
    return c.json({ error: `Failed to create booking: ${error.message || error}` }, 500);
  }
});

// Get user bookings endpoint
app.get("/make-server-a5b926ad/bookings", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userBookingsKey = `user_bookings_${user.id}`;
    const bookingIds = await kv.get(userBookingsKey) || [];
    
    if (bookingIds.length === 0) {
      return c.json({ bookings: [] });
    }

    const bookings = await kv.mget(bookingIds);
    const validBookings = bookings.filter(Boolean).map(booking => ({
      id: booking.id,
      salonName: booking.salonName,
      salonAddress: booking.salonAddress,
      serviceName: booking.service?.name || 'Service',
      date: booking.date,
      time: booking.time,
      status: booking.status || 'confirmed',
      price: booking.service?.price || 'N/A'
    }));
    
    return c.json({ bookings: validBookings });
  } catch (error) {
    console.log(`Error fetching user bookings: ${error}`);
    return c.json({ error: "Failed to fetch bookings" }, 500);
  }
});

// Get user bookings by user ID endpoint (public access for demo)
app.get("/make-server-a5b926ad/bookings/user/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    
    if (!userId) {
      return c.json({ error: "User ID is required" }, 400);
    }

    const userBookingsKey = `user_bookings_${userId}`;
    const bookingIds = await kv.get(userBookingsKey) || [];
    
    if (bookingIds.length === 0) {
      // Return some sample bookings for demo purposes
      const sampleBookings = [
        {
          id: 'sample_1',
          salonName: 'Glamour Studio',
          salonAddress: '123 Fashion Street, Mumbai, Maharashtra',
          serviceName: 'Hair Cut & Styling',
          date: '2025-01-15',
          time: '10:00 AM',
          status: 'upcoming',
          price: '₹800'
        },
        {
          id: 'sample_2',
          salonName: 'Elite Beauty Salon',
          salonAddress: '456 Beauty Avenue, Delhi, Delhi',
          serviceName: 'Facial Treatment',
          date: '2024-12-28',
          time: '02:00 PM',
          status: 'completed',
          price: '₹1,200'
        },
        {
          id: 'sample_3',
          salonName: 'Men\'s Grooming Hub',
          salonAddress: '789 Gents Corner, Bangalore, Karnataka',
          serviceName: 'Beard Trim',
          date: '2024-12-20',
          time: '04:30 PM',
          status: 'completed',
          price: '₹300'
        }
      ];
      return c.json({ bookings: sampleBookings });
    }

    const bookings = await kv.mget(bookingIds);
    const validBookings = bookings.filter(Boolean).map(booking => ({
      id: booking.id,
      salonName: booking.salonName,
      salonAddress: booking.salonAddress,
      serviceName: booking.service?.name || 'Service',
      date: booking.date,
      time: booking.time,
      status: booking.status || 'confirmed',
      price: booking.service?.price || 'N/A'
    }));
    
    return c.json({ bookings: validBookings });
  } catch (error) {
    console.log(`Error fetching user bookings: ${error}`);
    return c.json({ error: "Failed to fetch bookings" }, 500);
  }
});

// Force refresh salons endpoint (clears cache)
app.delete("/make-server-a5b926ad/salons", async (c) => {
  try {
    await kv.del("salons");
    return c.json({ message: "Salon data cleared successfully" });
  } catch (error) {
    console.log(`Error clearing salon data: ${error}`);
    return c.json({ error: "Failed to clear salon data" }, 500);
  }
});

// Profile Management Routes

// Update user profile
app.post("/make-server-a5b926ad/profile/update", async (c) => {
  try {
    const { userId, profile } = await c.req.json();
    
    if (!userId || !profile) {
      return c.json({ error: "User ID and profile data are required" }, 400);
    }

    const profileKey = `user_profile_${userId}`;
    await kv.set(profileKey, {
      ...profile,
      updatedAt: new Date().toISOString()
    });

    return c.json({ success: true });
  } catch (error) {
    console.log(`Error updating profile: ${error}`);
    return c.json({ error: "Failed to update profile" }, 500);
  }
});

// Get booking history for profile
app.get("/make-server-a5b926ad/bookings/history/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    
    // Get user bookings
    const userBookingsKey = `user_bookings_${userId}`;
    const bookingIds = await kv.get(userBookingsKey) || [];
    
    if (bookingIds.length === 0) {
      // Return sample booking history for demo
      const sampleHistory = [
        {
          id: 'hist_1',
          salonName: 'Glamour Studio',
          salonImage: 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWxvbiUyMGludGVyaW9yJTIwbW9kZXJufGVufDF8fHx8MTc1NjY1ODc1NXww&ixlib=rb-4.1.0&q=80&w=400',
          salonAddress: '123 Fashion Street, Mumbai',
          services: [
            { name: 'Hair Cut & Styling', price: 50, duration: 60 },
            { name: 'Hair Color', price: 80, duration: 120 }
          ],
          date: '2024-12-15',
          time: '10:00 AM',
          status: 'completed',
          totalAmount: 130,
          rating: 5,
          review: 'Excellent service! Very professional and friendly staff.',
          loyaltyPointsEarned: 130
        },
        {
          id: 'hist_2',
          salonName: 'Elite Beauty Salon',
          salonImage: 'https://images.unsplash.com/photo-1702236240794-58dc4c6895e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHhhaXIlMjBzYWxvbiUyMHdvbWVufGVufDF8fHx8MTc1NjY1ODc1Nnww&ixlib=rb-4.1.0&q=80&w=400',
          salonAddress: '456 Beauty Avenue, Delhi',
          services: [
            { name: 'Facial Treatment', price: 60, duration: 90 }
          ],
          date: '2024-11-28',
          time: '02:00 PM',
          status: 'completed',
          totalAmount: 60,
          rating: 4,
          loyaltyPointsEarned: 60
        },
        {
          id: 'hist_3',
          salonName: 'Men\'s Grooming Hub',
          salonImage: 'https://images.unsplash.com/photo-1638383257199-5772f668ec73?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHhiYXJiZXIlMjBzaG9wJTIwbWVufGVufDF8fHx8MTc1NjY1ODc1Nnww&ixlib=rb-4.1.0&q=80&w=400',
          salonAddress: '789 Gents Corner, Bangalore',
          services: [
            { name: 'Hair Cut', price: 25, duration: 30 },
            { name: 'Beard Trim', price: 15, duration: 15 }
          ],
          date: '2024-11-10',
          time: '04:30 PM',
          status: 'completed',
          totalAmount: 40,
          rating: 5,
          review: 'Great barber, exactly what I wanted!',
          loyaltyPointsEarned: 40
        }
      ];
      return c.json({ bookings: sampleHistory });
    }

    const bookings = await kv.mget(bookingIds);
    const detailedBookings = bookings.filter(Boolean).map(booking => ({
      id: booking.id,
      salonName: booking.salonName,
      salonAddress: booking.salonAddress,
      services: booking.services || [{ name: booking.service?.name || 'Service', price: booking.service?.price || 0, duration: 60 }],
      date: booking.date,
      time: booking.time,
      status: booking.status || 'completed',
      totalAmount: booking.totalAmount || booking.service?.price || 0,
      loyaltyPointsEarned: Math.floor((booking.totalAmount || booking.service?.price || 0) * 1) // 1 point per dollar
    }));

    return c.json({ bookings: detailedBookings });
  } catch (error) {
    console.log(`Error fetching booking history: ${error}`);
    return c.json({ error: "Failed to fetch booking history" }, 500);
  }
});

// Get loyalty points and rewards
app.get("/make-server-a5b926ad/loyalty/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    const loyaltyKey = `user_loyalty_${userId}`;
    
    let loyaltyData = await kv.get(loyaltyKey);
    
    if (!loyaltyData) {
      // Initialize loyalty data with sample data
      loyaltyData = {
        currentPoints: 350,
        totalEarned: 850,
        currentTier: 'Bronze',
        nextTier: 'Silver',
        pointsToNextTier: 150,
        rewards: [
          {
            id: 'reward_1',
            title: '10% Off Next Service',
            description: 'Get 10% discount on any service',
            pointsCost: 100,
            category: 'discount',
            isAvailable: true
          },
          {
            id: 'reward_2',
            title: 'Free Hair Wash',
            description: 'Complimentary hair wash with any service',
            pointsCost: 50,
            category: 'free-service',
            isAvailable: true
          },
          {
            id: 'reward_3',
            title: 'Premium Service Upgrade',
            description: 'Upgrade to premium service package',
            pointsCost: 200,
            category: 'upgrade',
            isAvailable: true
          },
          {
            id: 'reward_4',
            title: 'Hair Care Gift Set',
            description: 'Professional hair care products package',
            pointsCost: 500,
            category: 'gift',
            isAvailable: false
          }
        ],
        recentTransactions: [
          {
            id: 'trans_1',
            type: 'earned',
            points: 130,
            description: 'Hair Cut & Styling at Glamour Studio',
            date: '2024-12-15T10:00:00Z'
          },
          {
            id: 'trans_2',
            type: 'earned',
            points: 60,
            description: 'Facial Treatment at Elite Beauty Salon',
            date: '2024-11-28T14:00:00Z'
          },
          {
            id: 'trans_3',
            type: 'redeemed',
            points: -50,
            description: 'Redeemed: Free Hair Wash',
            date: '2024-11-20T16:00:00Z'
          }
        ]
      };
      
      await kv.set(loyaltyKey, loyaltyData);
    }

    return c.json(loyaltyData);
  } catch (error) {
    console.log(`Error fetching loyalty data: ${error}`);
    return c.json({ error: "Failed to fetch loyalty data" }, 500);
  }
});

// Redeem loyalty reward
app.post("/make-server-a5b926ad/loyalty/redeem", async (c) => {
  try {
    const { userId, rewardId } = await c.req.json();
    
    const loyaltyKey = `user_loyalty_${userId}`;
    const loyaltyData = await kv.get(loyaltyKey);
    
    if (!loyaltyData) {
      return c.json({ error: "Loyalty data not found" }, 404);
    }

    const reward = loyaltyData.rewards.find(r => r.id === rewardId);
    if (!reward || !reward.isAvailable) {
      return c.json({ error: "Reward not available" }, 400);
    }

    if (loyaltyData.currentPoints < reward.pointsCost) {
      return c.json({ error: "Insufficient points" }, 400);
    }

    // Deduct points and add transaction
    loyaltyData.currentPoints -= reward.pointsCost;
    loyaltyData.recentTransactions.unshift({
      id: `trans_${Date.now()}`,
      type: 'redeemed',
      points: -reward.pointsCost,
      description: `Redeemed: ${reward.title}`,
      date: new Date().toISOString()
    });

    await kv.set(loyaltyKey, loyaltyData);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error redeeming reward: ${error}`);
    return c.json({ error: "Failed to redeem reward" }, 500);
  }
});

// Get user preferences
app.get("/make-server-a5b926ad/preferences/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    const preferencesKey = `user_preferences_${userId}`;
    
    const preferences = await kv.get(preferencesKey);
    
    if (!preferences) {
      return c.json({ error: "No preferences found" }, 404);
    }

    return c.json(preferences);
  } catch (error) {
    console.log(`Error fetching preferences: ${error}`);
    return c.json({ error: "Failed to fetch preferences" }, 500);
  }
});

// Save user preferences
app.post("/make-server-a5b926ad/preferences/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    const preferences = await c.req.json();
    
    const preferencesKey = `user_preferences_${userId}`;
    await kv.set(preferencesKey, {
      ...preferences,
      updatedAt: new Date().toISOString()
    });

    return c.json({ success: true });
  } catch (error) {
    console.log(`Error saving preferences: ${error}`);
    return c.json({ error: "Failed to save preferences" }, 500);
  }
});

// Get user settings
app.get("/make-server-a5b926ad/settings/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    const settingsKey = `user_settings_${userId}`;
    
    const settings = await kv.get(settingsKey);
    
    if (!settings) {
      return c.json({ error: "No settings found" }, 404);
    }

    return c.json(settings);
  } catch (error) {
    console.log(`Error fetching settings: ${error}`);
    return c.json({ error: "Failed to fetch settings" }, 500);
  }
});

// Save user settings
app.post("/make-server-a5b926ad/settings/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    const settings = await c.req.json();
    
    const settingsKey = `user_settings_${userId}`;
    await kv.set(settingsKey, {
      ...settings,
      updatedAt: new Date().toISOString()
    });

    return c.json({ success: true });
  } catch (error) {
    console.log(`Error saving settings: ${error}`);
    return c.json({ error: "Failed to save settings" }, 500);
  }
});

// Export user data
app.get("/make-server-a5b926ad/data/export/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    
    // Collect all user data
    const profileKey = `user_profile_${userId}`;
    const loyaltyKey = `user_loyalty_${userId}`;
    const preferencesKey = `user_preferences_${userId}`;
    const settingsKey = `user_settings_${userId}`;
    const bookingsKey = `user_bookings_${userId}`;
    
    const [profile, loyalty, preferences, settings, bookingIds] = await Promise.all([
      kv.get(profileKey),
      kv.get(loyaltyKey),
      kv.get(preferencesKey),
      kv.get(settingsKey),
      kv.get(bookingsKey)
    ]);

    let bookings = [];
    if (bookingIds && bookingIds.length > 0) {
      bookings = await kv.mget(bookingIds);
    }

    const exportData = {
      profile,
      loyalty,
      preferences,
      settings,
      bookings: bookings.filter(Boolean),
      exportDate: new Date().toISOString()
    };

    const jsonData = JSON.stringify(exportData, null, 2);
    
    c.header('Content-Type', 'application/json');
    c.header('Content-Disposition', 'attachment; filename="salon-data.json"');
    
    return c.body(jsonData);
  } catch (error) {
    console.log(`Error exporting data: ${error}`);
    return c.json({ error: "Failed to export data" }, 500);
  }
});

// Delete user account (removes all user data)
app.delete("/make-server-a5b926ad/account/delete/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    
    // Delete all user-related data
    const keysToDelete = [
      `user_profile_${userId}`,
      `user_loyalty_${userId}`,
      `user_preferences_${userId}`,
      `user_settings_${userId}`,
      `user_bookings_${userId}`
    ];

    // Get booking IDs to delete individual bookings
    const bookingIds = await kv.get(`user_bookings_${userId}`) || [];
    const allKeysToDelete = [...keysToDelete, ...bookingIds];

    await kv.mdel(allKeysToDelete);

    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting account: ${error}`);
    return c.json({ error: "Failed to delete account" }, 500);
  }
});

// Health check endpoint
app.get("/make-server-a5b926ad/health", (c) => {
  return c.json({ status: "ok" });
});

Deno.serve(app.fetch);