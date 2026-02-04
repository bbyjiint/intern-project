'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import InternNavbar from '@/components/InternNavbar'
import { apiFetch } from '@/lib/api'

interface Message {
  id: string
  senderId: string
  senderName: string
  senderInitials: string
  text: string
  timestamp: Date
  isCompany: boolean
}

interface Conversation {
  id: string
  companyId: string
  companyName: string
  companyInitials: string
  companyLogo?: string
  jobTitle?: string
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
  messages: Message[]
}

// Mock conversations - only companies that initiated contact
const mockConversations: Conversation[] = [
  {
    id: '1',
    companyId: '1',
    companyName: 'Trinity Securities Co., Ltd.',
    companyInitials: 'TS',
    companyLogo: 'TRINITY',
    jobTitle: 'UX/UI Designer',
    lastMessage: 'Thank you for the opportunity! I look forward to discussing this further.',
    lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    unreadCount: 0,
    messages: [
      {
        id: '1',
        senderId: 'company1',
        senderName: 'Trinity Securities Co., Ltd.',
        senderInitials: 'TS',
        text: 'Hi! I reviewed your profile and I\'m impressed with your design skills and projects. We have an exciting UX/UI Designer Intern position that I think would be a great fit for you.',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        isCompany: true,
      },
      {
        id: '2',
        senderId: 'intern',
        senderName: 'Intern Name',
        senderInitials: 'IN',
        text: 'Hi! Thank you so much for reaching out. I would love to learn more about this opportunity!',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000 + 45 * 60 * 1000),
        isCompany: false,
      },
      {
        id: '3',
        senderId: 'company1',
        senderName: 'Trinity Securities Co., Ltd.',
        senderInitials: 'TS',
        text: 'Great! The role focuses on designing user-friendly interfaces for our financial platform. You\'d be working with our design team using Figma and FlutterFlow. Would you be available for a quick phone screen this week?',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        isCompany: true,
      },
      {
        id: '4',
        senderId: 'intern',
        senderName: 'Intern Name',
        senderInitials: 'IN',
        text: 'That sounds perfect! I\'m particularly interested in UX/UI design. I\'m available Thursday or Friday afternoon. What time works best for you?',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 15 * 60 * 1000),
        isCompany: false,
      },
      {
        id: '5',
        senderId: 'intern',
        senderName: 'Intern Name',
        senderInitials: 'IN',
        text: 'Thank you for the opportunity! I look forward to discussing this further.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isCompany: false,
      },
    ],
  },
  {
    id: '2',
    companyId: '2',
    companyName: 'Tech Solutions Inc.',
    companyInitials: 'TS',
    jobTitle: 'Software Engineering Intern',
    lastMessage: 'When would be a good time to discuss the details?',
    lastMessageTime: new Date(Date.now() - 5 * 60 * 60 * 1000 + 15 * 60 * 1000),
    unreadCount: 1,
    messages: [
      {
        id: '6',
        senderId: 'company2',
        senderName: 'Tech Solutions Inc.',
        senderInitials: 'TS',
        text: 'Hi! I saw your profile and I think you\'d be a great fit for our Software Engineering Intern position.',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        isCompany: true,
      },
      {
        id: '7',
        senderId: 'intern',
        senderName: 'Intern Name',
        senderInitials: 'IN',
        text: 'When would be a good time to discuss the details?',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000 + 15 * 60 * 1000),
        isCompany: false,
      },
    ],
  },
]

function formatTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) {
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`
  }
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[date.getDay()]
  }
  return date.toLocaleDateString()
}

function formatMessageTime(date: Date): string {
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`
}

export default function InternMessagesPage() {
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Check role and load conversations (only on mount)
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const userData = await apiFetch<{ user: { role: string | null } }>('/api/auth/me')
        
        // Only redirect if role doesn't match the current page
        // This prevents issues when multiple tabs are open with different users
        const currentPath = window.location.pathname
        
        if (userData.user.role === 'COMPANY') {
          // Only redirect if we're on an intern page
          if (currentPath.startsWith('/intern')) {
            router.push('/employer/messages')
            return
          }
          // If we're already on an employer page, don't redirect (might be wrong token but let it be)
          return
        }
        
        if (!userData.user.role) {
          if (!currentPath.startsWith('/role-selection')) {
            router.push('/role-selection')
          }
          return
        }
        
        // If we're here and role is CANDIDATE, we're good to proceed

        // Load conversations from API
        const data = await apiFetch<{ conversations: Conversation[] }>('/api/messages/conversations')
        
        // Convert timestamp strings to Date objects
        const converted = data.conversations.map((conv: any) => ({
          ...conv,
          lastMessageTime: new Date(conv.lastMessageTime),
          messages: [], // Will be loaded when conversation is selected
        }))
        
        setConversations(converted)
        
        // Set first conversation as selected if we have conversations
        // Do this synchronously to prevent flicker
        if (converted.length > 0) {
          const firstConv = { ...converted[0], messages: [] }
          setSelectedConversation(firstConv)
        }
        setLoading(false)
      } catch (error) {
        console.error('Failed to load conversations:', error)
        setLoading(false)
      }
    }

    loadConversations()

    // Poll for conversation list updates every 3 seconds
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        const refreshConversations = async () => {
          try {
            const data = await apiFetch<{ conversations: Conversation[] }>('/api/messages/conversations')
            setConversations((prevConversations) => {
              const converted = data.conversations.map((conv: any) => ({
                ...conv,
                lastMessageTime: new Date(conv.lastMessageTime),
                messages: prevConversations.find(c => c.id === conv.id)?.messages || [],
              }))
              
              // Update selected conversation if it exists
              if (selectedConversation) {
                const updated = converted.find(c => c.id === selectedConversation.id)
                if (updated) {
                  setSelectedConversation({
                    ...updated,
                    messages: selectedConversation.messages,
                  })
                }
              }
              
              return converted
            })
          } catch (error) {
            // Silently fail - don't spam console
          }
        }
        refreshConversations()
      }
    }, 3000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, selectedConversation])

  // Load messages when conversation is selected
  useEffect(() => {
    if (!selectedConversation) return

    // Cancel any in-flight requests for previous conversation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const conversationId = selectedConversation.id
    const loadMessages = async () => {
      // Create new AbortController for this request
      const abortController = new AbortController()
      abortControllerRef.current = abortController

      // Only set loading on initial load, not during polling
      const isInitialLoad = !selectedConversation.messages || selectedConversation.messages.length === 0
      if (isInitialLoad) {
        setIsLoadingMessages(true)
      }

      try {
        // Create a custom fetch that supports AbortController
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/api/messages/conversations/${conversationId}/messages`,
          {
            signal: abortController.signal,
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )

        // Check if request was aborted
        if (abortController.signal.aborted) {
          return
        }

        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`)
        }

        const data = await response.json() as { messages: Message[] }
        
        // Double-check conversation hasn't changed (race condition protection)
        setSelectedConversation((current) => {
          if (!current || current.id !== conversationId) {
            // Conversation changed, ignore this response
            return current
          }
          return current
        })

        // Ignore if conversation changed while request was in-flight
        if (abortController.signal.aborted) {
          return
        }

        // Convert timestamp strings to Date objects
        const converted = data.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }))

        // Check if we have new messages (compare by length or last message ID)
        setSelectedConversation((current) => {
          if (!current || current.id !== conversationId) {
            return current
          }

          const prevMessages = current.messages || []
          const hasNewMessages = 
            prevMessages.length === 0 || 
            converted.length !== prevMessages.length ||
            (converted.length > 0 && prevMessages.length > 0 &&
             converted[converted.length - 1].id !== prevMessages[prevMessages.length - 1].id)

          // Scroll to bottom if new messages arrived
          if (hasNewMessages) {
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
            }, 100)
          }

          return {
            ...current,
            messages: converted, // Only update when we have valid data
          }
        })

        // Update conversations list
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === conversationId
              ? { ...conv, messages: converted }
              : conv
          )
        )

        setIsLoadingMessages(false)
      } catch (error: any) {
        // Don't clear messages on error - keep previous messages visible
        if (error.name === 'AbortError') {
          // Request was cancelled, ignore
          return
        }
        console.error('Failed to load messages:', error)
        // Keep previous messages, just stop loading indicator
        setIsLoadingMessages(false)
        // Could show a toast here: "Failed to refresh messages"
      }
    }

    loadMessages()

    // Poll for new messages every 2 seconds
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadMessages()
      }
    }, 2000)

    return () => {
      clearInterval(interval)
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [selectedConversation?.id])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedConversation?.messages])

  const filteredConversations = conversations.filter((conv) =>
    conv.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (conv.jobTitle && conv.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    try {
      const data = await apiFetch<{ message: Message }>(
        `/api/messages/conversations/${selectedConversation.id}/messages`,
        {
          method: 'POST',
          body: JSON.stringify({ text: newMessage.trim() }),
        }
      )

      const newMsg: Message = {
        ...data.message,
        timestamp: new Date(data.message.timestamp),
        senderName: data.message.isCompany ? 'Company' : 'Intern',
        senderInitials: data.message.isCompany ? 'CO' : 'IN',
      }

      const updatedConversations = conversations.map((conv) => {
        if (conv.id === selectedConversation.id) {
          return {
            ...conv,
            lastMessage: newMessage.trim(),
            lastMessageTime: new Date(),
            messages: [...conv.messages, newMsg],
          }
        }
        return conv
      })

      setConversations(updatedConversations)
      setSelectedConversation({
        ...selectedConversation,
        lastMessage: newMessage.trim(),
        lastMessageTime: new Date(),
        messages: [...selectedConversation.messages, newMsg],
      })
      setNewMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const getInitials = (name: string) => {
    if (!name) return 'C'
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.charAt(0).toUpperCase()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <InternNavbar />
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Sidebar - Conversation List */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Messages</h1>
            <div className="relative">
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center text-gray-500">Loading conversations...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                {searchQuery ? 'No conversations found' : 'No messages yet. Companies will contact you here.'}
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => {
                    setSelectedConversation(conv)
                    // Mark as read when selected
                    if (conv.unreadCount > 0) {
                      const updated = conversations.map((c) =>
                        c.id === conv.id ? { ...c, unreadCount: 0 } : c
                      )
                      setConversations(updated)
                    }
                  }}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedConversation?.id === conv.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${
                        selectedConversation?.id === conv.id ? 'bg-blue-600' : 'bg-gray-400'
                      }`}
                    >
                      {conv.companyInitials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">{conv.companyName}</h3>
                        {conv.unreadCount > 0 && (
                          <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
                        )}
                      </div>
                      {conv.jobTitle && (
                        <p className="text-xs text-gray-500 mb-1">{conv.jobTitle}</p>
                      )}
                      <p className="text-sm text-gray-600 truncate mb-1">{conv.lastMessage}</p>
                      <p className="text-xs text-gray-500">{formatTime(conv.lastMessageTime)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Content - Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {loading ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-lg">Loading messages...</p>
              </div>
            </div>
          ) : selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {selectedConversation.companyInitials}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{selectedConversation.companyName}</h2>
                    {selectedConversation.jobTitle && (
                      <p className="text-sm text-gray-600">{selectedConversation.jobTitle}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    // View company/job details - can be implemented later
                  }}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">View Details</span>
                </button>
              </div>

              {/* Messages */}
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 bg-gray-50">
                <div className="space-y-4">
                  {selectedConversation.messages && selectedConversation.messages.length > 0 ? (
                    <>
                      {selectedConversation.messages.map((msg) => {
                    // For intern page: isCompany means it's from the company (other person) - should be on left
                    // !isCompany means it's from the intern (current user) - should be on right
                    const isCurrentUser = !msg.isCompany
                    return (
                      <div
                        key={msg.id}
                        className={`flex items-start space-x-3 ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 ${
                            isCurrentUser ? 'bg-blue-600' : 'bg-gray-400'
                          }`}
                        >
                          {msg.senderInitials}
                        </div>
                        <div className={`flex-1 ${isCurrentUser ? 'flex justify-end' : ''}`}>
                          <div
                            className={`inline-block max-w-[70%] rounded-lg px-4 py-2 ${
                              isCurrentUser
                                ? 'bg-blue-600 text-white'
                                : 'bg-white border border-gray-200 text-gray-900'
                            }`}
                          >
                            <p className="text-sm leading-relaxed">{msg.text}</p>
                            <p
                              className={`text-xs mt-1 ${
                                isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                              }`}
                            >
                              {formatMessageTime(msg.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                      )
                    })}
                    {isLoadingMessages && (
                      <div className="flex justify-center py-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                      </div>
                    )}
                    </>
                  ) : !isLoadingMessages ? (
                    // Only show empty state when we're sure there are no messages (not loading)
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    // Show loading state instead of empty state
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <div className="w-8 h-8 mx-auto mb-2 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                        <p className="text-sm">Loading messages...</p>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#0273B1' }}
                    onMouseEnter={(e) => {
                      if (!e.currentTarget.disabled) {
                        e.currentTarget.style.backgroundColor = '#025a8f'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!e.currentTarget.disabled) {
                        e.currentTarget.style.backgroundColor = '#0273B1'
                      }
                    }}
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <p className="text-lg">Select a conversation to start messaging</p>
                <p className="text-sm mt-2 text-gray-400">Companies will contact you here when they're interested</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
