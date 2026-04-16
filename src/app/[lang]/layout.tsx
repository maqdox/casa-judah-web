import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "../globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getDictionary } from "@/dictionaries";
import { prisma } from "@/lib/prisma";

const THEME_MAP: Record<string, { primary: string, accent: string }> = {
  'verde_olivo': { primary: '#4F5A3E', accent: '#D5BD9B' },
  'terracota': { primary: '#8B4D3B', accent: '#D5BD9B' },
  'marron_medio': { primary: '#7E644B', accent: '#D5BD9B' },
  'cafe_profundo': { primary: '#5D3518', accent: '#D5BD9B' },
  'negro': { primary: '#000000', accent: '#D5BD9B' },
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
  
  const themeSetting = await prisma.siteSetting.findUnique({ where: { key: 'activeTheme' } });
  const themeKey = themeSetting?.value || 'verde_olivo';
  const activeColors = THEME_MAP[themeKey] || THEME_MAP['verde_olivo'];

  return (
    <html lang={lang}>
      <head>
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
        <Header dict={dict.navigation} lang={lang} />
        {children}
        <Footer />
      </body>
    </html>
  );
}
