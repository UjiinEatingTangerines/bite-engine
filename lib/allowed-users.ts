// 사전 등록된 사용자 목록
export interface AllowedUser {
  name: string
  email: string
  role: 'admin' | 'user'
}

export const ALLOWED_USERS: AllowedUser[] = [
  {
    name: 'Harry',
    email: 'harry@skelectlink.com',
    role: 'admin',
  },
  // 여기에 추가 사용자를 등록할 수 있습니다
  // {
  //   name: '홍길동',
  //   email: 'hong@skelectlink.com',
  //   role: 'user',
  // },
]

export function isUserAllowed(email: string): boolean {
  return ALLOWED_USERS.some(user => user.email.toLowerCase() === email.toLowerCase())
}

export function getUserByEmail(email: string): AllowedUser | undefined {
  return ALLOWED_USERS.find(user => user.email.toLowerCase() === email.toLowerCase())
}

export function isAdmin(email: string): boolean {
  const user = getUserByEmail(email)
  return user?.role === 'admin'
}
