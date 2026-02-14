'use client';
import React, { useEffect, useState } from 'react';
import { ScrollArea } from '@/components/website/ui/scroll-area';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Component, Rocket, Download } from 'lucide-react';
import { useRecentPagesStore } from '@/hooks/useZustStore';
import { SpecialComponents } from '@/configs/docs';

export const basePath = [
  {
    href: '/',
    name: 'Home',
    icon: <Rocket />,
  },
  {
    href: '/get-started',
    name: 'Installation',
    icon: <Download />,
  },
  {
    href: '/components',
    name: 'Components',
    icon: <Component />,
  },
];

function DocsSidebar() {
  const pathname = usePathname();
  const { addVisitedPage, getRecentPages } = useRecentPagesStore();
  const [recentPages, setRecentPages] = useState<any[]>([]);

  useEffect(() => {
    const recentPage = getRecentPages();
    setRecentPages(recentPage);
  }, [getRecentPages]);

  return (
    <aside className='h-full border-r border-neutral-800 bg-black'>
      <div className='sticky top-0 h-screen w-full rounded-md pt-[3.2em]'>
        <ScrollArea className='h-full py-4'>
          <ul className='pb-1'>
            {basePath?.map((link, index) => {
              return (
                <li key={`id-${index}`}>
                  <Link
                    href={link.href}
                    onClick={() => addVisitedPage(link.href, link.name)}
                    className={`flex gap-2 group font-medium items-center py-2 px-4 transition-all ${link.href === pathname
                      ? 'text-white'
                      : 'text-neutral-400 hover:text-white'
                      }`}
                  >
                    {React.cloneElement(link?.icon, {
                      className: `${link.href === pathname
                        ? 'bg-orange-500 text-white'
                        : 'bg-neutral-800 text-neutral-400 group-hover:bg-orange-500 group-hover:text-white'
                        } h-7 w-7 border border-neutral-700 transition-all rounded-md p-1`,
                    })}
                    {link.name}
                  </Link>
                </li>
              );
            })}
          </ul>

          <h1 className='text-lg font-semibold pb-1 text-white px-4 mt-4'>Shaders</h1>
          <ul>
            {SpecialComponents?.map((link: any) => {
              return (
                <li
                  key={link.href}
                  className={`text-sm flex items-center gap-1 py-1.5 px-4 border-l-2 transition-all ${link.href === pathname
                    ? 'border-orange-500 text-white font-semibold'
                    : 'border-transparent text-neutral-400 hover:text-white hover:border-neutral-700'
                    }`}
                >
                  <Link
                    href={link.href}
                    onClick={() => addVisitedPage(link.href, link.name)}
                    className="block w-full"
                  >
                    {link.name}
                  </Link>
                  {link?.new && (
                    <span className='text-[10px] bg-orange-500 text-white px-1.5 py-0.5 rounded-full ml-auto'>
                      New
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </ScrollArea>
      </div>
    </aside>
  );
}

export default DocsSidebar;
