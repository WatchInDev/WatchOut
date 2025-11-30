export interface User {
  id: number
  name: string
  email: string
  reputation: number
  externalId: string
  isBlocked?: boolean;
}

export interface EventType {
  id: number
  name: string
  icon: string
  description: string
}

export interface Event {
  id: number
  name: string
  description: string
  image: string
  reportedDate: string
  endDate: string
  isActive: boolean
  author: User
  eventType: EventType
  location: {
    latitude: number
    longitude: number
  }
}

export interface Comment {
  id: number
  content: string
  author: User
  eventId: number
  isDeleted: boolean
}
