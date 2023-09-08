import './App.css'
import React from 'react'
import Webcam from 'react-webcam'
import Drawer from '@mui/material/Drawer';
import Fab from '@mui/material/Fab'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import { CountdownCircleTimer } from 'react-countdown-circle-timer'

import SettingsIcon from '@mui/icons-material/Settings';
import CameraIcon from '@mui/icons-material/Camera';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import NorthIcon from '@mui/icons-material/North';

import useSound from 'use-sound'

import beep from './beep.mp3'
import shutter from './shutter.mp3'

function App() {
  const [deviceId, setDeviceId] = React.useState({})
  const [devices, setDevices] = React.useState([])
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)
  const [isCounting, setIsCounting] = React.useState(false)
  const [duration, setDuration] = React.useState(3)
  const [imgSrc, setImgSrc] = React.useState(null)
  const [playBeep] = useSound(beep)
  const [playShutter] = useSound(shutter)

  const handleDevices = React.useCallback(
    mediaDevices => {
      const d = mediaDevices.filter(({ kind }) => kind === "videoinput")
      setDevices(d)

      setDeviceId(d.find((c) => (c.label.includes('ZV'))).deviceId)
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

  const handleCountdown = (e, getScreenshot) => {
    rotate(getScreenshot(), -90, (i) => {
      setImgSrc(i)
      setIsCounting(false)
    })
  }

  if (imgSrc) {
    return (
      <div
        style={{
          paddingTop: '2em',
          textAlign: 'center',
        }}
      >
        <img
          alt="selfie"
          src={imgSrc}
          style={{
            height: '90vh',
          }}
        />
        <Fab
          variant="extended"
          color="warning"
          size="large"
          sx={{
            position: 'absolute',
            right: '50%',
            mr: -7,
            bottom: '25vh',
          }}
          onClick={() => setImgSrc(null)}
        >
          <RestartAltIcon
            sx={{mr: 1}}
          />
          Retake
        </Fab>
      </div>
    )
  }

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
      >
        {({ getScreenshot }) => (
          <>
            {!isCounting ? (
              <Fab
                variant="extended"
                color="primary"
                size="large"
                sx={{
                  position: 'absolute',
                  right: '50%',
                  mr: -13,
                  bottom: '25vh',
                }}
                onClick={() => setIsCounting(true)}
              >
                <CameraIcon
                  sx={{mr: 1}}
                />
                {duration}-Second Countdown
              </Fab>
            ) : null}
            {isCounting ? (
              <>
                <div
                  style={{
                    position: 'absolute',
                    left: '0vw',
                    width: '100vw',
                    top: '10vh',
                    textAlign: 'center',
                    display: 'inline-block',
                    color: '#fff',
                  }}
                  className="bounce"
                >
                  <NorthIcon fontSize="large" sx={{mb: -2}}/>
                  <h1>
                    Look up at<br/>the camera! 
                  </h1>
                </div>
                <div
                  style={{
                    position: 'absolute',
                    left: '50vw',
                    bottom: '25vh',
                    marginLeft: '-6em',
                    marginBottom: '-6em',
                  }}
                >
                  <CountdownCircleTimer
                    isPlaying
                    duration={duration}
                    trailColor="#fff"
                    colors={['#004777', '#F7B801', '#A30000', '#A30000']}
                    colorsTime={[3, 2, 1, 0]}
                    onComplete={(e) => handleCountdown(e, getScreenshot)}
                    onUpdate={(t) => t ? playBeep() : playShutter()}
                  >
                    {({ remainingTime }) => 
                      <h1
                        style={{color: '#fff'}}
                        className="bounce2"
                      >{remainingTime}</h1>}
                  </CountdownCircleTimer>
                </div>
              </>
            ) : null}
          </>
        )}
      </Webcam>
      <Fab
        color="error"
        size="small"
        onClick={() => setIsDrawerOpen(true)}
        sx={{
          position: 'absolute',
          right: '1em',
          top: '1em',
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
        <Select
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          sx={{
            margin: '1em',
          }}
        >
          <MenuItem value={3}>3s</MenuItem>
          <MenuItem value={5}>5s</MenuItem>
        </Select>
        <Fab
          variant="extended"
          color="warning"
          size="large"
          sx={{
            mt: 1,
          }}
          onClick={() => location.reload()}
        >
          <RestartAltIcon
            sx={{margin: 1}}
          />
        </Fab>
      </Drawer>
    </>
  )
}

export default App


function rotate(srcBase64, degrees, callback) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const image = new Image();

  image.onload = function () {
    canvas.width  = degrees % 180 === 0 ? image.width : image.height;
    canvas.height = degrees % 180 === 0 ? image.height : image.width;

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(degrees * Math.PI / 180);
    ctx.drawImage(image, image.width / -2, image.height / -2);

    callback(canvas.toDataURL());
  };

  image.src = srcBase64;
}
