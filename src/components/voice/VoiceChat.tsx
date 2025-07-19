'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface VoiceChatProps {
  roomName: string
  roomId: string
}

interface Participant {
  id: string
  name: string
  isMuted: boolean
  isSpeaking: boolean
}

export default function VoiceChat({ roomName, roomId }: VoiceChatProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt'>('prompt')

  // Mock participants
  const mockParticipants: Participant[] = [
    { id: '1', name: 'Alex Johnson', isMuted: false, isSpeaking: true },
    { id: '2', name: 'Sarah Chen', isMuted: true, isSpeaking: false },
    { id: '3', name: 'Mike Rodriguez', isMuted: false, isSpeaking: false },
  ]

  useEffect(() => {
    // Check microphone permission on component mount
    checkMicrophonePermission()
  }, [])

  const checkMicrophonePermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName })
      setPermissionStatus(result.state)
      
      result.addEventListener('change', () => {
        setPermissionStatus(result.state)
      })
    } catch (err) {
      console.error('Error checking microphone permission:', err)
    }
  }

  const requestMicrophoneAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setPermissionStatus('granted')
      // Stop the stream immediately as we just needed permission
      stream.getTracks().forEach(track => track.stop())
      return true
    } catch (err) {
      setPermissionStatus('denied')
      setError('Microphone access denied. Please enable microphone access to join voice chat.')
      return false
    }
  }

  const handleJoinVoiceChat = async () => {
    setIsConnecting(true)
    setError(null)

    try {
      // Check and request microphone permission if needed
      if (permissionStatus !== 'granted') {
        const hasPermission = await requestMicrophoneAccess()
        if (!hasPermission) {
          setIsConnecting(false)
          return
        }
      }

      // Simulate WebRTC connection
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate successful connection
      setIsConnected(true)
      setParticipants([...mockParticipants, { 
        id: 'you', 
        name: 'You', 
        isMuted: false, 
        isSpeaking: false 
      }])
      
    } catch (err) {
      setError('Failed to join voice chat. Please check your connection and try again.')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleLeaveVoiceChat = () => {
    setIsConnected(false)
    setParticipants([])
    setIsMuted(false)
    setError(null)
  }

  const handleToggleMute = () => {
    setIsMuted(!isMuted)
    // Update the current user's muted status in participants
    setParticipants(prev => 
      prev.map(p => 
        p.id === 'you' ? { ...p, isMuted: !isMuted } : p
      )
    )
  }

  if (permissionStatus === 'denied') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Microphone Access Required</CardTitle>
          <CardDescription>
            Voice chat requires microphone access to function properly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Please enable microphone access in your browser settings and refresh the page.
            </div>
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Room Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{roomName}</CardTitle>
              <CardDescription>
                {isConnected 
                  ? `Connected • ${participants.length} participant${participants.length !== 1 ? 's' : ''}`
                  : 'Not connected'
                }
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-gray-400'
              }`} />
              <span className="text-sm text-muted-foreground">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="pt-6">
            <div className="text-red-600 dark:text-red-400">{error}</div>
          </CardContent>
        </Card>
      )}

      {/* Participants */}
      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle>Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className={`p-4 rounded-lg border ${
                    participant.isSpeaking 
                      ? 'border-green-500 bg-green-50 dark:bg-green-950' 
                      : 'border-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{participant.name}</div>
                    <div className="flex items-center space-x-2">
                      {participant.isMuted && (
                        <Badge variant="secondary" className="text-xs">
                          Muted
                        </Badge>
                      )}
                      {participant.isSpeaking && (
                        <Badge variant="default" className="text-xs bg-green-500">
                          Speaking
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isConnected ? (
              <Button
                onClick={handleJoinVoiceChat}
                disabled={isConnecting}
                size="lg"
                className="w-full sm:w-auto"
              >
                {isConnecting ? 'Connecting...' : 'Join Voice Chat'}
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleToggleMute}
                  variant={isMuted ? "destructive" : "secondary"}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  {isMuted ? 'Unmute' : 'Mute'}
                </Button>
                <Button
                  onClick={handleLeaveVoiceChat}
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Leave Chat
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      {!isConnected && (
        <Card>
          <CardHeader>
            <CardTitle>How to Use Voice Chat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>• Click "Join Voice Chat" to connect to the room</div>
              <div>• Allow microphone access when prompted</div>
              <div>• Use the "Mute" button to control your microphone</div>
              <div>• Click "Leave Chat" when you're done</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
