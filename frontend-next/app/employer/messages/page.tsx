"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import EmployerNavbar from "@/components/EmployerNavbar";
import CandidateProfileModal from "@/components/CandidateProfileModal";
import { apiFetch } from "@/lib/api";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderInitials: string;
  senderProfileImage?: string | null;
  text: string;
  timestamp: Date;
  isEmployer: boolean;
  isCompany?: boolean;
}

interface Conversation {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateInitials: string;
  candidateRole: string;
  candidateUniversity: string;
  candidateProfileImage: string | null;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  messages: Message[];
}

interface CompanyProfile {
  companyName: string;
  logoURL: string | null;
}

function formatTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[date.getDay()];
  }
  return date.toLocaleDateString();
}

function getInitials(name: string): string {
  if (!name) return "CO";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length >= 2)
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetConversationId = searchParams.get("conversationId");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(
    null,
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const selectedConversationRef = useRef<Conversation | null>(null);

  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation((prev) =>
      prev?.id === conversation.id
        ? { ...conversation, messages: prev.messages }
        : conversation,
    );
    setConversations((prev) =>
      prev.map((item) =>
        item.id === conversation.id ? { ...item, unreadCount: 0 } : item,
      ),
    );
    const nextUrl = `/employer/messages?conversationId=${encodeURIComponent(conversation.id)}`;
    if (
      typeof window !== "undefined" &&
      window.location.search !== `?conversationId=${conversation.id}`
    ) {
      router.replace(nextUrl);
    }
  };

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const userData = await apiFetch<{
          user: {
            role: string | null;
            CompanyProfile?: { companyName: string; logoURL: string | null };
          };
        }>("/api/auth/me");

        const currentPath = window.location.pathname;

        if (userData.user.role === "CANDIDATE") {
          if (currentPath.startsWith("/employer")) {
            router.push("/intern/messages");
            return;
          }
          return;
        }

        if (!userData.user.role) {
          if (!currentPath.startsWith("/role-selection")) {
            router.push("/role-selection");
          }
          return;
        }

        if (!companyProfile && userData.user.CompanyProfile) {
          setCompanyProfile({
            companyName: userData.user.CompanyProfile.companyName,
            logoURL: userData.user.CompanyProfile.logoURL,
          });
        }

        const data = await apiFetch<{ conversations: Conversation[] }>(
          "/api/messages/conversations",
        );
        const currentSelected = selectedConversationRef.current;
        const converted = data.conversations.map((conv: any) => {
          const existing =
            currentSelected?.id === conv.id
              ? currentSelected
              : conversations.find((c) => c.id === conv.id);
          return {
            ...conv,
            lastMessageTime: new Date(conv.lastMessageTime),
            messages: existing?.messages || [],
          };
        });

        setConversations(converted);

        if (converted.length > 0) {
          const target = targetConversationId
            ? converted.find((c) => c.id === targetConversationId)
            : null;

          if (target) {
            setSelectedConversation((prev) =>
              prev?.id === target.id
                ? { ...target, messages: prev?.messages ?? [] }
                : target,
            );
          } else if (!selectedConversationRef.current) {
            setSelectedConversation(converted[0]);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error("Failed to load conversations:", error);
        setLoading(false);
      }
    };

    loadConversations();

    const interval = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      const refresh = async () => {
        try {
          const data = await apiFetch<{ conversations: Conversation[] }>(
            "/api/messages/conversations",
          );
          setConversations((prev) => {
            const currentSelected = selectedConversationRef.current;
            const converted = data.conversations.map((conv: any) => {
              const existing = prev.find((c) => c.id === conv.id);
              const preservedMessages =
                currentSelected?.id === conv.id
                  ? (currentSelected?.messages ?? [])
                  : existing?.messages || [];
              return {
                ...conv,
                lastMessageTime: new Date(conv.lastMessageTime),
                messages: preservedMessages,
              };
            });

            if (currentSelected) {
              const updated = converted.find(
                (c) => c.id === currentSelected.id,
              );
              if (updated) {
                setSelectedConversation((prev) =>
                  prev?.id === updated.id
                    ? { ...updated, messages: prev?.messages ?? [] }
                    : prev,
                );
              }
            }

            return converted;
          });
        } catch {
          // silently fail
        }
      };
      refresh();
    }, 3000);

    return () => clearInterval(interval);
  }, [router, targetConversationId]);

  useEffect(() => {
    if (!targetConversationId || conversations.length === 0) return;
    const target = conversations.find((c) => c.id === targetConversationId);
    if (target && selectedConversation?.id !== target.id) {
      setSelectedConversation((prev) =>
        prev?.id === target.id
          ? { ...target, messages: prev.messages }
          : target,
      );
    }
  }, [conversations, selectedConversation?.id, targetConversationId]);

  useEffect(() => {
    if (!selectedConversation) return;

    const loadMessages = async () => {
      try {
        const data = await apiFetch<{ messages: Message[] }>(
          `/api/messages/conversations/${selectedConversation.id}/messages`,
        );
        const converted = data.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));

        const hasNew =
          !selectedConversation.messages ||
          converted.length !== selectedConversation.messages.length ||
          (converted.length > 0 &&
            converted[converted.length - 1].id !==
              selectedConversation.messages[
                selectedConversation.messages.length - 1
              ]?.id);

        setSelectedConversation((current) => {
          if (!current || current.id !== selectedConversation.id)
            return current;
          return { ...current, messages: converted };
        });

        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === selectedConversation.id
              ? { ...conv, messages: converted }
              : conv,
          ),
        );

        if (hasNew) {
          setTimeout(
            () =>
              messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
            100,
          );
        }
      } catch (error) {
        console.error("Failed to load messages:", error);
      }
    };

    loadMessages();
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") loadMessages();
    }, 2000);
    return () => clearInterval(interval);
  }, [selectedConversation?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConversation?.messages]);

  const filteredConversations = conversations.filter((conv) =>
    conv.candidateName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    try {
      const data = await apiFetch<{ message: Message }>(
        `/api/messages/conversations/${selectedConversation.id}/messages`,
        {
          method: "POST",
          body: JSON.stringify({ text: newMessage.trim() }),
        },
      );
      const newMsg: Message = {
        ...data.message,
        timestamp: new Date(data.message.timestamp),
        senderName: data.message.isEmployer ? "Company" : "Candidate",
        senderInitials: data.message.isEmployer
          ? getInitials(companyProfile?.companyName || "CO")
          : data.message.senderInitials,
      };

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedConversation.id
            ? {
                ...conv,
                lastMessage: newMessage.trim(),
                lastMessageTime: new Date(),
                messages: [...conv.messages, newMsg],
              }
            : conv,
        ),
      );
      setSelectedConversation((current) => {
        if (!current || current.id !== selectedConversation.id) return current;
        return {
          ...current,
          lastMessage: newMessage.trim(),
          lastMessageTime: new Date(),
          messages: [...current.messages, newMsg],
        };
      });
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleViewProfile = async () => {
    if (!selectedConversation) return;
    try {
      const data = await apiFetch<{ profile: any }>(
        `/api/candidates/${selectedConversation.candidateId}`,
      );
      const c = data.profile;
      const primaryEdu = c.education?.[0] ?? null;
      setSelectedCandidate({
        id: c.id || selectedConversation.candidateId,
        name: c.fullName || selectedConversation.candidateName,
        role: c.desiredPosition || selectedConversation.candidateRole,
        university:
          primaryEdu?.universityName ||
          selectedConversation.candidateUniversity,
        major: primaryEdu?.fieldOfStudy || primaryEdu?.degree || null,
        graduationDate: primaryEdu?.isCurrent
          ? "Present"
          : (primaryEdu?.yearOfStudy ?? null),
        skills: (c.skills || []).map((s: any) => s.name ?? s),
        initials: selectedConversation.candidateInitials,
        profileImage: c.profileImage ?? null,
        email: c.email || "",
        about: c.bio || "",
        phoneNumber: c.phoneNumber ?? null,
        preferredPositions: c.preferredPositions ?? [],
        preferredLocations: c.preferredLocations ?? [],
        internshipPeriod: c.internshipPeriod ?? null,
        yearOfStudy: primaryEdu?.yearOfStudy ?? null,
        gpa: primaryEdu?.gpa ?? null,
        degreeName: primaryEdu?.degree ?? null,
        isCurrent: primaryEdu?.isCurrent ?? false,
        education: c.education ?? [],
        experience: c.experience ?? [],
        projects: c.projects ?? [],
        files: c.files ?? { contactFiles: [], certificates: [] },
        resume: c.resume ?? null,
        createdAt: c.createdAt ?? null,
      });
    } catch (error) {
      console.error("Failed to load candidate profile:", error);
    }
  };

  return (
    <div className="h-screen bg-[#E6EBF4] dark:bg-gray-950 flex flex-col transition-colors duration-300 overflow-hidden">
      <EmployerNavbar />
      <div className="layout-container flex h-[calc(100vh-4rem)] w-full py-6">
        {/* Left Sidebar */}
        <div className="flex w-80 flex-col rounded-l-2xl border border-r-0 border-gray-200 bg-white transition-colors dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-gray-200 p-6 dark:border-slate-800">
            <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              Messages
            </h1>
            <div className="relative">
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pl-10 text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-gray-500"
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
              <div className="p-6 text-center text-gray-500 dark:text-slate-400">
                No conversations found
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`cursor-pointer border-b border-gray-100 p-4 transition-colors hover:bg-gray-50 dark:border-slate-800 dark:hover:bg-slate-800 ${
                    selectedConversation?.id === conv.id
                      ? "bg-blue-50 dark:bg-slate-800"
                      : ""
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 overflow-hidden ${
                        selectedConversation?.id === conv.id
                          ? "bg-blue-600"
                          : "bg-gray-400"
                      }`}
                    >
                      {conv.candidateProfileImage ? (
                        <img
                          src={conv.candidateProfileImage}
                          alt={conv.candidateName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        conv.candidateInitials
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                          {conv.candidateName}
                        </h3>
                        {conv.unreadCount > 0 && (
                          <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <p className="mb-1 truncate text-sm text-gray-600 dark:text-slate-300">
                        {conv.lastMessage}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-slate-500">
                        {formatTime(conv.lastMessageTime)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex flex-1 flex-col rounded-r-2xl border border-gray-200 bg-white transition-colors dark:border-slate-800 dark:bg-slate-900">
          {loading ? (
            <div className="flex flex-1 items-center justify-center text-gray-500 dark:text-slate-400">
              <div className="text-center">
                <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 dark:border-slate-800 dark:border-t-blue-500" />
                <p className="text-lg">Loading messages...</p>
              </div>
            </div>
          ) : selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden flex-shrink-0">
                    {selectedConversation.candidateProfileImage ? (
                      <img
                        src={selectedConversation.candidateProfileImage}
                        alt={selectedConversation.candidateName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      selectedConversation.candidateInitials
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedConversation.candidateName}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-slate-400">
                      {selectedConversation.candidateRole} ·{" "}
                      {selectedConversation.candidateUniversity}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleViewProfile}
                  className="flex items-center space-x-2 rounded-lg border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-50 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  <svg
                    className="h-4 w-4 text-gray-600 dark:text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                    View Profile
                  </span>
                </button>
              </div>

              {/* Messages */}
              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto bg-gray-50 p-6 transition-colors dark:bg-gray-950"
              >
                <div className="space-y-4">
                  {selectedConversation.messages.map((msg) => {
                    const isCurrentUser = msg.isEmployer || msg.isCompany;
                    return (
                      <div
                        key={msg.id}
                        className={`flex items-start space-x-3 ${isCurrentUser ? "flex-row-reverse space-x-reverse" : ""}`}
                      >
                        {/* Avatar */}
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 overflow-hidden ${
                            isCurrentUser ? "bg-blue-600" : "bg-gray-400"
                          }`}
                        >
                          {isCurrentUser ? (
                            companyProfile?.logoURL ? (
                              <img
                                src={companyProfile.logoURL}
                                alt="Company"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              getInitials(companyProfile?.companyName || "CO")
                            )
                          ) : msg.senderProfileImage ? (
                            <img
                              src={msg.senderProfileImage}
                              alt={msg.senderName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            msg.senderInitials
                          )}
                        </div>

                        <div
                          className={`flex-1 ${isCurrentUser ? "flex justify-end" : ""}`}
                        >
                          <div
                            className={`inline-block max-w-[70%] rounded-lg px-4 py-2 ${
                              isCurrentUser
                                ? "bg-blue-600 text-white"
                                : "bg-white border border-gray-200 text-gray-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            }`}
                          >
                            <p className="text-sm leading-relaxed">
                              {msg.text}
                            </p>
                            <p
                              className={`text-xs mt-1 ${isCurrentUser ? "text-blue-100" : "text-gray-500 dark:text-slate-500"}`}
                            >
                              {formatTime(msg.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Message Input */}
              <div className="border-t border-gray-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
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
                <p className="text-lg">
                  Select a conversation to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedCandidate && (
        <CandidateProfileModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center min-h-[calc(100vh-4rem)] w-full">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin dark:border-slate-800 dark:border-t-blue-500" />
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
