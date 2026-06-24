import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16', '#94a3b8']

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export default function Dashboard() {
  const [scans, setScans] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [scanning, setScanning] = useState(false)
  const [path, setPath] = useState('')
  const [showPath, setShowPath] = useState(false)

  const load = async () => {
    try {
      const [u, s] = await Promise.all([api.auth.me(), api.scans.list()])
      setUser(u)
      setScans(s)
    } catch {}
  }

  useEffect(() => { load() }, [])

  const startScan = async () => {
    setScanning(true)
    try {
      await api.scans.create(path || undefined)
      await load()
    } catch (err: any) {
      alert(err.message)
    }
    setScanning(false)
  }

  const lastScan = scans[0]
  let categories = { counts: {}, sizes: {} }
  if (lastScan?.categories) {
    try { categories = JSON.parse(lastScan.categories) } catch {}
  }

  const pieData = Object.entries(categories.counts as Record<string, number>).map(([k, v]) => ({ name: k, value: v }))
  const barData = Object.entries(categories.sizes as Record<string, number>).map(([k, v]) => ({ name: k, size: v }))

  const totalScansUsed = user?.scan_count || 0
  const totalScansLimit = user?.scan_limit || 80

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            {totalScansUsed}/{totalScansLimit === -1 ? '∞' : totalScansLimit} escaneos
          </span>
          {totalScansLimit !== -1 && totalScansUsed >= totalScansLimit && (
            <Link to="/pricing" className="text-sm text-brand-600 font-medium hover:underline">
              Upgrade
            </Link>
          )}
          <button
            onClick={() => setShowPath(!showPath)}
            disabled={scanning || (totalScansLimit !== -1 && totalScansUsed >= totalScansLimit)}
            className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 text-sm font-medium"
          >
            {scanning ? 'Escaneando...' : 'Nuevo Escaneo'}
          </button>
        </div>
      </div>

      {showPath && (
        <div className="bg-white p-4 rounded-xl border border-gray-200 flex gap-2">
          <input
            type="text"
            value={path}
            onChange={e => setPath(e.target.value)}
            placeholder="Ruta a escanear (ej: /home/usuario/Descargas)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <button onClick={() => { startScan(); setShowPath(false) }} className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm">
            Escanear
          </button>
          <button onClick={() => setShowPath(false)} className="px-3 py-2 text-gray-500 text-sm">Cancelar</button>
        </div>
      )}

      {lastScan ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Archivos', value: lastScan.total_files.toLocaleString(), color: 'text-brand-600' },
              { label: 'Carpetas', value: lastScan.total_folders.toLocaleString(), color: 'text-green-600' },
              { label: 'Duplicados', value: lastScan.duplicates_count, color: 'text-red-500' },
              { label: 'Espacio Total', value: formatBytes(lastScan.total_size), color: 'text-purple-600' },
            ].map(s => (
              <div key={s.label} className="bg-white p-4 rounded-xl border border-gray-200">
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="font-bold mb-4">Archivos por Categoría</h3>
              {pieData.length > 0 && (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name }) => name}>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="font-bold mb-4">Espacio por Categoría</h3>
              {barData.length > 0 && (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={barData}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={v => formatBytes(v)} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => formatBytes(v)} />
                    <Bar dataKey="size" fill="#0ea5e9" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white p-12 rounded-xl border border-gray-200 text-center">
          <p className="text-gray-400 text-lg mb-2">No tienes escaneos aún</p>
          <p className="text-gray-400 mb-4">Haz clic en "Nuevo Escaneo" para analizar tu PC</p>
        </div>
      )}

      {scans.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-bold">Historial de Escaneos</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {scans.map(s => (
              <Link key={s.id} to={`/app/scan/${s.id}`} className="flex items-center justify-between p-4 hover:bg-gray-50">
                <div>
                  <p className="text-sm font-medium">{new Date(s.created_at).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-400">{s.total_files.toLocaleString()} archivos · {formatBytes(s.total_size)}</p>
                </div>
                <div className="text-right">
                  {s.duplicates_count > 0 && <p className="text-xs text-red-500">{s.duplicates_count} duplicados</p>}
                  <span className="text-brand-600 text-sm">Ver →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
