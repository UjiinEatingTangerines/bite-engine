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

export const restaurants: Restaurant[] = [
  {
    id: "1",
    name: "사쿠라 스시 하우스",
    cuisine: "일식",
    image: "/elegant-sushi-restaurant.png",
    votes: 12,
    totalVoters: 20,
    priceRange: "$$",
    rating: 4.8,
    distance: "0.5km",
    badges: ["AI 추천", "사무실 근처"],
    activeViewers: [
      { id: "1", name: "민수", avatar: "/professional-man-headshot.png" },
      { id: "2", name: "지연", avatar: "/professional-woman-headshot.png" },
    ],
    dietary: ["비건 옵션", "글루텐 프리"],
  },
  {
    id: "2",
    name: "서울 키친 BBQ",
    cuisine: "한식",
    image: "/korean-bbq-restaurant-grilling.jpg",
    votes: 10,
    totalVoters: 20,
    priceRange: "$$$",
    rating: 4.6,
    distance: "1.3km",
    badges: ["백엔드팀 인기"],
    activeViewers: [{ id: "3", name: "준혁", avatar: "/professional-headshot-man-glasses.png" }],
    dietary: ["육식주의"],
  },
  {
    id: "3",
    name: "스파이스 루트",
    cuisine: "인도식",
    image: "/indian-restaurant-colorful-interior.jpg",
    votes: 8,
    totalVoters: 20,
    priceRange: "$$",
    rating: 4.5,
    distance: "0.8km",
    badges: ["가성비 최고"],
    activeViewers: [],
    dietary: ["비건 옵션", "매운맛"],
  },
  {
    id: "4",
    name: "타코 피에스타",
    cuisine: "멕시코",
    image: "/vibrant-mexican-restaurant-tacos.jpg",
    votes: 6,
    totalVoters: 20,
    priceRange: "$",
    rating: 4.3,
    distance: "0.3km",
    badges: ["가성비 최고", "사무실 근처"],
    activeViewers: [
      { id: "4", name: "수진", avatar: "/professional-blonde-headshot.png" },
      { id: "5", name: "성민", avatar: "/professional-headshot-man-beard.jpg" },
      { id: "6", name: "유나", avatar: "/professional-asian-woman-headshot.png" },
    ],
    dietary: ["비건 옵션"],
  },
  {
    id: "5",
    name: "지중해 오아시스",
    cuisine: "지중해식",
    image: "/mediterranean-restaurant-hummus-falafel.jpg",
    votes: 4,
    totalVoters: 20,
    priceRange: "$$",
    rating: 4.4,
    distance: "1.6km",
    badges: [],
    activeViewers: [],
    dietary: ["비건 옵션", "채식주의"],
  },
  {
    id: "6",
    name: "파스타 팰리스",
    cuisine: "이탈리안",
    image: "/italian-restaurant-pasta-wine.jpg",
    votes: 3,
    totalVoters: 20,
    priceRange: "$$$",
    rating: 4.7,
    distance: "1.9km",
    badges: [],
    activeViewers: [],
    dietary: ["채식주의"],
  },
]

export const voteActivities: VoteActivity[] = [
  {
    id: "1",
    user: "동현",
    avatar: "/professional-developer-headshot.png",
    action: "에 투표했습니다",
    restaurant: "사쿠라 스시 하우스",
    timestamp: new Date(Date.now() - 30000),
  },
  {
    id: "2",
    user: "소희",
    avatar: "/professional-headshot-woman-engineer.jpg",
    action: "에 투표했습니다",
    restaurant: "서울 키친 BBQ",
    timestamp: new Date(Date.now() - 60000),
  },
  {
    id: "3",
    user: "현우",
    avatar: "/professional-headshot-man-tech.jpg",
    action: "로 투표를 변경했습니다",
    restaurant: "스파이스 루트",
    timestamp: new Date(Date.now() - 120000),
  },
  {
    id: "4",
    user: "예린",
    avatar: "/professional-headshot-woman-designer.png",
    action: "에 투표했습니다",
    restaurant: "타코 피에스타",
    timestamp: new Date(Date.now() - 180000),
  },
]

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
