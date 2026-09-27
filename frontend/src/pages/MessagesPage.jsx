import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { MessageSquare, Send, Paperclip, Circle, Sparkles, Building, User } from 'lucide-react';

export const MessagesPage = () => {
  const [searchParams] = useSearchParams();
  const applicationId = searchParams.get('applicationId');
  const targetConvId = searchParams.get('conversationId');

  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const res = await api.get('/chat/conversations');
      if (res.data.success) {
        setConversations(res.data.conversations);
        if (res.data.conversations.length > 0) {
          let initial = res.data.conversations[0];
          if (targetConvId) {
            const found = res.data.conversations.find((c) => c._id === targetConvId);
            if (found) initial = found;
          } else if (applicationId) {
            const found = res.data.conversations.find((c) => c.application?._id === applicationId);
            if (found) initial = found;
          }
          setActiveConv(initial);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchMessages = async (convId) => {
    setMessagesLoading(true);
    try {
      const res = await api.get(`/chat/conversations/${convId}/messages`);
      if (res.data.success) {
        setMessages(res.data.messages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMessagesLoading(false);
    }
  };

  useEffect(() => {
    if (activeConv) {
      fetchMessages(activeConv._id);
      if (socket) {
        socket.emit('join_conversation', activeConv._id);
      }
    }

    return () => {
      if (activeConv && socket) {
        socket.emit('leave_conversation', activeConv._id);
      }
    };
  }, [activeConv, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Real-Time Socket Listeners for Chat
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      if (activeConv && msg.conversation === activeConv._id) {
        setMessages((prev) => [...prev, msg]);
        scrollToBottom();
      }
      fetchConversations();
    };

    const handleTyping = ({ userId, isTyping: typingStatus }) => {
      if (activeConv && userId !== user.id) {
        setOtherUserTyping(typingStatus);
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleTyping);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleTyping);
    };
  }, [socket, activeConv, user]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeConv) return;

    const messageText = text;
    setText('');

    if (socket && activeConv) {
      socket.emit('typing', { conversationId: activeConv._id, isTyping: false });
    }

    try {
      const res = await api.post(`/chat/conversations/${activeConv._id}/messages`, {
        text: messageText,
      });

      if (res.data.success) {
        setMessages((prev) => [...prev, res.data.message]);
        scrollToBottom();
        fetchConversations();
      }
    } catch (err) {
      console.error('Send message error:', err);
    }
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    if (socket && activeConv) {
      socket.emit('typing', { conversationId: activeConv._id, isTyping: e.target.value.length > 0 });
    }
  };

  const getOtherParticipant = (conv) => {
    if (!conv || !conv.participants) return null;
    return conv.participants.find((p) => p._id !== user?.id) || conv.participants[0];
  };

  if (loading) return <LoadingSpinner text="Loading real-time chat workspace..." />;

  return (
    <div className="h-[calc(100vh-6rem)] bg-white rounded-3xl border border-slate-200 shadow-sm flex overflow-hidden">
      {/* Conversations Sidebar */}
      <div className="w-80 border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-100">
          <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-brand-600" /> Messages & Chat
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Real-time candidate-recruiter messaging</p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No conversations active yet. Apply for a job to start a real-time chat stream.
            </div>
          ) : (
            conversations.map((conv) => {
              const other = getOtherParticipant(conv);
              const isSelected = activeConv?._id === conv._id;
              const isOnline = other && onlineUsers.has(other._id);

              return (
                <div
                  key={conv._id}
                  onClick={() => setActiveConv(conv)}
                  className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors ${
                    isSelected ? 'bg-brand-50/60 border-l-4 border-brand-600' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-2xl bg-brand-600 text-white font-bold text-xs flex items-center justify-center">
                        {other?.avatar ? (
                          <img src={other.avatar} alt="" className="w-full h-full object-cover rounded-2xl" />
                        ) : (
                          other?.name?.charAt(0) || 'U'
                        )}
                      </div>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                          isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-xs text-slate-900 truncate">{other?.name || 'User'}</h4>
                        <span className="text-[10px] text-slate-400">
                          {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{conv.job?.title}</p>
                      <p className="text-xs text-slate-600 truncate mt-1">{conv.lastMessage}</p>
                    </div>

                    {conv.unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-brand-600 text-white text-[10px] font-bold">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Window */}
      {activeConv ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="px-6 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-brand-600 text-white font-bold text-xs flex items-center justify-center">
                  {getOtherParticipant(activeConv)?.avatar ? (
                    <img src={getOtherParticipant(activeConv)?.avatar} alt="" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    getOtherParticipant(activeConv)?.name?.charAt(0)
                  )}
                </div>
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                    onlineUsers.has(getOtherParticipant(activeConv)?._id) ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                />
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900">{getOtherParticipant(activeConv)?.name}</h3>
                <p className="text-[11px] text-slate-500">
                  {activeConv.job?.title} • {onlineUsers.has(getOtherParticipant(activeConv)?._id) ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/30">
            {messagesLoading ? (
              <LoadingSpinner text="Fetching conversation history..." />
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender?._id === user?.id || msg.sender === user?.id;
                return (
                  <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`max-w-md p-3.5 rounded-2xl text-xs shadow-sm leading-relaxed ${
                        isMe
                          ? 'bg-brand-600 text-white rounded-br-none'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                      }`}
                    >
                      <p>{msg.text}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })
            )}
            {otherUserTyping && (
              <div className="text-[11px] text-brand-600 italic font-semibold animate-pulse">
                {getOtherParticipant(activeConv)?.name} is typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 bg-white flex items-center gap-2">
            <input
              type="text"
              placeholder="Type a real-time message..."
              value={text}
              onChange={handleTextChange}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />

            <button
              type="submit"
              disabled={!text.trim()}
              className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Send
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <EmptyState title="Select a Conversation" description="Choose a message thread from the sidebar to begin chatting." />
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
