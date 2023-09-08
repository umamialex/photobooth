import './App.css'
import React from 'react'
import Webcam from 'react-webcam'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'

function App() {
  const [deviceId, setDeviceId] = React.useState({})
  const [devices, setDevices] = React.useState([])

  const handleDevices = React.useCallback(
    mediaDevices =>
      setDevices(mediaDevices.filter(({ kind }) => kind === "videoinput")),
    [setDevices]
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
      <Select
        value={deviceId}
        onChange={handleChange}
      >
        {devices.map((device, key) => {
          return <MenuItem value={device.deviceId}>{device.label}</MenuItem>
        })}
      </Select>
    </>
  )
}

export default App
