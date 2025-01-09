"use client"

import { Button } from "@/components/ui/button"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { 
  FileText, 
  MessageSquare, 
  ArrowRight, 
  Brain,
  FileSearch,
  MailCheck,
  FileOutput,
  List,
  BookOpen,
  CheckCircle2,
  Sparkles
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
}

const cardHover = {
  hover: {
    scale: 1.03,
    transition: {
      duration: 0.2
    }
  }
}

const FeatureCard = ({ icon: Icon, title, description, features, linkHref, linkText }) => (
  <motion.div
    variants={fadeInUp}
    whileHover="hover"
    // eslint-disable-next-line react/jsx-no-duplicate-props
    variants={cardHover}
  >
    <Card className="h-full">
      <CardHeader>
        <motion.div 
          className="flex items-center gap-2 mb-2"
          whileHover={{ scale: 1.05 }}
        >
          <Icon className="w-5 h-5 text-primary" />
          <CardTitle>{title}</CardTitle>
        </motion.div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <motion.ul 
          className="space-y-2 mb-6 text-sm"
          variants={staggerChildren}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.li 
              key={index} 
              className="flex items-center gap-2"
              variants={fadeInUp}
            >
              <ArrowRight className="w-4 h-4 text-primary" />
              {feature}
            </motion.li>
          ))}
        </motion.ul>
        <Button variant="secondary" className="w-full" asChild>
          <Link href={linkHref}>{linkText}</Link>
        </Button>
      </CardContent>
    </Card>
  </motion.div>
)

const ResumeAnalyzerDetails = () => (
  <motion.div 
    className="space-y-6"
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    variants={staggerChildren}
  >
    <motion.h3 
      className="text-2xl font-semibold"
      variants={fadeInUp}
    >
      Resume Analyzer Features
    </motion.h3>
    <div className="grid md:grid-cols-3 gap-6">
      {[
        {
          icon: FileSearch,
          title: "Smart Analysis",
          description: "Advanced AI algorithms analyze resumes to identify key skills, experiences, and qualifications. Provides detailed insights about candidate strengths and areas for improvement."
        },
        {
          icon: Brain,
          title: "Skills Assessment",
          description: "Automatically extracts and categorizes technical skills, soft skills, and industry expertise. Matches skills against job requirements and industry standards."
        },
        {
          icon: MailCheck,
          title: "Professional Reports",
          description: "Generates comprehensive reports and professional emails with feedback and recommendations. Perfect for recruiters and HR professionals."
        }
      ].map((item, index) => (
        <motion.div
          key={index}
          variants={fadeInUp}
          whileHover={{ scale: 1.05 }}
        >
          <Card>
            <CardHeader>
              <item.icon className="w-5 h-5 text-primary mb-2" />
              <CardTitle className="text-lg">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  </motion.div>
)

const FAQSection = () => (
  <motion.section 
    id="faq" 
    className="scroll-mt-16 py-16 px-4 max-w-3xl mx-auto"
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    variants={staggerChildren}
  >
    <motion.h2 
      className="text-3xl font-semibold text-center mb-8"
      variants={fadeInUp}
    >
      Frequently Asked Questions
    </motion.h2>
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="q1">
        <AccordionTrigger>How does the Resume Analyzer work?</AccordionTrigger>
        <AccordionContent>
          Our Resume Analyzer uses advanced AI to scan your resume, identify key skills and experiences, 
          and generate detailed reports. It analyzes both technical skills and soft skills, providing 
          comprehensive feedback and suggestions for improvement.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="q2">
        <AccordionTrigger>Can I convert any ChatGPT conversation to PDF?</AccordionTrigger>
        <AccordionContent>
          Yes! The Chat Converter can process any ChatGPT conversation. Simply paste your chat URL 
          or content, and our tool will organize it into a well-structured PDF with key points, 
          summaries, and categorized sections.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="q3">
        <AccordionTrigger>How accurate is the AI analysis?</AccordionTrigger>
        <AccordionContent>
          Our AI models are trained on extensive datasets and continuously improved. They provide 
          highly accurate analysis with detailed explanations, helping you understand the reasoning 
          behind each insight.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </motion.section>
)

const TestimonialsSection = () => (
  <motion.section 
    id="testimonials" 
    className="scroll-mt-16 py-16 px-4 bg-secondary/5"
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    variants={staggerChildren}
  >
    <div className="max-w-6xl mx-auto">
      <motion.h2 
        className="text-3xl font-semibold text-center mb-12"
        variants={fadeInUp}
      >
        What Our Users Say
      </motion.h2>
      <div className="grid md:grid-cols-3 gap-6">
        {[
          {
            title: "Streamlined Hiring Process",
            role: "HR Manager",
            content: "The Resume Analyzer has revolutionized our recruitment process. We save hours on each application while getting more detailed insights into candidates capabilities."
          },
          {
            title: "Perfect Documentation",
            role: "Technical Lead",
            content: "Converting ChatGPT conversations to PDFs has made it so much easier to document technical discussions and share knowledge within our team."
          },
          {
            title: "Exceptional Insights",
            role: "Career Coach",
            content: "The level of detail in the resume analysis helps my clients understand exactly what they need to improve. It's like having an expert assistant."
          }
        ].map((testimonial, index) => (
          <motion.div
            key={index}
            variants={fadeInUp}
            whileHover={{ scale: 1.05 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{testimonial.title}</CardTitle>
                <CardDescription>{testimonial.role}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  &quot;{testimonial.content}&quot;
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  </motion.section>
)

const CTASection = () => (
  <motion.section 
    className="py-20 px-4 bg-primary text-primary-foreground"
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    variants={staggerChildren}
  >
    <div className="max-w-4xl mx-auto text-center">
      <motion.h2 
        className="text-3xl font-semibold mb-4"
        variants={fadeInUp}
      >
        Ready to Get Started?
      </motion.h2>
      <motion.p 
        className="text-xl mb-8 opacity-90 "
        variants={fadeInUp}
      >
        Transform your document workflow today with our AI-powered tools.
      </motion.p>
      <motion.div 
        className="flex gap-4 justify-center"
        variants={fadeInUp}
      >
        <Button size="lg" variant="secondary" asChild>
          <Link href="/resume-analyzer">Try Resume Analyzer</Link>
        </Button>
        <Button size="lg" variant="outline" className="bg-transparent" asChild>
          <Link href="/chat-converter">Try Chat Converter</Link>
        </Button>
      </motion.div>
    </div>
  </motion.section>
)

const ContactSection = () => (
  <motion.section 
    id="contact" 
    className="scroll-mt-16 py-16 px-4 max-w-2xl mx-auto"
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    variants={staggerChildren}
  >
    <motion.h2 
      className="text-3xl font-semibold text-center mb-8"
      variants={fadeInUp}
    >
      Get in Touch
    </motion.h2>
    <motion.div variants={fadeInUp}>
      <Card>
        <CardContent className="pt-6">
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  className="w-full p-2 border rounded-md"
                  placeholder="your@email.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <textarea
                className="w-full p-2 border rounded-md h-32"
                placeholder="How can we help?"
              />
            </div>
            <Button className="w-full">Send Message</Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  </motion.section>
)

const ChatConverterDetails = () => (
  <motion.div 
    className="space-y-6"
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    variants={staggerChildren}
  >
    <motion.h3 
      className="text-2xl font-semibold"
      variants={fadeInUp}
    >
      Chat Converter Features
    </motion.h3>
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="conversion">
        <AccordionTrigger>
          <div className="flex items-center gap-2">
            <FileOutput className="w-5 h-5" />
            Smart Conversion
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <ul className="space-y-2 ml-7">
            <li>Convert ChatGPT conversations into well-structured PDF documents</li>
            <li>Maintain formatting and conversation flow</li>
            <li>Support for code blocks and technical content</li>
          </ul>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="insights">
        <AccordionTrigger>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            AI-Powered Insights
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <ul className="space-y-2 ml-7">
            <li>Extract key takeaways and important points automatically</li>
            <li>Generate summaries of technical discussions</li>
            <li>Identify action items and follow-ups</li>
          </ul>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="organization">
        <AccordionTrigger>
          <div className="flex items-center gap-2">
            <List className="w-5 h-5" />
            Content Organization
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <ul className="space-y-2 ml-7">
            <li>Organize Q&A sections for easy reference</li>
            <li>Create table of contents for longer conversations</li>
            <li>Tag and categorize different types of content</li>
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </motion.div>
)

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="bg-gradient-to-b mt-20 from-white to-gray-50">
        {/* Hero Section */}
        <motion.section 
          className="py-20 px-4 text-center"
          initial="hidden"
          animate="visible"
          variants={staggerChildren}
        >
          <motion.h1 
            className="text-4xl font-bold tracking-tight sm:text-6xl mb-6"
            variants={fadeInUp}
          >
            AI-Powered Document Tools
          </motion.h1>
          <motion.p 
            className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
            variants={fadeInUp}
          >
            Transform your resume analysis and chat conversations into actionable insights with our advanced AI tools.
          </motion.p>
          <motion.div 
            className="flex gap-4 justify-center"
            variants={fadeInUp}
          >
            <Button asChild size="lg">
              <Link href="/resume-analyzer">Get Started</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/chat-converter">Try Chat Converter</Link>
            </Button>
          </motion.div>
        </motion.section>

        {/* Main Features */}
        <motion.section 
          id="tools" 
          className="scroll-mt-16 py-16 px-4 max-w-6xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerChildren}
        >
          <motion.h2 
            className="text-3xl font-semibold text-center mb-12"
            variants={fadeInUp}
          >
            Our Tools
          </motion.h2>
          <motion.div 
            className="grid md:grid-cols-2 gap-8 mb-16"
            variants={staggerChildren}
          >
            <FeatureCard 
              icon={FileText}
              title="Resume Analyzer"
              description="Advanced resume analysis and report generation"
              features={[
                "AI-powered skill extraction and analysis",
                "Comprehensive candidate assessment",
                "Automated professional report generation",
                "Customizable email templates"
              ]}
              linkHref="/resume-analyzer"
              linkText="Analyze Resume"
            />
            <FeatureCard 
              icon={MessageSquare}
              title="Chat Converter"
              description="Convert ChatGPT conversations into structured PDFs"
              features={[
                "Smart conversation parsing and formatting",
                "Automatic key points extraction",
                "Q&A organization and categorization",
                "Professional PDF generation"
              ]}
              linkHref="/chat-converter"
              linkText="Convert Chat"
            />
          </motion.div>

          {/* Detailed Sections */}
          <motion.div 
            id="features" 
            className="scroll-mt-16 space-y-16"
            variants={staggerChildren}
          >
            <ResumeAnalyzerDetails />
            <ChatConverterDetails />
          </motion.div>
        </motion.section>

        {/* Why Choose Us */}
        <motion.section 
          id="why-us" 
          className="scroll-mt-16 py-16 px-4 bg-primary/5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerChildren}
        >
          <div className="max-w-6xl mx-auto">
            <motion.h2 
              className="text-3xl font-semibold text-center mb-8"
              variants={fadeInUp}
            >
              Why Choose Our Tools
            </motion.h2>
            <motion.div 
              className="grid md:grid-cols-3 gap-6"
              variants={staggerChildren}
            >
              {[
                {
                  icon: Brain,
                  title: "AI-Powered Analysis",
                  description: "Advanced machine learning algorithms provide deep insights and accurate analysis"
                },
                {
                  icon: CheckCircle2,
                  title: "Time-Saving",
                  description: "Automate manual tasks and get professional results in minutes instead of hours"
                },
                {
                  icon: BookOpen,
                  title: "Easy to Use",
                  description: "Intuitive interface and clear workflows make our tools accessible to everyone"
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  whileHover={{ scale: 1.05 }}
                >
                  <Card className="bg-white">
                    <CardHeader>
                      <item.icon className="w-5 h-5 text-primary mb-2" />
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        <TestimonialsSection />
        <FAQSection />
        <CTASection />
        <ContactSection />

        {/* Footer */}
        <motion.footer 
          className="py-8 px-4 text-center text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p>© 2025 The AI Tools • Powered by AI</p>
        </motion.footer>
      </div>
    </div>
  )
}