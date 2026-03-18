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
  companyEmail?: string
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
  messages?: Message[]
}

const mockConversations: Conversation[] = [
  {
    id: '1',
    companyId: '1',
    companyName: 'Trinity Securities Co., Ltd.',
    companyInitials: 'TS',
    companyLogo: 'TRINITY',
    companyEmail: 'info@trinitythai.com',
    jobTitle: 'Software Engineering Intern',
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
        text: "Hi! I reviewed your profile and I'm impressed with your technical skills. We have an exciting position for you.",
        timestamp: new Date(new Date().setHours(9, 0, 0)),
        isCompany: false,
      },
    ],
  }
]

function formatTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const CompanyLogo = () => (
  <div className="w-10 h-10 rounded-full border border-gray-200 dark:border-slate-700 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-slate-800 flex-shrink-0">
    <div className="w-7 h-7 relative flex items-end justify-center">
      <div className="absolute inset-0 bg-[#1C2D4F]" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
      <div className="absolute inset-[2.5px] bg-[#E31837]" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
      <span className="text-[4px] font-bold text-white z-10 mb-0.5 uppercase">TRINITY</span>
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
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // ซิมูเลทการโหลดข้อมูล
    const init = async () => {
      setConversations(mockConversations)
      setSelectedConversation(mockConversations[0])
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedConversation?.messages])

  const filteredConversations = conversations.filter((conv) =>
    conv.companyName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return
    const newMsg: Message = {
      id: Date.now().toString(),
      senderId: 'intern',
      senderName: 'User',
      senderInitials: 'JS',
      text: newMessage.trim(),
      timestamp: new Date(),
      isCompany: false,
    }
    setSelectedConversation({
      ...selectedConversation,
      messages: [...(selectedConversation.messages || []), newMsg]
    })
    setNewMessage('')
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col transition-colors duration-300">
      <InternNavbar />
      
      <div className="flex flex-1 h-[calc(100vh-80px)] overflow-hidden w-full">
        
        {/* --- Sidebar --- */}
        <div className="w-[340px] bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col flex-shrink-0">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Link href="/intern/find-companies" className="dark:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-xl font-black text-slate-900 dark:text-white">Messages</h1>
            </div>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Search conversation"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-transparent dark:border-slate-700 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
              <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conv) => {
              const isActive = selectedConversation?.id === conv.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`relative p-4 mx-2 rounded-xl cursor-pointer transition-all mb-1 ${
                    isActive ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <CompanyLogo />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{conv.companyName}</h3>
                        <span className="text-[10px] font-medium text-gray-500 dark:text-slate-400">{formatTime(conv.lastMessageTime)}</span>
                      </div>
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium truncate mb-1">{conv.jobTitle}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{conv.lastMessage}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* --- Main Chat --- */}
        <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 relative">
          {selectedConversation ? (
            <>
              {/* Header */}
              <div className="h-20 px-8 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                  <CompanyLogo />
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">{selectedConversation.companyName}</h2>
                    <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Online
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 md:p-10">
                <div className="max-w-3xl mx-auto space-y-6">
                  {selectedConversation.messages?.map((msg) => (
                    <div key={msg.id} className={`flex items-end gap-3 ${!msg.isCompany ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex flex-col ${!msg.isCompany ? 'items-end' : 'items-start'} max-w-[80%]`}>
                        <div className={`px-4 py-3 rounded-2xl text-[14px] shadow-sm ${
                          msg.isCompany 
                          ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-gray-100 dark:border-slate-700 rounded-bl-none' 
                          : 'bg-blue-600 text-white rounded-br-none'
                        }`}>
                          {msg.text}
                        </div>
                        <span className="text-[10px] text-gray-400 dark:text-slate-500 mt-1.5 font-medium px-1">
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input */}
              <div className="p-6 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800">
                <div className="max-w-3xl mx-auto flex items-center gap-3">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type a message..."
                      className="w-full pl-5 pr-12 py-3.5 bg-gray-50 dark:bg-slate-800 dark:text-white border border-transparent dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-inner"
                    />
                    <button 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-slate-700 text-white rounded-xl transition-colors shadow-lg shadow-blue-500/30"
                    >
                      <svg className="w-5 h-5 transform rotate-45 -translate-y-0.5 -translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <p>Select a conversation to start</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}