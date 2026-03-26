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
  isEmployer?: boolean
}

interface Conversation {
  id: string
  companyId: string
  companyName: string
  companyInitials: string
  companyLogo?: string
  jobTitle?: string
  companyEmail?: string
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
  messages: Message[]
}

interface MyProfile {
  fullName: string | null
  profileImage: string | null
}

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

export default function InternMessagesPage() {
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [myProfile, setMyProfile] = useState<MyProfile | null>(null)
  
  // Responsive State
  const [showChatMobile, setShowChatMobile] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const selectedConversationRef = useRef<Conversation | null>(null)

  useEffect(() => {
    selectedConversationRef.current = selectedConversation
  }, [selectedConversation])

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const userData = await apiFetch<{ user: { role: string | null } }>('/api/auth/me')
        if (userData.user.role === 'COMPANY') {
          router.push('/employer/messages')
          return
        }
        if (!userData.user.role) {
          router.push('/role-selection')
          return
        }

        // ดึงโปรไฟล์ของเราครั้งเดียวตอนโหลด
        if (!myProfile) {
          try {
            const profileData = await apiFetch<{ profile: MyProfile }>('/api/candidates/profile')
            setMyProfile(profileData.profile)
          } catch {
            // ถ้าดึงไม่ได้ก็ใช้ค่า default (ME)
          }
        }

        const data = await apiFetch<{ conversations: Conversation[] }>('/api/messages/conversations')
        const currentSelected = selectedConversationRef.current
        const converted = data.conversations.map((conv: any) => ({
          ...conv,
          lastMessageTime: new Date(conv.lastMessageTime),
          messages: [] as Message[],
        })) as Conversation[]

        setConversations((prev) =>
          converted.map((conv) => {
            const existingConversation =
              currentSelected?.id === conv.id
                ? currentSelected
                : prev.find((existing) => existing.id === conv.id)
            return { ...conv, messages: existingConversation?.messages || [] }
          })
        )
        
        // บน Desktop เท่านั้นที่ให้เลือกแชทแรกอัตโนมัติ
        if (window.innerWidth >= 1024 && converted.length > 0 && !selectedConversationRef.current) {
          setSelectedConversation(converted[0])
        }
        setLoading(false)
      } catch (error) {
        console.error('Failed to load conversations:', error)
        setLoading(false)
      }
    }

    loadConversations()

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadConversations()
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [router])

  useEffect(() => {
    if (!selectedConversation) return

    const loadMessages = async () => {
      try {
        const data = await apiFetch<{ messages: Message[] }>(
          `/api/messages/conversations/${selectedConversation.id}/messages`
        )
        const converted = data.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }))

        setSelectedConversation((current) => {
          if (!current || current.id !== selectedConversation.id) return current
          return { ...current, messages: converted }
        })

        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === selectedConversation.id ? { ...conv, messages: converted, unreadCount: 0 } : conv
          )
        )
      } catch (error) {
        console.error('Failed to load messages:', error)
      }
    }

    loadMessages()
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadMessages()
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [selectedConversation?.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedConversation?.messages])

  const filteredConversations = conversations.filter((conv) =>
    conv.companyName.toLowerCase().includes(searchQuery.toLowerCase())
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

      const sent: Message = {
        ...data.message,
        timestamp: new Date((data.message as any).timestamp),
        isCompany: false,
      }

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedConversation.id
            ? {
                ...conv,
                lastMessage: sent.text,
                lastMessageTime: sent.timestamp,
                messages: [...conv.messages, sent],
              }
            : conv
        )
      )

      setSelectedConversation((current) => {
        if (!current || current.id !== selectedConversation.id) return current
        return {
          ...current,
          lastMessage: sent.text,
          lastMessageTime: sent.timestamp,
          messages: [...current.messages, sent],
        }
      })
      setNewMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const getCompanyInitials = (name?: string) => {
    if (!name) return 'CO'
    const parts = name.split(' ')
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return name.substring(0, 2).toUpperCase()
  }

  const getMyInitials = () => {
    if (!myProfile?.fullName) return 'ME'
    const parts = myProfile.fullName.trim().split(' ').filter(Boolean)
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    return myProfile.fullName.substring(0, 2).toUpperCase()
  }

  const selectConversation = (conv: Conversation) => {
    setSelectedConversation(conv)
    setShowChatMobile(true)
  }

  return (
    <div className="min-h-screen bg-[#E6EBF4] dark:bg-gray-950 flex flex-col transition-colors duration-300 overflow-hidden">
      <InternNavbar />
      
      <div className="flex-1 flex w-full max-w-7xl mx-auto lg:py-6 lg:px-4 h-[calc(100vh-4rem)] overflow-hidden">
        
        {/* --- Left Sidebar - Conversation List --- */}
        <div className={`
          ${showChatMobile ? 'hidden lg:flex' : 'flex'} 
          w-full lg:w-80 flex-col lg:rounded-l-2xl border-r border-gray-200 bg-white transition-colors dark:border-slate-800 dark:bg-slate-900
        `}>
          <div className="border-b border-gray-200 p-4 lg:p-6 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-4">
              <Link href="/intern/find-companies" className="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Messages</h1>
            </div>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pl-10 text-sm text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-slate-400 text-sm">No conversations found</div>
            ) : (
              filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => selectConversation(conv)}
                  className={`cursor-pointer border-b border-gray-100 p-4 transition-colors hover:bg-gray-50 dark:border-slate-800 dark:hover:bg-slate-800 ${
                    selectedConversation?.id === conv.id ? 'bg-blue-50 dark:bg-slate-800' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 overflow-hidden ${
                        selectedConversation?.id === conv.id ? 'bg-blue-600' : 'bg-gray-400'
                      }`}
                    >
                      {conv.companyLogo ? (
                        <img src={conv.companyLogo} alt={conv.companyName} className="w-full h-full object-cover" />
                      ) : (
                        getCompanyInitials(conv.companyName)
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-white">{conv.companyName}</h3>
                        {conv.unreadCount > 0 && (
                          <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
                        )}
                      </div>
                      <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium truncate mb-1">{conv.jobTitle}</p>
                      <p className="mb-1 truncate text-xs text-gray-600 dark:text-slate-300">{conv.lastMessage}</p>
                      <p className="text-[10px] text-gray-500 dark:text-slate-500">{formatTime(conv.lastMessageTime)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* --- Main Chat Area --- */}
        <div className={`
          ${!showChatMobile ? 'hidden lg:flex' : 'flex'} 
          flex-1 flex-col lg:rounded-r-2xl bg-white transition-colors dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800
        `}>
          {loading ? (
            <div className="flex flex-1 items-center justify-center text-gray-500 dark:text-slate-400">
              <div className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 dark:border-slate-800"></div>
                <p className="text-sm">Loading messages...</p>
              </div>
            </div>
          ) : selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between border-b border-gray-200 p-3 lg:p-4 dark:border-slate-800 shadow-sm">
                <div className="flex items-center space-x-3">
                  {/* Back button for mobile */}
                  <button onClick={() => setShowChatMobile(false)} className="lg:hidden p-1 text-gray-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>

                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden bg-blue-600 flex-shrink-0">
                    {selectedConversation.companyLogo ? (
                      <img src={selectedConversation.companyLogo} alt={selectedConversation.companyName} className="w-full h-full object-cover" />
                    ) : (
                      getCompanyInitials(selectedConversation.companyName)
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm lg:text-base font-bold text-gray-900 dark:text-white truncate">{selectedConversation.companyName}</h2>
                    <p className="text-[10px] text-green-500 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Online
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-6 transition-colors dark:bg-gray-950">
                <div className="space-y-4">
                  {selectedConversation.messages?.map((msg) => {
                    const isCurrentUser = !msg.isCompany 
                    return (
                      <div key={msg.id} className={`flex items-start space-x-2 ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        {/* Avatar */}
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0 overflow-hidden ${
                            isCurrentUser ? 'bg-blue-600' : 'bg-gray-400'
                          }`}
                        >
                          {isCurrentUser ? (
                            myProfile?.profileImage ? (
                              <img src={myProfile.profileImage} alt="Me" className="w-full h-full object-cover" />
                            ) : (
                              getMyInitials()
                            )
                          ) : (
                            selectedConversation.companyLogo ? (
                              <img src={selectedConversation.companyLogo} alt="Company" className="w-full h-full object-cover" />
                            ) : (
                              getCompanyInitials(selectedConversation.companyName)
                            )
                          )}
                        </div>

                        <div className={`flex-1 ${isCurrentUser ? 'flex justify-end' : ''}`}>
                          <div className={`inline-block max-w-[85%] lg:max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${
                              isCurrentUser
                                ? 'bg-blue-600 text-white rounded-tr-none'
                                : 'bg-white border border-gray-100 text-gray-900 dark:border-slate-800 dark:bg-slate-800 dark:text-white rounded-tl-none'
                            }`}
                          >
                            <p className="text-sm leading-relaxed break-words">{msg.text}</p>
                            <p className={`text-[9px] mt-1 text-right ${isCurrentUser ? 'text-blue-100' : 'text-gray-400'}`}>
                              {formatTime(msg.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Message Input Area */}
              <div className="border-t border-gray-200 bg-white p-3 lg:p-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center space-x-2 lg:space-x-4">
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
                    className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="p-2 lg:px-6 lg:py-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <span className="hidden lg:inline">Send</span>
                    <svg className="w-5 h-5 lg:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-gray-500 dark:text-slate-400 px-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-10 w-10 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-base lg:text-lg font-medium">Select a conversation</p>
                <p className="text-xs lg:text-sm text-gray-400 mt-1">Choose a company to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}