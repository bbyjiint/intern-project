'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import EmployerNavbar from '@/components/EmployerNavbar'
import CandidateProfileModal from '@/components/CandidateProfileModal'
import { apiFetch } from '@/lib/api'

interface Message {
  id: string
  senderId: string
  senderName: string
  senderInitials: string
  text: string
  timestamp: Date
  isEmployer: boolean
  isCompany?: boolean
}

interface Conversation {
  id: string
  candidateId: string
  candidateName: string
  candidateInitials: string
  candidateRole: string
  candidateUniversity: string
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
  messages: Message[]
}

const mockCandidates = [
  {
    id: '1',
    name: 'John Smith',
    role: 'Software Engineering Intern',
    university: 'UC Berkeley',
    major: 'Engineering',
    graduationDate: 'Jan 2024',
    skills: ['Python', 'JavaScript', 'React', 'Node.js'],
    initials: 'JS',
    email: 'john.smith@company.com',
    about: 'Passionate software engineering intern focused on full-stack development. Eager to learn modern web technologies and contribute to impactful projects.',
  },
  {
    id: '2',
    name: 'Emily Chen',
    role: 'Data Science Intern',
    university: 'Stanford University',
    major: 'Data Science',
    graduationDate: 'Jun 2024',
    skills: ['Python', 'R', 'Machine Learning', 'Pandas'],
    initials: 'EC',
    email: 'emily.chen@company.com',
    about: 'Data science intern with strong analytical skills and experience in statistical modeling. Passionate about turning data into actionable insights.',
  },
  {
    id: '3',
    name: 'Michael Rodriguez',
    role: 'Product Management Intern',
    university: 'MIT',
    major: 'Business',
    graduationDate: 'May 2024',
    skills: ['Product Strategy', 'Analytics', 'User Research'],
    initials: 'MR',
    email: 'michael.rodriguez@company.com',
    about: 'Product management intern with a passion for building user-centric products.',
  },
  {
    id: '4',
    name: 'Sarah Kim',
    role: 'UX Design Intern',
    university: 'Stanford University',
    major: 'Design',
    graduationDate: 'Apr 2024',
    skills: ['Adobe XD', 'UI Design', 'Wireframing', 'Figma'],
    initials: 'SK',
    email: 'sarah.kim@company.com',
    about: 'Creative UX design intern focused on creating intuitive and user-friendly interfaces.',
  },
  {
    id: '5',
    name: 'David Liu',
    role: 'Software Engineering Intern',
    university: 'UCLA',
    major: 'Engineering',
    graduationDate: 'Jan 2025',
    skills: ['Java', 'Spring Boot', 'AWS', 'Docker'],
    initials: 'DL',
    email: 'david.liu@company.com',
    about: 'Software engineering intern specializing in backend development and cloud infrastructure.',
  },
]

const mockConversations: Conversation[] = [
  {
    id: '1',
    candidateId: '1',
    candidateName: 'John Smith',
    candidateInitials: 'JS',
    candidateRole: 'Software Engineering Intern',
    candidateUniversity: 'UC Berkeley',
    lastMessage: 'Thank you for the opportunity! I look forward to discussing this further.',
    lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    unreadCount: 0,
    messages: [
      {
        id: '1',
        senderId: 'employer',
        senderName: 'Sarah Johnson',
        senderInitials: 'SJ',
        text: 'Hi John! I reviewed your profile and I\'m impressed with your technical skills and projects. We have an exciting Software Engineering Intern position that I think would be a great fit for you.',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        isEmployer: true,
      },
      {
        id: '2',
        senderId: '1',
        senderName: 'John Smith',
        senderInitials: 'JS',
        text: 'Hi Sarah! Thank you so much for reaching out. I would love to learn more about this opportunity!',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000 + 45 * 60 * 1000),
        isEmployer: false,
      },
      {
        id: '3',
        senderId: 'employer',
        senderName: 'Sarah Johnson',
        senderInitials: 'SJ',
        text: 'Great! The role focuses on full-stack development with our Engineering team. You\'d be working on our core platform using React, Node.js, and PostgreSQL. Would you be available for a quick phone screen this week?',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        isEmployer: true,
      },
      {
        id: '4',
        senderId: '1',
        senderName: 'John Smith',
        senderInitials: 'JS',
        text: 'That sounds perfect! I\'m particularly interested in full-stack development. I\'m available Thursday or Friday afternoon. What time works best for you?',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 15 * 60 * 1000),
        isEmployer: false,
      },
      {
        id: '5',
        senderId: '1',
        senderName: 'John Smith',
        senderInitials: 'JS',
        text: 'Thank you for the opportunity! I look forward to discussing this further.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isEmployer: false,
      },
    ],
  },
  {
    id: '2',
    candidateId: '2',
    candidateName: 'Emily Chen',
    candidateInitials: 'EC',
    candidateRole: 'Data Science Intern',
    candidateUniversity: 'Stanford University',
    lastMessage: 'When would be a good time to discuss the details?',
    lastMessageTime: new Date(Date.now() - 5 * 60 * 60 * 1000 + 15 * 60 * 1000),
    unreadCount: 1,
    messages: [
      {
        id: '6',
        senderId: 'employer',
        senderName: 'Sarah Johnson',
        senderInitials: 'SJ',
        text: 'Hi Emily! I saw your profile and I think you\'d be a great fit for our Data Science Intern position.',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        isEmployer: true,
      },
      {
        id: '7',
        senderId: '2',
        senderName: 'Emily Chen',
        senderInitials: 'EC',
        text: 'When would be a good time to discuss the details?',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000 + 15 * 60 * 1000),
        isEmployer: false,
      },
    ],
  },
  {
    id: '3',
    candidateId: '3',
    candidateName: 'Michael Rodriguez',
    candidateInitials: 'MR',
    candidateRole: 'Product Management Intern',
    candidateUniversity: 'MIT',
    lastMessage: 'Sounds great! See you on Friday.',
    lastMessageTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
    unreadCount: 0,
    messages: [
      {
        id: '8',
        senderId: 'employer',
        senderName: 'Sarah Johnson',
        senderInitials: 'SJ',
        text: 'Hi Michael! Are you still interested in the Product Management Intern role?',
        timestamp: new Date(Date.now() - 25 * 60 * 60 * 1000),
        isEmployer: true,
      },
      {
        id: '9',
        senderId: '3',
        senderName: 'Michael Rodriguez',
        senderInitials: 'MR',
        text: 'Sounds great! See you on Friday.',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        isEmployer: false,
      },
    ],
  },
  {
    id: '4',
    candidateId: '4',
    candidateName: 'Sarah Kim',
    candidateInitials: 'SK',
    candidateRole: 'UX Design Intern',
    candidateUniversity: 'Stanford University',
    lastMessage: 'I\'ve updated my portfolio as requested. Let me know what you think!',
    lastMessageTime: new Date(Date.now() - 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
    unreadCount: 1,
    messages: [
      {
        id: '10',
        senderId: 'employer',
        senderName: 'Sarah Johnson',
        senderInitials: 'SJ',
        text: 'Hi Sarah! Could you please update your portfolio with your latest projects?',
        timestamp: new Date(Date.now() - 25 * 60 * 60 * 1000),
        isEmployer: true,
      },
      {
        id: '11',
        senderId: '4',
        senderName: 'Sarah Kim',
        senderInitials: 'SK',
        text: 'I\'ve updated my portfolio as requested. Let me know what you think!',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        isEmployer: false,
      },
    ],
  },
  {
    id: '5',
    candidateId: '5',
    candidateName: 'David Liu',
    candidateInitials: 'DL',
    candidateRole: 'Software Engineering Intern',
    candidateUniversity: 'UCLA',
    lastMessage: 'Thank you for your time today!',
    lastMessageTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    unreadCount: 0,
    messages: [
      {
        id: '12',
        senderId: 'employer',
        senderName: 'Sarah Johnson',
        senderInitials: 'SJ',
        text: 'Hi David! Thank you for your interest in our Software Engineering Intern position.',
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        isEmployer: true,
      },
      {
        id: '13',
        senderId: '5',
        senderName: 'David Liu',
        senderInitials: 'DL',
        text: 'Thank you for your time today!',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        isEmployer: false,
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

export default function MessagesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const targetConversationId = searchParams.get('conversationId')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [selectedCandidate, setSelectedCandidate] = useState<typeof mockCandidates[0] | null>(null)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const selectedConversationRef = useRef<Conversation | null>(null)

  useEffect(() => {
    selectedConversationRef.current = selectedConversation
  }, [selectedConversation])

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation((prev) =>
      prev?.id === conversation.id
        ? { ...conversation, messages: prev.messages }
        : conversation
    )

    setConversations((prev) =>
      prev.map((item) =>
        item.id === conversation.id ? { ...item, unreadCount: 0 } : item
      )
    )

    const nextUrl = `/employer/messages?conversationId=${encodeURIComponent(conversation.id)}`
    if (typeof window !== 'undefined' && window.location.search !== `?conversationId=${conversation.id}`) {
      router.replace(nextUrl)
    }
  }

  // Check role and load conversations
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const userData = await apiFetch<{ user: { role: string | null } }>('/api/auth/me')
        
        // Only redirect if role doesn't match the current page
        // This prevents issues when multiple tabs are open with different users
        const currentPath = window.location.pathname
        
        if (userData.user.role === 'CANDIDATE') {
          // Only redirect if we're on an employer page
          if (currentPath.startsWith('/employer')) {
            router.push('/intern/messages')
            return
          }
          // If we're already on an intern page, don't redirect (might be wrong token but let it be)
          return
        }
        
        if (!userData.user.role) {
          if (!currentPath.startsWith('/role-selection')) {
            router.push('/role-selection')
          }
          return
        }
        
        // If we're here and role is COMPANY, we're good to proceed

        // Load conversations from API
        const data = await apiFetch<{ conversations: Conversation[] }>('/api/messages/conversations')
        
        // Convert timestamp strings to Date objects
        const currentSelected = selectedConversationRef.current
        const converted = data.conversations.map((conv: any) => {
          const existingConversation = currentSelected?.id === conv.id
            ? currentSelected
            : conversations.find((existing) => existing.id === conv.id)

          return {
            ...conv,
            lastMessageTime: new Date(conv.lastMessageTime),
            messages: existingConversation?.messages || [], // Preserve loaded messages when refreshing the list
          }
        })
        
        setConversations(converted)
        // Set first conversation as selected if we have conversations and none is selected
        // Do this synchronously to prevent flicker
        if (converted.length > 0) {
          const targetConversation = targetConversationId
            ? converted.find((conversation) => conversation.id === targetConversationId)
            : null

          if (targetConversation) {
            setSelectedConversation((prev) =>
              prev?.id === targetConversation.id
                ? { ...targetConversation, messages: prev.messages }
                : targetConversation
            )
          } else if (!selectedConversationRef.current) {
            setSelectedConversation(converted[0])
          }
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
              const currentSelected = selectedConversationRef.current
              const converted = data.conversations.map((conv: any) => {
                const prev = prevConversations.find(c => c.id === conv.id)
                const preservedMessages =
                  currentSelected?.id === conv.id
                    ? currentSelected.messages
                    : prev?.messages || []

                return {
                  ...conv,
                  lastMessageTime: new Date(conv.lastMessageTime),
                  messages: preservedMessages,
                }
              })
              
              // Update selected conversation if it exists
              if (currentSelected) {
                const updated = converted.find(c => c.id === currentSelected.id)
                if (updated) {
                  setSelectedConversation((prev) =>
                    prev?.id === updated.id
                      ? {
                          ...updated,
                          messages: prev.messages,
                        }
                      : prev
                  )
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
  }, [router, targetConversationId])

  useEffect(() => {
    if (!targetConversationId || conversations.length === 0) return

    const targetConversation = conversations.find((conversation) => conversation.id === targetConversationId)
    if (targetConversation && selectedConversation?.id !== targetConversation.id) {
      setSelectedConversation((prev) =>
        prev?.id === targetConversation.id
          ? { ...targetConversation, messages: prev.messages }
          : targetConversation
      )
    }
  }, [conversations, selectedConversation?.id, targetConversationId])

  // Load messages when conversation is selected
  useEffect(() => {
    if (!selectedConversation) return

    const loadMessages = async () => {
      try {
        const data = await apiFetch<{ messages: Message[] }>(
          `/api/messages/conversations/${selectedConversation.id}/messages`
        )
        
        // Convert timestamp strings to Date objects
        const converted = data.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }))

        // Check if we have new messages (compare by length or last message ID)
        const hasNewMessages = 
          !selectedConversation.messages || 
          converted.length !== selectedConversation.messages.length ||
          (converted.length > 0 && selectedConversation.messages.length > 0 &&
           converted[converted.length - 1].id !== selectedConversation.messages[selectedConversation.messages.length - 1].id)

        // Update conversation with messages
        setSelectedConversation((current) => {
          if (!current || current.id !== selectedConversation.id) return current
          return {
            ...current,
            messages: converted,
          }
        })

        // Update conversations list
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === selectedConversation.id
              ? { ...conv, messages: converted }
              : conv
          )
        )

        // Scroll to bottom if new messages arrived
        if (hasNewMessages) {
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
          }, 100)
        }
      } catch (error) {
        console.error('Failed to load messages:', error)
      }
    }

    loadMessages()

    // Poll for new messages every 2 seconds
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadMessages()
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [selectedConversation?.id])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedConversation?.messages])

  const filteredConversations = conversations.filter((conv) =>
    conv.candidateName.toLowerCase().includes(searchQuery.toLowerCase())
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
        senderName: data.message.isEmployer ? 'Company' : 'Candidate',
        senderInitials: data.message.isEmployer ? 'CO' : 'CA',
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
      setSelectedConversation((current) => {
        if (!current || current.id !== selectedConversation.id) return current
        return {
          ...current,
          lastMessage: newMessage.trim(),
          lastMessageTime: new Date(),
          messages: [...current.messages, newMsg],
        }
      })
      setNewMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleViewProfile = async () => {
    if (!selectedConversation) return
    try {
      const data = await apiFetch<{ candidate: any }>(`/api/candidates/${selectedConversation.candidateId}`)
      setSelectedCandidate({
        id: data.candidate.id || selectedConversation.candidateId,
        name: data.candidate.name,
        role: data.candidate.role,
        university: data.candidate.university,
        major: data.candidate.major,
        graduationDate: data.candidate.graduationDate,
        skills: data.candidate.skills || [],
        initials: data.candidate.initials,
        email: data.candidate.email,
        about: data.candidate.about,
      })
    } catch (error) {
      console.error('Failed to load candidate profile:', error)
    }
  }

  const getInitials = (name: string) => {
    if (!name) return 'U'
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.charAt(0).toUpperCase()
  }

  return (
    <div className="min-h-screen bg-gray-50 transition-colors dark:bg-slate-950">
      <EmployerNavbar />
      <div className="layout-container flex h-[calc(100vh-4rem)] w-full">
        {/* Left Sidebar - Conversation List */}
        <div className="flex w-80 flex-col border-r border-gray-200 bg-white transition-colors dark:border-slate-800 dark:bg-slate-950">
          <div className="border-b border-gray-200 p-6 dark:border-slate-800">
            <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Messages</h1>
            <div className="relative">
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pl-10 text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-slate-500"
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
            {filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-slate-400">No conversations found</div>
            ) : (
              filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`cursor-pointer border-b border-gray-100 p-4 transition-colors hover:bg-gray-50 dark:border-slate-800 dark:hover:bg-slate-900 ${
                    selectedConversation?.id === conv.id ? 'bg-blue-50 dark:bg-blue-500/10' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${
                        selectedConversation?.id === conv.id ? 'bg-blue-600' : 'bg-gray-400'
                      }`}
                    >
                      {conv.candidateInitials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-white">{conv.candidateName}</h3>
                        {conv.unreadCount > 0 && (
                          <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
                        )}
                      </div>
                      <p className="mb-1 truncate text-sm text-gray-600 dark:text-slate-300">{conv.lastMessage}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-500">{formatTime(conv.lastMessageTime)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Content - Chat Area */}
        <div className="flex flex-1 flex-col bg-white transition-colors dark:bg-slate-950">
          {loading ? (
            <div className="flex flex-1 items-center justify-center text-gray-500 dark:text-slate-400">
              <div className="text-center">
                <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 dark:border-slate-800 dark:border-t-blue-500"></div>
                <p className="text-lg">Loading messages...</p>
              </div>
            </div>
          ) : selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {selectedConversation.candidateInitials}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedConversation.candidateName}</h2>
                    <p className="text-sm text-gray-600 dark:text-slate-400">
                      {selectedConversation.candidateRole} · {selectedConversation.candidateUniversity}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleViewProfile}
                  className="flex items-center space-x-2 rounded-lg border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-50 dark:border-slate-700 dark:hover:bg-slate-900"
                >
                  <svg className="h-4 w-4 text-gray-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-gray-700 dark:text-slate-300">View Profile</span>
                </button>
              </div>

              {/* Messages */}
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto bg-gray-50 p-6 transition-colors dark:bg-slate-900/40">
                <div className="space-y-4">
                  {selectedConversation.messages.map((msg) => {
                    // For employer page: isEmployer/isCompany means it's from the company (current user) - should be on right
                    const isCurrentUser = msg.isEmployer || msg.isCompany
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
                                : 'bg-white border border-gray-200 text-gray-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100'
                            }`}
                          >
                            <p className="text-sm leading-relaxed">{msg.text}</p>
                            <p
                              className={`text-xs mt-1 ${
                                isCurrentUser ? 'text-blue-100' : 'text-gray-500 dark:text-slate-500'
                              }`}
                            >
                              {formatMessageTime(msg.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Message Input */}
              <div className="border-t border-gray-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
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
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-gray-500 dark:text-slate-400">
              <div className="text-center">
                <svg
                  className="mx-auto mb-4 h-16 w-16 text-gray-400 dark:text-slate-500"
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
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Candidate Profile Modal */}
      {selectedCandidate && (
        <CandidateProfileModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  )
}
