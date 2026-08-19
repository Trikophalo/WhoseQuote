import { Game } from './components/Game'
import { Footer } from './components/Footer'
import { useRoute } from './router'
import { BildnachweisePage, DatenschutzPage, FaqPage, ImpressumPage, NutzungsbedingungenPage } from './pages/legal'

export default function App() {
  const route = useRoute()

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="flex-1">
        {route === 'game' && <Game />}
        {route === 'faq' && <FaqPage />}
        {route === 'impressum' && <ImpressumPage />}
        {route === 'datenschutz' && <DatenschutzPage />}
        {route === 'nutzungsbedingungen' && <NutzungsbedingungenPage />}
        {route === 'bildnachweise' && <BildnachweisePage />}
      </main>
      <Footer />
    </div>
  )
}
