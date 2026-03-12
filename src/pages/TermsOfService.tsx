import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

const sections = [
  {
    title: "1. Introduction",
    content: `Welcome to SaathVerse. SaathVerse is a closed campus collaboration platform exclusively for verified students of registered educational institutions in India. By accessing or using the SaathVerse platform (available at saathverse.com and through associated mobile applications), you agree to be bound by these Terms and Conditions. Please read these Terms carefully before creating an account. If you do not agree with any part of these Terms, you must not use SaathVerse.`,
  },
  {
    title: "2. Eligibility and Account Creation",
    content: `**2.1 Who Can Use SaathVerse**

SaathVerse is available exclusively to:
• Currently enrolled students of educational institutions that have a registered partnership with SaathVerse
• Faculty or administrative staff of registered institutions, where applicable
• Alumni of registered institutions, where explicitly permitted by your institution

**2.2 Account Registration**

To create an account, you must:
• Register using a valid email address associated with your institution
• Complete the onboarding process including verification of your institution, branch, and year of study
• Provide accurate and truthful information during signup
• Be at least 18 years of age

You are responsible for maintaining the confidentiality of your login credentials. You must notify us immediately at support@saathverse.com if you suspect any unauthorised use of your account.`,
  },
  {
    title: "3. Acceptable Use Policy",
    content: `**3.1 Permitted Use**

You may use SaathVerse to:
• Connect and collaborate with other verified students within your institution
• Discover hackathons, clubs, events, and academic opportunities
• Share your academic projects, skills, and startup ideas
• Communicate with other students through the platform's messaging system
• Access alumni profiles and IEEE research resources

**3.2 Prohibited Activities**

You must not use SaathVerse to:
• Post false, misleading, or fraudulent information
• Harass, threaten, bully, or intimidate any other user
• Share obscene, sexually explicit, or pornographic content
• Discriminate against any user on the basis of gender, religion, caste, region, or any other protected characteristic
• Impersonate another person or misrepresent your institutional affiliation
• Spam other users through the messaging system or connection requests
• Attempt to circumvent the chat message limits or other platform restrictions through technical means
• Scrape, harvest, or collect data from SaathVerse without written permission
• Upload malicious software, viruses, or any harmful code
• Use the platform for commercial solicitation, multi-level marketing, or unauthorized advertising
• Share the login credentials of another student or access another user's account

Violation of this policy may result in immediate suspension or permanent termination of your account without notice.`,
  },
  {
    title: "4. User-Generated Content",
    content: `**4.1 Your Content**

You retain ownership of content you post on SaathVerse, including your profile information, startup ideas, messages, and any other material you submit. By posting content, you grant SaathVerse a non-exclusive, royalty-free licence to store, display, and use that content for the purpose of operating and improving the platform.

**4.2 Content Standards**

All content you post must be accurate, lawful, and respectful. You must not post content that:
• Infringes the intellectual property rights of any third party
• Contains personal or sensitive information of others without their consent
• Promotes violence, self-harm, or illegal activity
• Violates the privacy or dignity of any individual

**4.3 Content Removal**

SaathVerse reserves the right to remove any content that violates these Terms or that we consider inappropriate, offensive, or harmful, at our sole discretion and without prior notice.`,
  },
  {
    title: "5. Messaging and Communication",
    content: `The SaathVerse messaging system is subject to the following conditions:
• Each user is permitted a daily message limit as specified on the platform. This limit resets on a rolling 24-hour basis.
• Additional message capacity may be purchased for a nominal fee as communicated on the platform.
• All messages are subject to automatic deletion after 24 hours to maintain server efficiency. Do not use SaathVerse messages as a permanent storage or record.
• SaathVerse does not guarantee end-to-end encryption of messages. Do not share sensitive personal information, passwords, or financial details through the messaging system.`,
  },
  {
    title: "6. Privacy",
    content: `Your use of SaathVerse is also governed by our Privacy Policy, which is incorporated into these Terms by reference. By using the platform, you consent to the collection and use of your information as described in the Privacy Policy.

Female students have the option to hide their profile photographs from other students as a safety feature. This setting can be managed from your profile settings at any time.`,
  },
  {
    title: "7. Intellectual Property",
    content: `All content, design, code, trademarks, and materials on SaathVerse, excluding user-generated content, are the exclusive property of SaathVerse and its licensors. You may not copy, reproduce, distribute, or create derivative works from any platform content without our express written permission.

'SaathVerse' is a registered trademark. Unauthorised use of the name or logo is strictly prohibited.`,
  },
  {
    title: "8. Startup Ideas and Intellectual Property",
    content: `When you post a startup idea on SaathVerse:
• You retain full ownership of your idea. SaathVerse does not claim any rights over startup ideas posted on the platform.
• By posting publicly, you acknowledge that your idea will be visible to other verified students within your institution.
• SaathVerse is not responsible for any unauthorised use of your idea by other users. We strongly recommend filing appropriate intellectual property protections before disclosing sensitive business concepts.
• AI evaluation scores provided on startup ideas are for informational purposes only and do not constitute professional business or investment advice.`,
  },
  {
    title: "9. Payments and Fees",
    content: `Certain features on SaathVerse, such as additional daily messages or event tickets, may require payment. Where applicable:
• Payments are processed through third-party payment providers. SaathVerse does not store your payment card information.
• All transactions are in Indian Rupees (INR) unless otherwise specified.
• Fees are non-refundable except where required by applicable law or expressly stated at the time of purchase.
• SaathVerse reserves the right to change pricing at any time with reasonable notice.`,
  },
  {
    title: "10. Relationship with Your Institution",
    content: `SaathVerse operates under agreements with registered educational institutions. Your institution's administrators have the ability to manage platform settings, approve student registrations, and moderate content within their college's environment. SaathVerse is not responsible for decisions made by institutional administrators.

If your institution's agreement with SaathVerse is terminated, your access to the platform may be suspended. We will make reasonable efforts to provide advance notice where possible.`,
  },
  {
    title: "11. Disclaimers and Limitation of Liability",
    content: `SaathVerse is provided on an 'as is' and 'as available' basis. We do not warrant that:
• The platform will be uninterrupted, error-free, or free from viruses
• Information on the platform is accurate, complete, or current
• The platform will meet your specific requirements

To the maximum extent permitted by applicable Indian law, SaathVerse shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of or inability to use the platform, including but not limited to loss of data, loss of revenue, or reputational harm.

Our total liability to you for any claim arising from these Terms shall not exceed the amount you have paid to SaathVerse in the three months preceding the claim.`,
  },
  {
    title: "12. Safety and Reporting",
    content: `SaathVerse is committed to maintaining a safe environment for all users. If you experience or witness harassment, abuse, or any behaviour that violates these Terms:
• Use the in-app report button available on all user profiles and messages
• Contact us directly at support@saathverse.com

We take all reports seriously and will investigate promptly. Users found to be in violation of our safety policies will face account suspension or permanent ban.`,
  },
  {
    title: "13. Termination",
    content: `SaathVerse reserves the right to suspend or terminate your account at any time for violation of these Terms, suspected fraudulent activity, or any behaviour we deem harmful to the platform or its users.

You may delete your account at any time through your profile settings. Upon deletion, your data will be removed in accordance with our Privacy Policy.`,
  },
  {
    title: "14. Changes to These Terms",
    content: `SaathVerse may update these Terms from time to time. We will notify you of material changes through the platform or by email. Your continued use of SaathVerse after changes are posted constitutes your acceptance of the revised Terms.`,
  },
  {
    title: "15. Governing Law and Disputes",
    content: `These Terms are governed by the laws of India. Any dispute arising from or relating to these Terms shall be subject to the exclusive jurisdiction of the courts in India. We encourage you to contact us first at support@saathverse.com before initiating any legal proceedings. We are committed to resolving disputes amicably.`,
  },
  {
    title: "16. Contact Us",
    content: `If you have any questions about these Terms and Conditions, please contact us:

Email: support@saathverse.com
Website: saathverse.com

Last updated: March 2025`,
  },
];

const TermsOfService = () => {
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
            Terms and <span className="gradient-text">Conditions</span>
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

export default TermsOfService;
