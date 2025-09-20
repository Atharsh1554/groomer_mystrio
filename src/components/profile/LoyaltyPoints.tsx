import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Gift, Star, Trophy, Crown, RefreshCw } from 'lucide-react';
import { LoadingSpinner } from '../LoadingSpinner';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  category: 'discount' | 'free-service' | 'upgrade' | 'gift';
  isAvailable: boolean;
  expiryDate?: string;
}

interface LoyaltyTier {
  name: string;
  minPoints: number;
  maxPoints: number;
  benefits: string[];
  icon: React.ComponentType<any>;
  color: string;
}

interface LoyaltyData {
  currentPoints: number;
  totalEarned: number;
  currentTier: string;
  nextTier: string;
  pointsToNextTier: number;
  rewards: Reward[];
  recentTransactions: Array<{
    id: string;
    type: 'earned' | 'redeemed';
    points: number;
    description: string;
    date: string;
  }>;
}

interface LoyaltyPointsProps {
  userId: string;
}

const LOYALTY_TIERS: LoyaltyTier[] = [
  {
    name: 'Bronze',
    minPoints: 0,
    maxPoints: 499,
    benefits: ['5% off services', 'Birthday discount'],
    icon: Star,
    color: 'text-amber-600'
  },
  {
    name: 'Silver',
    minPoints: 500,
    maxPoints: 1499,
    benefits: ['10% off services', 'Priority booking', 'Free consultation'],
    icon: Trophy,
    color: 'text-gray-500'
  },
  {
    name: 'Gold',
    minPoints: 1500,
    maxPoints: 4999,
    benefits: ['15% off services', 'Complimentary refreshments', 'Exclusive events'],
    icon: Crown,
    color: 'text-yellow-500'
  },
  {
    name: 'Platinum',
    minPoints: 5000,
    maxPoints: Infinity,
    benefits: ['20% off services', 'Free product samples', 'Personal stylist'],
    icon: Crown,
    color: 'text-purple-600'
  }
];

export function LoyaltyPoints({ userId }: LoyaltyPointsProps) {
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  useEffect(() => {
    fetchLoyaltyData();
  }, [userId]);

  const fetchLoyaltyData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a5b926ad/loyalty/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLoyaltyData(data);
      } else {
        setError('Failed to load loyalty data');
      }
    } catch (error) {
      console.error('Error fetching loyalty data:', error);
      setError('Failed to load loyalty data');
    } finally {
      setLoading(false);
    }
  };

  const redeemReward = async (rewardId: string) => {
    setRedeeming(rewardId);
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a5b926ad/loyalty/redeem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          userId,
          rewardId
        }),
      });

      if (response.ok) {
        fetchLoyaltyData(); // Refresh data
      } else {
        setError('Failed to redeem reward');
      }
    } catch (error) {
      console.error('Error redeeming reward:', error);
      setError('Failed to redeem reward');
    } finally {
      setRedeeming(null);
    }
  };

  const getCurrentTier = () => {
    if (!loyaltyData) return LOYALTY_TIERS[0];
    return LOYALTY_TIERS.find(tier => 
      loyaltyData.currentPoints >= tier.minPoints && 
      loyaltyData.currentPoints <= tier.maxPoints
    ) || LOYALTY_TIERS[0];
  };

  const getNextTier = () => {
    if (!loyaltyData) return LOYALTY_TIERS[1];
    const currentTierIndex = LOYALTY_TIERS.findIndex(tier => 
      loyaltyData.currentPoints >= tier.minPoints && 
      loyaltyData.currentPoints <= tier.maxPoints
    );
    return LOYALTY_TIERS[currentTierIndex + 1] || LOYALTY_TIERS[currentTierIndex];
  };

  const getProgressToNextTier = () => {
    if (!loyaltyData) return 0;
    const currentTier = getCurrentTier();
    const nextTier = getNextTier();
    if (currentTier === nextTier) return 100; // Max tier reached
    
    const progress = (loyaltyData.currentPoints - currentTier.minPoints) / 
                    (nextTier.minPoints - currentTier.minPoints) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (error || !loyaltyData) {
    return (
      <Card>
        <CardContent className="text-center p-8">
          <p className="text-muted-foreground mb-4">{error || 'No loyalty data found'}</p>
          <Button onClick={fetchLoyaltyData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentTier = getCurrentTier();
  const nextTier = getNextTier();
  const TierIcon = currentTier.icon;

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Loyalty Status</span>
            <Badge variant="secondary" className={currentTier.color}>
              <TierIcon className="w-4 h-4 mr-1" />
              {currentTier.name}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold">{loyaltyData.currentPoints}</div>
            <p className="text-sm text-muted-foreground">Available Points</p>
          </div>

          {currentTier !== nextTier && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to {nextTier.name}</span>
                <span>{loyaltyData.pointsToNextTier} points to go</span>
              </div>
              <Progress value={getProgressToNextTier()} className="h-2" />
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium">Current Benefits:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              {currentTier.benefits.map((benefit, index) => (
                <li key={index} className="flex items-center">
                  <Star className="w-3 h-3 mr-2 text-primary" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Available Rewards */}
      <Card>
        <CardHeader>
          <CardTitle>Available Rewards</CardTitle>
        </CardHeader>
        <CardContent>
          {loyaltyData.rewards.length === 0 ? (
            <div className="text-center py-8">
              <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No rewards available</p>
              <p className="text-sm text-muted-foreground">
                Keep earning points to unlock rewards
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {loyaltyData.rewards.map((reward) => (
                <div
                  key={reward.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{reward.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {reward.description}
                    </p>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {reward.pointsCost} points
                      </Badge>
                      <Badge variant="secondary">
                        {reward.category.replace('-', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    onClick={() => redeemReward(reward.id)}
                    disabled={
                      !reward.isAvailable || 
                      loyaltyData.currentPoints < reward.pointsCost ||
                      redeeming === reward.id
                    }
                    size="sm"
                  >
                    {redeeming === reward.id ? 'Redeeming...' : 'Redeem'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {loyaltyData.recentTransactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No recent activity
            </p>
          ) : (
            <div className="space-y-3">
              {loyaltyData.recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`text-sm font-medium ${
                    transaction.type === 'earned' 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {transaction.type === 'earned' ? '+' : '-'}{transaction.points}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}