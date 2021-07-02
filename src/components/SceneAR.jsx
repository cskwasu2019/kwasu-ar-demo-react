import React, { useEffect, useRef } from 'react'
import {
  Scene,
  WebGLRenderer,
  PerspectiveCamera,
  AmbientLight,
  DirectionalLight,
  HemisphereLight,
  ACESFilmicToneMapping,
  Clock,
  Group,
  Object3D,
} from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { createAsset } from 'use-asset'
import PropTypes from 'prop-types'
import LogoModel from '../assets/models/kwasu-logo.glb'
import AnthemAudio from '../assets/audio/kwasu-anthem.mp3'

const modelLoader = createAsset(async () => {
  const loader = new GLTFLoader()
  const gltf = await loader.loadAsync(LogoModel)
  gltf.scene.scale.set(0.5, 0.5, 0.5)
  return gltf
})

const audioLoader = (() => {
  let state = 'pending'
  let result
  let promise

  const getPromise = () => {
    if (!promise) {
      promise = fetch(AnthemAudio)
        .then((res) => {
          if (!res.ok) {
            return Promise.reject('Error occured while loading audio')
          }
          return res.blob()
        })
        .then((blob) => {
          const audio = new Audio(window.URL.createObjectURL(blob))
          audio.loop = true
          result = audio
          state = 'success'
        })
        .catch((err) => {
          state = 'error'
          result = err
        })
    }
    return promise
  }

  return {
    read() {
      const pendingPromise = getPromise()
      if (state === 'pending') {
        throw pendingPromise
      } else if (state === 'error') {
        throw new Error(result)
      } else if (state === 'success') {
        return result
      }
    },
  }
})()

const MODEL_SIZE = 35

const SceneAR = ({ size, pose }) => {
  const model = modelLoader.read()
  const audio = audioLoader.read()

  const canvasRef = useRef(null)
  const threeRef = useRef(null)

  useEffect(() => {
    if (size.width > 0 && size.height > 0) {
      const canvas = canvasRef.current
      const three = initScene(canvas, model, audio)
      threeRef.current = three

      return three.clean
    }
  }, [size])

  useEffect(() => {
    const three = threeRef.current
    if (three != null) {
      if (pose != null) {
        three.world.position.copy(pose.position)
        three.world.rotation.copy(pose.rotation)
        three.world.scale.copy(pose.scale)
      }
      three.setVisibility(pose != null)
    }
  }, [pose])
  return (
    <div className="absolute w-full h-full left-0 top-0 pointer-events-none">
      <canvas
        className="w-full h-full object-cover"
        width={size.width}
        height={size.height}
        ref={canvasRef}
      ></canvas>
    </div>
  )
}

const initScene = (canvas, model, audio) => {
  const { width, height } = canvas
  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  })
  renderer.toneMapping = ACESFilmicToneMapping
  renderer.physicallyCorrectLights = true
  const scene = new Scene()
  const camera = new PerspectiveCamera(40, width / height, 0.1, 20000)
  let exit = false
  let isVisible = false

  const TURNTABLE_SPEED = 1
  const clock = new Clock()

  const world = new Group()

  const turntable = new Object3D()
  turntable.add(model.scene)

  world.add(turntable)
  world.add(new AmbientLight(0xffffff, 5))
  world.add(new DirectionalLight())
  world.add(new HemisphereLight())

  scene.add(world)
  scene.add(camera)

  const update = (delta) => {
    if (isVisible) {
      turntable.rotateY(TURNTABLE_SPEED * delta)
    }
  }

  const render = () => {
    if (exit) {
      return
    }

    requestAnimationFrame(render)
    const delta = clock.getDelta()
    update(delta)
    renderer.render(scene, camera)
  }

  render()

  return {
    scene,
    renderer,
    camera,
    world,
    clean() {
      exit = true
      audio.pause()
      scene.clear()
    },
    setVisibility(visible) {
      isVisible = visible
      world.visible = isVisible

      if (visible) {
        audio.play()
      } else {
        audio.pause()
      }
    },
  }
}

SceneAR.propTypes = {
  size: PropTypes.shape({
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  }),
}

export default SceneAR
export { MODEL_SIZE }
