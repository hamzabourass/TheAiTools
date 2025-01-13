import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold">
            The AI Tools
          </Link>
          <div className="flex gap-4">
            <Link href="/terms">
              <Button variant="ghost">Terms of Service</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-slate max-w-none">
          <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-gray-500 mb-8">Last Updated: January 13, 2025</p>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="mb-4">
              At The AI Tools, we are committed to protecting your privacy and handling your data 
              with transparency. This Privacy Policy explains how we collect, use, and safeguard 
              your personal information when you use our platform.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            
            <h3 className="text-lg font-medium mb-2">2.1 Personal Information</h3>
            <p className="mb-4">We collect the following types of personal information:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Name and email address</li>
              <li>Resume content and job descriptions</li>
              <li>ChatGPT conversation data</li>
              <li>Account credentials</li>
            </ul>

            <h3 className="text-lg font-medium mb-2">2.2 Automatically Collected Information</h3>
            <p className="mb-4">We automatically collect:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Usage data and analytics</li>
              <li>Device and browser information</li>
              <li>IP address and location data</li>
              <li>Log files and performance data</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            
            <h3 className="text-lg font-medium mb-2">3.1 Service Provision</h3>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Analyzing resumes and generating compatibility reports</li>
              <li>Processing ChatGPT conversations and creating PDF documents</li>
              <li>Generating synthetic data based on specifications</li>
              <li>Maintaining and improving our services</li>
            </ul>

            <h3 className="text-lg font-medium mb-2">3.2 Communications</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Sending service-related notifications</li>
              <li>Responding to your inquiries and support requests</li>
              <li>Providing updates about our services</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">4. Data Sharing</h2>
            <p className="mb-4">
              We do not sell your personal information. We may share your information in the 
              following circumstances:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>With your explicit consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights, privacy, safety, or property</li>
              <li>In connection with a business transfer or merger</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
            <p className="mb-4">
              We implement appropriate technical and organizational measures to protect your 
              personal information, including:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security assessments</li>
              <li>Access controls and authentication mechanisms</li>
              <li>Secure data storage and processing practices</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate or incomplete data</li>
              <li>Request deletion of your personal information</li>
              <li>Object to certain data processing activities</li>
              <li>Export your data in a portable format</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">7. Changes to This Policy</h2>
            <p className="mb-4">
              We may update this Privacy Policy periodically. We will notify you of any material 
              changes through our platform or via email. Your continued use of our services 
              after such modifications constitutes acceptance of the updated Policy.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
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

export default PrivacyPolicyPage;