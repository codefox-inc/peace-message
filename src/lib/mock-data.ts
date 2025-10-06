import { PeaceMessage } from '@/types/peace-message'

// Fixed timestamps to avoid hydration mismatch
const baseTimestamp = 1641024000000 // Fixed date: 2022-01-01 12:00:00 GMT

export const mockMessages: PeaceMessage[] = [
  {
    messageId: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890',
    text: 'Peace 🕊️',
    h: '0x2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890ab',
    kioskId: 'KIOSK_001',
    timestamp: baseTimestamp - 60000,
    scheme: 1,
  },
  {
    messageId: '0x2c3d4e5f6789abcdef1234567890abcdef1234567890abcdef1234567890abcd',
    text: '平和 ✨',
    h: '0x3d4e5f6789abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    kioskId: 'KIOSK_002',
    timestamp: baseTimestamp - 120000,
    scheme: 1,
  },
  {
    messageId: '0x3e4f5678abcdef1234567890abcdef1234567890abcdef1234567890abcdef12',
    text: 'Love 💖',
    h: '0x4f5678abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234',
    kioskId: 'KIOSK_001',
    timestamp: baseTimestamp - 180000,
    scheme: 1,
  },
  {
    messageId: '0x456789abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234',
    text: '和平 🌍',
    h: '0x56789abcdef1234567890abcdef1234567890abcdef1234567890abcdef12345',
    kioskId: 'KIOSK_003',
    timestamp: baseTimestamp - 240000,
    scheme: 1,
  },
  {
    messageId: '0x56789abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    text: 'Hope 🌸',
    h: '0x6789abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456',
    kioskId: 'KIOSK_002',
    timestamp: baseTimestamp - 300000,
    scheme: 1,
  },
  {
    messageId: '0x67890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567891',
    text: 'Joy ⚓',
    h: '0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567',
    kioskId: 'KIOSK_004',
    timestamp: baseTimestamp - 360000,
    scheme: 1,
  },
  {
    messageId: '0x78901abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567892',
    text: 'Unity 🌅',
    h: '0x8901abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234568',
    kioskId: 'KIOSK_001',
    timestamp: baseTimestamp - 420000,
    scheme: 1,
  },
  {
    messageId: '0x89012abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567893',
    text: 'Kindness 💝',
    h: '0x9012abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234569',
    kioskId: 'KIOSK_003',
    timestamp: baseTimestamp - 480000,
    scheme: 1,
  },
]

// Mock function to simulate new messages arriving
let messageIdCounter = mockMessages.length + 1

export function generateMockMessage(): PeaceMessage {
  const messages = [
    'Hope is the thing with feathers 🕊️',
    'Peace begins with a smile 😊',
    'In a gentle way, you can shake the world 🌍',
    'Be the change you wish to see 🌟',
    'Love conquers all 💕',
    '平和への祈りを込めて 🙏',
    '愛と平和が世界に届きますように ✨',
    '和平与爱将指引我们前行 🌈',
    '세상에 평화의 빛이 가득하기를 🕯️',
    'Together we can make a difference 🤝',
  ]

  const kioskIds = ['KIOSK_001', 'KIOSK_002', 'KIOSK_003', 'KIOSK_004']
  
  // Use counter-based selection instead of Math.random()
  const messageIndex = messageIdCounter % messages.length
  const kioskIndex = messageIdCounter % kioskIds.length
  
  const selectedMessage = messages[messageIndex]
  const selectedKiosk = kioskIds[kioskIndex]
  
  const currentCounter = messageIdCounter + 100
  messageIdCounter++
  
  return {
    messageId: `0x${currentCounter.toString(16).padStart(64, '0')}`,
    text: selectedMessage,
    h: `0x${(currentCounter + 1000).toString(16).padStart(64, '0')}`,
    kioskId: selectedKiosk,
    timestamp: baseTimestamp + (messageIdCounter * 15000), // Fixed incremental timestamp
    scheme: 1,
  }
}

export function generateMockProof(message: string, passphrase: string) {
  // Simulate ZK proof generation with mock data
  const mockProof = {
    proof: {
      a: ['0x123...', '0x456...'],
      b: [['0x789...', '0xabc...'], ['0xdef...', '0x012...']],
      c: ['0x345...', '0x678...'],
    },
    publicSignals: [
      '0x' + Buffer.from(message).toString('hex'),
      '8453', // Base chain ID
      '0x1234567890abcdef...', // Contract address
      'KIOSK_001',
      Math.floor(baseTimestamp / 60000).toString(), // timestamp bucket
      '0x' + Buffer.from(`${message}-${passphrase}`).toString('hex'), // h
    ],
  }
  
  return mockProof
}