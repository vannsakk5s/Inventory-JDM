import type { Metadata } from 'next'
import { Kantumruy_Pro } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import '../globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { InventoryProvider } from '@/components/inventory-context'
import { CurrencyProvider } from '@/components/currency-context'
import { AppSidebar } from '@/components/app-sidebar'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'

const kantumruyPro = Kantumruy_Pro({ 
  subsets: ["khmer", "latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: 'Inventory Manager',
  description: 'Modern inventory management system',
  generator: 'v0.app',
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${kantumruyPro.variable} font-sans antialiased`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={messages}>
            <CurrencyProvider>
              <InventoryProvider>
                <div className="flex h-screen overflow-hidden">
                  <AppSidebar />
                  <main className="flex-1 overflow-auto bg-background p-6">
                    {children}
                  </main>
                </div>
              </InventoryProvider>
            </CurrencyProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
