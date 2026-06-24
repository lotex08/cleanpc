import { Link } from 'react-router-dom'

export default function Pricing() {
  const plans = [
    { name: 'Free', price: 0, scans: 5, features: ['5 escaneos', 'Reporte básico', 'Duplicados'], cta: 'Comenzar' },
    { name: 'Pro', price: 5.99, scans: 100, features: ['100 escaneos', 'Reportes detallados', 'Duplicados + grandes', 'Archivos antiguos', 'Gráficas'], cta: 'Probar Pro', popular: true },
    { name: 'Ilimitado', price: 9.99, scans: '∞', features: ['Escaneos ilimitados', 'Todo de Pro', 'Prioridad', 'Soporte por email'], cta: 'Ilimitado' },
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
        <h1 className="text-4xl font-bold mb-2">Planes</h1>
        <p className="text-gray-500 mb-12">Elige el plan que mejor se ajuste a tus necesidades</p>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map(p => (
            <div key={p.name} className={`bg-white rounded-2xl border-2 p-8 ${p.popular ? 'border-brand-500 relative' : 'border-gray-200'}`}>
              {p.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white px-4 py-0.5 rounded-full text-xs font-bold">POPULAR</span>}
              <h3 className="text-lg font-bold mb-2">{p.name}</h3>
              <p className="text-3xl font-bold mb-1">${p.price}<span className="text-sm font-normal text-gray-400">{p.price > 0 ? '/mes' : ''}</span></p>
              <p className="text-sm text-gray-400 mb-6">{p.scans} escaneos</p>
              <ul className="text-left space-y-2 mb-8">
                {p.features.map(f => <li key={f} className="text-sm text-gray-600 flex items-center gap-2"><span className="text-green-500">✓</span>{f}</li>)}
              </ul>
              <Link to="/register" className={`block py-2 rounded-xl font-medium ${p.popular ? 'bg-brand-600 text-white hover:bg-brand-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
