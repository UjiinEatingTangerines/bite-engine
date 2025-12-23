export interface Restaurant {
  id: string
  name: string
  cuisine: string
  image: string
  votes: number
  totalVoters: number
  priceRange: string
  rating: number
  distance: string
  badges: string[]
  activeViewers: { id: string; name: string; avatar: string }[]
  dietary: string[]
}

export interface VoteActivity {
  id: string
  user: string
  avatar: string
  action: string
  restaurant: string
  timestamp: Date
}

export interface TeamMember {
  id: string
  name: string
  avatar: string
  preferences: string[]
}

export const restaurants: Restaurant[] = []

export const voteActivities: VoteActivity[] = []

export const teamScores = {
  satisfaction: 87,
  dietary: 92,
  price: 78,
}

export const dietaryFilters = [
  { id: "no-seafood", label: "해산물 제외", icon: "🦐" },
  { id: "vegan", label: "비건", icon: "🥬" },
  { id: "meat-lover", label: "육식주의", icon: "🥩" },
  { id: "spicy", label: "매운맛", icon: "🌶️" },
  { id: "gluten-free", label: "글루텐 프리", icon: "🌾" },
]

export const currentUser = {
  name: "해리",
  preferences: ["매운맛", "아시안 요리"],
  pastDinners: ["태국 궁전", "딤섬 가든", "쌀국수 하우스"],
}
