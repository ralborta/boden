export type BuilderbotFile = {
  id: string
  name: string
  size: number
  uploadedAt: string // ISO
}

export type BuilderbotPrompt = {
  content: string
  updatedAt: string
}

export type ApiResponse<T> = {
  data?: T
  error?: string
  message?: string
}

