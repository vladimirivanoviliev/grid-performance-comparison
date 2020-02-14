import React from 'react';
import logo from './logo.svg';
import './App.css';
import { KendoGrid } from './KendoGrid';
import { DataProvider } from './DataService';

import '@progress/kendo-theme-default/dist/all.css';
// import '@progress/kendo-theme-material/dist/all.css';

const App: React.FC = () => {
  return (
    <div className="App">
      <DataProvider>
        <KendoGrid />
      </DataProvider>
    </div>
  );
}

export default App;
