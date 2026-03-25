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

const CompanyLogo = ({ logo, name }: { logo?: string; name?: string }) => (
  <div className="w-10 h-10 rounded-full border border-gray-200 dark:border-slate-700 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-slate-800 flex-shrink-0">
    {logo ? (
      <img src={logo} alt={name} className="w-10 h-10 rounded-full object-cover" />
    ) : (
      <span className="text-sm font-bold text-white bg-[#1C2D4F] w-full h-full flex items-center justify-center">
        {name?.substring(0, 2).toUpperCase() || 'CO'}
      </span>
    )}
  </div>
)

export default function InternMessagesPage() {
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
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
        if (converted.length > 0 && !selectedConversationRef.current) {
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

  return (
    <div className="min-h-screen bg-[#E6EBF4] dark:bg-gray-950 flex flex-col transition-colors duration-300">
      <InternNavbar />
      
      <div className="layout-container flex h-[calc(100vh-4rem)] w-full py-6">
        
        {/* --- Left Sidebar - Conversation List --- */}
        <div className="flex w-80 flex-col rounded-l-2xl border border-r-0 border-gray-200 bg-white transition-colors dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-gray-200 p-6 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-4">
              <Link href="/intern/find-companies" className="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Messages</h1>
            </div>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pl-10 text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-gray-500"
              />
              <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
                  onClick={() => setSelectedConversation(conv)}
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
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium truncate mb-1">{conv.jobTitle}</p>
                      <p className="mb-1 truncate text-sm text-gray-600 dark:text-slate-300">{conv.lastMessage}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-500">{formatTime(conv.lastMessageTime)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* --- Main Chat Area --- */}
        <div className="flex flex-1 flex-col rounded-r-2xl border border-gray-200 bg-white transition-colors dark:border-slate-800 dark:bg-slate-900">
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
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden bg-blue-600">
                    {selectedConversation.companyLogo ? (
                      <img src={selectedConversation.companyLogo} alt={selectedConversation.companyName} className="w-full h-full object-cover" />
                    ) : (
                      getCompanyInitials(selectedConversation.companyName)
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">{selectedConversation.companyName}</h2>
                    <p className="text-xs text-green-500 font-medium flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Online
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto bg-gray-50 p-6 transition-colors dark:bg-gray-950">
                <div className="space-y-4">
                  {selectedConversation.messages?.map((msg) => {
                    const isCurrentUser = !msg.isCompany // ฝั่ง Intern (User) เป็นคนส่ง
                    return (
                      <div key={msg.id} className={`flex items-start space-x-3 ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        
                        {/* รูปหรือตัวย่อของคนส่งข้อความ */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 overflow-hidden ${
                            isCurrentUser ? 'bg-blue-600' : 'bg-gray-400'
                          }`}
                        >
                          {!isCurrentUser && selectedConversation.companyLogo ? (
                            <img src={selectedConversation.companyLogo} alt="Company" className="w-full h-full object-cover" />
                          ) : (
                            isCurrentUser ? 'ME' : getCompanyInitials(selectedConversation.companyName)
                          )}
                        </div>

                        {/* กล่องข้อความ */}
                        <div className={`flex-1 ${isCurrentUser ? 'flex justify-end' : ''}`}>
                          <div className={`inline-block max-w-[70%] rounded-lg px-4 py-2 ${
                              isCurrentUser
                                ? 'bg-blue-600 text-white'
                                : 'bg-white border border-gray-200 text-gray-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
                            }`}
                          >
                            <p className="text-sm leading-relaxed">{msg.text}</p>
                            <p className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-100' : 'text-gray-500 dark:text-slate-500'}`}>
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
              <div className="border-t border-gray-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
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
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-gray-500"
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
                <svg className="mx-auto mb-4 h-16 w-16 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-lg">Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}