//#ef8e38 sun
// 	{planet: "Mercury", diameter: 0.383, color: "#A17F5D"},
// 	{planet: "Venus", diameter: 0.949, color: "#E89624"},
// 	{planet: "Earth", diameter: 1, color: "#518E87"},
// 	{planet: "Mars", diameter: 0.532, color: "#964120"},

const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");
const massesList = document.querySelector("#masses-list");

const width = (canvas.width = window.innerWidth);
const height = (canvas.height = window.innerHeight)
const scale = 70;
const radius = 4;
const trailLength = 35;

const g = 39.5;
const dt = 0.008;
const constant = 0.15;

const masses = [{
  name: "Sun",
  m: 1,
  x: -1.50324727873647e-6,
  y: -3.93762725944737e-6,
  z: -4.86567877183925e-8,
  vx: 3.1669325898331e-5,
  vy: -6.85489559263319e-6,
  vz: -7.90076642683254e-7
},
{
  name: "Mercury",
  m: 1.65956463e-7,
  x: -0.346390408691506,
  y: -0.272465544507684,
  z: 0.00951633403684172,
  vx: 4.25144321778261,
  vy: -7.61778341043381,
  vz: -1.01249478093275
},
{
  name: "Venus",
  m: 2.44699613e-6,
  x: -0.168003526072526,
  y: 0.698844725464528,
  z: 0.0192761582256879,
  vx: -7.2077847105093,
  vy: -1.76778886124455,
  vz: 0.391700036358566
},
{
  name: "Earth",
  m: 3.0024584e-6,
  x: 0.648778995445634,
  y: 0.747796691108466,
  z: -3.22953591923124e-5,
  vx: -4.85085525059392,
  vy: 4.09601538682312,
  vz: -0.000258553333317722
},
{
  m: 3.213e-7,
  name: "Mars",
  x: -0.574871406752105,
  y: -1.395455041953879,
  z: -0.01515164037265145,
  vx: 4.9225288800471425,
  vy: -1.5065904473191791,
  vz: -0.1524041758922603
}
];


let mousePressX = 0,
  mousePressY = 0,
  currentMouseX = 0,
  currentMouseY = 0,
  dragging = false,
  solarSystem;


canvas.addEventListener(
  "mousedown",
  e => {
    mousePressX = e.clientX;
    mousePressY = e.clientY;
    dragging = true;
  },
  false
);

canvas.addEventListener(
  "mousemove",
  e => {
    currentMouseX = e.clientX;
    currentMouseY = e.clientY;
  },
  false
);

canvas.addEventListener("mouseup", e => {
  const x = (mousePressX - width / 2) / scale;
  const y = (mousePressY - height / 2) / scale;
  const z = 0;
  const vx = (e.clientX - mousePressX) / 35;
  const vy = (e.clientY - mousePressY) / 35;
  const vz = 0;

  solarSystem.masses.push({
    m: parseFloat(massesList.value),
    x,
    y,
    z,
    vx,
    vy,
    vz,
    motionTrail: new MotionTrail(ctx, trailLength, radius)
  });
  dragging = false;
}, false)

class nBody {

  constructor(params) {
    this.g = params.g;
    this.dt = params.dt;
    this.constant = params.constant;

    this.masses = params.masses;
  }


  updatePosition = () => {
    for (let i = 0; i < this.masses.length; i++) {
      const massI = this.masses[i];
      massI.x += massI.vx * this.dt
      massI.y += massI.vy * this.dt
      massI.z += massI.vz * this.dt

    }
    return this;
  }


  updateVelocity = () => {
    for (let i = 0; i < this.masses.length; i++) {
      const massI = this.masses[i];
      massI.vx += massI.ax * this.dt
      massI.vy += massI.ay * this.dt
      massI.vz += massI.az * this.dt

    }
    return this;
  }


  updateAcceleration = () => {
    const length = this.masses.length;

    for (let i = 0; i < length; i++) {
      let ax = 0, ay = 0, az = 0;
      const massI = this.masses[i];

      for (let j = 0; j < length; j++) {
        if (i !== j) {
          const massJ = this.masses[j];

          const dx = massJ.x - massI.x,
            dy = massJ.y - massI.y,
            dz = massJ.z - massI.z;

          const disSq = dx * dx + dy * dy + dz * dz;

          const f = (this.g * massJ.m) / (disSq * Math.sqrt(disSq + this.constant));
          ax += dx * f;
          ay += dy * f;
          az += dz * f;
        }
      }
      massI.ax = ax;
      massI.ay = ay;
      massI.az = az;
    }
    return this;
  }
};



class MotionTrail {

  constructor(ctx, trailLength, radius) {
    this.ctx = ctx;
    this.trailLength = trailLength;
    this.radius = radius;
    this.positions = [];
  }


  storePositions = (x, y) => {
    this.positions.push({ x, y });

    if (this.positions.length > this.trailLength)
      this.positions.shift();
  }

  render = (x, y) => {
    this.storePositions(x, y);

    const length = this.positions.length;

    for (let i = 0; i < length; i++) {
      let opacity, circleScale;

      const scaleFactor = i / length;

      if (i === length - 1) {
        opacity = 1;
        circleScale = 1;
      } else {
        opacity = scaleFactor / 2;
        circleScale = scaleFactor;
      }

      this.ctx.beginPath();
      this.ctx.arc(
        this.positions[i].x,
        this.positions[i].y,
        circleScale * this.radius,
        0,
        2 * Math.PI
      );
      this.ctx.fillStyle = `rgb(0, 12, 153, ${opacity})`;
      this.ctx.fill();
    }
  }
};



solarSystem = new nBody({
  g,
  dt,
  masses: JSON.parse(JSON.stringify(masses)),
  constant
});


document.querySelector('#reset-button').addEventListener('click', () => {
  solarSystem.masses = JSON.parse(JSON.stringify(masses));
  populateMotionTrail(solarSystem.masses);
}, false);

const populateMotionTrail = masses => {
  masses.forEach(
    mass =>
      (mass["motionTrail"] = new MotionTrail(
        ctx,
        trailLength,
        radius
      ))
  );
};

populateMotionTrail(solarSystem.masses);


const animate = () => {
  solarSystem
    .updatePosition()
    .updateAcceleration()
    .updateVelocity();

  ctx.clearRect(0, 0, width, height);

  const massesLen = solarSystem.masses.length;

  for (let i = 0; i < massesLen; i++) {
    const massI = solarSystem.masses[i];

    const x = width / 2 + massI.x * scale;
    const y = height / 2 + massI.y * scale;

    massI.motionTrail.render(x, y);

    if (massI.name) {
      ctx.font = "14px Arial";
      ctx.fillText(massI.name, x + 12, y + 4);
      ctx.fill();
    }
    if (x < radius || x > width - radius) massI.vx = -massI.vx;

    if (y < radius || y > height - radius) massI.vy = -massI.vy;
  }

  if (dragging) {
    ctx.beginPath();
    ctx.moveTo(mousePressX, mousePressY);
    ctx.lineTo(currentMouseX, currentMouseY);
    ctx.strokeStyle = "red";
    ctx.stroke();
  }

  requestAnimationFrame(animate);
};

animate();