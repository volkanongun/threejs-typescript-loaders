import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module.js'
import {GUI} from 'dat.gui'
import {OutlineEffect} from 'three/examples/jsm/effects/OutlineEffect'

import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

const scene = new THREE.Scene()
scene.background = new THREE.Color(0xFFFFFF)

const ambientLight = new THREE.AmbientLight( 0xFFFFFF, 0.16 );
scene.add( ambientLight );

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
)
camera.position.z = 6.5

const renderer = new THREE.WebGLRenderer({antialias: true})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

new OrbitControls(camera, renderer.domElement)

const manMaterial = new THREE.MeshStandardMaterial({
  color: 0xFF0099
})

const loader = new GLTFLoader()
let mixer: THREE.AnimationMixer;
let modelReady = false

loader.load('models/man.glb', function (gltf) {

        scene.add(gltf.scene)
        gltf.scene.scale.set(.25,.25,.25)
        gltf.scene.position.set(0,-1,0)

        gltf.scene.traverse(function(child){
          if ((child as THREE.Mesh).isMesh) {
              const m = (child as THREE.Mesh)
              m.material = manMaterial
              m.castShadow = true
          }
        })

        mixer = new THREE.AnimationMixer(gltf.scene)

        gltf.animations.forEach((a: THREE.AnimationClip, i) => {
          const clip = mixer
            .clipAction((gltf as GLTF).animations[i])

          clip.play()
        })

        console.log(mixer)

        modelReady = true

    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    (error) => {
        console.log(error)
    }
)

window.addEventListener('resize', onWindowResize, false)

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}

const stats = Stats()
document.body.appendChild(stats.dom)

const clock = new THREE.Clock()
function animate() {

    stats.update()

    renderer.render(scene, camera)

    if(modelReady) mixer.update(clock.getDelta())
}

renderer.setAnimationLoop(animate)