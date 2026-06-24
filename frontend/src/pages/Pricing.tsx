import { Link } from 'react-router-dom'

export default function Pricing() {
  const plans = [
    { name: 'Gratis', price: 0, scans: '∞', features: ['Escaneos ilimitados', 'Reportes detallados', 'Duplicados', 'Archivos grandes', 'Archivos antiguos', 'Gráficas'], cta: 'Comenzar' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-brand-600">CleanPC</Link>
        <div className="flex gap-3">
          <Link to="/login" className="px-4 py-2 text-gray-600 text-sm">Iniciar Sesión</Link>
          <Link to="/register" className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm">Registrarse</Link>
        </div>
      </nav>
      <section className="max-w-5xl mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl font-bold mb-2">Totalmente gratis</h1>
        <p className="text-gray-500 mb-12">Sin límites, sin tarjeta, sin registro necesario para descargar</p>
        <div className="max-w-sm mx-auto">
          <div className="bg-white rounded-2xl border-2 border-brand-500 p-8 relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white px-4 py-0.5 rounded-full text-xs font-bold">GRATIS</span>
            <h3 className="text-lg font-bold mb-2">{plans[0].name}</h3>
            <p className="text-3xl font-bold mb-1">$0</p>
            <p className="text-sm text-gray-400 mb-6">{plans[0].scans} escaneos</p>
            <ul className="text-left space-y-2 mb-8">
              {plans[0].features.map(f => <li key={f} className="text-sm text-gray-600 flex items-center gap-2"><span className="text-green-500">✓</span>{f}</li>)}
            </ul>
            <Link to="/register" className="block py-2 rounded-xl font-medium bg-brand-600 text-white hover:bg-brand-700">
              {plans[0].cta}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
