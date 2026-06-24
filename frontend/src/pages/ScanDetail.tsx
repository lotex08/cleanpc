import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../lib/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export default function ScanDetail() {
  const { id } = useParams()
  const [scan, setScan] = useState<any>(null)

  useEffect(() => {
    api.scans.get(id!).then(setScan).catch(() => {})
  }, [id])

  if (!scan) return <p className="text-gray-400">Cargando...</p>

  const files = (scan.files || []).slice(0, 100)

  const catSize: Record<string, number> = {}
  files.forEach((f: any) => {
    catSize[f.category] = (catSize[f.category] || 0) + f.size
  })
  const barData = Object.entries(catSize).map(([k, v]) => ({ name: k, size: v }))

  return (
    <div className="space-y-6">
      <Link to="/app" className="text-brand-600 text-sm hover:underline">← Volver</Link>
      <h1 className="text-2xl font-bold">Detalle del Escaneo</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Archivos', value: scan.total_files.toLocaleString() },
          { label: 'Carpetas', value: scan.total_folders.toLocaleString() },
          { label: 'Espacio Total', value: formatBytes(scan.total_size) },
          { label: 'Fecha', value: new Date(scan.created_at).toLocaleDateString() },
        ].map(s => (
          <div key={s.label} className="bg-white p-4 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {scan.duplicates_count > 0 && (
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="font-bold text-red-500 mb-2">Archivos Duplicados</h3>
          <p className="text-sm text-gray-500 mb-4">
            {scan.duplicates_count} grupos · {formatBytes(scan.duplicates_size)} desperdiciados
          </p>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {(scan.duplicates || []).map((d: any) => (
              <div key={d.id} className="bg-red-50 p-3 rounded-lg text-sm">
                <p className="font-medium">{d.file_count} archivos · {formatBytes(d.total_size)}</p>
                <div className="text-xs text-gray-500 truncate">
                  {(d.files || []).slice(0, 3).map((fp: string) => <p key={fp} className="truncate">{fp}</p>)}
                  {(d.files || []).length > 3 && <p className="text-gray-400">y {d.files.length - 3} más...</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {barData.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="font-bold mb-4">Espacio por Categoría</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <XAxis dataKey="name" tick={{fontSize: 11}} />
              <YAxis tickFormatter={v => formatBytes(v)} tick={{fontSize: 11}} />
              <Tooltip formatter={(v: number) => formatBytes(v)} />
              <Bar dataKey="size" fill="#0ea5e9" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-bold">Archivos ({scan.total_files})</h3>
        </div>
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-2 font-medium text-gray-500">Nombre</th>
                <th className="px-4 py-2 font-medium text-gray-500">Categoría</th>
                <th className="px-4 py-2 font-medium text-gray-500 text-right">Tamaño</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {files.slice(0, 50).map((f: any, i: number) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-2 truncate max-w-xs">{f.name}</td>
                  <td className="px-4 py-2 text-gray-500">{f.category}</td>
                  <td className="px-4 py-2 text-right">{formatBytes(f.size)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
