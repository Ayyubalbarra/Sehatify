import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import App from "./App.tsx"

// 1. Import komponen yang dibutuhkan
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// 2. Buat instance baru dari QueryClient
const queryClient = new QueryClient()

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement)
root.render(
  <React.StrictMode>
    {/* 3. Bungkus komponen <App /> dengan QueryClientProvider */}
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
)