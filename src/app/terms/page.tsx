import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const TermsOfServicePage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold">
            The AI Tools
          </Link>
          <div className="flex gap-4">
            <Link href="/privacy">
              <Button variant="ghost">Privacy Policy</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-slate max-w-none">
          <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
          <p className="text-gray-500 mb-8">Last Updated: January 13, 2025</p>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="mb-4">
              Welcome to The AI Tools ("we," "our," or "us"). These Terms of Service ("Terms") govern 
              your access to and use of our platform and services. By using our services, you agree 
              to be bound by these terms.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">2. Our Services</h2>
            <p className="mb-4">The AI Tools platform provides the following services:</p>
            <div className="pl-6 mb-6">
              <h3 className="text-lg font-medium mb-2">2.1 Resume Analyzer</h3>
              <p className="mb-4">
                Our Resume Analyzer service evaluates CVs against job descriptions, providing 
                detailed compatibility reports and improvement suggestions. Users can generate 
                and send emails directly through the platform.
              </p>

              <h3 className="text-lg font-medium mb-2">2.2 ChatGPT Extractor</h3>
              <p className="mb-4">
                This tool processes ChatGPT conversation URLs to create comprehensive PDF 
                documents containing notes, summaries, and Q&A content.
              </p>

              <h3 className="text-lg font-medium mb-2">2.3 Data Generation Tool</h3>
              <p className="mb-4">
                Users can generate synthetic data in CSV format based on their specific 
                requirements and prompts.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">3. User Responsibilities</h2>
            <p className="mb-4">By using our services, you agree to:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Use the platform in compliance with all applicable laws and regulations</li>
              <li>Maintain the confidentiality of your account credentials</li>
              <li>Take responsibility for all activities conducted through your account</li>
              <li>Not engage in any harmful or malicious activities</li>
              <li>Not attempt to interfere with or disrupt our services</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">4. Intellectual Property</h2>
            <p className="mb-4">
              All content, features, and functionality of the platform are owned by The AI Tools 
              and are protected by international intellectual property laws. Users may not:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Copy, modify, or distribute platform content without permission</li>
              <li>Reverse engineer or decompile any part of our services</li>
              <li>Remove any copyright or proprietary notices</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">5. Limitation of Liability</h2>
            <p className="mb-4">
              The AI Tools shall not be liable for any damages arising from:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Use or inability to use our services</li>
              <li>Any content obtained through the platform</li>
              <li>Unauthorized access to your data</li>
              <li>Service interruptions or data loss</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">6. Governing Law</h2>
            <p className="mb-4">
              These Terms shall be governed by and construed in accordance with the laws of 
              [Your Country/State], without regard to its conflict of law principles.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">7. Changes to Terms</h2>
            <p className="mb-4">
              We reserve the right to modify these Terms at any time. We will notify users of 
              any material changes through our platform. Your continued use of our services 
              following such modifications constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">8. Contact Information</h2>
            <p className="mb-4">
              If you have any questions about these Terms, please contact us at:
              <p className='text-12 font-bold'>theaitools@gmail.com</p>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default TermsOfServicePage;