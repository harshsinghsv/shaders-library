// import { TabsProvider, TabsBtn, TabsContent } from './tabs';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/website/ui/tabs';
import docs from '@/configs/docs.json';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/website/ui/dialog';
import { Pre, RawCode, highlight } from 'codehike/code';

import {
  DrawerContent,
  ResponsiveDrawer,
} from '@/components/core/drawer/vaul-main';
import ComponentPreview from './component-preview';
import { extractCodeFromFilePath } from '@/lib/code';
import React from 'react';
import { Code, Eye, Maximize2 } from 'lucide-react';
import prettier from 'prettier';

import { CopyButton } from './copy-button';
import { ScrollArea } from '../ui/scroll-area';
import ComponentBlocks from './component-block';
import { callout, wordWrap } from '../constant';
import { cn } from '@/lib/utils';
import ts from 'typescript';

type ComponentCodePreview = {
  component: React.ReactElement;
  hasReTrigger?: boolean;
  name: string;
  children: React.ReactNode; //
  responsive?: boolean;
  isCard?: string;
};
export type TCurrComponentProps = {
  componentName: string;
  iframeSrc?: string;
  componentSrc?: React.LazyExoticComponent<React.FC<{}>>;
  filesrc?: string;
  compIframeSrc?: string;
  filesArray?: any;
};

interface CodeBlockProps {
  codeblock: string;
  filesrc: string;
  comName: string;
  children: React.ReactNode;
  [key: string]: unknown;
}

export default async function DrawerCodePreview({
  hasReTrigger,
  name,
  children,
  isCard,
  responsive,
}: ComponentCodePreview) {
  // console.log(children);

  const Codes = React.Children.toArray(children) as React.ReactElement<CodeBlockProps>[];
  const parsedCodeblock = Codes[0]?.props as CodeBlockProps;
  // console.log(parsedCodeblock);

  const currComponent: TCurrComponentProps | null =
    docs.dataArray.reduce<TCurrComponentProps | null>((acc, component) => {
      const file = component?.componentArray?.find(
        (file) => file.componentName === name
      );

      if (file) {
        acc = file;
      }
      return acc;
    }, null);

  if (!currComponent) {
    return <div>Component not found</div>;
  }
  // console.log(currComponent);

  // console.log('childer', children);

  // const isDesktop = useMediaQuery('(min-width: 768px)');
  // if (isDesktop) {
  // console.log(parsedCodeblock.codeblock);
  const getcode = JSON.parse((Codes[0]?.props as CodeBlockProps).codeblock);
  const result = ts.transpileModule(getcode, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ESNext,
      jsx: ts.JsxEmit.Preserve,
      removeComments: true,
    },
  });

  let jsCode = result.outputText.replace(/"use strict";\s*/, '');

  // Format JavaScript code using Prettier
  const formattedJsCode = await prettier.format(jsCode, {
    parser: 'babel',
    semi: true,
    singleQuote: true,
    trailingComma: 'es5',
    printWidth: 80,
    jsxBracketSameLine: true, // Keep JSX tags in one line
  });

  const tsCode = {
    value: getcode,
    lang: 'tsx',
    meta: '',
  };

  const jsCodeblock = {
    value: formattedJsCode,
    lang: 'js',
    meta: '',
  };

  // Highlight the code
  const tshighlighted = await highlight(tsCode, 'github-from-css');
  const jshighlighted = await highlight(jsCodeblock, 'github-from-css');

  return (
    <>
      <div
        className={`${
          isCard ? 'p-10 h-[550px]' : '2xl:p-20 py-16 px-2 h-fit'
        } my-2 w-full border border-neutral-800 rounded-lg overflow-hidden bg-black bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:20px_20px] relative grid place-content-center`}
      >
        <div className='not-prose'>
          <ComponentBlocks componentfile={parsedCodeblock.filesrc} />
        </div>

        <div className='absolute top-2 right-2 flex justify-center items-center gap-2'>
          <CopyButton
            code={parsedCodeblock.codeblock}
            classname='relative top-0 left-0'
          />
          <ResponsiveDrawer
            classname='max-w-screen-lg p-2'
            triggerContent={
              <button className='bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg p-2 h-8 w-8 grid place-content-center transition-colors'>
                <Maximize2 className='text-neutral-400 h-5 w-5' />
              </button>
            }
          >
            <DrawerContent classname='2xl:max-h-[62vh] max-h-[80vh] overflow-auto bg-neutral-900'>
              <Tabs
                className='relative'
                defaultValue={`${parsedCodeblock.comName}-typescript`}
              >
                <TabsList
                  className={cn(
                    'absolute right-20 top-6 z-[1] h-9 p-0.5 border border-neutral-700 bg-neutral-900'
                  )}
                >
                  <TabsTrigger
                    value={`${parsedCodeblock.comName}-typescript`}
                    className='h-8 text-neutral-400 data-[state=active]:bg-neutral-700 data-[state=active]:text-white'
                  >
                    Ts
                  </TabsTrigger>
                  <TabsTrigger
                    value={`${parsedCodeblock.comName}-javascript`}
                    className='h-8 text-neutral-400 data-[state=active]:bg-neutral-700 data-[state=active]:text-white'
                  >
                    Js{' '}
                  </TabsTrigger>
                </TabsList>
                <TabsContent
                  className='mt-0 p-4'
                  value={`${parsedCodeblock.comName}-typescript`}
                >
                  <CopyButton
                    code={tshighlighted.code}
                    classname={cn('top-6 right-10')}
                  />
                  <Pre
                    code={tshighlighted}
                    handlers={[callout, wordWrap]}
                    className={cn('m-0 bg-neutral-900 max-h-[450px]')}
                  />
                  {parsedCodeblock.children}
                </TabsContent>
                <TabsContent value={`${parsedCodeblock.comName}-javascript`}>
                  <CopyButton
                    code={jshighlighted.code}
                    classname={cn('top-6 right-10')}
                  />
                  <Pre
                    code={jshighlighted}
                    handlers={[callout, wordWrap]}
                    className={cn('m-0 bg-neutral-900 max-h-[450px]')}
                  />
                  {parsedCodeblock.children}
                </TabsContent>
              </Tabs>
            </DrawerContent>
          </ResponsiveDrawer>
        </div>
      </div>
    </>
  );
}
