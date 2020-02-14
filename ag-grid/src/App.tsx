import React from 'react';
import './App.css';
import { AgGrid } from './AgGrid';
import { DataProvider } from './DataService';

const App: React.FC = () => {
  return (
    <div className="App">
      <DataProvider>
        <AgGrid />
      </DataProvider>
    </div>
  );
}

export default App;
