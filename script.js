import * as THREE from "three";

const canvas = document.getElementById("scene");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);


const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);

camera.position.set(0, 1.8, 6);


const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true
});

renderer.setSize(window.innerWidth, window.innerHeight);

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

renderer.outputColorSpace = THREE.SRGBColorSpace;


const ambientLight = new THREE.AmbientLight(
    0xffffff,
    0.7
);

scene.add(ambientLight);

const moonLight = new THREE.DirectionalLight(
    0xffffff,
    2
);

moonLight.position.set(5, 8, 5);

scene.add(moonLight);

const pointLight = new THREE.PointLight(
    0xffffff,
    6,
    20
);

pointLight.position.set(0, 3, 2);

scene.add(pointLight);
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
window.addEventListener("click", (event) => {

    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObject(roseGroup, true);

    if (intersects.length > 0) {

        showPoem();

    }

});

const floor = new THREE.Mesh(

    new THREE.CircleGeometry(4, 64),

    new THREE.MeshStandardMaterial({

        color: 0x111111,

        transparent: true,

        opacity: 0

    })

);

floor.rotation.x = -Math.PI / 2;

floor.position.y = -1;

scene.add(floor);


const starGeometry = new THREE.BufferGeometry();

const starCount = 3500;

const starVertices = [];

for (let i = 0; i < starCount; i++) {

    starVertices.push(

        (Math.random() - 0.5) * 120,

        Math.random() * 70,

        (Math.random() - 0.5) * 120

    );

}

starGeometry.setAttribute(

    "position",

    new THREE.Float32BufferAttribute(starVertices, 3)

);

const starMaterial = new THREE.PointsMaterial({

    color: 0xffffff,

    size: 0.05,

    transparent: true,

    opacity: 0.7

});

const stars = new THREE.Points(

    starGeometry,

    starMaterial

);

scene.add(stars);


const roseGroup = new THREE.Group();

roseGroup.position.y = -0.3;

scene.add(roseGroup);
function createPetalMesh(size, color) {

    const segsX = 8;
    const segsY = 16;

    const geo = new THREE.PlaneGeometry(1, 1, segsX, segsY);

    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {

        const ux = pos.getX(i);
        const uy = pos.getY(i) + 0.5;

      
        const widthProfile = Math.sin(Math.PI * Math.pow(uy, 0.75));

        const halfWidth = size * 0.8 * widthProfile;

        const newX = ux * 2 * halfWidth;
        const newY = uy * size;

        const curl = -Math.pow(uy, 1.6) * size * 0.75;

        const cup = (ux * ux * 4) * size * 0.14;

        pos.setX(i, newX);
        pos.setY(i, newY);
        pos.setZ(i, curl + cup);

    }

    geo.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({

        color,
        roughness: 0.5,
        metalness: 0.03,
        side: THREE.DoubleSide

    });

    const mesh = new THREE.Mesh(geo, mat);

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return mesh;

}

const petalColors = [0xfffdf9, 0xfffaf2, 0xfdf5ea];

const ringConfigs = [

    { count: 5, radius: 0.03, height: 0.78, tilt: 0.15, size: 0.16 },
    { count: 6, radius: 0.05, height: 0.7, tilt: 0.4, size: 0.22 },
    { count: 7, radius: 0.08, height: 0.6, tilt: 0.75, size: 0.28 },
    { count: 8, radius: 0.1, height: 0.5, tilt: 1.05, size: 0.34 },
    { count: 9, radius: 0.12, height: 0.42, tilt: 1.35, size: 0.4 }

];

const bloomGroup = new THREE.Group();

ringConfigs.forEach((ring, ringIndex) => {

    for (let i = 0; i < ring.count; i++) {

        const angle = (i / ring.count) * Math.PI * 2 + ringIndex * 0.35;

        const color = petalColors[ringIndex % petalColors.length];

        const pivot = new THREE.Object3D();

        pivot.rotation.y = angle;

        bloomGroup.add(pivot);

        const hinge = new THREE.Object3D();

        hinge.position.set(0, ring.height, ring.radius);

        hinge.rotation.x = ring.tilt + (Math.random() - 0.5) * 0.1;
        hinge.rotation.z = (Math.random() - 0.5) * 0.08;

        pivot.add(hinge);

        const petal = createPetalMesh(ring.size, color);

        hinge.add(petal);

    }

});

roseGroup.add(bloomGroup);

let rose = bloomGroup;

const stemMaterial = new THREE.MeshStandardMaterial({

    color: 0x2f5d34,
    roughness: 0.65

});

for (let i = 0; i < 5; i++) {

    const angle = (i / 5) * Math.PI * 2;

    const sepal = new THREE.Mesh(

        new THREE.ConeGeometry(0.05, 0.22, 6),

        stemMaterial

    );

    sepal.position.set(

        Math.cos(angle) * 0.09,
        0.36,
        Math.sin(angle) * 0.09

    );

    sepal.rotation.x = Math.PI + 0.5;
    sepal.rotation.z = Math.cos(angle) * 0.4;
    sepal.rotation.y = -angle;

    roseGroup.add(sepal);

}

const stemCurve = new THREE.CatmullRomCurve3([

    new THREE.Vector3(0, 0.42, 0),
    new THREE.Vector3(0.04, -0.3, 0.03),
    new THREE.Vector3(-0.03, -1.0, -0.02),
    new THREE.Vector3(0.02, -1.7, 0.02)

]);

const stemGeometry = new THREE.TubeGeometry(

    stemCurve, 40, 0.035, 8, false

);

const stem = new THREE.Mesh(stemGeometry, stemMaterial);

stem.castShadow = true;
stem.receiveShadow = true;

roseGroup.add(stem);


const leafShape = new THREE.Shape();

leafShape.moveTo(0, 0);
leafShape.quadraticCurveTo(0.14, 0.08, 0.02, 0.32);
leafShape.quadraticCurveTo(-0.14, 0.08, 0, 0);

const leafGeometry = new THREE.ExtrudeGeometry(

    leafShape,

    { depth: 0.005, bevelEnabled: false }

);

[0.35, 0.62].forEach((t, idx) => {

    const point = stemCurve.getPointAt(t);

    const leaf = new THREE.Mesh(leafGeometry, stemMaterial);

    leaf.position.copy(point);

    leaf.rotation.y = idx % 2 === 0 ? 0.6 : -2.3;
    leaf.rotation.z = 0.3;

    leaf.scale.set(1.3, 1.3, 1.3);

    leaf.castShadow = true;

    roseGroup.add(leaf);

});


const thornGeometry = new THREE.ConeGeometry(0.02, 0.09, 6);

for (let i = 0; i < 7; i++) {

    const t = 0.12 + i * 0.11;

    const point = stemCurve.getPointAt(t);

    const thorn = new THREE.Mesh(thornGeometry, stemMaterial);

    thorn.position.copy(point);

    const outward = Math.random() * Math.PI * 2;

    thorn.position.x += Math.cos(outward) * 0.02;
    thorn.position.z += Math.sin(outward) * 0.02;

    thorn.rotation.z = outward + Math.PI / 2;
    thorn.rotation.x = (Math.random() - 0.5) * 0.4;

    roseGroup.add(thorn);

}

const particleGeometry = new THREE.BufferGeometry();

const particleCount = 400;

const particlePositions = [];

for (let i = 0; i < particleCount; i++) {

    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 2;

    particlePositions.push(

        Math.cos(angle) * radius,

        Math.random() * 3,

        Math.sin(angle) * radius

    );

}

particleGeometry.setAttribute(

    "position",

    new THREE.Float32BufferAttribute(

        particlePositions,

        3

    )

);

const particleMaterial = new THREE.PointsMaterial({

    color: 0xffffff,

    size: 0.03,

    transparent: true,

    opacity: 0.8

});

const particles = new THREE.Points(

    particleGeometry,

    particleMaterial

);

roseGroup.add(particles);


const glow = new THREE.PointLight(

    0xffffff,

    2,

    6

);

glow.position.set(

    0,

    1,

    0

);

roseGroup.add(glow);


const fireflies = [];

for (let i = 0; i < 30; i++) {

    const fly = new THREE.Mesh(

        new THREE.SphereGeometry(

            0.015,

            8,

            8

        ),

        new THREE.MeshBasicMaterial({

            color: 0xffffff

        })

    );

    fly.position.set(

        (Math.random() - 0.5) * 3,

        Math.random() * 2,

        (Math.random() - 0.5) * 3

    );

    roseGroup.add(fly);

    fireflies.push(fly);

}
const mouse = {

    x: 0,

    y: 0

};

window.addEventListener("mousemove", (event) => {

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;

    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

});

const intro = document.getElementById("intro");
const loading = document.getElementById("loading");
const music = document.getElementById("music");

window.addEventListener("load", () => {

    setTimeout(() => {

        loading.style.opacity = "0";

        setTimeout(() => {

            loading.style.display = "none";

        }, 1000);

    }, 1800);

});

document.getElementById("startButton").addEventListener("click", () => {

    intro.classList.add("hide");

    if (music) {

        music.volume = 0.2;

        music.play().catch(() => {});

    }

});


window.addEventListener("resize", () => {

    camera.aspect = window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(

        window.innerWidth,

        window.innerHeight

    );

});

const clock = new THREE.Clock();


function animate() {

    requestAnimationFrame(animate);

    const elapsed = clock.getElapsedTime();

    stars.rotation.y += 0.00015;

    stars.rotation.x = Math.sin(elapsed * 0.05) * 0.02;

    roseGroup.rotation.y += 0.003;

    roseGroup.rotation.x = mouse.y * 0.12;

    roseGroup.rotation.z = mouse.x * 0.12;

    camera.position.x += (

        mouse.x * 0.3 -

        camera.position.x

    ) * 0.015;

    camera.position.y += (

        1.8 + mouse.y * 0.2 -

        camera.position.y

    ) * 0.015;

    camera.lookAt(

        roseGroup.position

    );

    renderer.render(

        scene,

        camera

    );
if (rose) {

    rose.rotation.y += 0.002;

    rose.position.y =

        Math.sin(elapsed * 0.8) * 0.03;

}


particles.rotation.y += 0.0008;

particles.rotation.x += 0.0002;


glow.intensity =

    2 +

    Math.sin(elapsed * 2) * 0.4;


fireflies.forEach((fly, index) => {

    fly.position.y +=

        Math.sin(

            elapsed * 2 +

            index

        ) * 0.0015;

    fly.position.x +=

        Math.cos(

            elapsed +

            index

        ) * 0.0008;

});
}

animate();
function showPoem() {

    const old = document.getElementById("lovePoem");

    if (old) old.remove();

    const poem = document.createElement("div");

    poem.id = "lovePoem";

    poem.innerHTML = `
        <h2>🤍 p/ Sophia Bruzarosco 🤍</h2>

        <p>
        Sophia,<br><br>

        entre todas as flores,<br>
        nenhuma consegue carregar a delicadeza que existe em você.<br><br>

        seu sorriso ilumina até os dias mais silenciosos,<br>
        e sua presença transforma momentos comuns em lembranças bonitas.<br><br>

        nunca deixe de ser essa pessoa tão gentil,<br>
        tão doce e tão especial.<br><br>

        espero q sempre que olhar p essa rosa,<br>
        lembre-se de que existe alguém que admira mt quem vc é.<br><br>

        🤍
        algumas pessoas deixam o mundo mais bonito apenas por estarem nele. vc é uma delas.
        brasil perdeu a copa mas eu ganhei meu mundo quando vc apareceu!!!
        </p>

        <button onclick="document.getElementById('lovePoem').remove()">
            Fechar
        </button>
    `;

    document.body.appendChild(poem);

}
