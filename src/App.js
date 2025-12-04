import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || '';

function App() {
  const [counter, setCounter] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCounter();
  }, []);

  const fetchCounter = async () => {
    try {
      const response = await fetch(`${API_URL}/api/counter`);
      const data = await response.json();
      setCounter(data.value);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching counter:', error);
      setLoading(false);
    }
  };

  const incrementCounter = async () => {
    try {
      const response = await fetch(`${API_URL}/api/counter/increment`, {
        method: 'POST',
      });
      const data = await response.json();
      setCounter(data.value);
    } catch (error) {
      console.error('Error incrementing counter:', error);
    }
  };

  const resetCounter = async () => {
    try {
      const response = await fetch(`${API_URL}/api/counter/reset`, {
        method: 'POST',
      });
      const data = await response.json();
      setCounter(data.value);
    } catch (error) {
      console.error('Error resetting counter:', error);
    }
  };

  if (loading) return <div className="App">Loading...</div>;

  return (
    <div className="App">
      <header className="App-header">
        <h1>Clicker Application</h1>
        <div className="counter-display">
          <h2>Counter: {counter}</h2>
        </div>
        <div className="button-group">
          <button onClick={incrementCounter} className="btn-increment">
            Click Me! (+1)
          </button>
          <button onClick={resetCounter} className="btn-reset">
            Reset
          </button>
        </div>
      </header>
    </div>
  );
}

export default App;