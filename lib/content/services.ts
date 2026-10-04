// Service pages. Every statement here repeats something the site already says elsewhere
// (prices and delivery times from the pricing section, document names from the request form,
// limits from the terms). Add nothing here that is not already true on the site.
import type { CategorySlug } from "./categories";
import { CATEGORY_SLUGS } from "./categories";

/** Address of each service page: /services/<slug>. */
export const SERVICE_SLUG: Record<CategorySlug, string> = {
  pre_purchase_check: "land-check",
  mutation: "namjari",
  survey: "land-survey",
  inheritance: "inheritance",
  record_correction: "khatian-correction",
  dispute: "land-dispute",
};
export const SERVICE_SLUGS: readonly string[] = CATEGORY_SLUGS.map((c) => SERVICE_SLUG[c]);

export function categoryFromServiceSlug(slug: string): CategorySlug | null {
  return CATEGORY_SLUGS.find((c) => SERVICE_SLUG[c] === slug) ?? null;
}

/** Documents listed on the request form (messages: help.docs.*). */
export type DocKey = "deed" | "khatian" | "mutation_dcr" | "tax_receipt" | "mouza_map";

export type ServiceDoc = {
  title: string;
  description: string;
  lede: string;
  includes: string[];
  documents: DocKey[];
  extraDocuments?: string[];
  price: string;
  time: string;
  area: string;
  notes: string[];
};

const bn: Record<CategorySlug, ServiceDoc> = {
  pre_purchase_check: {
    title: "জমি কেনার আগে যাচাই",
    description: "জমি কেনার আগে দলিল, খতিয়ান, নামজারি, খাজনা ও মামলা-সংক্রান্ত তথ্য যাচাই করে বাংলায় লিখিত প্রতিবেদন। সাভার ও গাজীপুরে, ৳8,000 থেকে।",
    lede: "জমি কেনার সিদ্ধান্তের আগে দলিল, খতিয়ান, নামজারি, খাজনা ও মামলা-সংক্রান্ত তথ্য যাচাই করে লিখিত প্রতিবেদন (ল্যান্ড হেলথ রিপোর্ট) দেওয়া হয়।",
    includes: ["দলিল ও খতিয়ানের তথ্য যাচাই", "নামজারি ও খাজনার তথ্য যাচাই", "মামলা-সংক্রান্ত তথ্য যাচাই", "বাংলায় লিখিত প্রতিবেদন"],
    documents: ["deed", "khatian", "mutation_dcr", "tax_receipt", "mouza_map"],
    price: "৳8,000 থেকে",
    time: "৫–৭ কার্যদিবসের মধ্যে",
    area: "সাভার ও গাজীপুর",
    notes: ["প্রতিবেদন কী নিশ্চিত করে আর কী করে না, তা সতর্কতা পাতায় লেখা আছে।"],
  },
  mutation: {
    title: "নামজারি সহায়তা",
    description: "নামজারির আবেদন থেকে ডিসিআর পর্যন্ত কোন ধাপে কী লাগবে, তা নিয়ে যাচাইকৃত ভূমি বিশেষজ্ঞের পরামর্শ ও কাগজপত্র প্রস্তুতে সহায়তা।",
    lede: "নামজারির আবেদন থেকে ডিসিআর পর্যন্ত কোন ধাপে কী লাগবে, বিশেষজ্ঞ তা বুঝিয়ে দেন এবং কাগজপত্র প্রস্তুত করতে সহায়তা করেন।",
    includes: ["আপনার কাগজ দেখে কী আছে আর কী লাগবে, তা জানানো", "আবেদনের কাগজপত্র প্রস্তুতে সহায়তা", "আবেদন থেকে ডিসিআর পর্যন্ত ধাপগুলো বুঝিয়ে দেওয়া"],
    documents: ["deed", "khatian", "tax_receipt"],
    price: "৩০ মিনিটের পরামর্শ ৳1,000। পরবর্তী কাজের মূল্য লিখিত প্রস্তাবে জানানো হয়।",
    time: "কাজের পরিধি অনুযায়ী, লিখিত প্রস্তাবে উল্লেখ থাকে",
    area: "ফোনে পরামর্শ দেশ ও বিদেশের যেকোনো স্থান থেকে",
    notes: ["নামজারির সিদ্ধান্ত দেয় ভূমি অফিস। আমরা সিদ্ধান্ত বা সময়ের কোনো নিশ্চয়তা দিই না।"],
  },
  survey: {
    title: "জমি পরিমাপ",
    description: "আমিন সরেজমিনে জমি পরিমাপ করে সীমানা চিহ্নিত করেন এবং নকশাসহ লিখিত প্রতিবেদন দেন। সাভার ও গাজীপুরে, ৳6,000 থেকে।",
    lede: "আমিন সরেজমিনে জমি পরিমাপ করে সীমানা চিহ্নিত করেন এবং নকশাসহ লিখিত প্রতিবেদন দেন।",
    includes: ["সরেজমিনে জমি পরিমাপ", "সীমানা চিহ্নিতকরণ", "নকশাসহ লিখিত প্রতিবেদন"],
    documents: ["deed", "khatian", "mouza_map"],
    price: "৳6,000 থেকে। জমির আয়তন অনুযায়ী মূল্য পরিবর্তিত হতে পারে।",
    time: "৫ কার্যদিবসের মধ্যে",
    area: "সাভার ও গাজীপুর",
    notes: [],
  },
  inheritance: {
    title: "ওয়ারিশ ও বণ্টন",
    description: "ওয়ারিশদের মধ্যে জমির অংশ নির্ধারণ ও বণ্টনের করণীয় নিয়ে যাচাইকৃত ভূমি বিশেষজ্ঞের পরামর্শ। ফোনে, দেশ ও বিদেশের যেকোনো স্থান থেকে।",
    lede: "ওয়ারিশদের মধ্যে জমির অংশ নির্ধারণ ও বণ্টনের করণীয় সম্পর্কে বিশেষজ্ঞের পরামর্শ।",
    includes: ["ফারায়েজ অনুযায়ী অংশ নির্ধারণে পরামর্শ", "বণ্টন ও নামজারির জন্য কোন কাগজ লাগবে, তা জানানো", "করণীয়ের লিখিত সারসংক্ষেপ"],
    documents: ["deed", "khatian", "tax_receipt"],
    extraDocuments: ["ওয়ারিশ সনদ"],
    price: "৩০ মিনিটের পরামর্শ ৳1,000। পরবর্তী কাজের মূল্য লিখিত প্রস্তাবে জানানো হয়।",
    time: "কাজের পরিধি অনুযায়ী, লিখিত প্রস্তাবে উল্লেখ থাকে",
    area: "ফোনে পরামর্শ দেশ ও বিদেশের যেকোনো স্থান থেকে",
    notes: [],
  },
  record_correction: {
    title: "খতিয়ানে ভুল সংশোধন",
    description: "খতিয়ানে নাম, দাগ বা জমির পরিমাণে ভুল থাকলে সংশোধনের সঠিক পথ ও প্রয়োজনীয় কাগজ নিয়ে যাচাইকৃত ভূমি বিশেষজ্ঞের পরামর্শ।",
    lede: "খতিয়ানে নাম, দাগ বা জমির পরিমাণে ভুল থাকলে সংশোধনের সঠিক পথ ও প্রয়োজনীয় কাগজ সম্পর্কে বিশেষজ্ঞের পরামর্শ।",
    includes: ["ভুলের ধরন চিহ্নিত করা", "কোথায় ও কীভাবে আবেদন করতে হবে, তা জানানো", "কাগজপত্র প্রস্তুতে সহায়তা"],
    documents: ["khatian", "deed", "mutation_dcr"],
    price: "৩০ মিনিটের পরামর্শ ৳1,000। পরবর্তী কাজের মূল্য লিখিত প্রস্তাবে জানানো হয়।",
    time: "কাজের পরিধি অনুযায়ী, লিখিত প্রস্তাবে উল্লেখ থাকে",
    area: "ফোনে পরামর্শ দেশ ও বিদেশের যেকোনো স্থান থেকে",
    notes: ["সংশোধনের সিদ্ধান্ত দেয় সংশ্লিষ্ট সরকারি কর্তৃপক্ষ। আমরা সিদ্ধান্ত বা সময়ের কোনো নিশ্চয়তা দিই না।"],
  },
  dispute: {
    title: "দখল ও বিরোধ",
    description: "জমির দখল বা সীমানা নিয়ে বিরোধে আপনার কাগজ দেখে করণীয় ও সঠিক পথ সম্পর্কে যাচাইকৃত ভূমি বিশেষজ্ঞের পরামর্শ।",
    lede: "জমির দখল বা সীমানা নিয়ে বিরোধে আপনার কাগজ দেখে করণীয় ও সঠিক পথ সম্পর্কে বিশেষজ্ঞের পরামর্শ।",
    includes: ["কাগজপত্র দেখে পরিস্থিতি বোঝা", "করণীয় ও সঠিক পথ সম্পর্কে পরামর্শ", "করণীয়ের লিখিত সারসংক্ষেপ"],
    documents: ["deed", "khatian", "mutation_dcr", "tax_receipt"],
    price: "৩০ মিনিটের পরামর্শ ৳1,000। পরবর্তী কাজের মূল্য লিখিত প্রস্তাবে জানানো হয়।",
    time: "কাজের পরিধি অনুযায়ী, লিখিত প্রস্তাবে উল্লেখ থাকে",
    area: "ফোনে পরামর্শ দেশ ও বিদেশের যেকোনো স্থান থেকে",
    notes: ["ল্যান্ডডক্টর কোনো সরকারি অফিস বা আইনি প্রতিষ্ঠান (ল ফার্ম) নয়।"],
  },
};

const en: Record<CategorySlug, ServiceDoc> = {
  pre_purchase_check: {
    title: "Check before buying land",
    description: "Before you buy: deed, khatian, mutation, tax and litigation checks, with a written report in Bangla. In Savar and Gazipur, from ৳8,000.",
    lede: "Before you decide to buy, an expert checks the deed, khatian, mutation, tax and litigation records and gives you a written report (the land health report).",
    includes: ["Deed and khatian checks", "Mutation and land tax checks", "Litigation checks", "Written report in Bangla"],
    documents: ["deed", "khatian", "mutation_dcr", "tax_receipt", "mouza_map"],
    price: "From ৳8,000",
    time: "Within 5–7 working days",
    area: "Savar and Gazipur",
    notes: ["Our disclaimer page explains what the report confirms and what it does not."],
  },
  mutation: {
    title: "Mutation (namjari) support",
    description: "Advice from a verified land expert on each step of mutation (namjari), from application to DCR, and help preparing the papers.",
    lede: "An expert explains what each step of mutation needs, from application to DCR, and helps you prepare the papers.",
    includes: ["Reviewing your papers and telling you what is missing", "Help preparing the application papers", "Explaining the steps from application to DCR"],
    documents: ["deed", "khatian", "tax_receipt"],
    price: "30-minute consultation ৳1,000. Further work is priced in your written proposal.",
    time: "Depends on the scope; stated in your written proposal",
    area: "Phone consultation from anywhere, including abroad",
    notes: ["The land office decides a mutation. We do not promise any decision or timeline."],
  },
  survey: {
    title: "Land survey",
    description: "A surveyor (amin) measures the land on site, marks the boundaries and gives a written report with a sketch. In Savar and Gazipur, from ৳6,000.",
    lede: "A surveyor (amin) measures the land on site, marks the boundaries and gives you a written report with a sketch.",
    includes: ["On-site measurement", "Boundary marking", "Written report with sketch"],
    documents: ["deed", "khatian", "mouza_map"],
    price: "From ৳6,000. The price may vary with land size.",
    time: "Within 5 working days",
    area: "Savar and Gazipur",
    notes: [],
  },
  inheritance: {
    title: "Inheritance and division",
    description: "Advice from a verified land expert on heirs' shares and how to divide inherited land. By phone, from anywhere including abroad.",
    lede: "Expert advice on each heir's share and the steps to divide inherited land.",
    includes: ["Advice on shares under faraiz rules", "Which papers division and mutation will need", "Written summary of next steps"],
    documents: ["deed", "khatian", "tax_receipt"],
    extraDocuments: ["Heirship (warish) certificate"],
    price: "30-minute consultation ৳1,000. Further work is priced in your written proposal.",
    time: "Depends on the scope; stated in your written proposal",
    area: "Phone consultation from anywhere, including abroad",
    notes: [],
  },
  record_correction: {
    title: "Correct a khatian error",
    description: "A wrong name, plot number or area in a khatian: advice from a verified land expert on the right route to correct it and the papers needed.",
    lede: "If a khatian shows the wrong name, plot number or area, an expert advises on the right route to correct it and the papers you need.",
    includes: ["Identifying the kind of error", "Where and how to apply", "Help preparing the papers"],
    documents: ["khatian", "deed", "mutation_dcr"],
    price: "30-minute consultation ৳1,000. Further work is priced in your written proposal.",
    time: "Depends on the scope; stated in your written proposal",
    area: "Phone consultation from anywhere, including abroad",
    notes: ["The relevant government authority decides a correction. We do not promise any decision or timeline."],
  },
  dispute: {
    title: "Possession and disputes",
    description: "In a dispute over possession or boundaries, a verified land expert reviews your papers and advises on the right next steps.",
    lede: "In a dispute over possession or boundaries, an expert reviews your papers and advises on the right next steps.",
    includes: ["Understanding the situation from your papers", "Advice on the right next steps", "Written summary of next steps"],
    documents: ["deed", "khatian", "mutation_dcr", "tax_receipt"],
    price: "30-minute consultation ৳1,000. Further work is priced in your written proposal.",
    time: "Depends on the scope; stated in your written proposal",
    area: "Phone consultation from anywhere, including abroad",
    notes: ["LandDoctor is not a government office and not a law firm."],
  },
};

export function getServiceDoc(locale: string, category: CategorySlug): ServiceDoc {
  return (locale === "en" ? en : bn)[category];
}
