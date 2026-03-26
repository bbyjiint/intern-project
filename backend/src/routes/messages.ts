import { Router } from 'express'
import { requireAuth, requireRole, type AuthedRequest } from '../middleware/auth'
import prisma from '../utils/prisma'

const messagesRouter = Router()

function initialsFromName(name: string) {
  return name
    .split(' ')
    .map((n: string) => n[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Get all conversations (for both company and candidate)
messagesRouter.get('/conversations', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const userId = req.user!.id

    // Get user role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })

    if (!user || !user.role) {
      return res.status(403).json({ error: 'User role not found' })
    }

    if (user.role === 'COMPANY') {
      // Get company profile
      const companyProfile = await prisma.companyProfile.findUnique({
        where: { userId },
      })

      if (!companyProfile) {
        return res.status(404).json({ error: 'Company profile not found' })
      }

      // Get all conversations for this company
      const conversations = await prisma.conversation.findMany({
        where: { companyId: companyProfile.id },
        include: {
          Candidate: {
            include: {
              User: true,
              CandidateUniversity: {
                orderBy: [{ isCurrent: 'desc' }, { updatedAt: 'desc' }],
                take: 1,
                include: { University: { select: { name: true } } },
              },
            },
          },
          Messages: {
            orderBy: { createdAt: 'desc' },
            take: 1, // Get only the last message
          },
        },
        orderBy: { updatedAt: 'desc' },
      })

      // Format conversations with unread count
      const formattedConversations = (await Promise.all(
        conversations.map(async (conv) => {
            const unreadCount = await prisma.message.count({
              where: {
                conversationId: conv.id,
                senderRole: 'CANDIDATE',
                read: false,
              },
            })

            const lastMessage = conv.Messages[0] || null

            return {
              id: conv.id,
              candidateId: conv.candidateId,
              candidateName: conv.Candidate.fullName || 'Unknown',
              candidateInitials: conv.Candidate.fullName ? initialsFromName(conv.Candidate.fullName) : 'U',
              candidateRole: conv.Candidate.desiredPosition || 'Intern',
              candidateUniversity: conv.Candidate.CandidateUniversity[0]?.University?.name || 'Unknown University',
              candidateProfileImage: conv.Candidate.profileImage ?? null,
              lastMessage: lastMessage?.text || '',
              lastMessageTime: lastMessage?.createdAt || conv.createdAt,
              unreadCount,
            }
          })
      ))

      res.json({ conversations: formattedConversations })
    } else if (user.role === 'CANDIDATE') {
      // Get candidate profile
      const candidateProfile = await prisma.candidateProfile.findUnique({
        where: { userId },
      })

      if (!candidateProfile) {
        return res.status(404).json({ error: 'Candidate profile not found' })
      }

      // Get all conversations for this candidate
      const conversations = await prisma.conversation.findMany({
        where: { candidateId: candidateProfile.id },
        include: {
          Company: {
            include: {
              User: true,
            },
          },
          Messages: {
            orderBy: { createdAt: 'desc' },
            take: 1, // Get only the last message
          },
        },
        orderBy: { updatedAt: 'desc' },
      })

      // Format conversations with unread count
      const formattedConversations = (await Promise.all(
        conversations.map(async (conv) => {
          const unreadCount = await prisma.message.count({
            where: {
              conversationId: conv.id,
              senderRole: 'COMPANY',
              read: false,
            },
          })

          const lastMessage = conv.Messages[0] || null

          return {
            id: conv.id,
            companyId: conv.companyId,
            companyName: conv.Company.companyName,
            companyInitials: initialsFromName(conv.Company.companyName),
            companyLogo: conv.Company.logoURL ?? null,
            lastMessage: lastMessage?.text || '',
            lastMessageTime: lastMessage?.createdAt || conv.createdAt,
            unreadCount,
          }
        })
      ))

      res.json({ conversations: formattedConversations })
    } else {
      return res.status(403).json({ error: 'Invalid user role' })
    }
  } catch (error) {
    console.error('Error fetching conversations:', error)
    res.status(500).json({ error: 'Failed to fetch conversations' })
  }
})

// Start a new conversation (company only)
messagesRouter.post('/conversations', requireAuth, requireRole('COMPANY'), async (req, res) => {
  try {
    if (!prisma) {
      console.error('Prisma client is not initialized')
      return res.status(500).json({ error: 'Database connection error' })
    }
    if (
      !prisma.companyProfile?.findUnique ||
      !prisma.candidateProfile?.findUnique ||
      !prisma.conversation?.findUnique
    ) {
      console.error('Prisma client is missing expected models. Run prisma generate.')
      return res.status(500).json({
        error: 'Server misconfiguration. Prisma client is out of date. Run prisma generate.',
      })
    }

    const userId = (req as AuthedRequest).user!.id
    const { candidateId, initialMessage } = req.body

    if (!candidateId) {
      return res.status(400).json({ error: 'candidateId is required' })
    }

    // Get company profile
    const companyProfile = await prisma.companyProfile.findUnique({
      where: { userId },
    })

    if (!companyProfile) {
      return res.status(404).json({ error: 'Company profile not found' })
    }

    // Check if candidate exists
    const candidateProfile = await prisma.candidateProfile.findUnique({
      where: { id: candidateId },
    })

    if (!candidateProfile) {
      return res.status(404).json({ error: 'Candidate not found' })
    }

    // Check if conversation already exists
    const existingConversation = await prisma.conversation.findUnique({
      where: {
        companyId_candidateId: {
          companyId: companyProfile.id,
          candidateId: candidateId,
        },
      },
      include: {
        Candidate: {
          include: {
            CandidateUniversity: {
              orderBy: [{ isCurrent: 'desc' }, { updatedAt: 'desc' }],
              take: 1,
              include: { University: { select: { name: true } } },
            },
          },
        },
        Messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    if (existingConversation) {
      // Return existing conversation (idempotent)
      const lastMessage = existingConversation.Messages[0] || null
      const unreadCount = await prisma.message.count({
        where: {
          conversationId: existingConversation.id,
          senderRole: 'CANDIDATE',
          read: false,
        },
      })
      
      return res.status(200).json({
        conversation: {
          id: existingConversation.id,
          candidateId: existingConversation.candidateId,
          candidateName: existingConversation.Candidate.fullName || 'Unknown',
          candidateInitials: existingConversation.Candidate.fullName
            ? initialsFromName(existingConversation.Candidate.fullName)
            : 'U',
          candidateRole: existingConversation.Candidate.desiredPosition || 'Intern',
          candidateUniversity: existingConversation.Candidate.CandidateUniversity[0]?.University?.name || 'Unknown University',
          lastMessage: lastMessage?.text || '',
          lastMessageTime: lastMessage?.createdAt || existingConversation.createdAt,
          unreadCount,
        },
      })
    }

    // Create conversation (with optional initial message)
    const conversationData: any = {
      companyId: companyProfile.id,
      candidateId: candidateId,
    }

    // If initial message is provided, create it along with the conversation
    if (initialMessage && initialMessage.trim()) {
      conversationData.Messages = {
        create: {
          senderId: companyProfile.id,
          senderRole: 'COMPANY',
          text: initialMessage.trim(),
        },
      }
    }

    const conversation = await prisma.conversation.create({
      data: conversationData,
      include: {
        Candidate: {
          include: {
            CandidateUniversity: {
              orderBy: [{ isCurrent: 'desc' }, { updatedAt: 'desc' }],
              take: 1,
              include: { University: { select: { name: true } } },
            },
          },
        },
        Messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    const lastMessage = conversation.Messages[0] || null

    res.status(201).json({
      conversation: {
        id: conversation.id,
        candidateId: conversation.candidateId,
        candidateName: conversation.Candidate.fullName || 'Unknown',
        candidateInitials: conversation.Candidate.fullName
          ? initialsFromName(conversation.Candidate.fullName)
          : 'U',
        candidateRole: conversation.Candidate.desiredPosition || 'Intern',
        candidateUniversity: conversation.Candidate.CandidateUniversity[0]?.University?.name || 'Unknown University',
        lastMessage: lastMessage?.text || '',
        lastMessageTime: lastMessage?.createdAt || conversation.createdAt,
        unreadCount: 0,
      },
    })
  } catch (error: any) {
    console.error('Error creating conversation:', error)
    // Provide more detailed error information
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Conversation already exists' })
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Record not found' })
    }
    if (error.code?.startsWith('P')) {
      return res.status(500).json({ 
        error: 'Database error', 
        details: error.message,
        code: error.code 
      })
    }
    res.status(500).json({ 
      error: 'Failed to create conversation',
      details: error.message || 'Unknown error',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    })
  }
})

// Get total unread message count
messagesRouter.get('/unread-count', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const userId = req.user!.id

    // Get user role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })

    if (!user || !user.role) {
      return res.status(403).json({ error: 'User role not found' })
    }

    let totalUnread = 0

    if (user.role === 'COMPANY') {
      // Get company profile
      const companyProfile = await prisma.companyProfile.findUnique({
        where: { userId },
      })

      if (!companyProfile) {
        return res.json({ unreadCount: 0 })
      }

      // Get all conversations for this company
      const conversations = await prisma.conversation.findMany({
        where: { companyId: companyProfile.id },
        select: { id: true },
      })

      // Count unread messages from candidates
      for (const conv of conversations) {
        const unread = await prisma.message.count({
          where: {
            conversationId: conv.id,
            senderRole: 'CANDIDATE',
            read: false,
          },
        })
        totalUnread += unread
      }
    } else if (user.role === 'CANDIDATE') {
      // Get candidate profile
      const candidateProfile = await prisma.candidateProfile.findUnique({
        where: { userId },
      })

      if (!candidateProfile) {
        return res.json({ unreadCount: 0 })
      }

      // Get all conversations for this candidate
      const conversations = await prisma.conversation.findMany({
        where: { candidateId: candidateProfile.id },
        select: { id: true },
      })

      // Count unread messages from companies
      for (const conv of conversations) {
        const unread = await prisma.message.count({
          where: {
            conversationId: conv.id,
            senderRole: 'COMPANY',
            read: false,
          },
        })
        totalUnread += unread
      }
    }

    res.json({ unreadCount: totalUnread })
  } catch (error) {
    console.error('Error fetching unread count:', error)
    res.status(500).json({ error: 'Failed to fetch unread count' })
  }
})

// Get messages for a conversation
messagesRouter.get('/conversations/:conversationId/messages', requireAuth, async (req, res) => {
  try {
    const userId = (req as AuthedRequest).user!.id
    const conversationId = typeof (req.params as any).conversationId === 'string' ? (req.params as any).conversationId : (req.params as any).conversationId?.[0]
    if (!conversationId) return res.status(400).json({ error: 'conversationId is required' })

    // Get user role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })

    if (!user || !user.role) {
      return res.status(403).json({ error: 'User role not found' })
    }

    // Get conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        Company: true,
        Candidate: true,
      },
    })

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' })
    }

    // Verify user has access to this conversation
    if (user.role === 'COMPANY') {
      const companyProfile = await prisma.companyProfile.findUnique({
        where: { userId },
      })
      if (conversation.companyId !== companyProfile?.id) {
        return res.status(403).json({ error: 'Access denied' })
      }
    } else if (user.role === 'CANDIDATE') {
      const candidateProfile = await prisma.candidateProfile.findUnique({
        where: { userId },
      })
      if (conversation.candidateId !== candidateProfile?.id) {
        return res.status(403).json({ error: 'Access denied' })
      }
    }

    // Get messages
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    })

    // Mark messages as read if they're from the other party
    const otherRole = user.role === 'COMPANY' ? 'CANDIDATE' : 'COMPANY'
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderRole: otherRole,
        read: false,
      },
      data: { read: true },
    })

    // Format messages
    const formattedMessages = messages.map((msg) => {
      const isCompany = msg.senderRole === 'COMPANY'
      const senderName = isCompany
        ? conversation.Company.companyName
        : conversation.Candidate.fullName || 'Unknown'
      const senderInitials = isCompany
        ? initialsFromName(conversation.Company.companyName)
        : conversation.Candidate.fullName
          ? initialsFromName(conversation.Candidate.fullName)
          : 'U'

      return {
        id: msg.id,
        senderId: msg.senderId,
        senderName,
        senderInitials,
        senderProfileImage: isCompany ? null : conversation.Candidate.profileImage ?? null,
        text: msg.text,
        timestamp: msg.createdAt,
        isCompany,
        isEmployer: isCompany, // For compatibility with frontend
        read: msg.read,
      }
    })

    res.json({ messages: formattedMessages })
  } catch (error) {
    console.error('Error fetching messages:', error)
    res.status(500).json({ error: 'Failed to fetch messages' })
  }
})

// Send a message
messagesRouter.post('/conversations/:conversationId/messages', requireAuth, async (req, res) => {
  try {
    const userId = (req as AuthedRequest).user!.id
    const conversationId = typeof (req.params as any).conversationId === 'string' ? (req.params as any).conversationId : (req.params as any).conversationId?.[0]
    if (!conversationId) return res.status(400).json({ error: 'conversationId is required' })
    const { text } = req.body

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Message text is required' })
    }

    // Get user role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })

    if (!user || !user.role) {
      return res.status(403).json({ error: 'User role not found' })
    }

    // Get conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    })

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' })
    }

    // Verify user has access to this conversation
    let senderId: string
    if (user.role === 'COMPANY') {
      const companyProfile = await prisma.companyProfile.findUnique({
        where: { userId },
      })
      if (conversation.companyId !== companyProfile?.id) {
        return res.status(403).json({ error: 'Access denied' })
      }
      senderId = companyProfile.id
    } else if (user.role === 'CANDIDATE') {
      const candidateProfile = await prisma.candidateProfile.findUnique({
        where: { userId },
      })
      if (conversation.candidateId !== candidateProfile?.id) {
        return res.status(403).json({ error: 'Access denied' })
      }
      senderId = candidateProfile.id
    } else {
      return res.status(403).json({ error: 'Invalid user role' })
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        senderRole: user.role,
        text: text.trim(),
      },
    })

    // Update conversation updatedAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    })

    res.status(201).json({
      message: {
        id: message.id,
        senderId: message.senderId,
        text: message.text,
        timestamp: message.createdAt,
        isCompany: user.role === 'COMPANY',
        isEmployer: user.role === 'COMPANY',
        read: message.read,
      },
    })
  } catch (error) {
    console.error('Error sending message:', error)
    res.status(500).json({ error: 'Failed to send message' })
  }
})

export default messagesRouter
