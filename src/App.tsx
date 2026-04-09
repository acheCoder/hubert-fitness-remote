import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="fitness-scope"> 
      <section id="center">
        <div className="hero">
          <h1>💪 Hubert Fitness Coach</h1>
          <p>Tu transformación empieza aquí. Estás en el módulo de <b>Entrenamiento Personal</b>.</p>
        </div>
        
        <div style={{ margin: '2rem 0', padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '12px' }}>
          <h3>Sesiones completadas esta semana</h3>
          <p style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--accent)' }}>{count}</p>
          <button className="counter" onClick={() => setCount(count + 1)}>
            Registrar entrenamiento +
          </button>
        </div>
      </section>

      <section id="next-steps">
        <div id="docs">
          <h2>Planes activos</h2>
          <p>Consulta tus rutinas de fuerza y cardio.</p>
        </div>
        <div id="social">
          <h2>Mi Comunidad</h2>
          <p>Únete a nuestro grupo de Discord para motivación diaria.</p>
        </div>
      </section>
    </div>
  )
}

export default App