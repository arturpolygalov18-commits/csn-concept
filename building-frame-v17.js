import * as THREE from './assets/vendor/three.module.js';
import {mergeGeometries} from './assets/vendor/BufferGeometryUtils.js';

// An open structural study for a public/industrial building: concrete columns,
// a partial intermediate floor and exposed steel roof trusses. No facade.
export function createArchitecture(){
  const model=new THREE.Group(),phases=[],geometries=new Set(),materials=new Set();
  const concrete=new THREE.MeshStandardMaterial({color:0xcac5b9,roughness:.8});
  const steel=new THREE.MeshStandardMaterial({color:0xe4dfd3,roughness:.37,metalness:.32});
  const plate=new THREE.MeshStandardMaterial({color:0x858b8c,roughness:.4,metalness:.55});
  const floor=new THREE.MeshStandardMaterial({color:0xb2b2ab,roughness:.9});
  const connection=new THREE.MeshStandardMaterial({color:0x762d36,roughness:.42,metalness:.38});
  [concrete,steel,plate,floor,connection].forEach(m=>materials.add(m));
  function phase(name,start,duration,pivotY=0,lift=.12,grow=false){
    const group=new THREE.Group();group.name=name;group.position.y=pivotY;model.add(group);
    const p={group,name,start,duration,pivotY,lift,grow,batches:new Map()};phases.push(p);return p;
  }
  function add(p,g,mat){
    g.translate(0,-p.pivotY,0);
    if(g.index){const old=g;g=g.toNonIndexed();old.dispose();}
    if(!p.batches.has(mat))p.batches.set(mat,[]);p.batches.get(mat).push(g);
  }
  function box(p,w,h,d,x,y,z,mat=concrete){const g=new THREE.BoxGeometry(w,h,d);g.translate(x,y,z);add(p,g,mat);}
  // Three extruded rectangles form a real I-section instead of a solid stick.
  function beam(p,a,b,depth=.2,width=.14,mat=steel){
    const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),delta=end.clone().sub(start),length=delta.length();
    const direction=delta.normalize(),up=new THREE.Vector3(0,1,0);
    const profileDepth=up.addScaledVector(direction,-up.dot(direction));
    if(profileDepth.lengthSq()<.001)profileDepth.set(0,0,1);else profileDepth.normalize();
    const profileWidth=new THREE.Vector3().crossVectors(direction,profileDepth).normalize();
    const rotation=new THREE.Matrix4().makeBasis(profileWidth,direction,profileDepth);
    const center=start.add(end).multiplyScalar(.5),thickness=Math.min(.028,width*.2);
    for(const [w,d,z] of [[width,thickness,-depth/2+thickness/2],[width,thickness,depth/2-thickness/2],[thickness,depth-2*thickness,0]]){
      const g=new THREE.BoxGeometry(w,length,d);g.translate(0,0,z);g.applyMatrix4(rotation);g.translate(...center.toArray());add(p,g,mat);
    }
  }
  const xs=[-5.1,-2.55,0,2.55,5.1],zs=[-3,3],H=2.1,grade=.24,eaves=grade+H*2,ridge=eaves+1.65;
  const base=phase('footings',0,.1,0,.045);
  // Separate footings and grade beams leave a light, legible lower silhouette.
  for(const x of xs)for(const z of zs){box(base,.65,.2,.65,x,-.02,z);box(base,.37,.035,.37,x,.1,z,plate);}
  for(const z of zs)box(base,10.7,.14,.22,0,.06,z);
  for(const x of [-5.1,0,5.1])box(base,.22,.14,6.4,x,.06,0);
  box(base,10.65,.06,6.35,0,.13,0,floor);
  for(let level=0;level<2;level++){
    const y=grade+H*level,t=.08+level*.29;
    for(let row=0;row<2;row++){
      const cols=phase('columns-'+level+'-'+row,t+row*.04,.1,y,0,true);
      for(const x of xs){box(cols,.2,H,.2,x,y+H/2,zs[row]);box(cols,.29,.07,.29,x,y+H-.035,zs[row]);}
    }
    const longitudinal=phase('longitudinal-'+level,t+.105,.09,y+H,.17);
    for(const z of zs)beam(longitudinal,[-5.25,y+H,z],[5.25,y+H,z],.25,.17);
    const cross=phase('cross-beams-'+level,t+.155,.095,y+H,.13);
    for(const x of xs){
      beam(cross,[x,y+H,-3.05],[x,y+H,3.05],.22,.15);
      // Small bearing plates stay attached to the phase that installs the beam.
      for(const z of zs){
        box(cross,.32,.035,.32,x,y+H-.14,z,connection);
        for(const dx of [-.115,.115])for(const dz of [-.115,.115])box(cross,.027,.038,.027,x+dx,y+H-.108,z+dz,plate);
      }
    }
    if(level===0){
      const mezzanine=phase('intermediate-floor',.32,.11,y+H,.1);
      box(mezzanine,5.05,.105,2.97,-2.55,y+H+.08,-1.5,floor);
      for(const x of [-4.45,-3.8,-3.15,-2.5,-1.85,-1.2,-.55])beam(mezzanine,[x,y+H+.03,-3],[x,y+H+.03,0],.15,.1);
    }
  }
  // Each gable truss assembles in two deliberate phases, making the open roof
  // structure readable as construction rather than a finished house model.
  for(let i=0;i<xs.length;i++){
    const x=xs[i],t=.655+i*.043;
    const rafters=phase('roof-chords-'+i,t,.085,eaves,.16);
    beam(rafters,[x,eaves,-3.2],[x,ridge,0],.18,.13);
    beam(rafters,[x,ridge,0],[x,eaves,3.2],.18,.13);
    const webs=phase('roof-webs-'+i,t+.025,.08,eaves,.08);
    beam(webs,[x,eaves,0],[x,ridge-.04,0],.095,.085);
    for(const sign of [-1,1]){
      beam(webs,[x,eaves,0],[x,eaves+.825,sign*1.6],.095,.08);
      beam(webs,[x,eaves,sign*1.6],[x,eaves+.825,sign*1.6],.085,.075);
    }
  }
  const purlins=phase('roof-purlins',.89,.095,eaves,.12);
  for(const z of [-3.15,-1.6,0,1.6,3.15]){
    const y=ridge-Math.abs(z)*(1.65/3.2)+.04;
    beam(purlins,[-5.35,y,z],[5.35,y,z],.12,.095);
  }
  const bracing=phase('structural-bracing',.925,.07,grade,0,true);
  for(const [a,b] of [
    [[-5.1,grade,-3],[-2.55,eaves,-3]],
    [[-2.55,grade,-3],[-5.1,eaves,-3]],
    [[5.1,grade,-3],[5.1,eaves,0]],
    [[5.1,grade,0],[5.1,eaves,-3]]
  ])beam(bracing,a,b,.075,.065,plate);
  let sourceBoxes=0,drawMeshes=0;
  for(const p of phases){
    for(const [mat,list] of p.batches){
      sourceBoxes+=list.length;const g=mergeGeometries(list,false);list.forEach(item=>item.dispose());geometries.add(g);
      const mesh=new THREE.Mesh(g,mat);mesh.castShadow=true;mesh.receiveShadow=true;p.group.add(mesh);drawMeshes++;
    }
    delete p.batches;
  }
  model.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(model);
  function setProgress(value){for(const p of phases){const t=THREE.MathUtils.clamp((value-p.start)/p.duration,0,1),e=t*t*(3-2*t);p.group.visible=t>0;p.group.position.y=p.pivotY+(1-e)*p.lift;p.group.scale.y=p.grow?Math.max(.001,e):1;}}
  function dispose(){geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}
  return{model,bounds,phases,setProgress,dispose,stats:{sourceBoxes,drawMeshes,phases:phases.length}};
}
