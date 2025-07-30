import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as random from 'maath/random/dist/maath-random.esm';

const Stars = (props) => {
  const ref = React.useRef();
  const [sphere] = React.useState(() => random.inSphere(new Float32Array(5000), { radius: 1.5 }));
  
  React.useEffect(() => {
    const animate = () => {
      if (ref.current) {
        ref.current.rotation.x += 0.0005;
        ref.current.rotation.y += 0.0005;
      }
      requestAnimationFrame(animate);
    };
    animate();
  }, []);

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
        <PointMaterial transparent color="#ffa0e0" size={0.005} sizeAttenuation={true} depthWrite={false} />
      </Points>
    </group>
  );
};

// Moving stars component
const MovingStars = () => {
  const [stars, setStars] = React.useState([]);

  React.useEffect(() => {
    // Create initial stars
    const initialStars = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.8 + 0.2
    }));
    setStars(initialStars);

    // Animate stars
    const animate = () => {
      setStars(prevStars => 
        prevStars.map(star => ({
          ...star,
          x: star.x - star.speed,
          y: star.y + (Math.random() - 0.5) * 0.5,
          opacity: star.opacity + (Math.random() - 0.5) * 0.1
        })).map(star => {
          // Reset star if it goes off screen
          if (star.x < -50) {
            return {
              ...star,
              x: window.innerWidth + 50,
              y: Math.random() * window.innerHeight,
              opacity: Math.random() * 0.8 + 0.2
            };
          }
          return star;
        })
      );
    };

    const interval = setInterval(animate, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
      {stars.map(star => (
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
            transition: 'all 0.1s ease'
          }}
        />
      ))}
    </div>
  );
};

// Subtle bubbles component - very subtle bubbles moving from left to right
const SubtleBubbles = () => {
  const [bubbles, setBubbles] = React.useState([]);

  React.useEffect(() => {
    // Create initial bubbles - more visible but still subtle
    const initialBubbles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 8 + 4, // Larger size (4-12px)
      speed: Math.random() * 1.2 + 0.5, // Slightly faster
      opacity: Math.random() * 0.4 + 0.2 // Higher opacity (20-60%)
    }));
    setBubbles(initialBubbles);

    // Animate bubbles
    const animate = () => {
      setBubbles(prevBubbles => 
        prevBubbles.map(bubble => ({
          ...bubble,
          x: bubble.x + bubble.speed, // Move right
          y: bubble.y + (Math.random() - 0.5) * 0.5, // Slight vertical movement
          opacity: bubble.opacity + (Math.random() - 0.5) * 0.05 // Subtle opacity change
        })).map(bubble => {
          // Reset bubble if it goes off screen
          if (bubble.x > window.innerWidth + 50) {
            return {
              ...bubble,
              x: -50,
              y: Math.random() * window.innerHeight,
              opacity: Math.random() * 0.4 + 0.2
            };
          }
          return bubble;
        })
      );
    };

    const interval = setInterval(animate, 80); // Slightly faster animation
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
      {bubbles.map(bubble => (
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
            filter: 'blur(0.3px)'
          }}
        />
      ))}
    </div>
  );
};

const StarryBackground = ({ gradient = 'linear(to-br, purple.400, purple.600)', zIndex = -2 }) => (
  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex, width: '100vw', height: '100vh', pointerEvents: 'none' }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: `linear-gradient(to bottom right, #a78bfa, #7c3aed)`, zIndex: 1 }} />
    <Canvas camera={{ position: [0, 0, 1] }} style={{ position: 'absolute', width: '100vw', height: '100vh', zIndex: 2 }}>
      <Stars />
    </Canvas>
    <MovingStars />
    <SubtleBubbles />
  </div>
);

export default StarryBackground;