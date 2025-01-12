import { google, Auth } from 'googleapis'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth"
import { NextResponse } from 'next/server'

// Create a singleton instance of OAuth2Client
let oauth2Client: Auth.OAuth2Client | null = null

function getOAuth2Client() {
  if (!oauth2Client) {
    oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    )
  }
  return oauth2Client
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const oauth2Client = getOAuth2Client()

    // Set the credentials (access token and refresh token)
    oauth2Client.setCredentials({
      access_token: session.accessToken,
      refresh_token: session.refreshToken, // Add the refresh token
    })

    console.log('Refresh Token:', session.refreshToken)
    console.log('Token Expiry:', new Date(oauth2Client.credentials.expiry_date))
    // Check if the access token has expired
    if (oauth2Client.credentials.expiry_date && Date.now() > oauth2Client.credentials.expiry_date) {
      // Refresh the access token
      const { credentials } = await oauth2Client.refreshAccessToken()
      oauth2Client.setCredentials(credentials)

      // Update the session with the new access token
      session.accessToken = credentials.access_token
    }

    const gmail = google.gmail({ 
      version: 'v1', 
      auth: oauth2Client 
    })

    // Parse form data
    const formData = await request.formData()
    const to = formData.get('to') as string
    const subject = formData.get('subject') as string
    const message = formData.get('message') as string
    const cvFile = formData.get('cv') as File | null

    if (!cvFile) {
      return NextResponse.json({ error: "CV file is missing" }, { status: 400 })
    }

    // Create a boundary for the multipart message
    const boundary = "foo_bar_baz"

    // Create the email body
    const emailBody = [
      `To: ${to}`,
      `Subject: ${subject}`,
      "MIME-Version: 1.0",
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      "",
      `--${boundary}`,
      "Content-Type: text/html; charset=utf-8",
      "",
      `<html>
        <body>
          <p>${message.replace(/\n/g, '<br>')}</p>
        </body>
      </html>`,
      `--${boundary}`,
      "Content-Type: application/pdf",
      'Content-Disposition: attachment; filename="cv.pdf"',
      "Content-Transfer-Encoding: base64",
      "",
      Buffer.from(await cvFile.arrayBuffer()).toString('base64'),
      `--${boundary}--`,
    ].join('\n')

    // Encode the email body
    const encodedMessage = Buffer.from(emailBody)
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