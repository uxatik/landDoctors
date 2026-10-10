// DRAFT legal texts. They must be reviewed by a lawyer in Bangladesh before launch.
// Plain data (no Markdown/HTML) so nothing here can inject markup.

/** While true, the legal pages show the draft banner and are kept out of search results. Set to false after the lawyer's review. */
export const LEGAL_DRAFT = true;

export const LEGAL_SLUGS = ["terms", "refund", "privacy", "disclaimer"] as const;
export type LegalSlug = (typeof LEGAL_SLUGS)[number];

type Section = { heading: string; paragraphs?: string[]; bullets?: string[] };
type LegalDoc = { title: string; sections: Section[] };

export function isLegalSlug(v: string): v is LegalSlug {
  return (LEGAL_SLUGS as readonly string[]).includes(v);
}

const en: Record<LegalSlug, LegalDoc> = {
  terms: {
    title: "Terms of service",
    sections: [
      {
        heading: "Who we are",
        paragraphs: [
          "LandDoctor connects people in Bangladesh with verified, independent land experts: surveyors, retired land officials, deed writers and land advocates. LandDoctor is not a government office and not a law firm.",
        ],
      },
      {
        heading: "What we do and don't do",
        bullets: [
          "We help you understand your land problem, prepare the right papers and arrange field work.",
          "We do not promise any government decision, approval or timeline, and we never offer to speed up government work.",
          "Each expert is an independent professional and is responsible for the advice and work they give.",
        ],
      },
      {
        heading: "Prices and payment",
        bullets: [
          "You see the full service price before you pay. Official government fees are listed separately and are passed on at actual cost.",
          "Pay only through LandDoctor's payment page or the official account we give you. Never pay an expert in cash.",
          "Work starts after payment is confirmed.",
        ],
      },
      {
        heading: "Your part",
        bullets: [
          "Give true information and genuine documents.",
          "Do not offer or ask for bribes. Tell us if anyone asks you for unofficial money.",
        ],
      },
      {
        heading: "Law",
        paragraphs: ["These terms are governed by the laws of Bangladesh."],
      },
    ],
  },
  refund: {
    title: "Refund policy",
    sections: [
      {
        heading: "When you get a full refund",
        bullets: [
          "The expert or LandDoctor cancels the work.",
          "You cancel before the expert has started the work.",
        ],
      },
      {
        heading: "Partial refunds",
        paragraphs: [
          "If you cancel after work has started, we refund the part of the price for work not yet done.",
          "Government fees already paid to a government office cannot be refunded by us.",
        ],
      },
      {
        heading: "If the service was not as described",
        paragraphs: ["Tell us within 7 days of delivery. We will review it with the expert and fix it or refund."],
      },
      {
        heading: "How to ask",
        paragraphs: [
          "Message us on WhatsApp with your case number (for example LD-0123). Refunds go back to the payment method you used, normally within 7 working days.",
        ],
      },
    ],
  },
  privacy: {
    title: "Privacy policy",
    sections: [
      {
        heading: "What we collect",
        bullets: [
          "Your name and mobile number.",
          "Where your land is (area, upazila, mouza) and a short description of the problem.",
          "Which papers you have (just a tick list) and payment references.",
        ],
        paragraphs: [
          "We do not collect your National ID and we do not store photos of your documents on this website.",
        ],
      },
      {
        heading: "Why we use it",
        paragraphs: ["Only to call you, understand your problem, match you with an expert, take payment and follow up on your case."],
      },
      {
        heading: "Who can see it",
        bullets: [
          "Our small operations team.",
          "The expert assigned to your case.",
          "Our payment processor, only for the payment itself.",
        ],
        paragraphs: ["We do not sell or share your information with anyone else."],
      },
      {
        heading: "Documents you send on WhatsApp",
        paragraphs: ["They are used only for your case. We ask experts to delete them once your case is closed."],
      },
      {
        heading: "Analytics",
        paragraphs: ["We use Vercel Web Analytics to count page visits. It uses no cookies, does not identify you, and never receives private case links. We may also use Google Analytics and Microsoft Clarity to understand how the site is used. None of these see your form answers."],
      },
      {
        heading: "Your choices",
        paragraphs: ["Message us on WhatsApp to see, correct or delete your information."],
      },
    ],
  },
  disclaimer: {
    title: "Advice and report disclaimer",
    sections: [
      {
        heading: "What our advice and reports are",
        paragraphs: [
          "Advice and reports are based on the documents you give us and the records available on the day they are checked.",
          "They are not a legal opinion for court and not a guarantee of title.",
        ],
      },
      {
        heading: "Things that can change",
        bullets: [
          "Government records can be updated after our check.",
          "Decisions by land offices and courts are made by them, not by LandDoctor or its experts.",
        ],
      },
      {
        heading: "For court cases",
        paragraphs: ["If your matter goes to court, consult a lawyer who will represent you."],
      },
    ],
  },
};

const bn: Record<LegalSlug, LegalDoc> = {
  terms: {
    title: "সেবার শর্তাবলি",
    sections: [
      {
        heading: "আমরা কারা",
        paragraphs: [
          "ল্যান্ডডক্টর বাংলাদেশের মানুষকে যাচাই করা স্বাধীন জমি বিশেষজ্ঞদের সঙ্গে যুক্ত করে: সার্ভেয়ার, অবসরপ্রাপ্ত ভূমি কর্মকর্তা, দলিল লেখক ও জমির আইনজীবী। ল্যান্ডডক্টর কোনো সরকারি অফিস নয়, আইনি প্রতিষ্ঠানও নয়।",
        ],
      },
      {
        heading: "আমরা যা করি, যা করি না",
        bullets: [
          "আপনার জমির সমস্যা বুঝতে, সঠিক কাগজ তৈরি করতে এবং মাঠের কাজের ব্যবস্থা করতে সাহায্য করি।",
          "কোনো সরকারি সিদ্ধান্ত, অনুমোদন বা সময়ের প্রতিশ্রুতি দিই না, এবং সরকারি কাজ দ্রুত করিয়ে দেওয়ার প্রস্তাব কখনো দিই না।",
          "প্রত্যেক বিশেষজ্ঞ স্বাধীন পেশাজীবী এবং নিজের পরামর্শ ও কাজের দায়িত্ব তাঁর নিজের।",
        ],
      },
      {
        heading: "দাম ও পেমেন্ট",
        bullets: [
          "পেমেন্টের আগেই পুরো সেবার দাম দেখতে পাবেন। সরকারি ফি আলাদা লেখা থাকে এবং যা খরচ হয় ঠিক ততটুকুই নেওয়া হয়।",
          "শুধু ল্যান্ডডক্টরের পেমেন্ট পাতা বা আমাদের দেওয়া অফিসিয়াল অ্যাকাউন্টে টাকা দিন। কোনো বিশেষজ্ঞকে হাতে নগদ টাকা দেবেন না।",
          "পেমেন্ট নিশ্চিত হওয়ার পর কাজ শুরু হয়।",
        ],
      },
      {
        heading: "আপনার দায়িত্ব",
        bullets: [
          "সত্য তথ্য ও আসল কাগজ দিন।",
          "ঘুষ দেবেন না, চাইবেনও না। কেউ অনানুষ্ঠানিক টাকা চাইলে আমাদের জানান।",
        ],
      },
      { heading: "আইন", paragraphs: ["এই শর্তাবলি বাংলাদেশের আইন অনুযায়ী পরিচালিত হবে।"] },
    ],
  },
  refund: {
    title: "রিফান্ড নীতি",
    sections: [
      {
        heading: "কখন পুরো টাকা ফেরত পাবেন",
        bullets: ["বিশেষজ্ঞ বা ল্যান্ডডক্টর কাজ বাতিল করলে।", "বিশেষজ্ঞ কাজ শুরু করার আগে আপনি বাতিল করলে।"],
      },
      {
        heading: "আংশিক ফেরত",
        paragraphs: [
          "কাজ শুরু হওয়ার পর বাতিল করলে, যে কাজ এখনো হয়নি তার অংশের টাকা ফেরত দেওয়া হয়।",
          "সরকারি অফিসে ইতোমধ্যে জমা দেওয়া সরকারি ফি আমরা ফেরত দিতে পারি না।",
        ],
      },
      {
        heading: "সেবা যেমন বলা হয়েছিল তেমন না হলে",
        paragraphs: ["কাজ হাতে পাওয়ার ৭ দিনের মধ্যে জানান। আমরা বিশেষজ্ঞের সঙ্গে দেখে ঠিক করে দেব অথবা টাকা ফেরত দেব।"],
      },
      {
        heading: "কীভাবে চাইবেন",
        paragraphs: [
          "কেস নম্বর (যেমন LD-0123) সহ WhatsApp-এ লিখুন। যে মাধ্যমে পেমেন্ট করেছেন সেখানেই টাকা ফেরত যাবে, সাধারণত ৭ কর্মদিবসের মধ্যে।",
        ],
      },
    ],
  },
  privacy: {
    title: "গোপনীয়তা নীতি",
    sections: [
      {
        heading: "আমরা কী তথ্য নিই",
        bullets: [
          "আপনার নাম ও মোবাইল নম্বর।",
          "জমি কোথায় (এলাকা, উপজেলা, মৌজা) এবং সমস্যার সংক্ষিপ্ত বিবরণ।",
          "কোন কাগজ আছে (শুধু টিক চিহ্ন) এবং পেমেন্টের রেফারেন্স।",
        ],
        paragraphs: ["আমরা জাতীয় পরিচয়পত্র নিই না এবং এই ওয়েবসাইটে আপনার কাগজের ছবি রাখি না।"],
      },
      {
        heading: "কেন ব্যবহার করি",
        paragraphs: ["শুধু আপনাকে ফোন করতে, সমস্যা বুঝতে, বিশেষজ্ঞ ঠিক করতে, পেমেন্ট নিতে এবং কেসের খোঁজ রাখতে।"],
      },
      {
        heading: "কারা দেখতে পারে",
        bullets: ["আমাদের ছোট অপারেশনস দল।", "আপনার কেসের দায়িত্বপ্রাপ্ত বিশেষজ্ঞ।", "পেমেন্ট প্রসেসর, শুধু পেমেন্টের জন্য।"],
        paragraphs: ["আমরা আপনার তথ্য বিক্রি করি না, অন্য কারও সঙ্গে শেয়ারও করি না।"],
      },
      {
        heading: "WhatsApp-এ পাঠানো কাগজ",
        paragraphs: ["শুধু আপনার কেসের কাজে ব্যবহার হয়। কেস শেষ হলে বিশেষজ্ঞদের সেগুলো মুছে ফেলতে বলি।"],
      },
      {
        heading: "ব্যবহারের পরিসংখ্যান",
        paragraphs: ["কতজন কোন পাতা দেখছেন তা গুনতে আমরা Vercel Web Analytics ব্যবহার করি। এটি কোনো কুকি রাখে না, আপনাকে চেনে না, আর আপনার কেসের ব্যক্তিগত লিংক পায় না। সাইট কীভাবে ব্যবহার হচ্ছে বুঝতে আমরা Google Analytics ও Microsoft Clarity-ও ব্যবহার করতে পারি। এদের কেউই আপনার ফর্মের উত্তর দেখে না।"],
      },
      { heading: "আপনার অধিকার", paragraphs: ["আপনার তথ্য দেখতে, ঠিক করতে বা মুছে ফেলতে WhatsApp-এ লিখুন।"] },
    ],
  },
  disclaimer: {
    title: "পরামর্শ ও রিপোর্ট সংক্রান্ত সতর্কতা",
    sections: [
      {
        heading: "আমাদের পরামর্শ ও রিপোর্ট কী",
        paragraphs: [
          "পরামর্শ ও রিপোর্ট তৈরি হয় আপনার দেওয়া কাগজ এবং যাচাইয়ের দিন পাওয়া রেকর্ডের ভিত্তিতে।",
          "এটি আদালতের জন্য আইনি মতামত নয় এবং মালিকানার নিশ্চয়তাও নয়।",
        ],
      },
      {
        heading: "যা বদলাতে পারে",
        bullets: [
          "আমাদের যাচাইয়ের পরে সরকারি রেকর্ড হালনাগাদ হতে পারে।",
          "ভূমি অফিস ও আদালতের সিদ্ধান্ত তাঁরাই নেন, ল্যান্ডডক্টর বা এর বিশেষজ্ঞরা নন।",
        ],
      },
      { heading: "মামলার ক্ষেত্রে", paragraphs: ["বিষয়টি আদালতে গেলে আপনার পক্ষে মামলা পরিচালনা করবেন এমন আইনজীবীর পরামর্শ নিন।"] },
    ],
  },
};

export function getLegalDoc(locale: string, slug: LegalSlug): LegalDoc {
  return (locale === "bn" ? bn : en)[slug];
}
