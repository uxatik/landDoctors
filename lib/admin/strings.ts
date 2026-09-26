// Staff area text. Bangla first, English after, so both brothers and the founder can use it.
export const A = {
  appName: "ল্যান্ডডক্টর স্টাফ · LandDoctor Staff",
  nav: {
    cases: "কেস · Cases",
    consultants: "বিশেষজ্ঞ · Consultants",
    packages: "প্যাকেজ ও দাম · Packages",
    waitlist: "অপেক্ষার তালিকা · Waiting list",
    complaints: "অভিযোগ · Complaints",
    payouts: "বিশেষজ্ঞের পাওনা · Payouts",
    signOut: "সাইন আউট · Sign out",
  },
  login: {
    title: "স্টাফ লগইন · Staff sign in",
    email: "ইমেইল · Email",
    password: "পাসওয়ার্ড · Password",
    submit: "লগইন · Sign in",
    errors: {
      invalid: "ইমেইল বা পাসওয়ার্ড ভুল। · Wrong email or password.",
      not_staff: "এই অ্যাকাউন্টটি স্টাফ হিসেবে যুক্ত নয়। · This account is not a staff member.",
      not_configured: "ডাটাবেস এখনো যুক্ত হয়নি (.env.local দেখুন)। · Database not connected yet (check .env.local).",
      unknown: "লগইন করা যায়নি, আবার চেষ্টা করুন। · Could not sign in, try again.",
    } as Record<string, string>,
  },
  mfa: {
    title: "দুই-ধাপের যাচাই · Two-step verification",
    explain:
      "প্রতিবার লগইনে ফোনের অথেনটিকেটর অ্যাপের ৬ অঙ্কের কোড লাগবে। · Every sign-in needs the 6-digit code from your phone's authenticator app.",
    setupButton: "অথেনটিকেটর সেট আপ করুন · Set up authenticator",
    scan: "Google Authenticator বা Microsoft Authenticator দিয়ে QR কোডটি স্ক্যান করুন। · Scan the QR code with Google Authenticator or Microsoft Authenticator.",
    secret: "স্ক্যান না হলে এই কোডটি লিখুন · If scanning fails, type this key",
    code: "৬ অঙ্কের কোড · 6-digit code",
    verify: "যাচাই করুন · Verify",
    errors: {
      invalid_code: "কোডটি মেলেনি। নতুন কোড দিয়ে আবার চেষ্টা করুন। · The code didn't match. Try the next code.",
      unknown: "যাচাই করা যায়নি। · Could not verify.",
    } as Record<string, string>,
  },
} as const;
