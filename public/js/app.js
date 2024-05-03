import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/postprocessing/ShaderPass.js";
import { TextureLoader } from "https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js";

let userCount;
let bloomPass, composer;

var socket = io.connect();


// global variable
let scene;
let camera;
let renderer;
let circle;
let skelet;
let particle;
let raycaster;
let pointer;
var globalMemoIdCounter = 0;
let INTERSECTED;
let core;


let scaleAmplitude = 2;
let scaleFrequency = 0.5;

// main function
function init() {

    // create scene
    scene = new THREE.Scene();

    // create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio((window.devicePixelRatio) ? window.devicePixelRatio : 1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.autoClear = false;
    renderer.setClearColor(0x000000, 0.0);
    document.getElementById('canvas').appendChild(renderer.domElement);

    // Update mouse location
    document.addEventListener( 'mousemove', onPointerMove );
    // document.getElementById('canvas').addEventListener('mousemove', hoverPieces)


    // camera setup
    const fov = 75;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 0.1;
    const far = 800;

    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    const controls = new OrbitControls( camera, renderer.domElement );
    controls.maxDistance=800;
    controls.minDistance=100;
    camera.position.z = 500;

    controls.update();
    scene.add(camera);


    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();

    // Bloom effect setup
    const renderScene = new RenderPass(scene, camera);
    bloomPass = bloomPass || new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    const bloomLayer = new THREE.Layers();
    bloomLayer.set(1);  // Set to use layer 1
    bloomPass.threshold = 0.1;
    bloomPass.strength = 0.5;
    bloomPass.radius = 1;

    composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);
  


    // 3d object
    // circle = new THREE.Object3D();
    if (circle === undefined) {
        console.log("circle is not defined!!")
        circle = new THREE.Object3D();

        // return
    }
    skelet = new THREE.Object3D();
    particle = new THREE.Object3D();
    core = new THREE.Object3D();
    core.layers.enable(1);

    scene.add(circle);
    scene.add(skelet);
    scene.add(particle);
    scene.add(core);


    // adding geometry
    let geometry = new THREE.TetrahedronGeometry(2, 1);
    let geomet = new THREE.IcosahedronGeometry(7, 1);
    let geomet2 = new THREE.IcosahedronGeometry(15, 4);

    // adding material
    let material = new THREE.MeshPhongMaterial({
        color: 0x4a4507,
        shading: THREE.FlatShading

    });

    let mat = new THREE.MeshPhongMaterial({
        color: 0x5e3e01,
        side: THREE.DobuleSide,
        wireframe: true,
        opacity:0
    });


    var x = document.getElementById("username");
    var y = document.getElementById("memocontent");
    var z = document.getElementById("button");
    var k = document.getElementById("button2");

    //Button: AddMemo
    button.addEventListener('click', function () {
        let textValue = document.getElementsByName("message")[0].value;
        x.style.display = "none";
        y.style.display = "none";
        z.style.display = "none";
        k.style.display = "none";
        socket.emit('memo', { username: username.value, memocontent: textValue });
        
    })

    //addnew
    addNew.addEventListener('click', function(){
        x.style.display = "block";
        y.style.display = "block";
        z.style.display = "block";
        k.style.display = "block";
    })
    
    //closewindow
    button2.addEventListener('click', function(){
        x.style.display = "none";
        y.style.display = "none";
        z.style.display = "none";
        k.style.display = "none";
    })
    


    // create particle  
    for (let i = 0; i < 300; i++) {
        let mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
        mesh.position.multiplyScalar(90 + (Math.random() * 700));
        mesh.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
        particle.add(mesh);
    }



    // inner planet
    let innerPlanet = new THREE.Mesh(geomet, material);
    innerPlanet.scale.x = innerPlanet.scale.y = innerPlanet.scale.z = 16;

    core.add(innerPlanet);
    // circle.add(innerPlanet);
    // scene.add(innerPlanet)


    // outer planets
    let outerPlanet = new THREE.Mesh(geomet2, mat);
    outerPlanet.scale.x = outerPlanet.scale.y = outerPlanet.scale.z = 6;
    skelet.add(outerPlanet);

    // ambient light
    let ambientLight = new THREE.AmbientLight(0x999999);
    scene.add(ambientLight);

    // directional light
    let dLight = [];
    dLight[0] = new THREE.DirectionalLight(0xffff00, 1);
    dLight[0].position.set(1, 0, 0);
    dLight[1] = new THREE.DirectionalLight(0x00dbde, 1);
    dLight[1].position.set(0.75, 1, 0.5);
    dLight[2] = new THREE.DirectionalLight(0xfc00ff, 1);
    dLight[2].position.set(-0.75, -1, 0.5);
    scene.add(dLight[0]);
    scene.add(dLight[1]);
    scene.add(dLight[2]);


  

    animate();
    window.addEventListener('resize', onWindowResize, false);

}



function animate() {
    const time = Date.now() * 0.002;  // Adjust time scale if necessary
    requestAnimationFrame(animate);

    particle.rotation.x += 0.0000;
    particle.rotation.y -= 0.0010;
    particle.z += 0.1*Math.sin(time * scaleFrequency) * scaleAmplitude;

    // circle.rotation.x -= 0.0030;
    circle.rotation.y -= 0.0020;

    skelet.rotation.x += 0.0010;
    skelet.rotation.y += 0.0010;
    core.rotation.y -= 0.0020;

      // Directly update scale of innerPlanet

    core.scale.x =0.5+0.03*Math.sin(time * scaleFrequency) * scaleAmplitude; // Apply scaling directly
    core.scale.y =0.5+0.03*Math.sin(time * scaleFrequency) * scaleAmplitude; // Apply scaling directly
    core.scale.z =0.5+0.03*Math.sin(time * scaleFrequency) * scaleAmplitude; // Apply scaling directly
  
    // hoverPieces();
    renderer.render(scene, camera);
    composer.render();
    hoverPieces();

}

function updateBloomSettings(userCount) {
    if (!bloomPass) {
        console.error('bloomPass is not initialized yet. Scheduling update...');
        setTimeout(() => updateBloomSettings(userCount), 100); // Check again shortly
        return;
    }
    // If initialized, proceed to update
    bloomPass.strength = calculateBloomStrength(userCount);
    console.log("Bloom strength updated to:", bloomPass.strength);
}

// Calculate new bloom strength based on user count
function calculateBloomStrength(userCount) {
    const maxUsers = 10;
    const minStrength = 0.5;
    const maxStrength = 1.5;

    // Normalize user count to a scale factor between 0 and 1
    const scaleFactor = Math.min(userCount / maxUsers, 1);

    // Linearly interpolate between minStrength and maxStrength based on scaleFactor
    return minStrength + (maxStrength - minStrength) * scaleFactor;
}

function onPointerMove( event ) {

    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}

function hoverPieces() {
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(circle.children, false);
    const hidBtn = document.getElementById('hideMemoButton');

    if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        if (INTERSECTED !== intersectedObject) {
            let thisMemo_id = intersectedObject.name;
            let thisMemo = document.getElementById(thisMemo_id);

            // Hide all memos first
            Array.from(document.getElementsByClassName("memo")).forEach(memo => {
                memo.style.visibility = "hidden";
            });

            // Handle the previously intersected object
            if (INTERSECTED) {
                INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
            }

            // Update the currently intersected object
            INTERSECTED = intersectedObject;
            INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
            INTERSECTED.material.color.setHex(0xffff00);

            // Display the current memo and the button
            thisMemo.style.visibility = "visible";
            hidBtn.style.visibility = "visible"; // Ensure the button is visible when needed
            // hidBtn.style.position = "fixed";
            // hidBtn.style.left = "13%";
            // hidBtn.style.top = "7%";

            hidBtn.addEventListener("click",function(){      
                thisMemo.style.visibility = "hidden"; 
                this.style.visibility="hidden"
            })
        }

    } else {
        if (INTERSECTED) {
            INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
        }
        INTERSECTED = null;
        // hidBtn.style.visibility = "hidden"; // Hide the button when there are no intersections
        // thisMemo.style.visibility = "hidden"
    }

}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}


// window.addEventListener( 'pointermove', hoverPieces);
window.onload = init;


//socket receiving
socket.on('connect', function () {
    console.log("Connected");
});


// Listen for count updates
socket.on('count update', function(data) {
    console.log('Count Update:', data.count); // Check if data is received
    document.getElementById('count').textContent = 'Connected Clients: ' + data.count;
    userCount=data.count;

    updateBloomSettings(data.count);
});

socket.on('memo', function (file) {
    
    if (circle === undefined) {
        console.log("circle is not defined!!")
        circle = new THREE.Object3D();

        // return
    }
    console.log("test:", file)

    let geo = new THREE.IcosahedronGeometry(14,0); // 
    let mate = new THREE.MeshPhongMaterial({
        color: "#5c3f0e",
        shading: THREE.FlatShading
    });


    // Memo
    let memo = new THREE.Mesh(geo, mate);

    // Create & Set Memo ID
    let thisMemoId = `memo_${globalMemoIdCounter++}` // Use id and increase counter

    // Other Memo Properties
    // memo.position.set(100 + Math.floor(Math.random() * 150), Math.floor(Math.random() * 200), 150 + Math.floor(Math.random() * 30))
    memo.position.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
    memo.position.multiplyScalar(100 + (Math.random() * 300));
    circle.add(memo)
    memo.name = thisMemoId;

    // Create text 
    const newDiv = document.createElement("div");

    let textValue = file.memocontent;
    let userName = file.username;
    const newContent = document.createTextNode(textValue); 
    const newName = document.createTextNode(userName);

    //Fix - 换行
    let linebreak = document.createElement("br");

    newDiv.appendChild(newName);
    newDiv.append(linebreak);
    newDiv.appendChild(newContent);

    newDiv.id = thisMemoId;
    newDiv.className = `memo hidden`

    // add the newly created element and its content into the DOM
    const textDiv = document.getElementById("memos");
    textDiv.appendChild(newDiv);
});

