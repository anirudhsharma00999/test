import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Scanner from './components/Scanner';
import ThreatDatabase from './components/ThreatDatabase';
import Analytics from './components/Analytics';
import BrowserExtension from './components/BrowserExtension';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'scanner':
        return <Scanner />;
      case 'threats':
        return <ThreatDatabase />;
      case 'analytics':
        return <Analytics />;
      case 'extension':
        return <BrowserExtension />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="pt-16">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;