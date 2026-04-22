import { I18nProvider } from './common-submodule/src/i18n/I18nContext'
import HuberfitApp from './pages/Huberfit/HuberfitApp'

function App() {
  return (
    <I18nProvider>
      <HuberfitApp />
    </I18nProvider>
  )
}

export default App