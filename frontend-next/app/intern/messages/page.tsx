'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import InternNavbar from '@/components/InternNavbar'
import { apiFetch } from '@/lib/api'
import Link from 'next/link'

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
  companyEmail?: string // added for UI mockup
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
  messages?: Message[]
}

// ข้อมูลจำลองที่อัปเดตข้อความตามรูปภาพ
const mockConversations: Conversation[] = [
  {
    id: '1',
    companyId: '1',
    companyName: 'Trinity Securities Co., Ltd.',
    companyInitials: 'TS',
    companyLogo: 'TRINITY',
    companyEmail: 'info@trinitythai.com',
    jobTitle: 'Thank you for the opportunity! I look for...',
    lastMessage: 'Thank you for the opportunity! I look for...',
    lastMessageTime: new Date(new Date().setHours(10, 30, 0)),
    unreadCount: 0,
    messages: [
      {
        id: '1',
        senderId: 'company1',
        senderName: 'Trinity Securities Co., Ltd.',
        senderInitials: 'TS',
        text: 'Hi Sarah! Thank you so much for reaching out. I would love to learn more about this opportunity!',
        timestamp: new Date(new Date().setHours(9, 45, 0)),
        isCompany: true,
      },
      {
        id: '2',
        senderId: 'intern',
        senderName: 'John Smith',
        senderInitials: 'JS',
        text: "Hi John! I reviewed your profile and I'm impressed with your technical skills and projects. We have an exciting Software Engineering Intern position that I think would be a great fit for you.",
        timestamp: new Date(new Date().setHours(9, 0, 0)),
        isCompany: false,
      },
      {
        id: '3',
        senderId: 'intern',
        senderName: 'John Smith',
        senderInitials: 'JS',
        text: "Great! The role focuses on full-stack development with our Engineering team. You'd be working on our core platform using React, Node.js, and PostgreSQL. Would you be available for a quick phone screen this week?",
        timestamp: new Date(new Date().setHours(9, 0, 0)),
        isCompany: false,
      },
      {
        id: '4',
        senderId: 'company1',
        senderName: 'Trinity Securities Co., Ltd.',
        senderInitials: 'TS',
        text: "That sounds perfect! I'm particularly interested in full-stack development. I'm available Thursday or Friday afternoon. What time works best for you?",
        timestamp: new Date(new Date().setHours(9, 45, 0)),
        isCompany: true,
      },
    ],
  }
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

// Component โลโก้ Trinity (จำลองเพื่อความสวยงามตามรูป)
const CompanyLogo = () => (
  <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50 flex-shrink-0">
    <div className="w-7 h-7 relative flex items-end justify-center">
      <div className="absolute inset-0 bg-[#1C2D4F]" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
      <div className="absolute inset-[2.5px] bg-[#E31837]" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
      <span className="text-[4px] font-bold text-white z-10 mb-0.5">TRINITY</span>
    </div>
  </div>
);

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
  const selectedConversationRef = useRef<Conversation | null>(null)

  useEffect(() => {
    selectedConversationRef.current = selectedConversation
  }, [selectedConversation])

  // --- BACKEND LOGIC REMAINS UNCHANGED ---
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const userData = await apiFetch<{ user: { role: string | null } }>('/api/auth/me')
        const currentPath = window.location.pathname
        
        if (userData.user.role === 'COMPANY') {
          if (currentPath.startsWith('/intern')) {
            router.push('/employer/messages')
            return
          }
          return
        }
        
        if (!userData.user.role) {
          if (!currentPath.startsWith('/role-selection')) {
            router.push('/role-selection')
          }
          return
        }

        const data = await apiFetch<{ conversations: Conversation[] }>('/api/messages/conversations')
        const converted = data.conversations.map((conv: any) => ({
          ...conv,
          lastMessageTime: new Date(conv.lastMessageTime),
        }))
        
        // ถ้าระบบจริงไม่มีข้อมูล ให้ใช้ Mock data ไปก่อนเพื่อให้เห็น UI
        if (converted.length === 0) {
          setConversations(mockConversations)
          setSelectedConversation(mockConversations[0])
        } else {
          setConversations(converted)
          setSelectedConversation(converted[0])
        }
        setLoading(false)
      } catch (error) {
        console.error('Failed to load conversations:', error)
        // Fallback to Mock
        setConversations(mockConversations)
        setSelectedConversation(mockConversations[0])
        setLoading(false)
      }
    }

    loadConversations()

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        const refreshConversations = async () => {
          try {
            const data = await apiFetch<{ conversations: Conversation[] }>('/api/messages/conversations')
            setConversations((prevConversations) => {
              const converted = data.conversations.map((conv: any) => {
                const prev = prevConversations.find(c => c.id === conv.id)
                return {
                  ...conv,
                  lastMessageTime: new Date(conv.lastMessageTime),
                  messages: prev?.messages,
                }
              })

              const currentSelected = selectedConversationRef.current
              if (currentSelected) {
                const updated = converted.find(c => c.id === currentSelected.id)
                if (updated) {
                  setSelectedConversation((prev) => {
                    if (!prev || prev.id !== updated.id) return prev
                    const changed =
                      prev.lastMessage !== updated.lastMessage ||
                      prev.unreadCount !== updated.unreadCount ||
                      prev.companyName !== updated.companyName ||
                      prev.companyInitials !== updated.companyInitials ||
                      prev.jobTitle !== updated.jobTitle ||
                      prev.lastMessageTime?.getTime?.() !== updated.lastMessageTime?.getTime?.()
                    if (!changed) return prev
                    return { ...prev, ...updated, messages: prev.messages }
                  })
                }
              }
              return converted
            })
          } catch (error) {
            // Silently fail
          }
        }
        refreshConversations()
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [router])

  useEffect(() => {
    if (selectedConversation?.messages === undefined) {
      setIsLoadingMessages(true)
    }
  }, [selectedConversation?.id])

  useEffect(() => {
    if (!selectedConversation) return
    if (selectedConversation.messages && selectedConversation.messages.length > 0) {
      setIsLoadingMessages(false)
      return // ถ้าเป็น Mock data มีข้อความอยู่แล้ว ไม่ต้องโหลดใหม่
    }

    if (abortControllerRef.current) abortControllerRef.current.abort()
    const conversationId = selectedConversation.id
    
    const loadMessages = async () => {
      const abortController = new AbortController()
      abortControllerRef.current = abortController
      const isInitialLoad = selectedConversation.messages === undefined
      if (isInitialLoad) setIsLoadingMessages(true)

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/api/messages/conversations/${conversationId}/messages`,
          {
            signal: abortController.signal,
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          }
        )

        if (abortController.signal.aborted) return
        if (!response.ok) throw new Error(`Request failed: ${response.status}`)

        const data = await response.json() as { messages: Message[] }
        
        setSelectedConversation((current) => {
          if (!current || current.id !== conversationId) return current
          return current
        })

        if (abortController.signal.aborted) return

        const converted = data.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }))

        setSelectedConversation((current) => {
          if (!current || current.id !== conversationId) return current
          const prevMessages = current.messages ?? []
          const hasNewMessages = 
            prevMessages.length === 0 || 
            converted.length !== prevMessages.length ||
            (converted.length > 0 && prevMessages.length > 0 &&
             converted[converted.length - 1].id !== prevMessages[prevMessages.length - 1].id)

          if (hasNewMessages) {
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
          }
          return { ...current, messages: converted }
        })

        setConversations((prev) =>
          prev.map((conv) => conv.id === conversationId ? { ...conv, messages: converted } : conv)
        )
        setIsLoadingMessages(false)
      } catch (error: any) {
        if (error.name === 'AbortError') return
        if (selectedConversation.messages !== undefined) setIsLoadingMessages(false)
      }
    }

    loadMessages()
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') loadMessages()
    }, 2000)

    return () => {
      clearInterval(interval)
      if (abortControllerRef.current) abortControllerRef.current.abort()
    }
  }, [selectedConversation?.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedConversation?.messages])

  const filteredConversations = conversations.filter((conv) =>
    conv.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (conv.jobTitle && conv.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return
    
    // Optimistic UI update (แสดงข้อความทันทีโดยไม่ต้องรอ API)
    const newMsg: Message = {
      id: Date.now().toString(),
      senderId: 'intern',
      senderName: 'Intern',
      senderInitials: 'JS', // Mockup Initials
      text: newMessage.trim(),
      timestamp: new Date(),
      isCompany: false,
    }
    
    const updatedConversations = conversations.map((conv) => {
      if (conv.id === selectedConversation.id) {
        return {
          ...conv,
          lastMessage: newMessage.trim(),
          lastMessageTime: new Date(),
          messages: [...(conv.messages ?? []), newMsg],
        }
      }
      return conv
    })

    setConversations(updatedConversations)
    setSelectedConversation({
      ...selectedConversation,
      lastMessage: newMessage.trim(),
      lastMessageTime: new Date(),
      messages: [...(selectedConversation.messages ?? []), newMsg],
    })
    setNewMessage('')

    // ยิง API จริง
    try {
      await apiFetch<{ message: Message }>(
        `/api/messages/conversations/${selectedConversation.id}/messages`,
        {
          method: 'POST',
          body: JSON.stringify({ text: newMessage.trim() }),
        }
      )
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }
  // --- END BACKEND LOGIC ---

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <InternNavbar />
      
      <div className="layout-container flex flex-1 h-[calc(100vh-80px)] overflow-hidden w-full">
        
        {/* ================= LEFT SIDEBAR ================= */}
        <div className="w-[340px] bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
          <div className="p-6 pb-4">
            <div className="flex items-center gap-3 mb-6 cursor-pointer hover:opacity-80 transition-opacity">
              <Link href="/intern/find-companies">
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              </Link>
              <h1 className="text-[22px] font-extrabold text-black">Messages</h1>
            </div>
            <div className="relative">
              <svg
                className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2"
                fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search conversation"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center text-gray-500 text-sm">Loading conversations...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">
                {searchQuery ? 'No conversations found' : 'No messages yet.'}
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isActive = selectedConversation?.id === conv.id;
                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setSelectedConversation(conv)
                      if (conv.unreadCount > 0) {
                        const updated = conversations.map((c) =>
                          c.id === conv.id ? { ...c, unreadCount: 0 } : c
                        )
                        setConversations(updated)
                      }
                    }}
                    className={`relative p-4 pl-5 border-b border-gray-100 cursor-pointer transition-colors ${
                      isActive ? 'bg-[#F8FAFC]' : 'hover:bg-gray-50 bg-white'
                    }`}
                  >
                    {/* Active Blue Indicator */}
                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#3B82F6]"></div>}

                    <div className="flex items-start gap-4">
                      <CompanyLogo />
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-center justify-between mb-0.5">
                          <h3 className="text-[14px] font-bold text-gray-900 truncate pr-2">
                            {conv.companyName}
                          </h3>
                          <span className="text-[11px] text-gray-500 font-medium whitespace-nowrap">
                            {formatTime(conv.lastMessageTime)}
                          </span>
                        </div>
                        <p className="text-[13px] text-gray-500 truncate mb-1">
                          {conv.jobTitle}
                        </p>
                        <div className="flex justify-between items-center">
                          <p className="text-[13px] text-gray-400 truncate pr-4">
                            {conv.lastMessage}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* ================= MAIN CHAT AREA ================= */}
        <div className="flex-1 flex flex-col bg-white">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="h-[90px] px-8 border-b border-gray-200 bg-gray-50/50 flex items-center flex-shrink-0">
                <div className="flex items-center gap-4">
                  <CompanyLogo />
                  <div>
                    <h2 className="text-[16px] font-extrabold text-gray-900 leading-snug">
                      {selectedConversation.companyName}
                    </h2>
                    <p className="text-[13px] text-gray-500 mt-0.5">
                      {selectedConversation.companyEmail || 'info@trinitythai.com'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages Content */}
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-8 bg-[#F8FAFC]">
                <div className="space-y-6 max-w-4xl mx-auto">
                  {Array.isArray(selectedConversation.messages) && selectedConversation.messages.length > 0 ? (
                    <>
                      {selectedConversation.messages.map((msg) => {
                        const isCompany = msg.isCompany;
                        return (
                          <div
                            key={msg.id}
                            className={`flex items-start gap-4 ${!isCompany ? 'flex-row-reverse' : ''}`}
                          >
                            {/* Avatar */}
                            {isCompany ? (
                              <CompanyLogo />
                            ) : (
                              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 bg-[#5C89F7] shadow-sm">
                                {msg.senderInitials || 'JS'}
                              </div>
                            )}

                            {/* Message Bubble */}
                            <div className={`flex flex-col ${!isCompany ? 'items-end' : 'items-start'} max-w-[70%]`}>
                              <div
                                className={`px-5 py-3.5 text-[15px] leading-relaxed shadow-sm ${
                                  isCompany
                                    ? 'bg-white border border-gray-100 text-gray-700 rounded-2xl rounded-tl-sm'
                                    : 'bg-[#5C89F7] text-white rounded-2xl rounded-tr-sm'
                                }`}
                              >
                                {msg.text}
                              </div>
                              <span className="text-[11px] text-gray-400 mt-2 font-medium">
                                {formatMessageTime(msg.timestamp)}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                      {isLoadingMessages && (
                        <div className="flex justify-center py-4">
                          <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </>
                  ) : !isLoadingMessages ? (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    <div className="flex justify-center py-10">
                      <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Message Input Container */}
              <div className="p-6 bg-white border-t border-gray-200 flex-shrink-0">
                <div className="max-w-4xl mx-auto relative flex items-center">
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
                    placeholder="Write your message"
                    className="w-full px-5 py-3.5 pr-14 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-[15px] shadow-sm text-gray-700"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="absolute right-3 p-2 text-gray-400 hover:text-blue-500 transition-colors disabled:opacity-50"
                  >
                    <svg className="w-5 h-5 transform rotate-45" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-[#F8FAFC]">
              <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-[15px] font-medium">Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}