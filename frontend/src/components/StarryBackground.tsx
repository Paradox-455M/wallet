import { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as random from 'maath/random/dist/maath-random.esm';
import type { Points as ThreePoints } from 'three';

type StarsProps = React.ComponentProps<typeof Points>;

type MovingStar = {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
};

type Bubble = {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
};

type StarryBackgroundProps = {
  gradient?: string;
  zIndex?: number;
};

const Stars = (props: StarsProps) => {
  const ref = useRef<ThreePoints | null>(null);
  const [sphere] = useState(() => random.inSphere(new Float32Array(5000), { radius: 1.5 }));

  useEffect(() => {
    let animationFrame: number;
    const animate = () => {
      if (ref.current) {
        ref.current.rotation.x += 0.0005;
        ref.current.rotation.y += 0.0005;
      }
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
        <PointMaterial transparent color="#ffa0e0" size={0.005} sizeAttenuation depthWrite={false} />
      </Points>
    </group>
  );
};

const MovingStars = () => {
  const [stars, setStars] = useState<MovingStar[]>([]);

  useEffect(() => {
    const initialStars: MovingStar[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.8 + 0.2,
    }));
    setStars(initialStars);

    const animate = () => {
      setStars((prevStars) =>
        prevStars
          .map((star) => {
            const nextOpacity = Math.max(0, Math.min(1, star.opacity + (Math.random() - 0.5) * 0.1));
            return {
              ...star,
              x: star.x - star.speed,
              y: star.y + (Math.random() - 0.5) * 0.5,
              opacity: nextOpacity,
            };
          })
          .map((star) => {
            if (star.x < -50) {
              return {
                ...star,
                x: window.innerWidth + 50,
                y: Math.random() * window.innerHeight,
                opacity: Math.random() * 0.8 + 0.2,
              };
            }
            return star;
          })
      );
    };

    const interval = window.setInterval(animate, 50);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
      {stars.map((star) => (
        <div
          key={star.id}
          style={{
            position: 'absolute',
            left: star.x,
            top: star.y,
            width: star.size,
            height: star.size,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '50%',
            opacity: star.opacity,
            boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
            transition: 'all 0.1s ease',
          }}
        />
      ))}
    </div>
  );
};

const SubtleBubbles = () => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    const initialBubbles: Bubble[] = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 8 + 4,
      speed: Math.random() * 1.2 + 0.5,
      opacity: Math.random() * 0.4 + 0.2,
    }));
    setBubbles(initialBubbles);

    const animate = () => {
      setBubbles((prevBubbles) =>
        prevBubbles
          .map((bubble) => {
            const nextOpacity = Math.max(0, Math.min(1, bubble.opacity + (Math.random() - 0.5) * 0.05));
            return {
              ...bubble,
              x: bubble.x + bubble.speed,
              y: bubble.y + (Math.random() - 0.5) * 0.5,
              opacity: nextOpacity,
            };
          })
          .map((bubble) => {
            if (bubble.x > window.innerWidth + 50) {
              return {
                ...bubble,
                x: -50,
                y: Math.random() * window.innerHeight,
                opacity: Math.random() * 0.4 + 0.2,
              };
            }
            return bubble;
          })
      );
    };

    const interval = window.setInterval(animate, 80);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          style={{
            position: 'absolute',
            left: bubble.x,
            top: bubble.y,
            width: bubble.size,
            height: bubble.size,
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            borderRadius: '50%',
            opacity: bubble.opacity,
            boxShadow: '0 0 8px rgba(255, 255, 255, 0.4)',
            transition: 'all 0.2s ease',
            filter: 'blur(0.3px)',
          }}
        />
      ))}
    </div>
  );
};

const StarryBackground = ({ zIndex = -2 }: StarryBackgroundProps) => (
  <div
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex,
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none',
    }}
  >
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(to bottom right, #a78bfa, #7c3aed)',
        zIndex: 1,
      }}
    />
    <Canvas camera={{ position: [0, 0, 1] }} style={{ position: 'absolute', width: '100vw', height: '100vh', zIndex: 2 }}>
      <Stars />
    </Canvas>
    <MovingStars />
    <SubtleBubbles />
  </div>
);

export default StarryBackground;
