'use client';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollArea } from '@/components/website/ui/scroll-area';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Component, Rocket } from 'lucide-react';
import { IRecentPage, useRecentPagesStore } from '@/hooks/useZustStore';
import docsData from '@/configs/docs.json' assert { type: 'json' };
import { useTheme } from 'next-themes';
import { generateSidebarData } from './constant';
import { MainComponents, SpecialComponents } from '@/configs/docs';

export const basePath = [
  {
    href: '/get-started',
    name: 'Get Started',
    icon: <Rocket />,
  },
  {
    href: '/components',
    name: 'Components',
    icon: <Component />,
  },
];

function DocsSidebar() {
  const pathname = usePathname();
  const { setTheme } = useTheme();
  const { addVisitedPage, getRecentPages, removeAllRecentPages } =
    useRecentPagesStore();
  const [recentPages, setRecentPages] = useState<IRecentPage[]>([]);
  const groupedComponents = MainComponents.reduce((acc, component) => {
    const group = component.component || null;
    //@ts-ignore
    if (!acc[group]) {
      //@ts-ignore
      acc[group] = [];
    }
    //@ts-ignore
    acc[group].push(component);
    return acc;
  }, {});

  const sidebarData = generateSidebarData(docsData.dataArray);
  // console.log(sidebarData);

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
                <React.Fragment key={`fragment-${index}`}>
                  <li key={`id-${index}`}>
                    <Link
                      href={link.href}
                      onClick={() => addVisitedPage(link.href, link.name)}
                      className={`flex gap-2 group font-medium items-center py-1 transition-all ${
                        link.href === pathname
                          ? 'text-white'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      {React.cloneElement(link?.icon, {
                        className: `${
                          link.href === pathname
                            ? 'bg-orange-500 text-white'
                            : 'bg-neutral-800 text-neutral-400 group-hover:bg-orange-500 group-hover:text-white'
                        } h-7 w-7 border border-neutral-700 transition-all rounded-md p-1`,
                      })}

                      {link.name}
                    </Link>
                  </li>
                </React.Fragment>
              );
            })}
          </ul>
          <h1 className='text-lg font-semibold pb-1 text-white'>Shaders</h1>
          {SpecialComponents?.map((link: any) => {
            return (
              <React.Fragment key={`special-${link.href}`}>
                <li
                  key={link.href}
                  className={`2xl:text-sm text-[0.81em] flex items-center gap-1 2xl:py-1 py-0.5 pl-2 border-l transition-all ${
                    link.href === pathname
                      ? 'border-orange-500 text-white font-semibold'
                      : 'border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600'
                  }`}
                  // data-active={link.id === pathname}
                >
                  <Link
                    href={link.href}
                    onClick={() => addVisitedPage(link.href, link.name)}
                  >
                    {link.name}
                  </Link>
                  {link?.new && (
                    <span className='2xl:text-xs text-[0.74em] bg-orange-500 text-white px-1.5 py-0.5 rounded-full'>
                      New
                    </span>
                  )}
                </li>
              </React.Fragment>
            );
          })}
          {Object.entries(groupedComponents).map(([group, items], index) => (
            <ItemsWithName
              group={group}
              items={items}
              key={index}
              pathname={pathname}
              addVisitedPage={addVisitedPage}
            />
          ))}
        </ScrollArea>
      </div>
    </aside>
  );
}
export const ItemsWithName = ({
  group,
  items,
  pathname,
  addVisitedPage,
}: any) => {
  const groupRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const activeItemIndex = items.findIndex(
      (item: { id: any }) => item.id === pathname
    );
    if (activeItemIndex !== -1 && itemRefs.current[activeItemIndex]) {
      itemRefs.current[activeItemIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [pathname, items]);
  return (
    <div ref={groupRef} key={group}>
      <button className='text-[1rem] relative flex w-full items-center justify-between pr-4 cursor-pointer text-neutral-300 font-medium capitalize my-1'>
        {group}
      </button>
      <ul className='relative'>
        {items.map((link: any, index: number) => (
          <li
            key={link.href}
            // @ts-ignore
            ref={(el) => (itemRefs.current[index] = el)}
            className={`2xl:text-sm text-[0.81em] flex items-center gap-1 2xl:py-1 py-0.5 pl-2 border-l transition-all ${
              link.href === pathname
                ? 'border-orange-500 text-white font-semibold'
                : 'border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600'
            }`}
          >
            <Link
              href={link.href}
              onClick={() => addVisitedPage(link.href, link.name)}
            >
              {link.name}
            </Link>
            {link?.new && (
              <span className='2xl:text-xs text-[0.74em] bg-orange-500 text-white px-1.5 py-0.5 rounded-full'>
                New
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
export default DocsSidebar;
