import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Clicker from './Clicker';
import History from './History';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Clicker />} />
      <Route path="/history" element={<History />} />
    </Routes>
  );
}

export default App;
