import React from 'react';

function TestPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontSize: '24px',
      textAlign: 'center'
    }}>
      <div>
        <h1>✅ App is Working!</h1>
        <p>If you can see this, the React app is running correctly.</p>
        <p>Check the browser console for debug information.</p>
      </div>
    </div>
  );
}

export default TestPage; 