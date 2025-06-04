import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as random from 'maath/random/dist/maath-random.esm';

const Stars = (props) => {
  const ref = React.useRef();
  const [sphere] = React.useState(() => random.inSphere(new Float32Array(5000), { radius: 1.5 }));
  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
        <PointMaterial transparent color="#ffa0e0" size={0.005} sizeAttenuation={true} depthWrite={false} />
      </Points>
    </group>
  );
};

const StarryBackground = ({ gradient = 'linear(to-br, purple.400, purple.600)', zIndex = -2 }) => (
  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex, width: '100vw', height: '100vh', pointerEvents: 'none' }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: `linear-gradient(to bottom right, #a78bfa, #7c3aed)`, zIndex: 1 }} />
    <Canvas camera={{ position: [0, 0, 1] }} style={{ position: 'absolute', width: '100vw', height: '100vh', zIndex: 2 }}>
      <Stars />
    </Canvas>
  </div>
);

export default StarryBackground;