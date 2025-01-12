import "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken?: string  // Add this line
    refreshToken?: string
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string  // Add this for JWT handling
    id?: string
  }
}