import Script from "next/script";
import { publicEnv } from "@/lib/env";

/** Loads Google Analytics and Microsoft Clarity only when their IDs are set. */
export function Analytics() {
  const ga = publicEnv.NEXT_PUBLIC_GA_ID;
  const clarity = publicEnv.NEXT_PUBLIC_CLARITY_ID;
  const safe = (id: string) => /^[A-Za-z0-9-]+$/.test(id);
  return (
    <>
      {ga && safe(ga) && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
          <Script id="ga" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${ga}',{anonymize_ip:true});`}
          </Script>
        </>
      )}
      {clarity && safe(clarity) && (
        <Script id="clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${clarity}");`}
        </Script>
      )}
    </>
  );
}
