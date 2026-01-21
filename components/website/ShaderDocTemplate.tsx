import { getShaderBySlug } from '@/components/shaders';

export function ShaderDocTemplate({ slug }: { slug: string }) {
    const shader = getShaderBySlug(slug);
    if (!shader) return null;

    return (
        <>
            <div className="h-96 rounded-lg overflow-hidden border border-neutral-800 bg-black relative mb-8">
                <shader.Hero />
            </div>

            <h2>Installation</h2>
            <div className="not-prose bg-neutral-950 p-4 rounded-lg border border-neutral-800 mb-6">
                <code className="text-sm text-neutral-400">npx shaderz add {shader.metadata.id}</code>
            </div>

            <h2>Usage</h2>
            <div className="not-prose bg-neutral-950 p-4 rounded-lg border border-neutral-800 mb-6 overflow-x-auto">
                <pre className="text-sm text-neutral-400">
                    {`import ${shader.metadata.name.replace(/\s/g, '')} from '@/components/shaders/${shader.metadata.id}/Hero';

export default function App() {
  return (
    <div style={{ height: '500px', position: 'relative' }}>
        <${shader.metadata.name.replace(/\s/g, '')} />
    </div>
  );
}`}
                </pre>
            </div>
        </>
    );
}
