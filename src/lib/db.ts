import { prisma } from './prisma'

export async function withDatabase<T>(
  operation: () => Promise<T>
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    // Log the error (you can use your preferred logging solution)
    console.error('Database operation failed:', error)

    // If it's a connection error, try to reconnect once
    if (error.message.includes('terminating connection')) {
      try {
        await prisma.$disconnect()
        await prisma.$connect()
        // Retry the operation
        return await operation()
      } catch (retryError) {
        throw new Error(`Database retry failed: ${retryError.message}`)
      }
    }

    throw error
  }
}