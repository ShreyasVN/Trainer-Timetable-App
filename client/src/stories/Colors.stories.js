import React from 'react';

export default {
  title: 'Design System/Colors',
};

const ColorBox = ({ label, color }) => (
  <div style={{ display: 'inline-block', marginRight: '1rem', marginBottom: '1rem' }}>
    <div style={{ width: '3rem', height: '3rem', backgroundColor: color, borderRadius: '0.25rem' }}></div>
    <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>{label}</div>
  </div>
);

export const Colors = () => (
  <div>
    <h3>Primary Colors</h3>
    <ColorBox label="Primary 500" color="var(--primary-500)" />
    <ColorBox label="Primary 600" color="var(--primary-600)" />
    <ColorBox label="Primary 700" color="var(--primary-700)" />
    ...
    <h3>Secondary Colors</h3>
    <ColorBox label="Secondary 500" color="var(--secondary-500)" />
    <ColorBox label="Secondary 600" color="var(--secondary-600)" />
    <ColorBox label="Secondary 700" color="var(--secondary-700)" />
    ...
    <h3>Semantic Colors</h3>
    <ColorBox label="Success 500" color="var(--success-500)" />
    <ColorBox label="Error 500" color="var(--error-500)" />
    <ColorBox label="Warning 500" color="var(--warning-500)" />
    ...
  </div>
);
