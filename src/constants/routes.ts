export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  MY_TREE: '/my-tree',
  TREE: (id: string) => `/tree/${id}`,
  MESSAGES: '/messages',
} as const
