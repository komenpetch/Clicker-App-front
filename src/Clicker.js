import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || '';

function Clicker() {
  const [counter, setCounter] = useState(0);
  const [clicksPerClick, setClicksPerClick] = useState(1);
  const [upgrades, setUpgrades] = useState([]);
  const [ownedUpgrades, setOwnedUpgrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pluginInfo, setPluginInfo] = useState(null);
  const [floatingNumbers, setFloatingNumbers] = useState([]);

  useEffect(() => {
    fetchCounter();
    fetchUpgrades();
    fetchPluginInfo();
  }, []);

  // Poll counter every second for auto-click updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchCounter();
    }, 1000); // Update every 1 second

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const fetchCounter = async () => {
    try {
      const response = await fetch(`${API_URL}/api/counter`);
      const data = await response.json();
      setCounter(data.value);
      setClicksPerClick(data.clicksPerClick);
      setOwnedUpgrades(data.upgrades || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching counter:', error);
      setLoading(false);
    }
  };

  const fetchUpgrades = async () => {
    try {
      const response = await fetch(`${API_URL}/api/upgrades`);
      const data = await response.json();
      setUpgrades(data.upgrades || []);
    } catch (error) {
      console.error('Error fetching upgrades:', error);
    }
  };

  const fetchPluginInfo = async () => {
    try {
      const response = await fetch(`${API_URL}/api/plugin/info`);
      const data = await response.json();
      setPluginInfo(data);
    } catch (error) {
      console.error('Error fetching plugin info:', error);
    }
  };

  const incrementCounter = async () => {
    try {
      const response = await fetch(`${API_URL}/api/counter/increment`, {
        method: 'POST',
      });
      const data = await response.json();
      setCounter(data.value);
      setClicksPerClick(data.clicksPerClick);

      // Add floating number animation
      const id = Date.now();
      setFloatingNumbers(prev => [...prev, { id, value: data.clicksPerClick }]);
      setTimeout(() => {
        setFloatingNumbers(prev => prev.filter(num => num.id !== id));
      }, 1000);

      fetchUpgrades(); // Refresh upgrades to update affordability
    } catch (error) {
      console.error('Error incrementing counter:', error);
    }
  };

  const purchaseUpgrade = async (upgradeId) => {
    try {
      const response = await fetch(`${API_URL}/api/upgrades/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ upgradeId }),
      });
      const data = await response.json();
      
      if (data.success) {
        setCounter(data.newTotal);
        setOwnedUpgrades([...ownedUpgrades, upgradeId]);
        fetchUpgrades(); // Refresh upgrades
        alert(data.message);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error purchasing upgrade:', error);
      alert('Failed to purchase upgrade');
    }
  };

  const resetCounter = async () => {
    if (!window.confirm('Are you sure you want to reset? This will remove all upgrades!')) {
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/api/counter/reset`, {
        method: 'POST',
      });
      const data = await response.json();
      setCounter(data.value);
      setClicksPerClick(1);
      setOwnedUpgrades([]);
      fetchUpgrades();
    } catch (error) {
      console.error('Error resetting counter:', error);
    }
  };

  if (loading) return <div className="App">Loading...</div>;

  // Organize upgrades: Affordable first, then unaffordable, then purchased
  const organizedUpgrades = [...upgrades].sort((a, b) => {
    // Purchased items go to the end
    if (a.is_purchased && !b.is_purchased) return 1;
    if (!a.is_purchased && b.is_purchased) return -1;

    // Among unpurchased items
    if (!a.is_purchased && !b.is_purchased) {
      const aAffordable = counter >= a.cost;
      const bAffordable = counter >= b.cost;

      // Affordable items come first
      if (aAffordable && !bAffordable) return -1;
      if (!aAffordable && bAffordable) return 1;

      // Within same affordability, sort by cost (ascending)
      return a.cost - b.cost;
    }

    // Among purchased items, sort by cost
    return a.cost - b.cost;
  });

  return (
    <div className="App">
      <header className="App-header">
        <h1>🍪 Clicker Application</h1>

        {pluginInfo && (
          <div className="plugin-info">
            <small>Plugin: {pluginInfo.name} {pluginInfo.version}</small>
          </div>
        )}

        <div className="counter-display">
          <h2>{counter} clicks</h2>
          <p className="per-click">+{clicksPerClick} per click</p>

          {floatingNumbers.map(num => (
            <div key={num.id} className="floating-number">
              +{num.value}
            </div>
          ))}
        </div>

        <div className="button-group">
          <button onClick={incrementCounter} className="btn-increment">
            Click Me! (+{clicksPerClick})
          </button>
          <button onClick={resetCounter} className="btn-reset">
            Reset
          </button>
          <Link to="/history" className="btn-history">
            📜 View History
          </Link>
        </div>

        <div className="upgrades-section">
          <h3>🛒 Upgrades Shop</h3>
          <div className="upgrades-list">
            {organizedUpgrades.map((upgrade) => (
              <div
                key={upgrade.id}
                className={`upgrade-card ${upgrade.is_purchased ? 'purchased' : ''} ${counter >= upgrade.cost && !upgrade.is_purchased ? 'affordable' : ''}`}
              >
                <div className="upgrade-header">
                  <h4>{upgrade.name}</h4>
                  {upgrade.is_purchased && <span className="badge">✓ Owned</span>}
                </div>
                <p className="upgrade-description">{upgrade.description}</p>
                <div className="upgrade-footer">
                  <span className="upgrade-cost">Cost: {upgrade.cost} clicks</span>
                  {!upgrade.is_purchased && (
                    <button
                      onClick={() => purchaseUpgrade(upgrade.id)}
                      disabled={counter < upgrade.cost}
                      className="btn-buy"
                    >
                      {counter >= upgrade.cost ? 'Buy' : 'Not enough clicks'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </header>
    </div>
  );
}

export default Clicker;