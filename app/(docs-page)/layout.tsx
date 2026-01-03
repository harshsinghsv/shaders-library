import React from 'react';
import Header from '@/components/website/header';
import DocsSidebar from '@/components/website/sidebar';

export default async function ComponentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main className='mx-auto pl-2 2xl:container lg:grid 2xl:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-4'>
        <DocsSidebar />
        <div className='min-w-0 max-w-full'>{children}</div>
      </main>
      <footer className='border-t border-neutral-800 pb-24 pt-4 xl:pb-4 bg-black'>
        <div className='container mx-auto'>
          <p className='text-balance text-center text-sm leading-loose text-neutral-500 md:text-left'>
            Built by{' '}            <a
              href='https://x.com/harshsinghsv'
              target='_blank'
              rel='noreferrer'
              className='font-medium text-neutral-400 hover:text-white transition-colors underline underline-offset-4'
            >
              harsh
            </a>{' '}
            and{' '}
            <a
              href='https://x.com/shubhamm069'
              target='_blank'
              rel='noreferrer'
              className='font-medium text-neutral-400 hover:text-white transition-colors underline underline-offset-4'
            >
              shubham
            </a>
            . The source code is available on{' '}
            <a
              href='https://github.com/harshsinghsv/shaders-library'
              target='_blank'
              rel='noreferrer'
              className='font-medium text-neutral-400 hover:text-white transition-colors underline underline-offset-4'
            >
              GitHub
            </a>
            .
          </p>
        </div>
      </footer>
    </div>
  );
}
