import * as THREE from './assets/vendor/three.module.js';
import {createArchitecture} from './building-frame-v17.js?v=20';
const host=document.querySelector('.construction-scene');
function init(){
  if(!host||!window.gsap||!window.ScrollTrigger)return;
  gsap.registerPlugin(ScrollTrigger);
  let renderer;
  try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});}catch{return;}
  renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.9;
  renderer.domElement.setAttribute('role','img');renderer.domElement.setAttribute('aria-label','Сборка открытого каркаса здания: основание, колонны, балки и стропильные фермы');
  const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-10,10,7,-7,.1,100);
  const architecture=createArchitecture();scene.add(architecture.model);
  const target=architecture.bounds.getCenter(new THREE.Vector3());
  camera.position.copy(target).add(new THREE.Vector3(13,8.2,17));camera.lookAt(target);camera.updateMatrixWorld();
  scene.add(new THREE.HemisphereLight(0xe6ebf2,0x493b31,.65));
  const sun=new THREE.DirectionalLight(0xffe4c2,2.65);sun.position.set(-10,11,8);sun.castShadow=true;
  sun.shadow.mapSize.set(4096,4096);Object.assign(sun.shadow.camera,{left:-9,right:9,top:10,bottom:-9,near:.5,far:40});
  sun.shadow.normalBias=.018;sun.shadow.bias=-.00005;sun.shadow.radius=3;scene.add(sun);
  const fill=new THREE.DirectionalLight(0xc1d6f5,.62);fill.position.set(9,7,-8);scene.add(fill);
  const environment=new THREE.Scene();environment.background=new THREE.Color(0x8091a4);
  const envObjects=[];
  function panel(w,h,position,rotation,color,intensity){
    const geometry=new THREE.PlaneGeometry(w,h),material=new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide});
    material.color.multiplyScalar(intensity);const mesh=new THREE.Mesh(geometry,material);mesh.position.set(...position);mesh.rotation.set(...rotation);environment.add(mesh);envObjects.push(mesh);
  }
  panel(14,7,[-8,5,5],[0,.7,0],0xffead4,3.5);panel(4,13,[8,2,2],[0,-.8,0],0xe1ecff,2.6);
  panel(16,14,[0,13,0],[-Math.PI/2,0,0],0xe7efff,2.4);panel(3,9,[0,3,-10],[0,0,0],0x303740,.5);
  const pmrem=new THREE.PMREMGenerator(renderer),environmentTarget=pmrem.fromScene(environment,.025,.1,50);
  scene.environment=environmentTarget.texture;scene.environmentIntensity=.58;
  envObjects.forEach(m=>{m.geometry.dispose();m.material.dispose();});pmrem.dispose();
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(35,35),new THREE.ShadowMaterial({opacity:.17}));
  ground.rotation.x=-Math.PI/2;ground.position.y=-.205;ground.receiveShadow=true;scene.add(ground);
  let queued=false,disposed=false;
  function render(){if(queued||disposed)return;queued=true;requestAnimationFrame(()=>{queued=false;if(!disposed)renderer.render(scene,camera);});}
  function update(value){architecture.setProgress(value);render();}
  // Fit the real structural silhouette, not the empty corners of a box around
  // the pitched roof. This makes the frame larger without cutting any members.
  architecture.model.updateMatrixWorld(true);
  const projected=new THREE.Box3(),vertex=new THREE.Vector3();
  architecture.model.traverse(object=>{
    if(!object.isMesh)return;
    const positions=object.geometry.getAttribute('position');
    for(let i=0;i<positions.count;i++){
      vertex.fromBufferAttribute(positions,i).applyMatrix4(object.matrixWorld).applyMatrix4(camera.matrixWorldInverse);
      projected.expandByPoint(vertex);
    }
  });
  function resize(){
    const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;
    const aspect=w/h,pad=1.045;
    const halfH=Math.max((projected.max.y-projected.min.y)*pad/2,(projected.max.x-projected.min.x)*pad/(2*aspect));
    const centerX=(projected.min.x+projected.max.x)/2;
    // Anchor the broad frame near the lower panel, like the reference cutout.
    camera.left=centerX-halfH*aspect;camera.right=centerX+halfH*aspect;
    camera.bottom=projected.min.y-halfH*.035;camera.top=camera.bottom+2*halfH;camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,w<600?2:2.5));renderer.setSize(w,h,false);render();
  }
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);
  host.appendChild(renderer.domElement);host.classList.add('has-building-3d');resize();
  const motion=gsap.matchMedia();
  motion.add('(prefers-reduced-motion: no-preference)',()=>{
    const state={value:0};update(0);
    const tween=gsap.to(state,{value:1,ease:'none',onUpdate:()=>update(state.value),scrollTrigger:{id:'building-assembly',trigger:host,start:'center 115%',end:'center 65%',scrub:.32,invalidateOnRefresh:true}});
    return()=>{tween.scrollTrigger?.kill();tween.kill();update(1);};
  });
  motion.add('(prefers-reduced-motion: reduce)',()=>update(1));
  document.fonts.ready.then(()=>ScrollTrigger.refresh());
  window.addEventListener('pageshow',event=>{if(event.persisted)ScrollTrigger.refresh();});
  window.addEventListener('pagehide',event=>{
    if(event.persisted)return;
    disposed=true;motion.revert();resizeObserver.disconnect();architecture.dispose();environmentTarget.dispose();ground.geometry.dispose();ground.material.dispose();renderer.dispose();
  },{once:true});
}
function boot(){try{init();}catch(error){console.error('Construction model initialization failed; retaining image fallback.',error);host?.classList.remove('has-building-3d');host?.querySelector('canvas')?.remove();}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
