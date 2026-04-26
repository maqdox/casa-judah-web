import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "../globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getDictionary } from "@/dictionaries";
import { prisma } from "@/lib/prisma";
import { headers } from 'next/headers';

const THEME_MAP: Record<string, { primary: string, accent: string }> = {
  'verde_olivo': { primary: '#4E583E', accent: '#D6BE9B' },
  'terracota': { primary: '#804639', accent: '#D6BE9B' },
  'marron_medio': { primary: '#A88E6D', accent: '#D6BE9B' },
  'cafe_profundo': { primary: '#5A4334', accent: '#D6BE9B' },
  'negro': { primary: '#000000', accent: '#D6BE9B' },
};

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ["latin"], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: "Casa Judah | Farm Hotel",
  description: "An intimate farm hotel experience designed for rest.",
};

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>
}>) {
  const { lang } = (await params) as { lang: 'en' | 'es' };
  const dict = await getDictionary(lang);
  
  const headerList = await headers();
  const pathname = headerList.get('x-pathname') || '';
  const isV2 = pathname.includes('/v2');

  const themeSetting = await prisma.siteSetting.findUnique({ where: { key: 'activeTheme' } });
  const themeKey = themeSetting?.value || 'verde_olivo';
  const activeColors = THEME_MAP[themeKey] || THEME_MAP['verde_olivo'];

  return (
    <html lang={lang}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <style dangerouslySetInnerHTML={{__html: `
          :root {
            --color-dark-brown: ${activeColors.primary};
            --color-olive: ${activeColors.primary};
            /* Accent used elsewhere or unifies selection: */
            --color-accent: ${activeColors.accent};
          }
          ::selection {
            background-color: ${activeColors.accent};
            color: #000;
          }
        `}} />
      </head>
      <body className={`${inter.variable} ${playfair.variable}`}>
        {!isV2 && <Header dict={dict.navigation} lang={lang} />}
        {children}
        {!isV2 && <Footer />}
      </body>
    </html>
  );
}
