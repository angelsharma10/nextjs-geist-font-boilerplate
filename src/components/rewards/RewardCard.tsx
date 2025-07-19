'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface Reward {
  id: string
  title: string
  description: string
  points: number
  type: 'daily' | 'weekly' | 'achievement' | 'special'
  status: 'available' | 'claimed' | 'locked'
  progress?: {
    current: number
    required: number
    description: string
  }
  expiresAt?: Date
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

interface RewardCardProps {
  reward: Reward
  onClaim: (rewardId: string) => Promise<void>
}

export default function RewardCard({ reward, onClaim }: RewardCardProps) {
  const [claiming, setClaiming] = useState(false)
  const [claimError, setClaimError] = useState<string | null>(null)

  const handleClaim = async () => {
    if (reward.status !== 'available') return

    try {
      setClaiming(true)
      setClaimError(null)
      await onClaim(reward.id)
    } catch (error) {
      setClaimError('Failed to claim reward. Please try again.')
    } finally {
      setClaiming(false)
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500'
      case 'rare': return 'bg-blue-500'
      case 'epic': return 'bg-purple-500'
      case 'legendary': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return 'bg-green-500'
      case 'weekly': return 'bg-blue-500'
      case 'achievement': return 'bg-purple-500'
      case 'special': return 'bg-orange-500'
      default: return 'bg-gray-500'
    }
  }

  const isProgressReward = reward.progress && reward.progress.required > 0
  const progressPercentage = isProgressReward 
    ? (reward.progress!.current / reward.progress!.required) * 100 
    : 0

  return (
    <Card className={`hover:shadow-lg transition-all ${
      reward.status === 'claimed' ? 'opacity-60' : ''
    } ${reward.status === 'locked' ? 'opacity-40' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Badge 
              className={`text-white text-xs ${getTypeColor(reward.type)}`}
            >
              {reward.type.charAt(0).toUpperCase() + reward.type.slice(1)}
            </Badge>
            <Badge 
              className={`text-white text-xs ${getRarityColor(reward.rarity)}`}
            >
              {reward.rarity.charAt(0).toUpperCase() + reward.rarity.slice(1)}
            </Badge>
          </div>
          <div className="text-lg font-bold text-primary">
            {reward.points} pts
          </div>
        </div>
        
        <CardTitle className="text-lg">{reward.title}</CardTitle>
        <CardDescription>{reward.description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Progress Bar for Achievement Rewards */}
          {isProgressReward && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {reward.progress!.description}
                </span>
                <span className="font-medium">
                  {reward.progress!.current}/{reward.progress!.required}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          )}

          {/* Expiration Timer */}
          {reward.expiresAt && reward.status === 'available' && (
            <div className="text-sm text-orange-600 dark:text-orange-400">
              Expires: {reward.expiresAt.toLocaleDateString()} at {reward.expiresAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}

          {/* Error Message */}
          {claimError && (
            <div className="text-sm text-red-600 dark:text-red-400">
              {claimError}
            </div>
          )}

          {/* Action Button */}
          <Button
            onClick={handleClaim}
            disabled={
              reward.status !== 'available' || 
              claiming || 
              (isProgressReward && reward.progress!.current < reward.progress!.required)
            }
            className="w-full"
            variant={
              reward.status === 'claimed' ? 'secondary' : 
              reward.status === 'locked' ? 'outline' : 'default'
            }
          >
            {claiming ? 'Claiming...' : 
             reward.status === 'claimed' ? 'Claimed' :
             reward.status === 'locked' ? 'Locked' :
             isProgressReward && reward.progress!.current < reward.progress!.required ? 
             `${reward.progress!.required - reward.progress!.current} more needed` :
             'Claim Reward'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
