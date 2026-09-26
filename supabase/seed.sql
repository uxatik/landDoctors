-- Launch packages. Prices are PLACEHOLDERS from the project brief (price_confirmed = false),
-- so offers show "call us to confirm" instead of a Pay button until the founder confirms them.
insert into public.packages (slug, name_bn, name_en, scope_bn, scope_en, exclusions_bn, exclusions_en,
                             delivery_days, base_price, consultant_share_pct, field_work, price_confirmed)
values
  ('session-30',
   '৩০ মিনিটের পরামর্শ', '30-minute session',
   'ফোন বা WhatsApp কলে বিশেষজ্ঞের পরামর্শ, সঙ্গে পরবর্তী করণীয়ের লিখিত সারাংশ।',
   'Advice from an expert by phone or WhatsApp call, plus a short written summary of next steps.',
   'মাঠে যাওয়া, কাগজ তোলা বা আবেদন জমা দেওয়া এর মধ্যে নেই।',
   'Does not include site visits, collecting documents or filing applications.',
   0, 1000, 80, false, false),
  ('field-survey',
   'জমি মাপজোখ', 'Field survey',
   'আমিন সরেজমিনে গিয়ে জমি মাপবেন, সীমানা চিহ্নিত করবেন এবং নকশাসহ লিখিত ফলাফল দেবেন।',
   'A surveyor visits the land, measures it, marks the boundaries and gives a written result with a sketch.',
   'সীমানা নিয়ে বিরোধ মেটানো বা আদালতের কাজ এর মধ্যে নেই। দাম জমির আকার অনুযায়ী বাড়তে পারে।',
   'Does not include settling boundary disputes or court work. Price may rise with the size of the land.',
   5, 6000, 80, true, false),
  ('land-health-report',
   'ল্যান্ড হেলথ রিপোর্ট', 'Land health report',
   'জমি কেনার আগে দলিলের ধারাবাহিকতা, খতিয়ান, নামজারি, খাজনা ও জানা বিরোধ যাচাই করে বাংলায় লিখিত রিপোর্ট।',
   'Before you buy: checks of the deed chain, khatian, mutation, land tax and known disputes, with a written report in Bangla.',
   'এটি মালিকানার নিশ্চয়তা বা আদালতের জন্য আইনি মতামত নয়। সরকারি কপির ফি আলাদা।',
   'Not a guarantee of title or a legal opinion for court. Government copy fees are extra.',
   7, 8000, 70, true, false)
on conflict (slug) do nothing;
