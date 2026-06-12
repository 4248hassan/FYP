import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { formatDateTime } from '../../utils'
import api from '../../services/api'
import Card from '../../components/ui/Card.jsx'
import Loader from '../../components/ui/Loader.jsx'

export default function Chat() {
  const { conversationId } = useParams()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    fetchMessages()
    // Poll for new messages every 3 seconds
    const interval = setInterval(fetchMessages, 3000)
    return () => clearInterval(interval)
  }, [conversationId])

  const fetchMessages = async () => {
    try {
      if (!conversationId) return
      const response = await api.get(`/chat/conversation/${conversationId}`)
      setMessages(response.data.chats || [])
      setLoading(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load messages')
      setLoading(false)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    try {
      setSending(true)
      const receiverId = conversationId.split('-').find(id => id !== localStorage.getItem('userId'))
      await api.post('/chat/send', {
        receiverId,
        message: newMessage.trim(),
      })
      setNewMessage('')
      await fetchMessages()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  if (loading) return <Loader />

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Card header="Chat">
        <div className="flex flex-col h-96">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="flex-1 overflow-y-auto space-y-3 mb-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No messages yet. Start a conversation!
              </div>
            ) : (
              messages.map((message) => {
                const isOwn = message.senderId._id === localStorage.getItem('userId')
                return (
                  <div
                    key={message._id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs rounded-2xl px-3 py-2 text-sm ${
                        isOwn
                          ? 'bg-sky-600 text-white'
                          : 'bg-slate-100 text-slate-900'
                      }`}
                    >
                      <p>{message.message}</p>
                      <p className="mt-1 text-xs opacity-80">
                        {formatDateTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {sending ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      </Card>
    </div>
  )
}

