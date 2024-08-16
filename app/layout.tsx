import type { Metadata } from 'next';
import { cn } from '@/lib/utils';
import './globals.css';

import { inter } from '@/app/fonts';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut } from 'lucide-react';

import { ThemeProvider } from '@/components/theme-provider';
import { ModeToggleBtn } from '@/components/ModeToggleBtn';
import { Toaster } from '@/components/ui/toaster';

import { login, logout } from '@/lib/auth-actions'
import { auth } from '@/auth'

export const metadata: Metadata = {
  title: 'Definitions',
  description: 'A full-stack web application dictionary',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth()
  return (
    <html lang="en">
      <body className={cn(inter.className, 'overflow-x-hidden antialiased')}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <header className="flex h-16 w-screen items-center justify-between bg-background px-8 md:px-12">
            <ModeToggleBtn />
            {session?.user && <label className="text-sm">You have logged in as {session.user.name}</label>}
            <form action={session?.user ? logout : login}>
              <Button variant="outline" type="submit">
                {session?.user ? <LogOut className="mr-2" /> : <LogIn className="mr-2" />}
                {session?.user ? "Logout" : "Login with Google"}
              </Button>
            </form>
          </header>
          {children}
          <Toaster />
          <footer></footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
