import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { I18nProvider } from './common-submodule/src/i18n/I18nContext'
import Layout from './pages/Layout/Layout'
import HuberfitApp from './pages/Huberfit/HuberfitApp'
import CalculadoraPage from './pages/Calculadora/CalculadoraPage'

function App() {
  return (
    <I18nProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HuberfitApp />} />
            <Route path="/calculadora" element={<CalculadoraPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </I18nProvider>
  )
}

export default App