'use client';
import LightPillar from './Lightening';

export default function Hero() {
    return (
        <div className="absolute inset-0 w-full h-full bg-black">
            <LightPillar
                topColor="#00FFFF"
                bottomColor="#FF00FF"
                accentColor="#FFFF00"
                intensity={0.6}
                rotationSpeed={0.4}
                interactive={true}
                glowAmount={0.003}
                pillarWidth={3.5}
                pillarHeight={0.35}
                noiseIntensity={0.4}
                chromaticAberration={0.004}
                energyPulse={true}
                particleEffect={true}
                quality="high"
                mixBlendMode="screen"
            />
        </div>
    );
}
