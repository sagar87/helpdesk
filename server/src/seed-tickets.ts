import "dotenv/config";
import { db } from "./lib/db";
import { TicketStatus, TicketCategory } from "./generated/prisma/enums";

const statuses = [TicketStatus.OPEN, TicketStatus.RESOLVED, TicketStatus.CLOSED];
const categories = [
  TicketCategory.GENERAL_QUESTION,
  TicketCategory.TECHNICAL_QUESTION,
  TicketCategory.REFUND_REQUEST,
  null,
];

const tickets: {
  subject: string;
  body: string;
  senderName: string;
  senderEmail: string;
  status: TicketStatus;
  category: TicketCategory | null;
}[] = [
  // GENERAL_QUESTION tickets
  { subject: "How do I change my account email?", body: "I recently changed jobs and need to update my email address on file. Can you help me with that?", senderName: "Alice Johnson", senderEmail: "alice.johnson@gmail.com", status: TicketStatus.OPEN, category: TicketCategory.GENERAL_QUESTION },
  { subject: "What are your business hours?", body: "I'd like to know when your support team is available for phone calls.", senderName: "Bob Smith", senderEmail: "bob.smith@outlook.com", status: TicketStatus.RESOLVED, category: TicketCategory.GENERAL_QUESTION },
  { subject: "Do you offer student discounts?", body: "I'm currently enrolled at MIT and wondering if there are any educational pricing options.", senderName: "Chloe Park", senderEmail: "chloe.park@mit.edu", status: TicketStatus.OPEN, category: TicketCategory.GENERAL_QUESTION },
  { subject: "How to add a team member to my account?", body: "Our team just hired a new developer and I need to add them to our workspace. What's the process?", senderName: "David Chen", senderEmail: "d.chen@techstartup.io", status: TicketStatus.CLOSED, category: TicketCategory.GENERAL_QUESTION },
  { subject: "Where can I find my invoices?", body: "I need to download my invoices from the past 6 months for tax purposes. Where do I find them?", senderName: "Emily Davis", senderEmail: "emily.davis@company.com", status: TicketStatus.RESOLVED, category: TicketCategory.GENERAL_QUESTION },
  { subject: "Account verification taking too long", body: "I submitted my verification documents 5 days ago and haven't heard back. Is this normal?", senderName: "Frank Miller", senderEmail: "frank.miller@yahoo.com", status: TicketStatus.OPEN, category: TicketCategory.GENERAL_QUESTION },
  { subject: "Can I transfer my subscription to another person?", body: "I'm leaving the company and would like to transfer my pro subscription to my colleague.", senderName: "Grace Lee", senderEmail: "grace.lee@enterprise.co", status: TicketStatus.OPEN, category: TicketCategory.GENERAL_QUESTION },
  { subject: "How to enable two-factor authentication?", body: "Our IT department requires 2FA on all third-party tools. How do I set this up?", senderName: "Henry Wilson", senderEmail: "h.wilson@securecorp.com", status: TicketStatus.RESOLVED, category: TicketCategory.GENERAL_QUESTION },
  { subject: "What payment methods do you accept?", body: "We need to pay via wire transfer instead of credit card. Is that possible?", senderName: "Irene Zhang", senderEmail: "irene.z@globalfirm.com", status: TicketStatus.CLOSED, category: TicketCategory.GENERAL_QUESTION },
  { subject: "How to export my data?", body: "I'd like to export all my project data to CSV. Is there a bulk export feature?", senderName: "Jack Brown", senderEmail: "jack.brown@freelancer.com", status: TicketStatus.OPEN, category: TicketCategory.GENERAL_QUESTION },
  { subject: "Is there a mobile app?", body: "I travel a lot and would love to manage my account from my phone. Do you have an iOS app?", senderName: "Karen White", senderEmail: "karen.w@travelco.com", status: TicketStatus.RESOLVED, category: TicketCategory.GENERAL_QUESTION },
  { subject: "Can I customize notification preferences?", body: "I'm getting too many email notifications. How can I turn off non-essential ones?", senderName: "Leo Martinez", senderEmail: "leo.m@design.studio", status: TicketStatus.OPEN, category: TicketCategory.GENERAL_QUESTION },

  // TECHNICAL_QUESTION tickets
  { subject: "API returning 500 error on bulk import", body: "When I try to import more than 500 records via the API, I consistently get a 500 Internal Server Error. Smaller batches work fine.", senderName: "Maria Garcia", senderEmail: "maria.garcia@devshop.io", status: TicketStatus.OPEN, category: TicketCategory.TECHNICAL_QUESTION },
  { subject: "Webhook events not being delivered", body: "We set up webhooks for order.created events but haven't received any callbacks in the past 24 hours. Our endpoint is healthy.", senderName: "Nathan Patel", senderEmail: "nathan@ecommerce.com", status: TicketStatus.OPEN, category: TicketCategory.TECHNICAL_QUESTION },
  { subject: "OAuth token refresh failing silently", body: "Our integration's OAuth tokens expire after 1 hour but the refresh flow returns a 200 with an empty body instead of new tokens.", senderName: "Olivia Kim", senderEmail: "olivia.kim@saasplatform.io", status: TicketStatus.RESOLVED, category: TicketCategory.TECHNICAL_QUESTION },
  { subject: "Dashboard loading extremely slowly", body: "Our analytics dashboard takes 45+ seconds to load. It was fine until last week. We haven't changed anything on our end.", senderName: "Paul Robinson", senderEmail: "p.robinson@analytics.co", status: TicketStatus.OPEN, category: TicketCategory.TECHNICAL_QUESTION },
  { subject: "CSV upload fails with special characters", body: "When our CSV file contains names with accents (é, ñ, ü), the upload fails with a parsing error. UTF-8 encoding confirmed.", senderName: "Quinn Adams", senderEmail: "quinn@dataworks.com", status: TicketStatus.RESOLVED, category: TicketCategory.TECHNICAL_QUESTION },
  { subject: "SSO integration not redirecting properly", body: "After configuring SAML SSO with Okta, users are stuck in a redirect loop when trying to log in.", senderName: "Rachel Thompson", senderEmail: "rachel.t@megacorp.com", status: TicketStatus.OPEN, category: TicketCategory.TECHNICAL_QUESTION },
  { subject: "Rate limiting too aggressive for our use case", body: "We're hitting the 100 req/min rate limit during normal operations. Our workflow requires ~200 API calls per minute.", senderName: "Sam Anderson", senderEmail: "sam@highvolume.io", status: TicketStatus.CLOSED, category: TicketCategory.TECHNICAL_QUESTION },
  { subject: "Cannot connect database via SSL", body: "I'm trying to connect to the managed database with SSL enabled but getting certificate verification errors.", senderName: "Tina Nguyen", senderEmail: "tina.n@cloudops.dev", status: TicketStatus.OPEN, category: TicketCategory.TECHNICAL_QUESTION },
  { subject: "GraphQL query returning stale data", body: "Our GraphQL queries return cached data even after mutations. Setting cache-control to no-cache doesn't help.", senderName: "Uma Sharma", senderEmail: "uma@apifirst.com", status: TicketStatus.RESOLVED, category: TicketCategory.TECHNICAL_QUESTION },
  { subject: "File upload size limit not documented", body: "We're getting a 413 error when uploading files over 10MB but the docs say the limit is 50MB. Which is correct?", senderName: "Victor Ivanov", senderEmail: "victor.i@contentplatform.com", status: TicketStatus.OPEN, category: TicketCategory.TECHNICAL_QUESTION },
  { subject: "Timezone handling incorrect in reports", body: "All timestamps in exported reports show UTC instead of our configured timezone (America/New_York).", senderName: "Wendy Zhao", senderEmail: "wendy.z@reporting.co", status: TicketStatus.OPEN, category: TicketCategory.TECHNICAL_QUESTION },
  { subject: "SDK throwing deprecation warnings", body: "After updating to v3.2.0 of your Node.js SDK, we see deprecation warnings on every API call. Should we be concerned?", senderName: "Xavier Lopez", senderEmail: "xavier@modernstack.dev", status: TicketStatus.RESOLVED, category: TicketCategory.TECHNICAL_QUESTION },
  { subject: "Search index out of sync", body: "Search results are not reflecting recently created records. There seems to be a significant indexing delay.", senderName: "Yuki Tanaka", senderEmail: "yuki.t@searchapp.co.jp", status: TicketStatus.OPEN, category: TicketCategory.TECHNICAL_QUESTION },
  { subject: "Pagination broken on the /users endpoint", body: "The /users endpoint returns the same results for page=1 and page=2. The total count shows 500+ records.", senderName: "Zara Khan", senderEmail: "zara.k@webagency.com", status: TicketStatus.CLOSED, category: TicketCategory.TECHNICAL_QUESTION },
  { subject: "Memory leak in background worker", body: "Our background job worker process grows to 2GB+ memory after running for a few hours. Restarting temporarily fixes it.", senderName: "Alan Foster", senderEmail: "alan.f@scalableops.com", status: TicketStatus.OPEN, category: TicketCategory.TECHNICAL_QUESTION },
  { subject: "CORS error when calling API from subdomain", body: "We get CORS errors when calling the API from app.ourdomain.com even though ourdomain.com works fine.", senderName: "Bianca Rivera", senderEmail: "bianca@multidomain.io", status: TicketStatus.RESOLVED, category: TicketCategory.TECHNICAL_QUESTION },

  // REFUND_REQUEST tickets
  { subject: "Charged twice for monthly subscription", body: "I was charged $49.99 twice on March 15th. My bank statement shows two identical transactions. Please refund the duplicate.", senderName: "Carlos Mendez", senderEmail: "carlos.m@personalmail.com", status: TicketStatus.OPEN, category: TicketCategory.REFUND_REQUEST },
  { subject: "Cancelled within trial period but still charged", body: "I signed up for the free trial and cancelled on day 12 (before the 14-day trial ended) but was still charged $99.", senderName: "Diana Frost", senderEmail: "diana.frost@email.com", status: TicketStatus.OPEN, category: TicketCategory.REFUND_REQUEST },
  { subject: "Service was down for 3 days — requesting credit", body: "Your service experienced a major outage from March 1-3 that affected our production systems. We'd like a prorated credit.", senderName: "Eduardo Santos", senderEmail: "eduardo@reliablehost.com", status: TicketStatus.RESOLVED, category: TicketCategory.REFUND_REQUEST },
  { subject: "Accidentally upgraded to enterprise plan", body: "I meant to click the Pro plan but accidentally selected Enterprise and was charged $499. I need the Pro plan at $99.", senderName: "Fiona O'Brien", senderEmail: "fiona.obrien@smallbiz.com", status: TicketStatus.OPEN, category: TicketCategory.REFUND_REQUEST },
  { subject: "Feature advertised but not available", body: "I purchased the plan specifically for the AI analysis feature shown on your pricing page, but it says 'Coming Soon' in the app.", senderName: "George Hoffman", senderEmail: "g.hoffman@buyer.com", status: TicketStatus.OPEN, category: TicketCategory.REFUND_REQUEST },
  { subject: "Refund for unused annual subscription", body: "I paid for an annual plan in January but our company switched to a competitor in February. Can I get a prorated refund?", senderName: "Hannah Clark", senderEmail: "hannah.c@switchedco.com", status: TicketStatus.CLOSED, category: TicketCategory.REFUND_REQUEST },
  { subject: "Charged after account deletion", body: "I deleted my account on Feb 28 but was charged again on March 1. The account no longer exists. Please refund.", senderName: "Ian Stewart", senderEmail: "ian.stewart@protonmail.com", status: TicketStatus.OPEN, category: TicketCategory.REFUND_REQUEST },
  { subject: "Wrong currency charged on invoice", body: "My account is set to EUR but I was charged in USD, resulting in a higher amount due to conversion fees.", senderName: "Julia Becker", senderEmail: "julia.b@eucompany.de", status: TicketStatus.RESOLVED, category: TicketCategory.REFUND_REQUEST },
  { subject: "Renewal charge not expected", body: "I thought I had turned off auto-renewal last year but was charged $199 for another year. I don't need the service anymore.", senderName: "Kevin Murphy", senderEmail: "kevin.murphy@retired.net", status: TicketStatus.OPEN, category: TicketCategory.REFUND_REQUEST },
  { subject: "Purchased wrong add-on", body: "I bought the 'Extra Storage' add-on for $29/mo but actually needed 'Extra Users'. Can you swap them and refund the difference?", senderName: "Laura Simmons", senderEmail: "laura.s@growing.co", status: TicketStatus.RESOLVED, category: TicketCategory.REFUND_REQUEST },

  // Tickets with no category
  { subject: "Just wanted to say thanks!", body: "Your support team helped me resolve a critical issue last week. Just wanted to send a thank you note.", senderName: "Mike Turner", senderEmail: "mike.t@happycustomer.com", status: TicketStatus.CLOSED, category: null },
  { subject: "Feedback on the new UI", body: "The new dashboard redesign looks great but the contrast on the sidebar text is too low for accessibility.", senderName: "Nina Petrova", senderEmail: "nina.p@uxreview.org", status: TicketStatus.OPEN, category: null },
  { subject: "Partnership inquiry", body: "We're a dev tool company and would love to explore integration opportunities. Who should I talk to?", senderName: "Oscar Reyes", senderEmail: "oscar@partnertools.com", status: TicketStatus.OPEN, category: null },
  { subject: "Request for SOC 2 compliance report", body: "Our security team needs your SOC 2 Type II report before we can proceed with procurement.", senderName: "Patricia Wong", senderEmail: "p.wong@procurement.co", status: TicketStatus.RESOLVED, category: null },
  { subject: "Account locked after password reset", body: "I reset my password but now my account is locked and I can't log in. I've tried 3 times.", senderName: "Raj Kapoor", senderEmail: "raj.k@locked.out", status: TicketStatus.OPEN, category: null },
  { subject: "Inquiry about GDPR data deletion", body: "Under GDPR Article 17, I'm requesting complete deletion of all my personal data from your systems.", senderName: "Sophie Laurent", senderEmail: "sophie.l@privacyaware.eu", status: TicketStatus.OPEN, category: null },
  { subject: "Your email went to spam", body: "FYI, your password reset emails are landing in Gmail's spam folder. You might have a DKIM/SPF issue.", senderName: "Tom Harris", senderEmail: "tom.harris@gmail.com", status: TicketStatus.RESOLVED, category: null },
  { subject: "Can I get a demo for my team?", body: "We have 15 people who would benefit from a live walkthrough. Can we schedule a group demo next week?", senderName: "Ursula Meyer", senderEmail: "u.meyer@enterprise.de", status: TicketStatus.OPEN, category: null },
  { subject: "Bug: notification badge stuck at 99+", body: "The notification badge shows 99+ even after I've read all notifications and cleared them.", senderName: "Vincent Russo", senderEmail: "v.russo@bugfinder.com", status: TicketStatus.OPEN, category: null },
  { subject: "Accessibility issue with color picker", body: "The color picker component doesn't work with screen readers. This is a blocker for our team.", senderName: "Wei Lin", senderEmail: "wei.lin@a11y.org", status: TicketStatus.OPEN, category: null },

  // More diverse tickets to reach 100
  { subject: "Bulk delete not working on Firefox", body: "The select-all checkbox and bulk delete button don't work on Firefox 125. Works fine on Chrome.", senderName: "Amelia Foster", senderEmail: "amelia.f@crossbrowser.qa", status: TicketStatus.OPEN, category: TicketCategory.TECHNICAL_QUESTION },
  { subject: "How to set up custom domain?", body: "I want to use docs.mycompany.com instead of the default subdomain. What DNS records do I need?", senderName: "Brandon Yates", senderEmail: "brandon@customdomain.com", status: TicketStatus.RESOLVED, category: TicketCategory.TECHNICAL_QUESTION },
  { subject: "Image thumbnails not generating", body: "Uploaded images show as broken thumbnails in the gallery view. The original files are accessible though.", senderName: "Carmen Diaz", senderEmail: "carmen.d@photostudio.com", status: TicketStatus.OPEN, category: TicketCategory.TECHNICAL_QUESTION },
  { subject: "Requesting volume discount for 500 seats", body: "We're planning to roll out your tool across our entire engineering org (500+ people). What volume pricing is available?", senderName: "Derek Nash", senderEmail: "derek.nash@bigtech.com", status: TicketStatus.OPEN, category: TicketCategory.GENERAL_QUESTION },
  { subject: "Auto-save not working in editor", body: "I lost 2 hours of work because the auto-save feature didn't trigger. The manual save button works though.", senderName: "Elena Volkov", senderEmail: "elena.v@writer.co", status: TicketStatus.OPEN, category: TicketCategory.TECHNICAL_QUESTION },
  { subject: "Refund for team members who never activated", body: "We purchased 10 seats but only 6 people activated. Can we get a refund for the 4 unused licenses?", senderName: "Felix Braun", senderEmail: "felix.b@overprovisioned.com", status: TicketStatus.OPEN, category: TicketCategory.REFUND_REQUEST },
  { subject: "Calendar integration showing wrong times", body: "Events synced from your app to Google Calendar show up 1 hour early. We're in EST timezone.", senderName: "Gina Morales", senderEmail: "gina.m@scheduling.io", status: TicketStatus.RESOLVED, category: TicketCategory.TECHNICAL_QUESTION },
  { subject: "Do you support HIPAA compliance?", body: "We're a healthcare startup and need to ensure your platform meets HIPAA requirements before we can use it.", senderName: "Howard Price", senderEmail: "howard.p@healthtech.com", status: TicketStatus.OPEN, category: TicketCategory.GENERAL_QUESTION },
  { subject: "Email templates not rendering correctly", body: "The HTML email templates from your platform look broken in Outlook 2019. Gmail and Apple Mail are fine.", senderName: "Isabel Cruz", senderEmail: "isabel.c@emailmarketing.com", status: TicketStatus.OPEN, category: TicketCategory.TECHNICAL_QUESTION },
  { subject: "Duplicate charge on credit card", body: "My Visa ending in 4242 was charged $79 twice on March 20th. Transaction IDs: TXN-8834 and TXN-8835.", senderName: "James Wright", senderEmail: "james.w@doublecharged.com", status: TicketStatus.OPEN, category: TicketCategory.REFUND_REQUEST },
  { subject: "Keyboard shortcuts not working on Mac", body: "None of the documented keyboard shortcuts (Cmd+K, Cmd+Shift+P, etc.) work on macOS Sonoma.", senderName: "Kira Nakamura", senderEmail: "kira.n@macuser.jp", status: TicketStatus.OPEN, category: TicketCategory.TECHNICAL_QUESTION },
  { subject: "Need to change our billing contact", body: "Our finance person left the company. I need to update the billing email from old@company.com to new@company.com.", senderName: "Larry Cooper", senderEmail: "larry.c@accounting.co", status: TicketStatus.RESOLVED, category: TicketCategory.GENERAL_QUESTION },
  { subject: "Audit log missing entries", body: "Our compliance team noticed that some admin actions from last Tuesday are not showing up in the audit log.", senderName: "Mona Hassan", senderEmail: "mona.h@auditready.com", status: TicketStatus.OPEN, category: TicketCategory.TECHNICAL_QUESTION },
  { subject: "Print layout cuts off content", body: "When printing reports from the dashboard, the right side of tables gets cut off on A4 paper size.", senderName: "Noel Durand", senderEmail: "noel.d@printissue.fr", status: TicketStatus.RESOLVED, category: TicketCategory.TECHNICAL_QUESTION },
  { subject: "Onboarding guide is outdated", body: "The getting started guide references features and UI that no longer exist. It's confusing for new users.", senderName: "Olga Smirnova", senderEmail: "olga.s@newuser.ru", status: TicketStatus.OPEN, category: null },
  { subject: "Charged annual rate instead of monthly", body: "I selected monthly billing but was charged $588 (annual rate) instead of $49/month. Please fix and refund the difference.", senderName: "Peter Langford", senderEmail: "peter.l@monthlypls.com", status: TicketStatus.OPEN, category: TicketCategory.REFUND_REQUEST },
  { subject: "Dark mode breaks chart colors", body: "In dark mode, the pie chart and bar chart colors become nearly invisible against the dark background.", senderName: "Rosa Fernandez", senderEmail: "rosa.f@darkmode.fan", status: TicketStatus.OPEN, category: TicketCategory.TECHNICAL_QUESTION },
  { subject: "How to restore a deleted project?", body: "I accidentally deleted a project with 6 months of data. Is there a way to recover it? It was deleted about 2 hours ago.", senderName: "Steve Hancock", senderEmail: "steve.h@panicmode.com", status: TicketStatus.OPEN, category: TicketCategory.GENERAL_QUESTION },
  { subject: "PDF export has wrong page margins", body: "Exported PDFs have huge margins that waste half the page. There's no option to customize the margins.", senderName: "Tammy Rhodes", senderEmail: "tammy.r@pdfhater.com", status: TicketStatus.RESOLVED, category: TicketCategory.TECHNICAL_QUESTION },
  { subject: "Unable to cancel my subscription", body: "The cancel button in account settings is greyed out and I can't click it. I've been trying for a week.", senderName: "Usman Ali", senderEmail: "usman.a@cantcancel.pk", status: TicketStatus.OPEN, category: TicketCategory.GENERAL_QUESTION },
  { subject: "Webhook payload missing order_id field", body: "The webhook payload for order.updated events doesn't include the order_id field that's documented in the API reference.", senderName: "Vera Johansson", senderEmail: "vera.j@integrations.se", status: TicketStatus.OPEN, category: TicketCategory.TECHNICAL_QUESTION },
  { subject: "Requesting W-9 form for tax purposes", body: "Our accounting department requires a W-9 from all vendors. Can you provide one?", senderName: "William Brooks", senderEmail: "w.brooks@taxseason.com", status: TicketStatus.RESOLVED, category: null },
  { subject: "Login page showing blank white screen", body: "Since this morning, the login page shows nothing — just a white screen. Console shows a JavaScript error.", senderName: "Xena Douglas", senderEmail: "xena.d@cantlogin.com", status: TicketStatus.OPEN, category: TicketCategory.TECHNICAL_QUESTION },
  { subject: "Feature request: dark mode for emails", body: "Your in-app experience supports dark mode but the notification emails are blindingly white. Any plans to fix this?", senderName: "Yolanda Greene", senderEmail: "yolanda.g@nightowl.com", status: TicketStatus.OPEN, category: null },
  { subject: "Pro-rated refund after downgrade", body: "I downgraded from Enterprise to Pro mid-cycle. I should be credited the difference for the remaining 18 days.", senderName: "Zach Palmer", senderEmail: "zach.p@budgetcut.com", status: TicketStatus.OPEN, category: TicketCategory.REFUND_REQUEST },
  { subject: "Two-factor auth codes not arriving via SMS", body: "I'm not receiving SMS codes for 2FA. I've verified my phone number is correct. Email codes work fine.", senderName: "Abigail Stone", senderEmail: "abigail.s@smsbroken.com", status: TicketStatus.OPEN, category: TicketCategory.TECHNICAL_QUESTION },
  { subject: "Can I white-label the customer portal?", body: "We want to embed the support portal in our app with our own branding. Is this possible on the Enterprise plan?", senderName: "Brian Maxwell", senderEmail: "brian.m@whitelabel.io", status: TicketStatus.RESOLVED, category: TicketCategory.GENERAL_QUESTION },
  { subject: "Data discrepancy between dashboard and API", body: "The dashboard shows 1,247 active users but the API returns 1,183 for the same date range. Which is correct?", senderName: "Celeste Dubois", senderEmail: "celeste.d@datamismatch.fr", status: TicketStatus.OPEN, category: TicketCategory.TECHNICAL_QUESTION },
  { subject: "Charged for cancelled add-on", body: "I cancelled the 'Priority Support' add-on on Feb 15 but was charged $29 again on March 1.", senderName: "Daniel Okafor", senderEmail: "daniel.o@stillcharged.ng", status: TicketStatus.OPEN, category: TicketCategory.REFUND_REQUEST },
  { subject: "Need help migrating from v2 to v3 API", body: "We're still on API v2 which is being deprecated next month. Can you provide a migration guide or assistance?", senderName: "Eva Lindström", senderEmail: "eva.l@migratingnow.se", status: TicketStatus.OPEN, category: TicketCategory.TECHNICAL_QUESTION },
  { subject: "Collaborative editing has sync conflicts", body: "When two team members edit the same document, changes get overwritten instead of merged. This is causing data loss.", senderName: "Finn O'Connell", senderEmail: "finn.o@collabteam.ie", status: TicketStatus.OPEN, category: TicketCategory.TECHNICAL_QUESTION },
];

async function seed() {
  // Get agents to assign some tickets
  const agents = await db.user.findMany({
    where: { active: true },
    select: { id: true },
  });

  const agentIds = agents.map((a) => a.id);

  let created = 0;
  for (let i = 0; i < tickets.length; i++) {
    const t = tickets[i];
    // Spread creation dates across the past 90 days
    const daysAgo = Math.floor((i / tickets.length) * 90);
    const hoursOffset = Math.floor(Math.random() * 24);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);
    createdAt.setHours(hoursOffset, Math.floor(Math.random() * 60));

    // Assign ~40% of tickets to agents
    const assignedTo = i % 5 < 2 && agentIds.length > 0
      ? agentIds[i % agentIds.length]
      : null;

    await db.ticket.create({
      data: {
        subject: t.subject,
        body: t.body,
        senderEmail: t.senderEmail,
        senderName: t.senderName,
        status: t.status,
        category: t.category,
        assignedTo,
        createdAt,
        messages: {
          create: {
            body: t.body,
            sender: t.senderEmail,
            createdAt,
          },
        },
      },
    });
    created++;
  }

  console.log(`Created ${created} tickets.`);
}

seed()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
