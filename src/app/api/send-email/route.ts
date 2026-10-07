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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function stripLineBreaks(value: string | null) {
  return (value || '').replace(/[\r\n]+/g, ' ').trim()
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
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
    const to = stripLineBreaks(formData.get('to') as string)
    const subject = stripLineBreaks(formData.get('subject') as string)
    const message = (formData.get('message') as string) || ''
    const cvFile = formData.get('cv') as File | null

    if (!to || !EMAIL_PATTERN.test(to)) {
      return NextResponse.json({ error: "A valid recipient email is required" }, { status: 400 })
    }
    if (!cvFile) {
      return NextResponse.json({ error: "CV file is missing" }, { status: 400 })
    }

    const boundary = `cv_boundary_${Date.now().toString(36)}`
    const attachmentName = stripLineBreaks(cvFile.name || 'cv.pdf').replace(/"/g, '')
    const attachmentType = stripLineBreaks(cvFile.type) || 'application/octet-stream'

    // Create the email body
    const emailBody = [
      `To: ${to}`,
      `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
      "MIME-Version: 1.0",
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      "",
      `--${boundary}`,
      "Content-Type: text/html; charset=utf-8",
      "",
      `<html>
        <body>
          <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
        </body>
      </html>`,
      `--${boundary}`,
      `Content-Type: ${attachmentType}`,
      `Content-Disposition: attachment; filename="${attachmentName}"`,
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

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send email'
    console.error('Gmail API Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}