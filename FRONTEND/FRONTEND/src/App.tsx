import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'
import { NavBar } from './components/navBar/NavBar'

export function App() {
  const [selectedItem, setSelectedItem] = useState(null)
  return (
    <div>
      <NavBar />
      <main className="App">
        
      </main>
    </div>

  )
}