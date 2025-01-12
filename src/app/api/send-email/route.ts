// app/api/test-email/route.ts
import { google } from 'googleapis'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth"
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    )

    oauth2Client.setCredentials({
      access_token: session.accessToken
    })

    const gmail = google.gmail({ 
      version: 'v1', 
      auth: oauth2Client 
    })

    // Create email
    const utf8Subject = `Test Email ${new Date().toISOString()}`
    const messageParts = [
      `To: roxmax224@gmail.com`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${utf8Subject}`,
      '',
      'This is a test email from your app.'
    ]
    const message = messageParts.join('\n')
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')

    // Send email
    const res = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    })

    return NextResponse.json({
      success: true,
      messageId: res.data.id
    })

  } catch (error: any) {
    console.error('Gmail API Error:', error?.message)
    return NextResponse.json({ 
      error: error?.message || 'Failed to send email'
    }, { status: 500 })
  }
}