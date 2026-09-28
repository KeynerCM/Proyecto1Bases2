import { useState } from 'react'
import './App.css'
import { NavBar } from './components/navBar/NavBar'
import {InicioSection} from './components/InicioSection/InicioSection'
export function App() {
  const [selectedItem, setSelectedSection] = useState('Inicio')
  const sections = {
    'Inicio': <InicioSection />
   // 'Clientes': <ClientesSection />,
    //'Proveedores': <ProveedoresSection />,
    //'Inventarios': <InventariosSection />
  }
  return (
    <div>
      <NavBar setSelectedSection={setSelectedSection} />
      <main className="App">
        <h1 className="heading">{selectedItem}</h1>
        {sections[selectedItem]}
      </main>
    </div>

  )
}