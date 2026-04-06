'use strict';

// ═══ REAL PLANET TEXTURES (embedded) ═══
const TEX_MOON = 'textures/TEX_MOON.jpg';
const TEX_STARS = 'textures/TEX_STARS.jpg';
const TEX_SUN = 'textures/TEX_SUN.jpg';
const TEX_EARTH = 'textures/TEX_EARTH.jpg';
const TEX_JUPITER = 'textures/TEX_JUPITER.jpg';
const TEX_MARS = 'textures/TEX_MARS.jpg';
const TEX_MERCURY = 'textures/TEX_MERCURY.jpg';
const TEX_NEPTUNE = 'textures/TEX_NEPTUNE.jpg';
const TEX_SATURN = 'textures/TEX_SATURN.jpg';
const TEX_SATURN_RING = 'textures/TEX_SATURN_RING.png';
const TEX_URANUS = 'textures/TEX_URANUS.jpg';
const TEX_URANUS_RING = 'textures/TEX_URANUS_RING.png';
const TEX_VENUS = 'textures/TEX_VENUS.jpg';

// ═══════════════════════════════════════════════════════════
//  SCALE SYSTEM
// ═══════════════════════════════════════════════════════════
const SUN_R_SCENE = 0.285;
const SUN_R_KM = 696000;
const KM_TO_SCENE = SUN_R_SCENE / SUN_R_KM;

function auToScene(au) { return Math.log10(1 + au / 0.15) * 55; }

const J2000_JD = 2451545.0;
function dateToJD(date) { return date.getTime() / 86400000 + 2440587.5; }
function jdToDate(jd) { return new Date((jd - 2440587.5) * 86400000); }

function solveKepler(M, e) {
	M = ((M % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
	let E = M;
	for (let i = 0; i < 50; i++) {
		const dE = (M - E + e * Math.sin(E)) / (1 - e * Math.cos(E));
		E += dE; if (Math.abs(dE) < 1e-9) break;
	}
	return E;
}

function keplerPos(elem, T) {
	const a = (elem.a0 + elem.da * T), e = (elem.e0 + elem.de * T);
	const I = (elem.I0 + elem.dI * T) * Math.PI / 180, L = (elem.L0 + elem.dL * T) * Math.PI / 180;
	const lp = (elem.lp0 + elem.dlp * T) * Math.PI / 180, Om = (elem.Om0 + elem.dOm * T) * Math.PI / 180;
	const w = lp - Om, M = L - lp, E = solveKepler(M, e);
	const v = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
	const r = a * (1 - e * Math.cos(E));
	const cO = Math.cos(Om), sO = Math.sin(Om), cw = Math.cos(w), sw = Math.sin(w), cI = Math.cos(I), sI = Math.sin(I), cv = Math.cos(v), sv = Math.sin(v);
	return {
		x: r * (cO * (cw * cv - sw * sv) - sO * (sw * cv + cw * sv) * cI),
		y: r * (sO * (cw * cv - sw * sv) + cO * (sw * cv + cw * sv) * cI),
		z: r * (sI * (sw * cv + cw * sv)), r
	};
}

const OE = {
	mercury: { a0: .38709927, da: .00000037, e0: .20563593, de: .00001906, I0: 7.00497902, dI: -.00594749, L0: 252.25032350, dL: 149472.67411175, lp0: 77.45779628, dlp: .16047689, Om0: 48.33076593, dOm: -.12534081 },
	venus: { a0: .72333566, da: .00000390, e0: .00677672, de: -.00004107, I0: 3.39467605, dI: -.00078890, L0: 181.97909950, dL: 58517.81538729, lp0: 131.60246718, dlp: .00268329, Om0: 76.67984255, dOm: -.27769418 },
	earth: { a0: 1.00000261, da: .00000562, e0: .01671123, de: -.00004392, I0: -.00001531, dI: -.01294668, L0: 100.46457166, dL: 35999.37244981, lp0: 102.93768193, dlp: .32327364, Om0: 0, dOm: 0 },
	mars: { a0: 1.52371034, da: .00001847, e0: .09339410, de: .00007882, I0: 1.84969142, dI: -.00813131, L0: -4.55343205, dL: 19140.30268499, lp0: -23.94362959, dlp: .44441088, Om0: 49.55953891, dOm: -.29257343 },
	jupiter: { a0: 5.20288700, da: -.00011607, e0: .04838624, de: -.00013253, I0: 1.30439695, dI: -.00183714, L0: 34.39644051, dL: 3034.74612775, lp0: 14.72847983, dlp: .21252668, Om0: 100.47390909, dOm: .20469106 },
	saturn: { a0: 9.53667594, da: -.00125060, e0: .05386179, de: -.00050991, I0: 2.48599187, dI: .00193609, L0: 49.95424423, dL: 1222.49362201, lp0: 92.59887831, dlp: -.41897216, Om0: 113.66242448, dOm: -.28867794 },
	uranus: { a0: 19.18916464, da: -.00196176, e0: .04725744, de: -.00004397, I0: .77263783, dI: -.00242939, L0: 313.23810451, dL: 428.48202785, lp0: 170.95427630, dlp: .40805281, Om0: 74.01692503, dOm: .04240589 },
	neptune: { a0: 30.06992276, da: .00026291, e0: .00859048, de: .00005105, I0: 1.77004347, dI: .00035372, L0: -55.12002969, dL: 218.45945325, lp0: 44.96476227, dlp: -.32241464, Om0: 131.78422574, dOm: -.00508664 },
};

const PLANETS = [
	{ id: 'sun', name: 'Sun', type: 'Star', realR: 696000, color: '#FDB813', emissive: '#ff3300', orb: null, rotDays: 25.38, tilt: 7.25, dist: 'Center', diam: '1,392,700 km', period: '—', moons: '0', dot: '#FDB813' },
	{ id: 'mercury', name: 'Mercury', type: 'Terrestrial', realR: 2440, color: '#a0a0a0', emissive: '#181818', orb: 'mercury', rotDays: 58.65, tilt: .03, dist: '.387 AU', diam: '4,879 km', period: '88 d', moons: '0', dot: '#aaa' },
	{ id: 'venus', name: 'Venus', type: 'Terrestrial', realR: 6051, color: '#e8cda0', emissive: '#3a2000', orb: 'venus', rotDays: -243.02, tilt: 177.4, dist: '.723 AU', diam: '12,104 km', period: '225 d', moons: '0', dot: '#e8cda0' },
	{ id: 'earth', name: 'Earth', type: 'Terrestrial', realR: 6371, color: '#2e86c1', emissive: '#041220', orb: 'earth', rotDays: 1, tilt: 23.44, dist: '1.00 AU', diam: '12,742 km', period: '365 d', moons: '1', dot: '#4b9cd3' },
	{ id: 'mars', name: 'Mars', type: 'Terrestrial', realR: 3390, color: '#c1440e', emissive: '#280800', orb: 'mars', rotDays: 1.026, tilt: 25.19, dist: '1.52 AU', diam: '6,779 km', period: '687 d', moons: '2', dot: '#c1440e' },
	{ id: 'jupiter', name: 'Jupiter', type: 'Gas Giant', realR: 69911, color: '#c88b3a', emissive: '#281400', orb: 'jupiter', rotDays: .4135, tilt: 3.13, dist: '5.20 AU', diam: '139,820 km', period: '11.9 yr', moons: '95', dot: '#c88b3a' },
	{ id: 'saturn', name: 'Saturn', type: 'Gas Giant', realR: 58232, color: '#e4d191', emissive: '#282400', orb: 'saturn', rotDays: .4440, tilt: 26.73, dist: '9.54 AU', diam: '116,460 km', period: '29.5 yr', moons: '146', dot: '#e4d191', ring: true },
	{ id: 'uranus', name: 'Uranus', type: 'Ice Giant', realR: 25362, color: '#7de8e8', emissive: '#002222', orb: 'uranus', rotDays: -.7183, tilt: 97.77, dist: '19.2 AU', diam: '50,724 km', period: '84 yr', moons: '28', dot: '#7de8e8', ring: true },
	{ id: 'neptune', name: 'Neptune', type: 'Ice Giant', realR: 24622, color: '#3050dd', emissive: '#000618', orb: 'neptune', rotDays: .6713, tilt: 28.32, dist: '30.1 AU', diam: '49,244 km', period: '165 yr', moons: '16', dot: '#4b70dd' },
];
PLANETS.forEach(p => { p.sceneR = p.realR * KM_TO_SCENE; p.clickR = Math.max(p.sceneR, 0.18); });

const MOONS = [
	{ id: 'moon', parent: 'earth', name: 'Moon', realR: 1737, orbR_km: 384, period: 27.32, color: '#c0b89a', tilt: 5.14 },
	{ id: 'phobos', parent: 'mars', name: 'Phobos', realR: 11, orbR_km: 9376, period: .319, color: '#9a8878', tilt: -1.08 },
	{ id: 'deimos', parent: 'mars', name: 'Deimos', realR: 6, orbR_km: 23458, period: 1.263, color: '#9a9080', tilt: 1.79 },
	{ id: 'io', parent: 'jupiter', name: 'Io', realR: 1822, orbR_km: 421800, period: 1.769, color: '#e8d060', tilt: 0.04 },
	{ id: 'europa', parent: 'jupiter', name: 'Europa', realR: 1561, orbR_km: 671100, period: 3.551, color: '#c8b890', tilt: 0.47 },
	{ id: 'ganymede', parent: 'jupiter', name: 'Ganymede', realR: 2634, orbR_km: 1070400, period: 7.155, color: '#a09080', tilt: 0.20 },
	{ id: 'callisto', parent: 'jupiter', name: 'Callisto', realR: 2410, orbR_km: 1882700, period: 16.69, color: '#706858', tilt: 0.19 },
	{ id: 'titan', parent: 'saturn', name: 'Titan', realR: 2575, orbR_km: 1221870, period: 15.945, color: '#d0a840', tilt: 0.35 },
	{ id: 'rhea', parent: 'saturn', name: 'Rhea', realR: 764, orbR_km: 527108, period: 4.518, color: '#b8b0a0', tilt: 0.35 },
	{ id: 'dione', parent: 'saturn', name: 'Dione', realR: 562, orbR_km: 377396, period: 2.737, color: '#c0b8b0', tilt: 0.02 },
	{ id: 'tethys', parent: 'saturn', name: 'Tethys', realR: 531, orbR_km: 294619, period: 1.888, color: '#d0c8c0', tilt: 1.09 },
	{ id: 'enceladus', parent: 'saturn', name: 'Enceladus', realR: 252, orbR_km: 238020, period: 1.370, color: '#e8e8f0', tilt: 0.02 },
	{ id: 'mimas', parent: 'saturn', name: 'Mimas', realR: 198, orbR_km: 185539, period: .942, color: '#c8c0b8', tilt: 1.57 },
	{ id: 'iapetus', parent: 'saturn', name: 'Iapetus', realR: 735, orbR_km: 3560820, period: 79.33, color: '#908070', tilt: 15.47 },
	{ id: 'titania', parent: 'uranus', name: 'Titania', realR: 789, orbR_km: 435910, period: 8.706, color: '#9090a8', tilt: 0.08 },
	{ id: 'oberon', parent: 'uranus', name: 'Oberon', realR: 761, orbR_km: 583520, period: 13.46, color: '#888090', tilt: 0.07 },
	{ id: 'umbriel', parent: 'uranus', name: 'Umbriel', realR: 585, orbR_km: 266300, period: 4.144, color: '#605858', tilt: 0.13 },
	{ id: 'ariel', parent: 'uranus', name: 'Ariel', realR: 579, orbR_km: 191020, period: 2.520, color: '#9898a8', tilt: 0.04 },
	{ id: 'miranda', parent: 'uranus', name: 'Miranda', realR: 236, orbR_km: 129390, period: 1.413, color: '#a0a0b0', tilt: 4.34 },
	{ id: 'triton', parent: 'neptune', name: 'Triton', realR: 1354, orbR_km: 354759, period: -5.877, color: '#b0a898', tilt: 157.35 },
	{ id: 'nereid', parent: 'neptune', name: 'Nereid', realR: 170, orbR_km: 5513818, period: 360.14, color: '#888888', tilt: 7.23 },
	{ id: 'proteus', parent: 'neptune', name: 'Proteus', realR: 210, orbR_km: 117647, period: 1.122, color: '#706868', tilt: 0.55 },
];
function moonOrbToScene(km) { return Math.log10(1 + km / 8000) * 4.5; }

// Real mean longitudes at J2000 epoch (degrees) and mean motions (degrees/day)
// Sources: JPL/NASA ephemeris data for major moons
const MOON_EPOCHS = {
	// Earth
	moon:      { L0: 218.3164477, dLdt: 13.17639648 },   // Moon mean longitude
	// Mars
	phobos:    { L0: 92.474,      dLdt: 1128.8445850 },
	deimos:    { L0: 296.230,     dLdt: 285.1618970 },
	// Jupiter (Galilean + others) — from JPL satellite mean elements
	io:        { L0: 106.077,     dLdt: 203.4889538 },
	europa:    { L0: 175.731,     dLdt: 101.3747235 },
	ganymede:  { L0: 44.064,      dLdt: 50.3176081 },
	callisto:  { L0: 320.877,     dLdt: 21.5710715 },
	// Saturn
	mimas:     { L0: 14.852,      dLdt: 381.9945550 },
	enceladus: { L0: 197.047,     dLdt: 262.7318996 },
	tethys:    { L0: 10.366,      dLdt: 190.6979085 },
	dione:     { L0: 357.640,     dLdt: 131.5349316 },
	rhea:      { L0: 309.932,     dLdt: 79.6900478 },
	titan:     { L0: 186.513,     dLdt: 22.5769768 },
	iapetus:   { L0: 356.029,     dLdt: 4.5379571 },
	// Uranus
	miranda:   { L0: 68.312,      dLdt: 254.6906150 },
	ariel:     { L0: 115.349,     dLdt: 142.8356681 },
	umbriel:   { L0: 84.691,      dLdt: 86.8688923 },
	titania:   { L0: 284.400,     dLdt: 41.3514316 },
	oberon:    { L0: 104.400,     dLdt: 26.7394932 },
	// Neptune
	proteus:   { L0: 117.050,     dLdt: 320.7654228 },
	triton:    { L0: 264.775,     dLdt: -61.2572637 },  // retrograde
	nereid:    { L0: 358.910,     dLdt: 0.9996465 },
};

function moonAngleAtJD(m, jd) {
	const ep = MOON_EPOCHS[m.id];
	if (!ep) return 0;
	const daysSinceJ2000 = jd - J2000_JD;
	const dir = m.period < 0 ? -1 : 1;
	return ((ep.L0 + ep.dLdt * daysSinceJ2000 * dir) % 360) * Math.PI / 180;
}

MOONS.forEach(m => { m.sceneR = m.realR * KM_TO_SCENE; m.sceneOrb = moonOrbToScene(m.orbR_km); m.angle = 0; });

// ═══════════════════════════════════════════════════════════
//  THREE.JS SETUP
// ═══════════════════════════════════════════════════════════
const canvas = document.getElementById('cv');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 0.55;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.0001, 20000);

// Sun direct light — reduced intensity so planets aren't blown out
// decay:2 = inverse-square falloff, distance:0 = infinite range
const sunLight = new THREE.PointLight(0xfff4d6, 16, 0, 2);
sunLight.position.set(0, 0, 0); scene.add(sunLight);
// Warm secondary fill — simulates scattered solar diffusion, much weaker
const fillLight = new THREE.PointLight(0xff9944, 12, 0, 2);
fillLight.position.set(0, 0, 0); scene.add(fillLight);
// Ambient — restored to original level for deep-space visibility
scene.add(new THREE.AmbientLight(0x0d0d20, 0.9));

// ── MILKY WAY SKYBOX ─────────────────────────────────────
(function () {
	const loader = new THREE.TextureLoader();
	const skyTex = loader.load(TEX_STARS);
	skyTex.wrapS = skyTex.wrapT = THREE.RepeatWrapping;
	const skyGeo = new THREE.SphereGeometry(8000, 64, 40);
	const skyMat = new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide });
	scene.add(new THREE.Mesh(skyGeo, skyMat));
	// Sparse extra point stars for sparkle
	const n = 3000, pos = new Float32Array(n * 3);
	for (let i = 0; i < n; i++) {
		const r = 700 + Math.random() * 80, t = Math.random() * Math.PI * 2, p = Math.acos(2 * Math.random() - 1);
		pos[i * 3] = r * Math.sin(p) * Math.cos(t); pos[i * 3 + 1] = r * Math.sin(p) * Math.sin(t); pos[i * 3 + 2] = r * Math.cos(p);
	}
	const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
	scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: .55, sizeAttenuation: true, transparent: true, opacity: .65 })));
})();

// ── TEXTURE LOADER ────────────────────────────────────────
const _texLoader = new THREE.TextureLoader();
const _texCache = {};
function loadTex(dataUri, id) {
	if (_texCache[id]) return _texCache[id];
	const t = _texLoader.load(dataUri);
	t.wrapS = t.wrapT = THREE.RepeatWrapping;
	_texCache[id] = t;
	return t;
}
// ── PROCEDURAL SUN TEXTURE ─────────────────────────────────
function makeSunTexture() {
	const sz = 1024;
	const c = document.createElement('canvas'); c.width = c.height = sz;
	const ctx = c.getContext('2d');
	const cx = sz / 2, cy = sz / 2, R = sz / 2;
	// 1. Base: bright yellow fill for higher baseline brightness
	ctx.fillStyle = '#ffcc00';
	ctx.fillRect(0, 0, sz, sz);

	// 2. Granulation cells — scattered across full canvas including tile edges
	//    (tiled/wrapped by THREE, so we paint beyond edges to avoid seams)
	const NCELLS = 480;
	const cellPts = [];
	for (let i = 0; i < NCELLS; i++) {
		cellPts.push({
			x: Math.random() * sz,
			y: Math.random() * sz,
			brightness: 0.65 + Math.random() * 0.35,
			size: 12 + Math.random() * 32
		});
	}
	for (const p of cellPts) {
		const bright = p.brightness;
		const cr = Math.min(255, 240 + bright * 15 | 0);
		const cg = Math.min(255, 180 + bright * 75 | 0);
		const cb = Math.min(255, 20 + bright * 30 | 0);
		const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
		g.addColorStop(0, `rgba(${cr},${cg},${cb},1)`);
		g.addColorStop(0.5, `rgba(${cr * 0.9 | 0},${cg * 0.75 | 0},${cb * 0.5 | 0},0.6)`);
		g.addColorStop(1, `rgba(200,60,10,0.1)`);
		ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
		ctx.fillStyle = g; ctx.fill();
	}

	// 3. Plasma variation — large slow blobs to break up the regularity
	for (let i = 0; i < 25; i++) {
		const px = Math.random() * sz, py = Math.random() * sz;
		const pr = 100 + Math.random() * 160;
		const bright = 0.5 + Math.random() * 0.5;
		const g = ctx.createRadialGradient(px, py, 0, px, py, pr);
		g.addColorStop(0, `rgba(255,${180 + bright * 75 | 0},${20 + bright * 20 | 0},${0.25 + bright * 0.2})`);
		g.addColorStop(0.6, `rgba(255,150,20,0.15)`);
		g.addColorStop(1, `rgba(0,0,0,0)`);
		ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2);
		ctx.fillStyle = g; ctx.fill();
	}

	// 4. Bright hot-spot granule cores - much more intense
	for (let i = 0; i < 200; i++) {
		const hx = Math.random() * sz, hy = Math.random() * sz;
		const hr = 3 + Math.random() * 8;
		const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, hr);
		g.addColorStop(0, 'rgba(255,255,200,1)');
		g.addColorStop(0.5, 'rgba(255,200,60,0.6)');
		g.addColorStop(1, 'rgba(255,100,20,0.1)');
		ctx.beginPath(); ctx.arc(hx, hy, hr, 0, Math.PI * 2);
		ctx.fillStyle = g; ctx.fill();
	}

	// 5. Dark intergranular lanes - reduced to not darken too much
	for (let i = 0; i < 80; i++) {
		const lx = Math.random() * sz, ly = Math.random() * sz;
		const lr = 1 + Math.random() * 3;
		const g = ctx.createRadialGradient(lx, ly, 0, lx, ly, lr);
		g.addColorStop(0, 'rgba(80,20,0,0.3)');
		g.addColorStop(1, 'rgba(80,20,0,0)');
		ctx.beginPath(); ctx.arc(lx, ly, lr, 0, Math.PI * 2);
		ctx.fillStyle = g; ctx.fill();
	}

	// 6. Subtle limb darkening 
	const limbG = ctx.createRadialGradient(cx, cy, R * 0.4, cx, cy, R * 1.02);
	limbG.addColorStop(0, 'rgba(0,0,0,0)');
	limbG.addColorStop(0.75, 'rgba(0,0,0,0)');
	limbG.addColorStop(0.92, 'rgba(40,10,0,0.1)');
	limbG.addColorStop(1, 'rgba(0,0,0,0.2)');
	ctx.fillStyle = limbG;
	ctx.fillRect(0, 0, sz, sz);

	const blurCanvas = document.createElement('canvas');
	blurCanvas.width = blurCanvas.height = sz;
	const blurCtx = blurCanvas.getContext('2d');
	blurCtx.filter = 'blur(4px)';
	blurCtx.drawImage(c, 0, 0);
	const tex = new THREE.CanvasTexture(blurCanvas);
	tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
	return tex;
}

function makeTex(p) {
	const map = {
		mercury: TEX_MERCURY, venus: TEX_VENUS, earth: TEX_EARTH,
		mars: TEX_MARS, jupiter: TEX_JUPITER, saturn: TEX_SATURN, uranus: TEX_URANUS, neptune: TEX_NEPTUNE
	};
	if (p.id === 'sun') return makeSunTexture();
	if (map[p.id]) return loadTex(map[p.id], p.id);
	const sz = 256, c = document.createElement('canvas'); c.width = c.height = sz;
	const ctx = c.getContext('2d'); ctx.fillStyle = p.color; ctx.fillRect(0, 0, sz, sz);
	return new THREE.CanvasTexture(c);
}
function makeMoonTex(m) {
	if (m.id === 'moon') return loadTex(TEX_MOON, 'moon');
	const sz = 128, c = document.createElement('canvas'); c.width = c.height = sz;
	const ctx = c.getContext('2d');
	const bc = new THREE.Color(m.color);
	ctx.fillStyle = m.color; ctx.fillRect(0, 0, sz, sz);
	for (let i = 0; i < 60; i++) { const bv = .5 + Math.random() * .8; ctx.fillStyle = `rgba(${bc.r * 255 * bv | 0},${bc.g * 255 * bv | 0},${bc.b * 255 * bv | 0},.5)`; ctx.beginPath(); ctx.arc(Math.random() * sz, Math.random() * sz, Math.random() * 5 + 1, 0, Math.PI * 2); ctx.fill(); }
	if (m.id === 'titan') { const g = ctx.createRadialGradient(sz / 2, sz / 2, 0, sz / 2, sz / 2, sz / 2); g.addColorStop(0, 'rgba(200,160,40,.4)'); g.addColorStop(1, 'transparent'); ctx.fillStyle = g; ctx.fillRect(0, 0, sz, sz); }
	if (m.id === 'io') { for (let i = 0; i < 20; i++) { ctx.fillStyle = `rgba(255,${200 + Math.random() * 55 | 0},0,.6)`; ctx.beginPath(); ctx.arc(Math.random() * sz, Math.random() * sz, Math.random() * 4 + 1, 0, Math.PI * 2); ctx.fill(); } }
	return new THREE.CanvasTexture(c);
}

// Helper: UV fix for ring geometry (radial mapping)
function fixRingUV(geo, rInner, rOuter) {
	const pos = geo.attributes.position; const uv = geo.attributes.uv;
	for (let i = 0; i < pos.count; i++) {
		const vx = pos.getX(i), vy = pos.getY(i);
		const dist = Math.sqrt(vx * vx + vy * vy);
		uv.setXY(i, (dist - rInner) / (rOuter - rInner), 0.5);
	}
	uv.needsUpdate = true;
}

// ── BUILD PLANET MESHES ──────────────────────────────────
const meshes = {};
PLANETS.forEach(p => {
	const R = p.sceneR;
	const geo = new THREE.SphereGeometry(R, 54, 36);
	const isSun = p.id === 'sun';
	const mat = isSun
		? new THREE.MeshBasicMaterial({
			map: makeTex(p),
			toneMapped: false
		})
		: new THREE.MeshStandardMaterial({
			map: makeTex(p),
			emissive: new THREE.Color(p.emissive),
			emissiveIntensity: 0,
			roughness: .98, metalness: 0
		});
	const mesh = new THREE.Mesh(geo, mat);
	mesh.userData = { ...p, isMoon: false };
	mesh.castShadow = true; mesh.receiveShadow = true;
	scene.add(mesh); meshes[p.id] = mesh;

	if (isSun) {
		// Sprite-based corona glow — no geometry disc artifacts
		const spriteMat = new THREE.SpriteMaterial({
			map: (() => {
				const sc = document.createElement('canvas'); sc.width = sc.height = 256;
				const sx = sc.getContext('2d');
				const sg = sx.createRadialGradient(128, 128, 0, 128, 128, 128);
				sg.addColorStop(0, 'rgba(255,240,120,1.0)');
				sg.addColorStop(0.12, 'rgba(255,230,100,0.90)');
				sg.addColorStop(0.25, 'rgba(255,190,60,0.75)');
				sg.addColorStop(0.45, 'rgba(255,160,40,0.55)');
				sg.addColorStop(0.70, 'rgba(250,140,40,0.35)');
			sg.addColorStop(0.90, 'rgba(250,140,40,0.18)');
				sg.addColorStop(1, 'rgba(0,0,0,0)');
				sx.fillStyle = sg; sx.fillRect(0, 0, 256, 256);
				return new THREE.CanvasTexture(sc);
			})(),
			transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
		});
		const sprite = new THREE.Sprite(spriteMat);
		sprite.scale.set(R * 22, R * 22, 1);
		meshes['sun'].add(sprite);
	}

	if (p.id === 'saturn') {
		const ringGroup = new THREE.Group();
		const ringTex = loadTex(TEX_SATURN_RING, 'saturn_ring');
		// Main ring disc — radial UV mapped
		const rInner = R * 1.2, rOuter = R * 2.85;
		const rg = new THREE.RingGeometry(rInner, rOuter, 120);
		fixRingUV(rg, rInner, rOuter);
		const rm = new THREE.MeshBasicMaterial({ map: ringTex, side: THREE.DoubleSide, transparent: true, opacity: .95, alphaTest: 0.02 });
		ringGroup.add(new THREE.Mesh(rg, rm));
		ringGroup.rotation.x = Math.PI * 0.43;
		mesh.add(ringGroup);
	}

	if (p.id === 'uranus') {
		const ringGroup = new THREE.Group();
		const ringTex = loadTex(TEX_URANUS_RING, 'uranus_ring');
		const rInner = R * 1.5, rOuter = R * 2.1;
		const rg = new THREE.RingGeometry(rInner, rOuter, 100);
		fixRingUV(rg, rInner, rOuter);
		const rm = new THREE.MeshBasicMaterial({ map: ringTex, side: THREE.DoubleSide, transparent: true, opacity: .8, alphaTest: 0.01 });
		ringGroup.add(new THREE.Mesh(rg, rm));
		// Uranus is sideways — tilt ring to match its extreme axial tilt
		ringGroup.rotation.x = Math.PI * 0.5;
		mesh.add(ringGroup);
	}

	if (p.tilt) mesh.rotation.z = p.tilt * Math.PI / 180;
});

// ── BUILD MOON MESHES ────────────────────────────────────
const moonMeshes = {};
MOONS.forEach(m => {
	const geo = new THREE.SphereGeometry(m.sceneR, 20, 14);
	const mat = new THREE.MeshStandardMaterial({
		map: makeMoonTex(m), emissive: new THREE.Color('#000000'), emissiveIntensity: 0, roughness: .98, metalness: 0, envMapIntensity: 0
	});
	const mesh = new THREE.Mesh(geo, mat);
	mesh.userData = { ...m, isMoon: true }; mesh.castShadow = true;
	scene.add(mesh); moonMeshes[m.id] = mesh;
});

// ── ORBIT LINES ──────────────────────────────────────────
const orbitMeshes = [];
const T0_now = (dateToJD(new Date()) - J2000_JD) / 36525;
PLANETS.forEach(p => {
	if (!p.orb) return;
	const elem = OE[p.orb], pts = [];
	const a = elem.a0 + elem.da * T0_now, e = elem.e0 + elem.de * T0_now;
	const I = (elem.I0 + elem.dI * T0_now) * Math.PI / 180;
	const Om = (elem.Om0 + elem.dOm * T0_now) * Math.PI / 180;
	const lp = (elem.lp0 + elem.dlp * T0_now) * Math.PI / 180;
	const w = lp - Om;
	for (let i = 0; i <= 200; i++) {
		const nu = i / 200 * Math.PI * 2, r = a * (1 - e * e) / (1 + e * Math.cos(nu));
		const cO = Math.cos(Om), sO = Math.sin(Om), cw = Math.cos(w), sw = Math.sin(w), cI = Math.cos(I), sI = Math.sin(I), cv = Math.cos(nu), sv = Math.sin(nu);
		const ax = r * (cO * (cw * cv - sw * sv) - sO * (sw * cv + cw * sv) * cI);
		const ay = r * (sO * (cw * cv - sw * sv) + cO * (sw * cv + cw * sv) * cI);
		const az = r * (sI * (sw * cv + cw * sv));
		const ang = Math.atan2(ay, ax), sc = auToScene(r);
		pts.push(new THREE.Vector3(Math.cos(ang) * sc, az * 14, Math.sin(ang) * sc));
	}
	const orbColor = p.dot || '#6a5a30';
	const orbClr = new THREE.Color(orbColor);
	// Store curve + base orbit size for zoom-reactive scaling in animate loop
	const orbCurve = new THREE.CatmullRomCurve3(pts, true);
	const orbBaseSize = auToScene(a); // base reference for tube radius
	const orbTube = new THREE.TubeGeometry(orbCurve, 200, orbBaseSize * 0.0022, 4, true);
	const orbMat = new THREE.MeshBasicMaterial({ color: orbClr, transparent: true, opacity: .55 });
	const orbMesh = new THREE.Mesh(orbTube, orbMat);
	orbMesh.userData._orbitType = 'tube';
	orbMesh.userData._isOrbit = true;
	orbMesh.userData._orbCurve = orbCurve;
	orbMesh.userData._orbBaseSize = orbBaseSize;
	scene.add(orbMesh);
	orbitMeshes.push(orbMesh);
});

// Asteroid belt
(function () {
	const n = 2000, pos = new Float32Array(n * 3);
	for (let i = 0; i < n; i++) {
		const r = auToScene(2.2 + Math.random() * .9), a = Math.random() * Math.PI * 2;
		pos[i * 3] = Math.cos(a) * r; pos[i * 3 + 1] = (Math.random() - .5) * 1.5; pos[i * 3 + 2] = Math.sin(a) * r;
	}
	const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
	scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0x585040, size: .26, sizeAttenuation: true })));
})();

// ═══════════════════════════════════════════════════════════
//  TIME ENGINE
// ═══════════════════════════════════════════════════════════
let simJD = dateToJD(new Date());
let timeRate = 1, paused = false, timeDir = 1, lastRealMs = performance.now();
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function updateDateDisplay() {
	const d = jdToDate(simJD);
	const yr = d.getFullYear(), mon = MONTHS[d.getMonth()], day = String(d.getDate()).padStart(2, '0');
	const h = String(d.getHours()).padStart(2, '0'), min = String(d.getMinutes()).padStart(2, '0'), sec = String(d.getSeconds()).padStart(2, '0');
	let tzAbbr = '';
	try { tzAbbr = d.toLocaleTimeString('en-US', { timeZoneName: 'short' }).split(' ').pop() || ''; } catch (e) { }
	document.getElementById('dt-date').textContent = `${day} ${mon} ${yr}`;
	document.getElementById('dt-time').textContent = `${h}:${min}:${sec}`;
	document.getElementById('dt-tz').textContent = tzAbbr;
}

// ═══════════════════════════════════════════════════════════
//  ORBITAL POSITION UPDATE
// ═══════════════════════════════════════════════════════════
const planetWorldPos = {};
function updateAllPositions(dtSimSec) {
	const T = (simJD - J2000_JD) / 36525;
	PLANETS.forEach(p => {
		if (!p.orb) { meshes[p.id].position.set(0, 0, 0); planetWorldPos[p.id] = new THREE.Vector3(0, 0, 0); return; }
		const { x, y, z, r } = keplerPos(OE[p.orb], T);
		const ang = Math.atan2(y, x), sc = auToScene(r);
		const wx = Math.cos(ang) * sc, wy = z * 14, wz = Math.sin(ang) * sc;
		meshes[p.id].position.set(wx, wy, wz);
		planetWorldPos[p.id] = new THREE.Vector3(wx, wy, wz);
		meshes[p.id].rotation.y += (2 * Math.PI / (p.rotDays * 86400)) * dtSimSec;
	});
	meshes['sun'].rotation.y += 0.00025 * Math.sign((timeRate || 1) * timeDir);
	MOONS.forEach(m => {
		const parentPos = planetWorldPos[m.parent]; if (!parentPos) return;
		// Compute angle directly from simJD using real epoch data — no accumulation drift
		const angle = moonAngleAtJD(m, simJD);
		// Orbital plane: tilt applied on Y axis for inclination approximation
		const tiltRad = m.tilt * Math.PI / 180;
		const mx = parentPos.x + Math.cos(angle) * m.sceneOrb;
		const my = parentPos.y + Math.sin(tiltRad) * Math.sin(angle) * m.sceneOrb;
		const mz = parentPos.z + Math.sin(angle) * m.sceneOrb * Math.cos(tiltRad);
		moonMeshes[m.id].position.set(mx, my, mz);
		moonMeshes[m.id].rotation.y += 0.002 * Math.sign(dtSimSec);
	});
}

// ═══════════════════════════════════════════════════════════
//  CAMERA SYSTEM
// ═══════════════════════════════════════════════════════════
let camMode = 'overview', selectedId = null, selectedIsMoon = false;
let povMode = false, povId = null, povIsMoon = false;
let focusPoint = new THREE.Vector3(0, 0, 0);
let orbitTheta = 0.7, orbitPhi = Math.PI / 3.8, orbitRadius = 180;
let tOrbitTheta = orbitTheta, tOrbitPhi = orbitPhi, tOrbitRadius = orbitRadius;
let panOffset = new THREE.Vector3();
let povYaw = 0, povPitch = 0.05, povFOV = 60, tPovFOV = 60;
let leftDown = false, rightDown = false, hasDragged = false;
let prevMx = 0, prevMy = 0, mdX = 0, mdY = 0;
const keys = {};
addEventListener('keydown', e => { keys[e.code] = true; });
addEventListener('keyup', e => { keys[e.code] = false; });
let hoveredId = null;

function applyOverviewCam() {
	const sp = Math.sin(orbitPhi), cp = Math.cos(orbitPhi), st = Math.sin(orbitTheta), ct = Math.cos(orbitTheta);
	const fp = focusPoint.clone().add(panOffset);
	camera.position.set(fp.x + orbitRadius * sp * st, fp.y + orbitRadius * cp, fp.z + orbitRadius * sp * ct);
	camera.lookAt(fp); camera.fov = 60; camera.updateProjectionMatrix();
}
applyOverviewCam();

canvas.addEventListener('contextmenu', e => e.preventDefault());
canvas.addEventListener('mousedown', e => {
	if (e.button === 0) leftDown = true; if (e.button === 2) rightDown = true;
	hasDragged = false; prevMx = mdX = e.clientX; prevMy = mdY = e.clientY;
});
addEventListener('mouseup', e => {
	if (e.button === 0) leftDown = false; if (e.button === 2) rightDown = false;
	if (!hasDragged && e.button === 0 && camMode !== 'surface') {
		const m2 = new THREE.Vector2((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
		const rc = new THREE.Raycaster(); rc.setFromCamera(m2, camera);
		const hits = rc.intersectObjects([...PLANETS.map(p => meshes[p.id]), ...MOONS.map(m => moonMeshes[m.id])]);
		if (hits.length) { const ud = hits[0].object.userData; selectBody(ud.id, ud.isMoon || false, 'third-person'); }
	}
});
addEventListener('mousemove', e => {
	const dx = e.clientX - prevMx, dy = e.clientY - prevMy;
	if (Math.hypot(e.clientX - mdX, e.clientY - mdY) > 3) hasDragged = true;
	if (!leftDown && !rightDown && camMode !== 'surface') {
		const m2 = new THREE.Vector2((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
		const rc = new THREE.Raycaster(); rc.setFromCamera(m2, camera);
		const hits = rc.intersectObjects([...PLANETS.map(p => meshes[p.id]), ...MOONS.map(m => moonMeshes[m.id])]);
		const hit = hits.length ? hits[0].object.userData : null;
		const nh = hit ? hit.id : null;
		if (nh !== hoveredId) {
			hoveredId = nh;
			canvas.style.cursor = nh ? 'pointer' : 'default';
		}
	}
	if (camMode === 'surface' && leftDown) {
		povYaw += dx * 0.0028;
		povPitch = Math.max(-Math.PI * .48, Math.min(Math.PI * .48, povPitch + dy * 0.0028));
	} else if (leftDown) {
		tOrbitTheta -= dx * 0.005;
		tOrbitPhi = Math.max(0.04, Math.min(Math.PI - 0.04, tOrbitPhi - dy * 0.005));
	} else if (rightDown && camMode !== 'surface') {
		const right = new THREE.Vector3(), up = new THREE.Vector3(), forward = new THREE.Vector3();
		camera.getWorldDirection(forward);
		right.crossVectors(forward, camera.up).normalize();
		up.crossVectors(right, forward).normalize();
		const ps = orbitRadius * 0.0008;
		panOffset.addScaledVector(right, -dx * ps); panOffset.addScaledVector(up, dy * ps);
		tOrbitTheta = orbitTheta; tOrbitPhi = orbitPhi;
	}
	prevMx = e.clientX; prevMy = e.clientY;
});
canvas.addEventListener('wheel', e => {
	e.preventDefault();
	if (camMode === 'surface') { tPovFOV = Math.max(5, Math.min(120, tPovFOV + e.deltaY * 0.05)); }
	else { const bodyData = selectedId ? getBodyData(selectedId, selectedIsMoon) : null; const minR = bodyData ? bodyData.sceneR * 1.4 : 0.5; const f = 1 + e.deltaY * 0.0008; tOrbitRadius = Math.max(minR, Math.min(800, tOrbitRadius * f)); }
}, { passive: false });

function processKeys(dt) {
	if (camMode === 'surface') {
		const sp = 0.04;
		if (keys['KeyW'] || keys['ArrowUp']) povPitch = Math.min(Math.PI * .48, povPitch + sp * dt * 60);
		if (keys['KeyS'] || keys['ArrowDown']) povPitch = Math.max(-Math.PI * .48, povPitch - sp * dt * 60);
		if (keys['KeyA'] || keys['ArrowLeft']) povYaw -= sp * dt * 60;
		if (keys['KeyD'] || keys['ArrowRight']) povYaw += sp * dt * 60;
		return;
	}
	const ps = orbitRadius * 0.012 * dt * 60;
	const right = new THREE.Vector3(), fwd = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
	camera.getWorldDirection(fwd); fwd.y = 0; fwd.normalize();
	right.crossVectors(fwd, up).normalize();
	if (keys['KeyW'] || keys['ArrowUp']) panOffset.addScaledVector(fwd, ps);
	if (keys['KeyS'] || keys['ArrowDown']) panOffset.addScaledVector(fwd, -ps);
	if (keys['KeyA'] || keys['ArrowLeft']) panOffset.addScaledVector(right, -ps);
	if (keys['KeyD'] || keys['ArrowRight']) panOffset.addScaledVector(right, ps);
	if (keys['KeyQ'] || keys['KeyE']) { const d = keys['KeyE'] ? 1 : -1; panOffset.y += d * ps; }
	if (keys["Equal"] || keys["NumpadAdd"]) { const bd2 = selectedId ? getBodyData(selectedId, selectedIsMoon) : null; const minR2 = bd2 ? bd2.sceneR * 1.4 : 0.5; tOrbitRadius = Math.max(minR2, tOrbitRadius * 0.97); }
	if (keys['Minus'] || keys['NumpadSubtract']) tOrbitRadius = Math.min(800, tOrbitRadius * 1.03);
}

// Touch
let touch1 = { x: 0, y: 0 }, touch2 = { x: 0, y: 0 }, touchCount = 0, initPinchDist = 0, initOrbitR = 0;
canvas.addEventListener('touchstart', e => {
	e.preventDefault(); touchCount = e.touches.length; hasDragged = false;
	if (e.touches[0]) { touch1 = { x: e.touches[0].clientX, y: e.touches[0].clientY }; prevMx = mdX = touch1.x; prevMy = mdY = touch1.y; }
	if (e.touches[1]) { touch2 = { x: e.touches[1].clientX, y: e.touches[1].clientY }; initPinchDist = Math.hypot(touch1.x - touch2.x, touch1.y - touch2.y); initOrbitR = tOrbitRadius; }
	leftDown = true;
}, { passive: false });
addEventListener('touchend', e => {
	touchCount = e.touches.length;
	if (!hasDragged && touchCount === 0 && camMode !== 'surface') {
		const t = e.changedTouches[0];
		const m2 = new THREE.Vector2((t.clientX / innerWidth) * 2 - 1, -(t.clientY / innerHeight) * 2 + 1);
		const rc = new THREE.Raycaster(); rc.setFromCamera(m2, camera);
		const hits = rc.intersectObjects([...PLANETS.map(p => meshes[p.id]), ...MOONS.map(m => moonMeshes[m.id])]);
		if (hits.length) { const ud = hits[0].object.userData; selectBody(ud.id, ud.isMoon || false, 'third-person'); }
	}
	if (touchCount === 0) leftDown = false;
});
addEventListener('touchmove', e => {
	e.preventDefault();
	if (Math.hypot(e.touches[0].clientX - mdX, e.touches[0].clientY - mdY) > 6) hasDragged = true;
	if (e.touches.length === 2) {
		const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
		const _bd = selectedId ? getBodyData(selectedId, selectedIsMoon) : null; const _minR = _bd ? _bd.sceneR * 1.4 : 0.5; tOrbitRadius = Math.max(_minR, Math.min(800, initOrbitR * (initPinchDist / d)));
		prevMx = e.touches[0].clientX; prevMy = e.touches[0].clientY; return;
	}
	const t = e.touches[0]; const dx = t.clientX - prevMx, dy = t.clientY - prevMy;
	if (camMode === 'surface') { povYaw += dx * .0032; povPitch = Math.max(-Math.PI * .48, Math.min(Math.PI * .48, povPitch + dy * .0032)); }
	else { tOrbitTheta -= dx * .0055; tOrbitPhi = Math.max(.04, Math.min(Math.PI * .49, tOrbitPhi - dy * .0055)); }
	prevMx = t.clientX; prevMy = t.clientY;
}, { passive: false });

function lerp(a, b, t) { return a + (b - a) * t; }

// ═══════════════════════════════════════════════════════════
//  BODY SELECTION
// ═══════════════════════════════════════════════════════════
function getBodyData(id, isMoon) { return isMoon ? MOONS.find(m => m.id === id) : PLANETS.find(p => p.id === id); }
function getBodyMesh(id, isMoon) { return isMoon ? moonMeshes[id] : meshes[id]; }

function selectBody(id, isMoon = false, mode = 'third-person') {
	const data = getBodyData(id, isMoon); if (!data) return;
	selectedId = id; selectedIsMoon = isMoon; povId = id; povIsMoon = isMoon;
	if (mode === 'third-person') enterThirdPerson(id, isMoon); else enterSurface(id, isMoon);
}

function enterThirdPerson(id, isMoon) {
	const data = getBodyData(id, isMoon); if (!data) return;
	camMode = 'third-person'; povMode = false;
	const mesh = getBodyMesh(id, isMoon);
	if (mesh) focusPoint.copy(mesh.position);
	panOffset.set(0, 0, 0);
	const r = data.sceneR, startR = Math.max(r * 4, isMoon ? 0.3 : 1.5);
	orbitTheta = tOrbitTheta = 0.6; orbitPhi = tOrbitPhi = Math.PI / 5; orbitRadius = tOrbitRadius = startR;
	const name = data.name || id;
	document.getElementById('view-name').textContent = name.toUpperCase();
	document.getElementById('view-sub').textContent = 'Left-drag · Orbit  |  Right-drag · Pan  |  Scroll · Zoom';
	document.getElementById('esc').classList.add('show');
	document.getElementById('zoom-hint').classList.remove('show');
	document.getElementById('xhair').classList.remove('show');
	const povHint = document.getElementById('pov-hint');
	if (povHint) {
		povHint.innerHTML = 'Left-drag · Orbit<br>Right-drag · Pan<br>Scroll · Zoom<br>WASD · Fly';
		povHint.classList.add('show');
	}
	document.getElementById('povflash-name').textContent = name;
	const f = document.getElementById('povflash'); f.classList.add('show'); setTimeout(() => f.classList.remove('show'), 2200);
	document.querySelectorAll('.pb').forEach(b => b.classList.toggle('active', b.dataset.id === id));
	showViewModePanel(id, isMoon, 'third-person');
}

function enterSurface(id, isMoon) {
	const data = getBodyData(id, isMoon); if (!data) return;
	camMode = 'surface'; povMode = true; povYaw = 0; povPitch = 0.05; povFOV = 60; tPovFOV = 60;
	const name = data.name || id;
	document.getElementById('view-name').textContent = name.toUpperCase();
	document.getElementById('view-sub').textContent = 'Surface · Hold & Drag to look';
	document.getElementById('xhair').classList.add('show');
	document.getElementById('esc').classList.add('show');
	const povHint = document.getElementById('pov-hint');
	if (povHint) {
		povHint.innerHTML = 'Left-drag · Look around<br>WASD · Look direction<br>Scroll · Zoom FOV<br>ESC · Exit view';
		povHint.classList.add('show');
	}
	document.getElementById('zoom-hint').classList.add('show');
	document.getElementById('povflash-name').textContent = name;
	const f = document.getElementById('povflash'); f.classList.add('show'); setTimeout(() => f.classList.remove('show'), 2200);
	document.querySelectorAll('.pb').forEach(b => b.classList.toggle('active', b.dataset.id === id));
	showViewModePanel(id, isMoon, 'surface');
}

function exitToOverview() {
	camMode = 'overview'; povMode = false; povId = null; povIsMoon = false; selectedId = null; selectedIsMoon = false;
	focusPoint.set(0, 0, 0); panOffset.set(0, 0, 0);
	orbitRadius = tOrbitRadius = 180; orbitTheta = tOrbitTheta = 0.7; orbitPhi = tOrbitPhi = Math.PI / 3.8;
	document.getElementById('view-name').textContent = 'Overview';
	document.getElementById('view-sub').innerHTML = 'Left-drag · Rotate &nbsp;|&nbsp; Right-drag · Pan &nbsp;|&nbsp; Scroll · Zoom';
	document.getElementById('xhair').classList.remove('show');
	document.getElementById('esc').classList.remove('show');
	const povHint = document.getElementById('pov-hint');
	if (povHint) {
		povHint.innerHTML = 'Left-drag · Rotate<br>Right-drag · Pan<br>Scroll · Zoom<br>WASD · Fly';
		povHint.classList.add('show');
	}
	document.getElementById('zoom-hint').classList.remove('show');
	document.querySelectorAll('.pb').forEach(b => b.classList.remove('active'));
	document.getElementById('viewmode-panel').classList.remove('hover', 'pinned');
	canvas.style.cursor = 'default'; hoveredId = null;
	document.getElementById('infopanel').classList.remove('vis', 'hover', 'pinned');
}
addEventListener('keydown', e => { if (e.key === 'Escape' && camMode !== 'overview') exitToOverview(); });

function showViewModePanel(id, isMoon, activeMode) {
	const data = getBodyData(id, isMoon);
	document.getElementById('vmp-body-name').textContent = (data.name || id).toUpperCase();
	document.getElementById('vmp-tp').classList.toggle('active', activeMode === 'third-person');
	document.getElementById('vmp-surface').classList.toggle('active', activeMode === 'surface');
	document.getElementById('vmp-overview').classList.toggle('active', activeMode === 'overview');
}
document.getElementById('vmp-tp').addEventListener('click', () => { if (selectedId) enterThirdPerson(selectedId, selectedIsMoon); });
document.getElementById('vmp-surface').addEventListener('click', () => { if (selectedId) enterSurface(selectedId, selectedIsMoon); });
document.getElementById('vmp-overview').addEventListener('click', () => { exitToOverview(); });
document.getElementById('vmp-x').addEventListener('click', () => {
	document.getElementById('viewmode-panel').classList.remove('hover', 'pinned');
});

// ═══════════════════════════════════════════════════════════
//  INFO PANEL
// ═══════════════════════════════════════════════════════════
function fillInfo(id, isMoon = false) {
	let name, type, dist, diam, period, moons, tilt;
	if (isMoon) {
		const m = MOONS.find(x => x.id === id);
		name = m.name; type = 'Moon'; dist = `${(m.orbR_km / 1000).toFixed(0)}k km`;
		diam = `${(m.realR * 2).toLocaleString()} km`; period = `${Math.abs(m.period).toFixed(2)} days${m.period < 0 ? ' (R)' : ''}`;
		moons = '—'; tilt = m.tilt + '°';
	} else {
		const p = PLANETS.find(x => x.id === id);
		name = p.name; type = p.type; dist = p.dist; diam = p.diam; period = p.period; moons = p.moons; tilt = p.tilt + '°';
	}
	document.getElementById('ip-name').textContent = name;
	document.getElementById('ip-type').textContent = type;
	document.getElementById('ip-dist').textContent = dist;
	document.getElementById('ip-diam').textContent = diam;
	document.getElementById('ip-orb').textContent = period;
	document.getElementById('ip-moons').textContent = moons;
	document.getElementById('ip-tilt').textContent = tilt;
}
document.getElementById('ip-x').addEventListener('click', () => {
	document.getElementById('infopanel').classList.remove('hover', 'pinned');
});

// ═══════════════════════════════════════════════════════════
//  PLANET NAV
// ═══════════════════════════════════════════════════════════
const pnav = document.getElementById('pnav');
PLANETS.forEach(p => {
	const btn = document.createElement('button'); btn.className = 'pb'; btn.dataset.id = p.id;
	btn.style.setProperty('--dc', p.dot);
	btn.innerHTML = `<div class="pd" style="background:${p.dot}"></div><span class="pl">${p.name}</span>`;
	btn.addEventListener('click', () => selectBody(p.id, false, 'third-person'));
	pnav.appendChild(btn);
});
const moonsByParent = {};
MOONS.forEach(m => { (moonsByParent[m.parent] || (moonsByParent[m.parent] = [])).push(m); });
Object.entries(moonsByParent).forEach(([parentId, moons]) => {
	const sep = document.createElement('div');
	sep.style.cssText = 'width:18px;height:1px;background:rgba(201,168,76,.12);margin:3px 0;flex-shrink:0;align-self:center;';
	pnav.appendChild(sep);
	moons.forEach(m => {
		const btn = document.createElement('button'); btn.className = 'pb'; btn.dataset.id = m.id;
		btn.style.setProperty('--dc', m.color);
		btn.innerHTML = `<div class="pd" style="background:${m.color};width:6px;height:6px;"></div><span class="pl" style="font-size:.36rem">${m.name}</span>`;
		btn.addEventListener('click', () => selectBody(m.id, true, 'third-person'));
		pnav.appendChild(btn);
	});
});

// ═══════════════════════════════════════════════════════════
//  TIME RATE UI
// ═══════════════════════════════════════════════════════════
//  TIME RATE SLIDER (NASA EYES STYLE)
// ═══════════════════════════════════════════════════════════
const ratePresets = [1, 3600, 86400, 2629800, 31557600, 315576000];
const rateLabels = ['Real', '1h/s', '1d/s', '1mo/s', '1yr/s', '10yr/s'];
const rateSlider = document.getElementById('rate-slider');
const rateSliderLabel = document.getElementById('rate-slider-label-display');
const rateSliderFill = document.getElementById('rate-slider-fill');
const rateSliderThumb = document.getElementById('rate-slider-thumb');

function formatTimeRate(rate) {
	if (rate === 1) return 'Real Time';
	if (rate >= 315576000) return '10 Years/Second';
	if (rate >= 31557600) return `${(rate / 31557600).toFixed(0)} Year/Second`;
	if (rate >= 2629800) return `${(rate / 2629800).toFixed(0)} Month/Second`;
	if (rate >= 86400) return `${(rate / 86400).toFixed(0)} Day/Second`;
	if (rate >= 3600) return `${(rate / 3600).toFixed(0)} Hour/Second`;
	return `${rate.toFixed(0)}x`;
}

function updateRateSliderVisuals(index) {
	// Update label
	rateSliderLabel.textContent = formatTimeRate(ratePresets[index]);
	
	// Update fill width
	const fillPercent = (index / 5) * 100;
	rateSliderFill.style.width = `${fillPercent}%`;
	
	// Update thumb position (estimated)
	const thumbPercent = (index / 5) * 100;
	rateSliderThumb.style.left = `${thumbPercent}%`;
	
	// Update tick marks
	document.querySelectorAll('.rate-tick').forEach((tick, i) => {
		tick.classList.toggle('active', i === index);
	});
}

// Handle slider input
rateSlider.addEventListener('input', () => {
	const index = Math.round(parseFloat(rateSlider.value));
	timeRate = ratePresets[index];
	paused = false;
	document.getElementById('rb-pause').textContent = '⏸';
	updateRateSliderVisuals(index);
});

// Handle tick mark clicks
document.querySelectorAll('.rate-tick').forEach((tick, index) => {
	tick.addEventListener('click', () => {
		rateSlider.value = index;
		timeRate = ratePresets[index];
		paused = false;
		document.getElementById('rb-pause').textContent = '⏸';
		updateRateSliderVisuals(index);
	});
});

// Pause/Play button
document.getElementById('rb-pause').addEventListener('click', () => {
	paused = !paused;
	document.getElementById('rb-pause').textContent = paused ? '▶' : '⏸';
	if (!paused) lastRealMs = performance.now();
});

// Direction button (forward/reverse)
document.getElementById('rb-dir').addEventListener('click', function () {
	timeDir *= -1;
	this.classList.toggle('rev', timeDir < 0);
	this.title = timeDir < 0 ? 'Reverse: ON' : 'Forward';
});

updateRateSliderVisuals(0);

// ═══════════════════════════════════════════════════════════
//  CALENDAR
// ═══════════════════════════════════════════════════════════
function openCal() {
	const d = jdToDate(simJD);
	const yr = d.getFullYear(), mo = String(d.getMonth() + 1).padStart(2, '0'), dy = String(d.getDate()).padStart(2, '0');
	const hh = String(d.getHours()).padStart(2, '0'), mm = String(d.getMinutes()).padStart(2, '0');
	document.getElementById('cal-date').value = `${yr}-${mo}-${dy}`;
	document.getElementById('cal-time').value = `${hh}:${mm}`;
	document.getElementById('cal-modal').classList.add('vis');
}
function closeCal() { document.getElementById('cal-modal').classList.remove('vis'); }
document.getElementById('dt-open-cal').addEventListener('click', openCal);
document.getElementById('cal-cancel').addEventListener('click', closeCal);
document.getElementById('cal-modal').addEventListener('click', e => { if (e.target === document.getElementById('cal-modal')) closeCal(); });
document.getElementById('cal-now').addEventListener('click', () => { simJD = dateToJD(new Date()); closeCal(); lastRealMs = performance.now(); });
document.getElementById('cal-go').addEventListener('click', () => {
	const dv = document.getElementById('cal-date').value;
	const tv = document.getElementById('cal-time').value || '12:00';
	if (!dv) { closeCal(); return; }
	const [yr, mo, dy] = dv.split('-').map(Number); const [hh, mm] = (tv).split(':').map(Number);
	simJD = dateToJD(new Date(yr, mo - 1, dy, hh, mm, 0, 0)); closeCal(); lastRealMs = performance.now();
});

addEventListener('resize', () => {
	camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight);
});

// ═══════════════════════════════════════════════════════════
//  LABELS
// ═══════════════════════════════════════════════════════════
const labelSVG = document.getElementById('labels-svg');
const labelEls = {};
function makeLabelEl(id, name, color, isMoon) {
	const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	g.setAttribute('class', 'pl-label');
	const circ = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
	circ.setAttribute('r', isMoon ? '3' : '5'); circ.setAttribute('fill', 'none');
	circ.setAttribute('stroke', color); circ.setAttribute('stroke-width', '1.2'); circ.setAttribute('opacity', '.8');
	g.appendChild(circ);
	const tickLen = isMoon ? 6 : 10;
	[[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => {
		const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
		l.setAttribute('x1', sx * (isMoon ? 3 : 5) + sx * 2); l.setAttribute('y1', sy * (isMoon ? 3 : 5) + sy * 2);
		l.setAttribute('x2', sx * (isMoon ? 3 : 5) + sx * tickLen); l.setAttribute('y2', sy * (isMoon ? 3 : 5) + sy * tickLen);
		l.setAttribute('stroke', color); l.setAttribute('stroke-width', '1'); g.appendChild(l);
	});
	const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
	line.setAttribute('x1', '0'); line.setAttribute('y1', isMoon ? '-4' : '-6');
	line.setAttribute('x2', '16'); line.setAttribute('y2', isMoon ? '-14' : '-20');
	line.setAttribute('stroke', color); line.setAttribute('stroke-width', '.7'); line.setAttribute('opacity', '.5');
	g.appendChild(line);
	const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
	txt.setAttribute('x', '18'); txt.setAttribute('y', isMoon ? '-10' : '-14');
	txt.setAttribute('class', 'lname lname-hit'); txt.setAttribute('fill', color);
	txt.setAttribute('font-size', isMoon ? '8' : '10'); txt.setAttribute('pointer-events', 'all');
	txt.style.cursor = 'pointer'; txt.style.userSelect = 'none'; txt.textContent = name.toUpperCase();
	txt.addEventListener('mouseenter', () => {
		fillInfo(id, isMoon);
		const panel = document.getElementById('infopanel');
		if (!panel.classList.contains('pinned')) panel.classList.add('hover');
		
		// Show view mode panel on hover
		const vmpanel = document.getElementById('viewmode-panel');
		if (!vmpanel.classList.contains('pinned')) {
			const currentMode = camMode === 'overview' ? 'overview' : (camMode === 'surface' ? 'surface' : 'third-person');
			showViewModePanel(id, isMoon, selectedId === id ? currentMode : 'third-person');
			vmpanel.classList.add('hover');
		}
	});
	txt.addEventListener('mouseleave', () => {
		const panel = document.getElementById('infopanel');
		if (!panel.classList.contains('pinned')) panel.classList.remove('hover');
		
		// Hide view mode panel on leave
		const vmpanel = document.getElementById('viewmode-panel');
		if (!vmpanel.classList.contains('pinned')) vmpanel.classList.remove('hover');
	});
	txt.addEventListener('click', e => {
		e.stopPropagation();
		const panel = document.getElementById('infopanel');
		const alreadyPinned = panel.classList.contains('pinned') &&
			document.getElementById('ip-name').textContent.toLowerCase() === name.toLowerCase();
		if (alreadyPinned) { panel.classList.remove('pinned', 'hover'); }
		else { fillInfo(id, isMoon); panel.classList.remove('hover'); panel.classList.add('pinned'); }
		
		// Handle view mode panel click
		const vmpanel = document.getElementById('viewmode-panel');
		const alreadyVmPinned = vmpanel.classList.contains('pinned') &&
			document.getElementById('vmp-body-name').textContent.toLowerCase() === name.toLowerCase();
		if (alreadyVmPinned) { 
			vmpanel.classList.remove('pinned', 'hover'); 
		} else { 
			const currentMode = camMode === 'overview' ? 'overview' : (camMode === 'surface' ? 'surface' : 'third-person');
			showViewModePanel(id, isMoon, selectedId === id ? currentMode : 'third-person');
			vmpanel.classList.remove('hover'); 
			vmpanel.classList.add('pinned'); 
		}
	});
	g.appendChild(txt);
	const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
	dot.setAttribute('r', '1.2'); dot.setAttribute('fill', color); dot.setAttribute('opacity', '.9');
	g.appendChild(dot);
	return g;
}
[...PLANETS, ...MOONS].forEach(body => {
	const isMoon = !!body.parent;
	const color = body.dot || body.color || '#ffffff';
	const el = makeLabelEl(body.id, body.name, color, isMoon);
	labelSVG.appendChild(el); labelEls[body.id] = el;
});

const _tmpV = new THREE.Vector3();
function updateLabels() {
	const W = innerWidth, H = innerHeight;
	[...PLANETS, ...MOONS].forEach(body => {
		const isMoon = !!body.parent;
		const mesh = isMoon ? moonMeshes[body.id] : meshes[body.id];
		const el = labelEls[body.id]; if (!mesh || !el) return;
		if (camMode === 'surface' && selectedId === body.id) { el.style.display = 'none'; return; }
		el.style.display = '';
		_tmpV.copy(mesh.position); _tmpV.project(camera);
		const sx = ((_tmpV.x + 1) / 2) * W, sy = ((-_tmpV.y + 1) / 2) * H;
		if (_tmpV.z > 1 || sx < -50 || sx > W + 50 || sy < -50 || sy > H + 50) { el.style.display = 'none'; return; }
		const isHovered = hoveredId === body.id, isSelected = selectedId === body.id;
		let alpha;
		if (isHovered) alpha = 1.0;
		else if (isSelected && camMode === 'third-person') alpha = 0.3;
		else if (isMoon) alpha = camMode === 'overview' ? 0.3 : 0.5;
		else alpha = camMode === 'third-person' ? 0.5 : 0.85;
		el.style.opacity = alpha;
		const scale = isHovered ? 1.25 : 1.0;
		el.setAttribute('transform', `translate(${sx},${sy}) scale(${scale})`);
	});
}

// ═══════════════════════════════════════════════════════════
//  MAIN LOOP
// ═══════════════════════════════════════════════════════════
function animate() {
	requestAnimationFrame(animate);
	const nowMs = performance.now();
	const dtReal = Math.min((nowMs - lastRealMs) / 1000, 0.1); lastRealMs = nowMs;
	if (!paused) { const dtSim = timeRate * timeDir * dtReal; simJD += dtSim / 86400; updateAllPositions(dtSim); }
	else { updateAllPositions(0); }
	updateDateDisplay(); processKeys(dtReal);

	if (camMode === 'surface' && selectedId) {
		const data = getBodyData(selectedId, selectedIsMoon);
		const mesh = getBodyMesh(selectedId, selectedIsMoon);
		if (mesh && data) {
			const pole = mesh.position.clone().add(new THREE.Vector3(0, data.sceneR * 1.001, 0));
			camera.position.copy(pole);
			camera.near = data.sceneR * 0.001; camera.far = 20000; camera.updateProjectionMatrix();
			const cosP = Math.cos(povPitch), sinP = Math.sin(povPitch);
			const cosY = Math.cos(povYaw), sinY = Math.sin(povYaw);
			const dir = new THREE.Vector3(sinY * cosP, sinP, cosY * cosP).normalize();
			camera.lookAt(pole.clone().add(dir.multiplyScalar(1000)));
			camera.up.set(0, 1, 0);
			povFOV = lerp(povFOV, tPovFOV, 0.1); camera.fov = povFOV; camera.updateProjectionMatrix();
		}
	} else if (camMode === 'third-person' && selectedId) {
		const mesh = getBodyMesh(selectedId, selectedIsMoon);
		if (mesh) focusPoint.copy(mesh.position);
		const data = getBodyData(selectedId, selectedIsMoon);
		orbitTheta = lerp(orbitTheta, tOrbitTheta, .09);
		orbitPhi = lerp(orbitPhi, tOrbitPhi, .09);
		orbitRadius = lerp(orbitRadius, tOrbitRadius, .09);
		const fp = focusPoint.clone().add(panOffset);
		const sp = Math.sin(orbitPhi), cp = Math.cos(orbitPhi), st = Math.sin(orbitTheta), ct = Math.cos(orbitTheta);
		camera.position.set(fp.x + orbitRadius * sp * st, fp.y + orbitRadius * cp, fp.z + orbitRadius * sp * ct);
		camera.lookAt(fp);
		camera.near = data ? data.sceneR * 0.005 : 0.01; camera.far = 20000; camera.fov = 60; camera.updateProjectionMatrix();
	} else {
		orbitTheta = lerp(orbitTheta, tOrbitTheta, .08);
		orbitPhi = lerp(orbitPhi, tOrbitPhi, .08);
		orbitRadius = lerp(orbitRadius, tOrbitRadius, .08);
		camera.near = 0.05; camera.far = 20000; applyOverviewCam();
	}
	// Update orbit tube thickness — per-planet zoom-aware for third-person and surface modes
	{
		// In planet view modes, measure how close camera is relative to the selected planet's size
		// so each planet gets a thinning factor proportional to how "zoomed in" we are on it
		let planetProximityScale = 1.0;
		if ((camMode === 'third-person' || camMode === 'surface') && selectedId) {
			const selData = getBodyData(selectedId, selectedIsMoon);
			const selMesh = getBodyMesh(selectedId, selectedIsMoon);
			if (selData && selMesh) {
				// Distance from camera to the selected body's centre
				const distToBody = camera.position.distanceTo(selMesh.position);
				// Normalise by planet radius: at 2× radius = very close, at 500× = far out
				const radii = distToBody / selData.sceneR;
				// Map: radii<=2 → scale 0.003 (razor thin), radii>=400 → scale 1.0 (normal)
				planetProximityScale = Math.max(0.003, Math.min(1.0, (radii - 2) / 398));
			}
		}
		// Overview mode: original distance-from-sun zoom factor
		const camDist = camera.position.length();
		const overviewZoom = Math.max(0.15, Math.min(1.0, camDist / 180));
		const zoomFactor = (camMode === 'overview') ? overviewZoom : planetProximityScale;
		orbitMeshes.forEach(om => {
			if (om.userData._orbitType !== 'tube') return;
			const bs = om.userData._orbBaseSize;
			const widthFactor = 0.0022 * (0.8 + 0.4 * zoomFactor);
			const newR = bs * widthFactor * zoomFactor;
			if (Math.abs((om.userData._lastR || 0) - newR) / newR > 0.05) {
				om.userData._lastR = newR;
				const ng = new THREE.TubeGeometry(om.userData._orbCurve, 200, newR, 4, true);
				om.geometry.dispose(); om.geometry = ng;
			}
		});
	}
	updateLabels(); renderer.render(scene, camera);
}

setTimeout(() => {
	const l = document.getElementById('loading'); l.classList.add('fade'); setTimeout(() => l.remove(), 900);
}, 2200);
lastRealMs = performance.now();
exitToOverview();
animate();