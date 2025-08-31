'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

const ModpackManager: React.FC = () => {
  const [status, setStatus] = useState('idle')

  const installPreset = async () => {
    try {
      setStatus('installing')
      // Exemple : installe un mod via IPC (projectId à adapter si besoin)
      const res: any = await (window as any).api?.invoke('mods:install', { projectId: 'iyadr' })
      if (!res?.ok) throw new Error(res?.error || 'failed')
      setStatus('installed: ' + res.path)
    } catch (e: any) {
      setStatus('error: ' + (e?.message || String(e)))
    }
  }

  return (
    <div>
      <h3 className="text-lg font-bold">Modpack Manager</h3>
      <p>Install curated presets (Sodium/Iris/Lithium)</p>
      <Button onClick={installPreset}>Install Performance Preset</Button>
      <div>Status: {status}</div>
    </div>
  )
}

export default ModpackManager
export { ModpackManager } // <-- ajoute aussi l’export nommé pour corriger l’import
