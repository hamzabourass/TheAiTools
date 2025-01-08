"use client"
import ChatExtractor from '@/components/ChatExtractor';
import { Header } from '@/components/Header';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

export default function ChatPage() {

  const { data: session, status } = useSession()

if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!session) {
    redirect('/signin')
  }
  
  return <>
  <Header />
  <ChatExtractor />
  </>;
}