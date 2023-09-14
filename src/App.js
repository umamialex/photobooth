import './App.css'
import React from 'react'
import Webcam from 'react-webcam'
import Drawer from '@mui/material/Drawer'
import Fab from '@mui/material/Fab'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import CircularProgress from '@mui/material/CircularProgress'
import { CountdownCircleTimer } from 'react-countdown-circle-timer'

import SettingsIcon from '@mui/icons-material/Settings'
import CameraIcon from '@mui/icons-material/Camera'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import NorthIcon from '@mui/icons-material/North'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit'

import emailjs from '@emailjs/browser'
import validator from 'email-validator'

import useSound from 'use-sound'

import beep from './beep.mp3'
import shutter from './shutter.mp3'

function App() {
  const [deviceId, setDeviceId] = React.useState({})
  const [devices, setDevices] = React.useState([])
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)
  const [isCounting, setIsCounting] = React.useState(false)
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const [isSending, setIsSending] = React.useState(false)
  const [duration, setDuration] = React.useState(5)
  const [rotation, setRotation] = React.useState(-90)
  const [imgSrc, setImgSrc] = React.useState(null)
  const [email, setEmail ] = React.useState('')
  const [error, setError] = React.useState(false)
  const [playBeep] = useSound(beep)
  const [playShutter] = useSound(shutter)

  const handleDevices = React.useCallback(
    mediaDevices => {
      const d = mediaDevices.filter(({ kind }) => kind === "videoinput")
      setDevices(d)

      const cam = d.find((c) => c.label.includes('ZV')) || d[0]
      setDeviceId(cam.deviceId)
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

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen)

    if (!isFullscreen) {
      document.documentElement.requestFullscreen()

      return
    }

    document.exitFullscreen()
  }

  const handleCountdown = (e, getScreenshot) => {
    rotate(getScreenshot(), rotation, (i) => {
      setImgSrc(i)
      setIsCounting(false)
    })
  }

  const settingsComponent = (
    <>
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
            margin: 1,
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
            margin: 1,
          }}
        >
          <MenuItem value={3}>3s</MenuItem>
          <MenuItem value={5}>5s</MenuItem>
        </Select>
        <Select
          value={rotation}
          onChange={(e) => setRotation(e.target.value)}
          sx={{
            margin: 1,
          }}
        >
          <MenuItem value={0}>0</MenuItem>
          <MenuItem value={90}>90</MenuItem>
          <MenuItem value={-90}>-90</MenuItem>
        </Select>
        <Button
          variant="contained"
          color={isFullscreen ? 'error' : 'primary'}
          size="large"
          sx={{
            margin: 1,
          }}
          onClick={handleFullscreen}
          endIcon={isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
        >
          {isFullscreen ? 'Windowed' : 'Fullscreen'}
        </Button>
        <Button
          variant="contained"
          color="warning"
          size="large"
          sx={{
            margin: 1,
          }}
          onClick={() => location.reload()}
          endIcon={<RestartAltIcon />}
        >
          Refresh
        </Button>
      </Drawer>
    </>
  )

  if (imgSrc) {
    return (
      <>
        <div id="flash" />
        <div
          style={{
            display: isSending ? 'block' : 'none',
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: '#000c',
            zIndex: 100000,
            textAlign: 'center',
          }}
        >
        
          <CircularProgress
            size={200}
            color="primary"
            sx={{
              marginTop: '40vh',
            }}
          />
        </div>
        <div
          style={{
            paddingTop: '1.9em',
            textAlign: 'center',
          }}
        >
          <img
            alt="selfie"
            src={imgSrc}
            style={{
              height: '93.5vh',
              boxShadow: '#000a 0 0.25em 2em',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div>
              <div className="form bounce-in">
                <div
                  style={{
                    color: '#00f',
                    fontWeight: 'bold',
                    marginBottom: '1em',
                    fontSize: '2rem',
                    textAlign: 'left',
                  }}
                >
                  Enter your email address and hit send to receive<br/>your photo.
                </div>
                <div
                  style={{
                    color: '#d00',
                    fontWeight: 'bold',
                    display: error ? 'block' : 'none',
                    marginBottom: '1em',
                    fontSize: '2rem',
                  }}
                >
                  {
                    error && error.message === 'invalid email'
                      ? 'Please enter a valid email address.'
                      : 'Oops something went wrong. Please try again.'
                  }
                </div>
                <form id="emailjsform" onSubmit={function(e) {
                  event.preventDefault()

                  if (!validator.validate(email)) {
                    setError(new Error('invalid email'))

                    return
                  }

                  setError(null)
                  const dT = new DataTransfer()
                  dT.items.add(dataURLtoFile(imgSrc, 'photo.jpg'))
                  document.querySelector('#photo').files = dT.files

                  setIsSending(true)

                  try {
                    emailjs.sendForm(
                      'umamiphotobooth',
                      'umamiphotoboothtemplate',
                      document.querySelector('#emailjsform'),
                      'ZmY3p17W089Wzndyc',
                    ).then(() => {
                      setIsSending(false)
                      setImgSrc(null)
                    }, (err) => {
                      setIsSending(false)
                      setError(err)
                      console.error(err)
                    })
                  } catch (err) {
                    setIsSending(false)
                    setError(err)
                    console.error(err)
                  }
                }}>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="Email"
                    autocomplete="off"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <input type="file" name="photo" id="photo"/>
                  <input type="submit" value="Send" id="send" disabled={isSending}/>
                </form>
              </div>
              <Fab
                variant="extended"
                color="error"
                size="medium"
                sx={{
                  fontSize: '4rem',
                  height: '5rem',
                  marginTop: '2rem',
                }}
                onClick={() => setImgSrc(null)}
                className="bounce-in"
              >
                <RestartAltIcon
                  sx={{
                    fontSize: '4rem',
                    mr: 1
                  }}
                />
                  Retake
              </Fab>
            </div>
          </div>
        </div>
        {settingsComponent}
      </>
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
          left: '50vw',
          marginLeft: '-46.75vh',
          width: '93.5vh',
          transform: `rotate(${rotation}deg)`,
          boxShadow: '#000a 0 0.25em 2em',
        }}
      >
        {({ getScreenshot }) => (
          <>
            {!isCounting ? (
              <div
                onClick={() => setIsCounting(true)}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '4rem',
                  textAlign: 'center',
                  padding: '0 10rem 0 10rem',
                }}
              >
                <div
                  style={{
                    marginTop: '20rem',
                    textShadow: '0 0 0.25rem #000',
                  }}
                >
                  Tap anywhere to take a picture<br/>
                  <CameraIcon
                    sx={{
                      fontSize: '10rem',
                      marginTop: '1rem',
                    }}
                  />
                </div>
              </div>
            ) : null}
            {isCounting ? (
              <>
                <div
                  style={{
                    position: 'absolute',
                    left: '0vw',
                    width: '100vw',
                    top: '3rem',
                    textAlign: 'center',
                    display: 'inline-block',
                    color: '#fff',
                    fontSize: '3rem',
                  }}
                  className="bounce"
                >
                  <NorthIcon fontSize="large" sx={{
                    mb: -2,
                    fontSize: '5rem',
                  }}/>
                  <div>
                    Look up at<br/>the camera! 
                  </div>
                </div>
                <div
                  style={{
                    position: 'absolute',
                    left: '50vw',
                    bottom: '35vh',
                    marginLeft: '-6em',
                    marginBottom: '-6em',
                  }}
                >
                  <CountdownCircleTimer
                    isPlaying
                    duration={duration}
                    trailColor="#fff"
                    colors={['#0c0', '#ff0', '#c00', '#c00']}
                    colorsTime={[3, 2, 1, 0]}
                    onComplete={(e) => handleCountdown(e, getScreenshot)}
                    onUpdate={(t) => t ? playBeep() : playShutter()}
                  >
                    {({ remainingTime }) => 
                      <div
                        style={{
                          color: '#fff',
                          fontSize: '4rem',
                        }}
                        className="bounce2"
                      >{remainingTime}</div>}
                  </CountdownCircleTimer>
                </div>
              </>
            ) : null}
          </>
        )}
      </Webcam>
      {settingsComponent}
    </>
  )
}

export default App


function rotate(srcBase64, degrees, callback) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const image = new Image()

  image.onload = function () {
    canvas.width  = degrees % 180 === 0 ? image.width : image.height
    canvas.height = degrees % 180 === 0 ? image.height : image.width

    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate(degrees * Math.PI / 180)
    ctx.drawImage(image, image.width / -2, image.height / -2)

    callback(canvas.toDataURL())
  }

  image.src = srcBase64
}

function dataURLtoFile(dataurl, filename) {
 const arr = dataurl.split(',')
 const mime = arr[0].match(/:(.*?)/)[1]
 const bstr = atob(arr[arr.length - 1])
 let n = bstr.length
 const u8arr = new Uint8Array(n)
 while(n--){
		 u8arr[n] = bstr.charCodeAt(n)
 }
 return new File([u8arr], filename, {type:mime})
}
