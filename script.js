feather.replace()

/*Primero agarramos los elementos HTML que necesitamos*/
const controls = document.querySelector('.controls')
const cameraOptions = document.querySelector('.video-options>select')
const video = document.querySelector('video')
const canvas = document.querySelector('canvas')
const buttons = [...controls.querySelectorAll('button')]
const downloadLink = document.getElementById('download-link')
const cover = document.querySelector('.display-cover')
const gridSlider = document.getElementById('grid-slider')
const siluetaSlider = document.getElementById('silueta-slider')
const silueta = document.getElementById('silueta')

/* Luego hacemos unas variables muy importantes que vamos a requerir */
let streamStarted = false

const [play, pause] = buttons

const constraints = {

  video: {

    width: {
      min: 1280,
      ideal: 800,
      max: 1920,
    },
    height: {
      min: 720,
      ideal: 720,
      max: 1080
    },

  }
}

/* A continuación obtendremos las cámaras web conectadas a la computadora con el método enumerateDevices() */
const getCameraSelection = async () => {

  const devices = await navigator.mediaDevices.enumerateDevices()
  const videoDevices = devices.filter(device => device.kind === 'videoinput')

  const options = videoDevices.map(videoDevice => {
    return `<option value="${videoDevice.deviceId}">${videoDevice.label}</option>`
  });

  cameraOptions.innerHTML = options.join('')
};

/* Añadimos una serie de eventos que empiezan a streamear el feed de la cámara que hayamos escogido a un botón */
play.onclick = () => {

  if (streamStarted) {

    video.play()
    play.classList.add('d-none')
    pause.classList.remove('d-none')
    return;

  }

  if ('mediaDevices' in navigator && navigator.mediaDevices.getUserMedia) {

    const updatedConstraints = {
      ...constraints,
      deviceId: {
        exact: cameraOptions.value
      }
    }

    startStream(updatedConstraints)

  }
};

const startStream = async (constraints) => {

  const stream = await navigator.mediaDevices.getUserMedia(constraints)
  handleStream(stream)

};

const handleStream = (stream) => {

  video.srcObject = stream;
  play.classList.add('d-none')
  pause.classList.remove('d-none')
  streamStarted = true

};

getCameraSelection();

/* Ahora toca añadir otro evento al elemento select de nuesto index.html que cambia de cámara cuando escogemos una opción en el elemento */
cameraOptions.onchange = () => {

  const updatedConstraints = {

    video: {
      width: {
        min: 1280,
        ideal: 1920,
        max: 2560,
      },
      height: {
        min: 720,
        ideal: 1080,
        max: 1440
      },
      deviceId: {
        exact: cameraOptions.value
      }
    }
  }

  startStream(updatedConstraints)

}

/* Como extra añadimos un evento que pausa el stream con el click de un botón */
const pauseStream = () => {

  video.pause()
  play.classList.remove('d-none')
  pause.classList.add('d-none')

}

/* Ahora añadimos también un evento que permite descargar una foto con la webcam */
const download = () => {

  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  canvas.getContext('2d').drawImage(video, 0, 0)
  let fileName = document.getElementById("filename").value
  let prefix = ''

  if (fileName.length == 9) {

    prefix = 'P'

  } else if (fileName.length == 7) {

    prefix = 'D'

  } else {

    window.alert('Por favor ingresa un ID válido')
    return undefined

  }

  downloadLink.href = canvas.toDataURL('image/png')
  downloadLink.download = prefix + fileName + ".png"
  
}

pause.onclick = pauseStream
downloadLink.onclick = download

/* Finalmente hacemos un evento que dibuje una cruz con líneas que sirvan como guía visual para tomar fotos con la webcam */
function toggleGrid() {

  let vertLine = document.createElement('div')
  let horizLine = document.createElement('div')
  vertLine.id = 'vertLine'
  horizLine.id = 'horizLine'
  vertLine.style.cssText = `background-color: #74FF00; width: 10px; height: ${video.clientHeight}px; opacity: 0.5; position: absolute; left: ${(video.clientWidth / 2) - 5}px;`
  horizLine.style.cssText = `background-color: #74FF00; width: ${video.clientWidth}px; height: 10px; opacity: 0.5; position: absolute; top: ${(video.clientHeight / 2) - 5}px;`
  cover.append(vertLine)
  cover.append(horizLine)

}

function toggleSilueta() {

  silueta.style.display = 'block'
  silueta.style.height = `${video.clientHeight}px`

}

gridSlider.onchange = () => {

  if (gridSlider.checked) {

    toggleGrid()

  } else {

    let line1 = document.getElementById('vertLine')
    line1.remove()
    let line2 = document.getElementById('horizLine')
    line2.remove()

  }

}

siluetaSlider.onchange = () => {

  if (siluetaSlider.checked) {

    toggleSilueta()

  } else {

    silueta.style.display = 'none'

  }
}