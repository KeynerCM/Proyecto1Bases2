import { useState } from 'react'
import './App.css'
import { NavBar } from './components/navBar/NavBar'

export function App() {
  const [selectedItem, setSelectedSection] = useState('Inicio')
  //const sections: {}
  return (
    <div>
      <NavBar setSelectedSection={setSelectedSection} />
      <main className="App">
        <h1>{selectedItem}</h1>
        
      </main>
    </div>

  )
}