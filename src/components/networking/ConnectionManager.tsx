import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Trash2,
  Send,
  Search,
  ExternalLink,
  ShieldCheck,
  UserCheck,
  Clock,
  Sparkles,
  ArrowRight,
  ChevronRight,
  MessageCircle,
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { formatDate, formatDateTime } from '../../lib/utils';
import { DataService, type ConnectionItem, type DirectMessageItem } from '../../services/dataService';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface ConnectionManagerProps {
  onViewProfile?: (memberId: string) => void;
  initialSelectedConnectionId?: string | null;
}

export const ConnectionManager: React.FC<ConnectionManagerProps> = ({
  onViewProfile,
  initialSelectedConnectionId,
}) => {
  const { profile } = useAuth();
  const currentUserId = profile?.id || 'd0000000-0000-0000-0000-000000000003';

  const [connections, setConnections] = useState<ConnectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'accepted' | 'incoming' | 'outgoing'>('accepted');
  const [searchQuery, setSearchQuery] = useState('');

  // Active chat state
  const [activeChatConn, setActiveChatConn] = useState<ConnectionItem | null>(null);
  const [chatMessages, setChatMessages] = useState<DirectMessageItem[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load connections
  const loadConnections = async () => {
    setLoading(true);
    const data = await DataService.getUserConnections(currentUserId);
    setConnections(data);
    setLoading(false);

    if (initialSelectedConnectionId) {
      const match = data.find((c) => c.id === initialSelectedConnectionId && c.status === 'accepted');
      if (match) {
        setActiveChatConn(match);
      }
    }
  };

  useEffect(() => {
    loadConnections();
  }, [currentUserId]);

  // Load messages when active chat connection changes
  useEffect(() => {
    let isMounted = true;
    async function loadMessages() {
      if (!activeChatConn) {
        setChatMessages([]);
        return;
      }
      const msgs = await DataService.getDirectMessages(activeChatConn.id);
      if (isMounted) {
        setChatMessages(msgs);
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
    loadMessages();
    return () => {
      isMounted = false;
    };
  }, [activeChatConn?.id]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const acceptedConnections = connections.filter((c) => c.status === 'accepted');
  const incomingRequests = connections.filter((c) => c.status === 'pending' && c.direction === 'incoming');
  const outgoingRequests = connections.filter((c) => c.status === 'pending' && c.direction === 'outgoing');

  // Handle Accept (Update)
  const handleAcceptRequest = async (connectionId: string) => {
    await DataService.acceptConnectionRequest(connectionId);
    await loadConnections();
  };

  // Handle Decline (Update / Delete)
  const handleRejectRequest = async (connectionId: string) => {
    await DataService.rejectConnectionRequest(connectionId);
    await loadConnections();
  };

  // Custom Confirmation Popup State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText: string;
    targetId: string;
    isDisconnectingChat?: boolean;
  }>({
    isOpen: false,
    title: '',
    description: '',
    confirmText: 'Confirm',
    targetId: '',
    isDisconnectingChat: false,
  });
  const [isConfirmingAction, setIsConfirmingAction] = useState(false);

  // Trigger modal for removing accepted connection
  const promptRemoveConnection = (conn: ConnectionItem) => {
    setConfirmModal({
      isOpen: true,
      title: 'Remove Connection',
      description: `Are you sure you want to remove ${conn.otherUser.fullName} from your connections? Direct messaging with this member will be permanently closed.`,
      confirmText: 'Remove Connection',
      targetId: conn.id,
      isDisconnectingChat: true,
    });
  };

  // Trigger modal for cancelling outgoing invitation
  const promptCancelRequest = (req: ConnectionItem) => {
    setConfirmModal({
      isOpen: true,
      title: 'Cancel Connection Request',
      description: `Are you sure you want to withdraw your connection request sent to ${req.otherUser.fullName}? They will no longer see this request in their inbox.`,
      confirmText: 'Cancel Request',
      targetId: req.id,
      isDisconnectingChat: false,
    });
  };

  // Execute confirmed removal action
  const handleExecuteConfirmedRemoval = async () => {
    if (!confirmModal.targetId) return;
    setIsConfirmingAction(true);
    await DataService.removeConnection(confirmModal.targetId);
    if (activeChatConn?.id === confirmModal.targetId) {
      setActiveChatConn(null);
    }
    await loadConnections();
    setIsConfirmingAction(false);
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  };

  // Send Direct Message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() || !activeChatConn || isSendingMessage) return;

    const content = messageInput.trim();
    setMessageInput('');
    setIsSendingMessage(true);

    const res = await DataService.sendDirectMessage(
      activeChatConn.id,
      currentUserId,
      activeChatConn.otherUser.id,
      content
    );

    if (res.success && res.message) {
      setChatMessages((prev) => [...prev, res.message!]);
    }
    setIsSendingMessage(false);
  };

  const filteredAccepted = acceptedConnections.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.otherUser.fullName.toLowerCase().includes(q) ||
      (c.otherUser.headline && c.otherUser.headline.toLowerCase().includes(q)) ||
      (c.otherUser.city && c.otherUser.city.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extralight text-[#171C19] tracking-tight">
          Network Connections & Direct Messaging
        </h2>
        <p className="text-sm text-[#818A84] mt-1">
          Bilateral verified connections across all 7 ecosystems. Once mutually connected, message peers directly and share opportunities.
        </p>
      </div>

      {/* Segmented Navigation Bar */}
      <div className="flex items-center gap-2 p-1.5 bg-black/[0.04] rounded-full max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab('accepted')}
          className={`flex-1 py-1.5 px-3 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'accepted'
              ? 'bg-white text-black shadow-xs font-bold'
              : 'text-[#818A84] hover:text-black'
          }`}
        >
          <span>Connected</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/[0.06] text-black">
            {acceptedConnections.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('incoming')}
          className={`flex-1 py-1.5 px-3 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'incoming'
              ? 'bg-white text-black shadow-xs font-bold'
              : 'text-[#818A84] hover:text-black'
          }`}
        >
          <span>Incoming</span>
          {incomingRequests.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-600 text-white font-bold">
              {incomingRequests.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('outgoing')}
          className={`flex-1 py-1.5 px-3 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'outgoing'
              ? 'bg-white text-black shadow-xs font-bold'
              : 'text-[#818A84] hover:text-black'
          }`}
        >
          <span>Pending Sent</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/[0.06] text-black">
            {outgoingRequests.length}
          </span>
        </button>
      </div>

      {/* TAB 1: ACCEPTED CONNECTIONS & DIRECT MESSAGING */}
      {activeTab === 'accepted' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[560px]">
          {/* Left Column: Connections Directory List (5 cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#818A84]" />
              <input
                type="text"
                placeholder="Search connected members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-2xl bg-white border border-black/[0.08] text-xs text-[#171C19] focus:outline-none focus:border-black/30 shadow-2xs"
              />
            </div>

            {/* List of Connected Users */}
            <div className="space-y-2.5 overflow-y-auto max-h-[580px] pr-1">
              {filteredAccepted.length === 0 ? (
                <div className="apple-card p-8 text-center text-xs text-[#818A84] border border-black/[0.06]">
                  {loading ? 'Loading connections...' : 'No accepted connections found. Browse Member Directory to connect!'}
                </div>
              ) : (
                filteredAccepted.map((conn) => {
                  const isSelected = activeChatConn?.id === conn.id;
                  return (
                    <div
                      key={conn.id}
                      onClick={() => setActiveChatConn(conn)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer apple-card text-left flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'bg-white border-black/30 shadow-md ring-1 ring-black/10'
                          : 'bg-white hover:bg-black/[0.01] border-black/[0.06]'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <Avatar
                          src={conn.otherUser.avatarUrl}
                          name={conn.otherUser.fullName}
                          size="md"
                          isVerified={conn.otherUser.verificationLevel !== 'unverified'}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-semibold text-[#171C19] truncate">
                              {conn.otherUser.fullName}
                            </h4>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" title="Connected" />
                          </div>
                          <p className="text-[11px] text-[#818A84] truncate mt-0.5">
                            {conn.otherUser.headline}
                          </p>
                          <span className="text-[10px] text-[#818A84]/80 block mt-1">
                            {conn.otherUser.city || 'Verified Member'}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                          Chat
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            promptRemoveConnection(conn);
                          }}
                          className="p-1 text-[#818A84] hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                          title="Remove Connection"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Direct Messaging Room (7 cols) */}
          <div className="lg:col-span-7 apple-card border border-black/[0.08] p-0 flex flex-col rounded-[26px] overflow-hidden bg-white shadow-sm h-[640px]">
            {activeChatConn ? (
              <>
                {/* Chat Header */}
                <div className="p-4 sm:p-5 border-b border-black/[0.06] bg-black/[0.01] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={activeChatConn.otherUser.avatarUrl}
                      name={activeChatConn.otherUser.fullName}
                      size="sm"
                      isVerified={activeChatConn.otherUser.verificationLevel !== 'unverified'}
                    />
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-[#171C19] flex items-center gap-1.5">
                        {activeChatConn.otherUser.fullName}
                        <span className="text-[10px] text-emerald-600 font-normal bg-emerald-50 px-2 py-0.5 rounded-full">
                          Connected
                        </span>
                      </h4>
                      <p className="text-[11px] text-[#818A84] truncate max-w-xs">
                        {activeChatConn.otherUser.headline}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {activeChatConn.otherUser.linkedinUrl && (
                      <a
                        href={activeChatConn.otherUser.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-xl border border-black/[0.08] text-[#818A84] hover:text-black hover:bg-black/[0.04] text-xs flex items-center gap-1"
                        title="View LinkedIn Profile"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {onViewProfile && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewProfile(activeChatConn.otherUser.id)}
                        className="text-[11px] py-1 px-2.5 h-auto"
                      >
                        Profile
                      </Button>
                    )}
                    <button
                      type="button"
                      onClick={() => promptRemoveConnection(activeChatConn)}
                      className="p-1.5 rounded-xl border border-black/[0.08] text-[#818A84] hover:text-red-600 hover:bg-red-50 text-xs flex items-center transition-colors"
                      title="Remove Connection"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Messages Thread Container */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 bg-[#FAFBF9]">
                  <div className="text-center my-2">
                    <span className="text-[10px] text-[#818A84] bg-white px-3 py-1 rounded-full border border-black/[0.06] shadow-2xs">
                      End-to-end verified connection · Messaging active
                    </span>
                  </div>

                  {chatMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-xs text-[#818A84] space-y-2 py-16">
                      <MessageCircle className="w-8 h-8 text-black/20" />
                      <p>Start your direct conversation with {activeChatConn.otherUser.fullName}.</p>
                    </div>
                  ) : (
                    chatMessages.map((msg) => {
                      const isMe = msg.senderId === currentUserId || msg.senderId === 'me';
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-xs shadow-2xs leading-relaxed ${
                              isMe
                                ? 'bg-[#171C19] text-white rounded-br-xs'
                                : 'bg-white text-[#171C19] border border-black/[0.08] rounded-bl-xs'
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                          </div>
                          <span className="text-[9px] text-[#818A84] mt-1 px-1">
                            {formatDateTime(msg.createdAt)}
                          </span>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input Bar */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 sm:p-4 border-t border-black/[0.06] bg-white flex items-center gap-2"
                >
                  <input
                    type="text"
                    placeholder={`Message ${activeChatConn.otherUser.fullName}...`}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="flex-1 py-2 px-3.5 rounded-full bg-black/[0.03] border border-black/[0.08] text-xs text-[#171C19] focus:outline-none focus:border-black/30 placeholder:text-[#818A84]"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={!messageInput.trim() || isSendingMessage}
                    className="rounded-full px-3.5 py-2 flex items-center justify-center"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </form>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3 text-[#818A84]">
                <div className="w-12 h-12 rounded-full bg-black/[0.04] flex items-center justify-center text-[#171C19]">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-[#171C19]">Select a Connection to Chat</h4>
                <p className="text-xs max-w-sm">
                  Choose any accepted connection from the left to read messages or send new updates.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: INCOMING CONNECTION REQUESTS */}
      {activeTab === 'incoming' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-[#171C19]">
              Received Connection Invitations ({incomingRequests.length})
            </h3>
          </div>

          {incomingRequests.length === 0 ? (
            <div className="apple-card p-12 text-center text-xs text-[#818A84] border border-black/[0.06]">
              No pending connection requests. When members send you an invitation, they will appear here.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {incomingRequests.map((req) => (
                <div
                  key={req.id}
                  className="apple-card p-5 border border-black/[0.08] flex flex-col justify-between space-y-4 bg-white shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <Avatar
                        src={req.otherUser.avatarUrl}
                        name={req.otherUser.fullName}
                        size="lg"
                        isVerified={req.otherUser.verificationLevel !== 'unverified'}
                      />
                      <div>
                        <h4 className="text-sm font-semibold text-[#171C19]">
                          {req.otherUser.fullName}
                        </h4>
                        <p className="text-xs text-[#818A84] mt-0.5">{req.otherUser.headline}</p>
                        <span className="text-[10px] text-[#818A84] block mt-1">
                          {req.otherUser.city} · Requested {formatDate(req.createdAt)}
                        </span>
                      </div>
                    </div>

                    {req.otherUser.linkedinUrl && (
                      <a
                        href={req.otherUser.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#818A84] hover:text-black p-1 rounded-lg"
                        title="LinkedIn Profile"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  {req.message && (
                    <div className="bg-black/[0.02] border border-black/[0.05] rounded-xl p-3 text-xs text-[#171C19] italic">
                      "{req.message}"
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/[0.06]">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRejectRequest(req.id)}
                      className="text-xs"
                    >
                      Decline
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleAcceptRequest(req.id)}
                      className="text-xs flex items-center gap-1.5"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      Accept & Connect
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: OUTGOING SENT REQUESTS */}
      {activeTab === 'outgoing' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-[#171C19]">
              Pending Sent Invitations ({outgoingRequests.length})
            </h3>
          </div>

          {outgoingRequests.length === 0 ? (
            <div className="apple-card p-12 text-center text-xs text-[#818A84] border border-black/[0.06]">
              You have no pending invitations waiting for acceptance.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {outgoingRequests.map((req) => (
                <div
                  key={req.id}
                  className="apple-card p-5 border border-black/[0.08] flex flex-col justify-between space-y-3 bg-white"
                >
                  <div className="flex items-start gap-3">
                    <Avatar
                      src={req.otherUser.avatarUrl}
                      name={req.otherUser.fullName}
                      size="md"
                      isVerified={req.otherUser.verificationLevel !== 'unverified'}
                    />
                    <div>
                      <h4 className="text-sm font-semibold text-[#171C19]">
                        {req.otherUser.fullName}
                      </h4>
                      <p className="text-xs text-[#818A84] mt-0.5">{req.otherUser.headline}</p>
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full inline-block mt-1 font-medium">
                        Waiting for acceptance
                      </span>
                    </div>
                  </div>

                  {req.message && (
                    <div className="bg-black/[0.02] border border-black/[0.05] rounded-xl p-2.5 text-xs text-[#818A84]">
                      Note: "{req.message}"
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-black/[0.06] text-xs">
                    <span className="text-[10px] text-[#818A84]">
                      Sent {formatDate(req.createdAt)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => promptCancelRequest(req)}
                      className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Cancel Request
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Apple-grade Custom Confirmation Dialog */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => !isConfirmingAction && setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        title={confirmModal.title}
        maxWidth="sm"
      >
        <div className="space-y-4 pt-1">
          <p className="text-xs sm:text-sm text-[#525854] leading-relaxed">
            {confirmModal.description}
          </p>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-black/[0.06]">
            <Button
              variant="outline"
              size="sm"
              disabled={isConfirmingAction}
              onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
              className="text-xs font-medium"
            >
              Keep Connection
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isConfirmingAction}
              onClick={handleExecuteConfirmedRemoval}
              className="text-xs font-semibold bg-red-600 hover:bg-red-700 text-white border-transparent shadow-xs"
            >
              {confirmModal.confirmText}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
