import Card from '../../components/ui/Card.jsx'

const MESSAGES = [
  {
    id: 1,
    from: 'customer',
    text: 'Hi, I submitted a complaint about the leaky faucet.',
    time: '09:15',
  },
  {
    id: 2,
    from: 'vendor',
    text: 'Hi! I saw your complaint. I can visit today at 3 PM.',
    time: '09:18',
  },
  {
    id: 3,
    from: 'customer',
    text: 'That works for me, thank you.',
    time: '09:20',
  },
]

export default function ComplaintChat() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Card header="Complaint Chat">
        <div className="space-y-3">
          {MESSAGES.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.from === 'customer' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs rounded-2xl px-3 py-2 text-sm ${
                  message.from === 'customer'
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-100 text-slate-900'
                }`}
              >
                <p>{message.text}</p>
                <p className="mt-1 text-xs opacity-80 text-right">
                  {message.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}


