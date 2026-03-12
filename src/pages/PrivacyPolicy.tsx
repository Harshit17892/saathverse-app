import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

const sections = [
  {
    title: "1. Introduction",
    content: `SaathVerse ('we', 'us', 'our') is committed to protecting the privacy and personal data of every student who uses our platform. This Privacy Policy explains what information we collect, why we collect it, how we use it, and your rights regarding your personal data. This Policy applies to all users of saathverse.com and any associated applications. By creating an account on SaathVerse, you acknowledge that you have read and understood this Privacy Policy.`,
  },
  {
    title: "2. Information We Collect",
    content: `**2.1 Information You Provide Directly**

When you register and use SaathVerse, you provide us with:
• Full name and email address
• Name and location of your educational institution
• Academic branch, year of study, and graduation year
• Profile photograph (optional for female students — see Section 6)
• Skills, bio, and social media links you choose to add
• Startup ideas, project descriptions, and team details you post
• Messages you send to other users through the platform
• Payment information processed via our third-party payment provider (we do not store card details)

**2.2 Information Collected Automatically**

When you use SaathVerse, we automatically collect:
• Device type, operating system, and browser information
• IP address and approximate geographic location
• Pages visited, features used, and time spent on the platform
• Login timestamps and session activity
• Error logs and crash reports

**2.3 Information from Third Parties**

We may receive information about you from:
• Your educational institution, for the purpose of verifying your student status
• Payment processors, to confirm the status of transactions`,
  },
  {
    title: "3. How We Use Your Information",
    content: `**3.1 Providing and Operating the Platform**

• Creating and managing your account
• Verifying your student status and institutional affiliation
• Enabling you to connect with other verified students
• Delivering messages and notifications
• Processing payments for premium features or event tickets

**3.2 Improving the Platform**

• Analysing usage patterns to improve features and user experience
• Troubleshooting technical issues and bugs
• Conducting internal research and analytics

**3.3 Safety and Security**

• Detecting and preventing fraudulent activity, abuse, and policy violations
• Enforcing our Terms and Conditions
• Responding to user reports of misconduct

**3.4 Communications**

• Sending you important updates about the platform
• Notifying you of connection requests, messages, and activity on your profile
• Sending announcements from your institution's administrators

We will not use your personal information for purposes incompatible with those described in this Policy without your prior consent.`,
  },
  {
    title: "4. How We Share Your Information",
    content: `**4.1 With Other Users on the Platform**

Your profile information — including your name, branch, year, skills, and bio — is visible to other verified students within your institution. Your profile photograph is visible according to your privacy settings. Messages you send are visible only to the intended recipient.

**4.2 With Your Institution**

Your institution's administrators have access to aggregated data about student activity on the platform within their college. They may also see your registration information and, where relevant to platform management, reports filed against your account.

**4.3 With Service Providers**

We share data with trusted third-party service providers who assist us in operating the platform, including:
• Database hosting and authentication services
• Platform hosting and deployment
• Payment processors for transaction handling
• Analytics providers for usage analysis

All service providers are contractually required to handle your data securely and only for the purposes we specify.

**4.4 Legal Requirements**

We may disclose your information where required by law, court order, or government authority, or where we believe disclosure is necessary to protect the rights, property, or safety of SaathVerse, our users, or the public.

**4.5 We Do Not Sell Your Data**

SaathVerse does not sell, rent, or trade your personal information to any third party for their marketing or commercial purposes. Ever.`,
  },
  {
    title: "5. Data Retention",
    content: `We retain your personal data for as long as your account is active and for a reasonable period thereafter to comply with legal obligations or resolve disputes.

Specific retention periods:
• Chat messages: automatically deleted after 24 hours
• Profile data: retained for the duration of your account and deleted within 30 days of account deletion
• Payment records: retained for 7 years as required by applicable tax and financial regulations
• Activity logs: retained for up to 12 months for security and abuse prevention purposes

You may request deletion of your account at any time. Upon deletion, your personal profile, messages, and posted content will be removed from public visibility within 30 days, except where retention is required by law.`,
  },
  {
    title: "6. Gender-Based Privacy Controls",
    content: `SaathVerse includes a unique privacy feature specifically designed for the safety of female students:

• Female students (as identified during registration) have the option to hide their profile photograph from other users on the platform.
• Male students do not have this option, as this asymmetric design is intentional and aimed at reducing harassment while maintaining professional discoverability.
• This setting can be enabled or disabled at any time from your profile settings.
• Regardless of photo visibility, a student's name, branch, and academic information remain visible to other verified students within their institution.

This feature reflects our commitment to building a safe campus environment. We will never override a user's chosen privacy settings without explicit consent.`,
  },
  {
    title: "7. Data Security",
    content: `We take the security of your personal data seriously and implement appropriate technical and organisational measures to protect it, including:
• Row-level security on our database ensuring students can only access data from their own institution
• Encrypted data transmission using HTTPS/TLS
• Secure authentication systems
• Regular security reviews and monitoring

However, no method of internet transmission or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your data, we cannot guarantee absolute security. In the event of a data breach that affects your rights or interests, we will notify you and the relevant authorities as required by law.`,
  },
  {
    title: "8. Your Rights",
    content: `As a user of SaathVerse, you have the following rights regarding your personal data:

**8.1 Right to Access**
You can view and download the personal information we hold about you by visiting your profile settings.

**8.2 Right to Correction**
You can update or correct your profile information at any time through the platform.

**8.3 Right to Deletion**
You can delete your account at any time. This will result in the removal of your profile and personal data in accordance with our retention policy described in Section 5.

**8.4 Right to Object**
You may object to certain uses of your data, such as analytics. Contact us at support@saathverse.com to make such a request.

**8.5 Right to Data Portability**
You may request a copy of your personal data in a machine-readable format by emailing support@saathverse.com.

To exercise any of these rights, please contact us at support@saathverse.com. We will respond to your request within 30 days.`,
  },
  {
    title: "9. Cookies and Tracking",
    content: `SaathVerse uses cookies and similar tracking technologies to:
• Maintain your login session
• Remember your preferences
• Analyse platform usage and performance

You can control cookie settings through your browser. Disabling certain cookies may affect the functionality of the platform.`,
  },
  {
    title: "10. Minimum Age",
    content: `SaathVerse is designed for students who are at least 18 years of age. We do not knowingly collect personal data from individuals under 18. If we become aware that a user under 18 has registered on the platform, we will take steps to delete their account and associated data promptly.`,
  },
  {
    title: "11. Artificial Intelligence Features",
    content: `SaathVerse uses AI-powered features including the automatic evaluation of startup ideas. Where AI is used:
• AI evaluation scores are generated for informational purposes only and do not constitute professional advice
• Your submitted idea content may be processed by our AI evaluation service to generate scores and feedback
• We do not use your startup ideas to train or improve any external AI model
• AI-generated content is clearly labelled on the platform`,
  },
  {
    title: "12. Changes to This Privacy Policy",
    content: `We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. When we make material changes, we will notify you through the platform or by email before the changes take effect.

Your continued use of SaathVerse after the updated Policy is posted constitutes your acceptance of the changes.`,
  },
  {
    title: "13. Contact Us",
    content: `If you have any questions, concerns, or requests regarding this Privacy Policy or how we handle your personal data, please contact us:

Email: support@saathverse.com
Website: saathverse.com

We are committed to working with you to resolve any concerns about your privacy.

Last updated: March 2025`,
  },
];

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background pt-20">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-20 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="font-display text-3xl sm:text-5xl font-bold text-foreground mb-3">
            Privacy <span className="gradient-text">Policy</span>
          </h1>
          <p className="text-muted-foreground text-sm">Effective Date: March 2025</p>
        </motion.div>

        <div className="space-y-10">
          {sections.map((section, i) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="glass rounded-2xl p-6 sm:p-8 border border-border/30"
            >
              <h2 className="font-display text-xl font-bold text-foreground mb-4">{section.title}</h2>
              <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {section.content.split("**").map((part, j) =>
                  j % 2 === 1 ? (
                    <strong key={j} className="text-foreground font-semibold">{part}</strong>
                  ) : (
                    <span key={j}>{part}</span>
                  )
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
