'use client';
import Link from 'next/link';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import { SHADERS } from '@/components/shaders';

export function ComponentPagination({ slug }: { slug: string }) {
    // Find current shader index based on slug
    const currentIndex = SHADERS.findIndex(
        (s) => s.metadata.slug === slug
    );

    if (currentIndex === -1) return null;

    const previous = currentIndex > 0 ? SHADERS[currentIndex - 1] : null;
    const next = currentIndex < SHADERS.length - 1 ? SHADERS[currentIndex + 1] : null;

    return (
        <div className='flex flex-row items-center justify-between mt-10 border-t border-neutral-800 pt-8'>
            {previous ? (
                <Link
                    href={`/components/${previous.metadata.slug}`}
                    className='group flex flex-col items-start gap-1 p-4 rounded-lg hover:bg-neutral-900 transition-colors'
                >
                    <span className='text-xs text-neutral-500 flex items-center gap-1 group-hover:text-purple-400 transition-colors'>
                        <ChevronsLeft className='w-3 h-3' /> Previous
                    </span>
                    <span className='text-sm font-medium text-neutral-200 group-hover:text-white'>
                        {previous.metadata.name}
                    </span>
                </Link>
            ) : (
                <div />
            )}

            {next && (
                <Link
                    href={`/components/${next.metadata.slug}`}
                    className='group flex flex-col items-end gap-1 p-4 rounded-lg hover:bg-neutral-900 transition-colors'
                >
                    <span className='text-xs text-neutral-500 flex items-center gap-1 group-hover:text-purple-400 transition-colors'>
                        Next <ChevronsRight className='w-3 h-3' />
                    </span>
                    <span className='text-sm font-medium text-neutral-200 group-hover:text-white'>
                        {next.metadata.name}
                    </span>
                </Link>
            )}
        </div>
    );
}
