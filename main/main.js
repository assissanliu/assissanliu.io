import * as THREE from "three";
//导入轨道控制器
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
//导入水面
import { Water } from "three/examples/jsm/objects/Water2";
//导入GLTF载入库
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
//导入解压库
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { RGBELoader, RGBLoader } from 'three/examples/jsm/loaders/RGBELoader';

//初始化场景
const scene = new THREE.Scene();

//初始化相机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);

//设置相机位置
camera.position.set(-50, 50, 130);
//更新摄像头宽高比例
camera.aspect = window.innerWidth / window.innerHeight;
//更新摄像头投影矩阵
camera.updateProjectionMatrix();

scene.add(camera);

//初始化渲染器
const renderer = new THREE.WebGLRenderer({
    //设置抗锯齿
    antialias: true,
    //对数深度缓冲区，防止模型闪烁
    logarithmicDepthBuffer: true,
})
renderer.outputEncoding = THREE.sRGBEncoding;

//设置渲染器宽高
renderer.setSize(window.innerWidth, window.innerHeight);

//监听屏幕大小改变，修改渲染器的宽高，相机比例
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


//将渲染器添加到页面上
document.body.appendChild(renderer.domElement);
//实例化控制器
const controls = new OrbitControls(camera, renderer.domElement);


//渲染函数
function render() { 
    //渲染场景
    renderer.render(scene, camera);
    //引擎自动更新渲染器
    requestAnimationFrame(render);
}
//每帧都渲染
render();

// //添加平面
// const planeGeometry = new THREE.PlaneGeometry(100, 100);
// const planeMaterial = new THREE.MeshBasicMaterial({
//     color: 0xffffff, 
// });
// const plane = new THREE.Mesh(planeGeometry, planeMaterial);
// scene.add(plane);

//创建一个巨大的天空球体
let texture = new THREE.TextureLoader().load('./textures/sky.jpg');
const skyGeometry = new THREE.SphereGeometry(1000, 60, 60);
const skyMaterial = new THREE.MeshBasicMaterial({
    map: texture,
});
skyGeometry.scale(1, 1, -1);
const sky = new THREE.Mesh(skyGeometry, skyMaterial);
scene.add(sky);


//创建一个视频纹理
const video = document.createElement("video");
video.src = "./textures/sky.mp4";
video.loop = true;//自动播放

window.addEventListener("click", (e) => {
    //当鼠标移动的时候视频开始播放
    //判断视频是否处于播放状态
    if (video.paused) {
        video.play();
        let texture = new THREE.VideoTexture(video);
        skyMaterial.map = texture;
        skyMaterial.map.needsUpdate = true;
        
        // scene.background = texture;
        // scene.environment = texture;
    }
    
});

//载入环境纹理hdr
const hdrLoader = new RGBELoader();
hdrLoader.loadAsync("./assets/050.hdr").then((texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
    scene.environment = texture;

});

//创建水面
const waterGeometry = new THREE.CircleBufferGeometry(300, 64);
const water = new Water(waterGeometry, {
    textureWidth: 1024,
    textureHeight: 1024,
    color: 0xeeeeff,
    flowDirection: new THREE.Vector2(1, 1),//流动方向
    scale: 1,//流动大小
});  

//水面旋转至水平
water.rotation.x = -Math.PI / 2;
water.position.y = 3;
scene.add(water);

//添加小岛模型
//实例化gltf载入库
const loader = new GLTFLoader();
//实例化draco载入库
const dracoLoader = new DRACOLoader();
//添加draco载入库
dracoLoader.setDecoderPath("./draco/");

loader.setDRACOLoader(dracoLoader);

loader.load("./model/island2.glb", (gltf)=>{
    scene.add(gltf.scene);
});

 //点光源
 var point = new THREE.DirectionalLight(0xffffff,1);
 scene.add(point); //点光源添加到场景中
