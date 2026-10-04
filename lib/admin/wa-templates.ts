import { toWhatsAppNumber } from "@/lib/phone";

/**
 * Ready-made WhatsApp messages for staff. The case number and the customer's name are
 * filled in from the case, so nobody types (or mistypes) them by hand.
 * Opening the link only prepares the message in WhatsApp; staff still press send.
 */
export type WaTemplateKey = "received" | "call" | "docs" | "done";

export const WA_TEMPLATE_LABEL: Record<WaTemplateKey, string> = {
  received: "আবেদন পেয়েছি · Received",
  call: "কলের সময় · Call time",
  docs: "কাগজ চান · Ask documents",
  done: "কাজ সম্পন্ন · Work done",
};

export function waTemplate(key: WaTemplateKey, c: { ref: string; customer_name: string }): string {
  switch (key) {
    case "received":
      return `আসসালামু আলাইকুম ${c.customer_name}। ল্যান্ডডক্টরে আপনার আবেদন আমরা পেয়েছি। আপনার কেস নম্বর ${c.ref}। পরবর্তী যোগাযোগে এই নম্বরটি উল্লেখ করবেন।`;
    case "call":
      return `কেস ${c.ref}: আপনার সমস্যাটি বুঝে নিতে আমাদের প্রতিনিধি ১০ মিনিটের একটি বিনামূল্যে কল করবেন। আপনার জন্য কোন সময়টি সুবিধাজনক, জানাবেন?`;
    case "docs":
      return `কেস ${c.ref}: অনুগ্রহ করে এই কাগজগুলোর পরিষ্কার ছবি পাঠান: দলিল, খতিয়ান/পর্চা, নামজারি (ডিসিআর), খাজনার রসিদ। যেগুলো আছে শুধু সেগুলোই দিন।`;
    case "done":
      return `কেস ${c.ref}: আপনার কাজ সম্পন্ন হয়েছে। কোনো প্রশ্ন বা আপত্তি থাকলে ৭ দিনের মধ্যে জানাবেন। ল্যান্ডডক্টরের সেবা নেওয়ার জন্য ধন্যবাদ।`;
  }
}

export function waLink(phoneE164: string, text: string): string {
  return `https://wa.me/${toWhatsAppNumber(phoneE164)}?text=${encodeURIComponent(text)}`;
}
