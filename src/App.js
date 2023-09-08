import './App.css'
import React from 'react'
import Webcam from 'react-webcam'
import Drawer from '@mui/material/Drawer';
import Fab from '@mui/material/Fab'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'

import SettingsIcon from '@mui/icons-material/Settings';

function App() {
  const [deviceId, setDeviceId] = React.useState({})
  const [devices, setDevices] = React.useState([])
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)

  const handleDevices = React.useCallback(
    mediaDevices => {
      const d = mediaDevices.filter(({ kind }) => kind === "videoinput")
      setDevices(d)

      setDeviceId(d.find((c) => c.label.includes('ZV')).deviceId)
    },
    [setDevices, setDeviceId]
  )

  const handleChange = (e) => {
    setDeviceId(e.target.value)
  }

  React.useEffect(
    () => {
      navigator.mediaDevices.enumerateDevices().then(handleDevices)
    },
    [handleDevices]
  )

  return (
    <>
      <Webcam
        mirrored
        height={720}
        width={1280}
        audio={false}
        videoConstraints={{ deviceId }}
        style={{
          position: 'absolute',
          top: 310,
          left: -230,
          width: '100vh',
          transform: 'rotate(-90deg)',
        }}
      />
      <Fab
        color="error"
        size="small"
        onClick={() => setIsDrawerOpen(true)}
        sx={{
          position: 'absolute',
          right: '1em',
          bottom: '1em',
        }}
      >
        <SettingsIcon/>
      </Fab>
      <Drawer
        anchor="right"
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
      >
        <Select
          value={deviceId}
          onChange={handleChange}
          sx={{
            margin: '1em',
          }}
        >
          {devices.map((device, key) => {
            return <MenuItem value={device.deviceId}>{device.label}</MenuItem>
          })}
        </Select>
      </Drawer>
    </>
  )
}

export default App
