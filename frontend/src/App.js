import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SwapPageReal from "./components/SwapPageReal";
import { WalletProvider } from "./context/WalletContext";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <div className="App">
      <WalletProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<SwapPageReal />} />
          </Routes>
        </BrowserRouter>
        <Toaster 
          theme="dark" 
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a1a',
              border: '1px solid #4a4a4a',
              color: '#f5f5dc',
            },
          }}
        />
      </WalletProvider>
    </div>
  );
}

export default App;