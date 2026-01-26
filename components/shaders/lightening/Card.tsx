'use client';
import LightPillar from './Lightening';

export default function Card() {
    return (
        <div className="w-full h-full bg-black relative overflow-hidden">
            <LightPillar
                topColor="#00FFFF"
                bottomColor="#FF00FF"
                accentColor="#FFFF00"
                intensity={1.0}
                rotationSpeed={0.2}
                interactive={false}
                glowAmount={0.005}
                pillarWidth={2.5}
                pillarHeight={0.3}
                noiseIntensity={0.3}
                quality="low"
                mixBlendMode="screen"
                particleEffect={false}
                chromaticAberration={0.002}
                energyPulse={true}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        </div>
    );
}
