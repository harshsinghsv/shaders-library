import Link from 'next/link';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import docsData from '@/configs/docs.json' assert { type: 'json' };
import { generateSidebarData } from '../constant';

export function ComponentPagination({ doc }: any) {
  const sidebarData = generateSidebarData(docsData.dataArray);
  const pager = findPrevNextComp(sidebarData, doc.slug);
  // console.log(pager);
  // console.log(sidebarData);

  return (
    <div className='flex flex-row items-center justify-between mt-5 mb-2'>
      {pager?.previous?.id && (
        <Link
          href={pager.previous.id}
          className='group relative inline-flex no-underline h-12 items-center justify-center overflow-hidden rounded-md bg-neutral-900 border border-neutral-700 px-3 font-medium text-white transition-all duration-200 hover:translate-x-[3px] translate-x-[0px] hover:translate-y-[-3px] translate-y-[0px] hover:[box-shadow:-5px_5px_rgb(234,88,12)]'
        >
          <ChevronsLeft className='mr-1 h-4 w-4' />
          {pager.previous.name}
        </Link>
      )}
      {pager?.next?.id && (
        <Link
          href={pager.next.id}
          className='group relative inline-flex h-12 no-underline items-center justify-center overflow-hidden rounded-md bg-neutral-900 border border-neutral-700 px-3 font-medium text-white transition-all duration-200 hover:translate-x-[-3px] translate-x-[0px] hover:translate-y-[-3px] translate-y-[0px] hover:[box-shadow:5px_5px_rgb(234,88,12)]'
        >
          {pager.next.name}
          <ChevronsRight className='ml-1 h-4 w-4' />
        </Link>
      )}
    </div>
  );
}
export const findPrevNextComp = (dataArray: any[], slug: string) => {
  // Flatten the component arrays and generate the full path for matching
  const components = dataArray.flatMap((group) =>
    // console.log(group);
    group.items.map((component: { href: any }) => ({
      id: `${component.href}`,
      ...component, // Include the rest of the component data
    }))
  );
  // console.log('componet', components, slug);

  // Find the index of the component that matches the slug
  const index = components.findIndex(
    (component) => component.id === `/docs/${slug}`
  );
  console.log('componet', index, slug);

  // Return previous and next components based on the found index
  if (index === -1) {
    return { previous: null, next: null };
  }

  const previous = index > 0 ? components[index - 1] : null;
  const next = index < components.length - 1 ? components[index + 1] : null;
  return { previous, next };
};
