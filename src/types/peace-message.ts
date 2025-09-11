export interface PeaceMessage {
  messageId: string
  text: string
  h: string // commitment hash
  kioskId: string
  timestamp: number
  scheme: number
}

export interface ProofData {
  proof: {
    a: [string, string]
    b: [[string, string], [string, string]]
    c: [string, string]
  }
  publicSignals: string[]
}

export interface VerificationQR {
  txHash: string
  h: string
  publicInputs: {
    textHashF: string
    chainIdF: string
    contractF: string
    kioskIdF: string
    tsBucketF: string
    h: string
  }
  proof: ProofData
}

export interface MockZKProof {
  proof: string // base64 encoded mock proof
  publicInputs: string[]
  isValid: boolean
}