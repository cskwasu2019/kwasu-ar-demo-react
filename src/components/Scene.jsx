import classNames from 'classnames'
import React, { useContext, useEffect, useRef } from 'react'
import { Transition } from 'react-transition-group'
import {
  Scene as ThreeScene,
  WebGLRenderer,
  PerspectiveCamera,
  ACESFilmicToneMapping,
  AmbientLight,
  Clock,
  Object3D,
  DirectionalLight,
  HemisphereLight,
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { createAsset } from 'use-asset'
import LogoModel from '../assets/models/kwasu-logo.glb'
import { LoadingContext } from './Loading'

const TRANSITION_DURATION = 1000

const modelLoader = createAsset(() => {
  const loader = new GLTFLoader()
  return loader.loadAsync(LogoModel)
})

const Scene = () => {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)

  const model = modelLoader.read()
  const [isLoading] = useContext(LoadingContext)

  useEffect(() => {
    if (!isLoading) {
      const canvas = canvasRef.current
      const container = containerRef.current

      const three = initScene(container, canvas)
      three.turntable.add(model.scene)
      return three.clean
    }
  }, [isLoading])

  return (
    <>
      {!isLoading && (
        <Transition
          in={true}
          appear={true}
          timeout={TRANSITION_DURATION}
          exit={false}
        >
          {(state) => (
            <div
              className={classNames(
                'flex-1 min-h-0 relative transition duration-1000 opacity-0 ease-in-out',
                { 'opacity-100': state === 'entering' || state == 'entered' }
              )}
              ref={containerRef}
            >
              <canvas className="w-full h-full" ref={canvasRef}></canvas>
            </div>
          )}
        </Transition>
      )}
    </>
  )
}

const initScene = (container, canvas) => {
  canvas.width = container.clientWidth
  canvas.height = container.clientHeight

  let exit = false
  let interact = false

  const TURNTABLE_SPEED = 0.5
  const scene = new ThreeScene()
  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  })
  renderer.toneMapping = ACESFilmicToneMapping
  renderer.physicallyCorrectLights = true
  const camera = new PerspectiveCamera(
    45,
    canvas.width / canvas.height,
    0.1,
    1000
  )
  camera.position.z = 2.5

  const control = new OrbitControls(camera, canvas)
  control.enablePan = false
  control.enableZoom = false
  control.enableDamping = false
  control.minPolarAngle = Math.PI / 4
  control.maxPolarAngle = Math.PI / 2

  control.addEventListener('start', () => {
    interact = true
  })
  control.addEventListener('end', () => {
    interact = false
  })

  const clock = new Clock()
  const turntable = new Object3D()

  scene.add(camera)
  scene.add(turntable)
  scene.add(new AmbientLight(0xffffff, 5))
  scene.add(new DirectionalLight())
  scene.add(new HemisphereLight())

  const handleResize = () => {
    canvas.width = container.clientWidth
    canvas.height = container.clientHeight

    camera.aspect = canvas.width / canvas.height
    camera.updateProjectionMatrix()
    renderer.setSize(canvas.width, canvas.height)
  }

  window.addEventListener('resize', handleResize)

  const update = (delta) => {
    if (interact || exit) {
      return
    }
    turntable.rotateY(TURNTABLE_SPEED * delta)
  }

  const render = () => {
    if (exit) {
      return
    }
    const delta = clock.getDelta()
    requestAnimationFrame(render)
    update(delta)
    control.update()
    renderer.render(scene, camera)
  }

  render()
  return {
    scene,
    renderer,
    camera,
    turntable,
    render() {
      renderer.render(scene, camera)
    },
    clean() {
      exit = true
      interact = false
      window.removeEventListener('resize', handleResize)
      scene.clear()
    },
  }
}

export default Scene
