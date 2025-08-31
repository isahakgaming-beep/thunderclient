'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function ModpackManager(){ 
  const [status, setStatus] = useState('idle')
  const installPreset = async () => {
    setStatus('installing')
    // Example preset: sodium (project id "iyadr") -- real ids to be chosen by launcher
    try {
      const res:any = await window.api.invoke('mods:install', { projectId: 'iyadr' })
      if(!res?.ok) throw new Error(res?.error || 'failed')
      setStatus('installed: ' + res.path)
    } catch(e:any){
      setStatus('error: ' + (e?.message||String(e)))
    }
  }
  return <div>
    <h3 className="text-lg font-bold">Modpack Manager</h3>
    <p>Install curated presets (Sodium/Iris/Lithium)</p>
    <Button onClick={installPreset}>Install Performance Preset</Button>
    <div>Status: {status}</div>
  </div>
}
