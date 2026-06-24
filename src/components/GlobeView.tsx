// components/GlobeView.tsx
import { useEffect, useRef, useState } from "react";
import { geoContains, geoBounds } from "d3-geo";
import dots from "../globeDots.json";
import countries from "../countries.json";
import shapes from "../countryShapes.json";

type Dot = { x: number; y: number; z: number; c: string };
type Country = { name: string; iso: string; dial: string; lat: number; lon: number; flag: string };
const COUNTRIES = countries as Country[];
const SHAPES = shapes as Record<string, any>;

const CONTINENTS: Record<string, [number, number] | null> = {
    GLOBE: null, NA: [40, -100], SA: [-15, -60], EU: [50, 15], AF: [5, 20], AS: [35, 90], OC: [-25, 133],
};

type Mode = "spin" | "static" | "map";
const ZOOM_CONTINENT = 1.7;
const EXIT_MS = 320;
const toRad = (d: number) => (d * Math.PI) / 180;

const GLOW_COLORS: { name: string; rgb: [number, number, number] }[] = [
    { name: "White", rgb: [235, 240, 255] },
    { name: "Blue", rgb: [120, 195, 255] },
    { name: "Cyan", rgb: [120, 255, 235] },
    { name: "Green", rgb: [130, 255, 150] },
    { name: "Purple", rgb: [190, 150, 255] },
    { name: "Pink", rgb: [255, 150, 210] },
    { name: "Amber", rgb: [255, 200, 110] },
    { name: "Red", rgb: [255, 130, 130] },
];

// speed presets the user can pick in settings
const SPEEDS: Record<string, { ease: number; blackout: number; grow: number }> = {
    Calm: { ease: 0.06, blackout: 0.55, grow: 1.0 },
    Smooth: { ease: 0.08, blackout: 0.45, grow: 0.8 },
    Fast: { ease: 0.1, blackout: 0.35, grow: 0.6 },
};

const WORLD_COVER: Record<string, number> = {};
for (const d of dots as Dot[]) if (d.c) WORLD_COVER[d.c] = (WORLD_COVER[d.c] || 0) + 1;

function countrySpan(iso: string): number {
    const geom = SHAPES[iso];
    if (!geom) return 30;
    const [[w, s], [e, n]] = geoBounds({ type: "Feature", geometry: geom, properties: {} } as any);
    return Math.min(Math.max(e - w, n - s), 90);
}

function zoomForSpan(span: number): number {
    const s = Math.max(3, Math.min(90, span));
    const t = (Math.log(s) - Math.log(3)) / (Math.log(90) - Math.log(3));
    return 7.0 - t * (7.0 - 2.0);
}

function genDetail(iso: string): { x: number; y: number; z: number }[] {
    const geom = SHAPES[iso];
    if (!geom) return [];
    const feat = { type: "Feature", geometry: geom, properties: {} } as any;
    const [[w, s], [e, n]] = geoBounds(feat);
    const spanLon = Math.max(e - w, 0.1), spanLat = Math.max(n - s, 0.1);
    const sp = Math.max(spanLon, spanLat);
    if (sp > 60) return [];
    const step = Math.max(0.02, sp / 70);
    const out: { x: number; y: number; z: number }[] = [];
    for (let lat = s; lat <= n; lat += step) {
        for (let lon = w; lon <= e; lon += step) {
            if (geoContains(feat, [lon, lat])) {
                const la = toRad(lat), lo = toRad(lon);
                out.push({ x: Math.cos(la) * Math.cos(lo), y: Math.sin(la), z: Math.cos(la) * Math.sin(lo) });
            }
        }
    }
    return out;
}

// ---- Props: marketplace-ready ----
export type GlobeViewProps = {
    onSubmit?: (value: { iso: string; dial: string; number: string; e164: string }) => void;
    defaultColor?: number;        // index into GLOW_COLORS
    defaultSpeed?: keyof typeof SPEEDS;
    defaultMode?: Mode;
    showSettings?: boolean;       // show the gear menu
    className?: string;
    style?: React.CSSProperties;
};

export default function GlobeView({
    onSubmit,
    defaultColor = 0,
    defaultSpeed = "Smooth",
    defaultMode = "spin",
    showSettings = true,
    className,
    style,
}: GlobeViewProps) {
    const wrapRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sizeRef = useRef(320); // live canvas size (responsive)

    const rot = useRef({ yaw: 0.6, pitch: 0.3 });
    const target = useRef({ yaw: 0.6, pitch: 0.3, active: false });
    const zoom = useRef(1);
    const zoomTarget = useRef(1);
    const glowIso = useRef<string | null>(null);
    const glowStart = useRef(0);
    const arrived = useRef(false);
    const detail = useRef<{ x: number; y: number; z: number }[]>([]);
    const glowColor = useRef<[number, number, number]>(GLOW_COLORS[defaultColor].rgb);
    const center = useRef({ x: 0, y: 0, z: 0 });
    const maxDist = useRef(0.3);
    const fadeIso = useRef<string | null>(null);
    const fadeStart = useRef(0);
    const fadeCenter = useRef({ x: 0, y: 0, z: 0 });
    const fadeMax = useRef(0.3);
    const speedRef = useRef(SPEEDS[defaultSpeed]);

    const [mode, setMode] = useState<Mode>(defaultMode);
    const [region, setRegion] = useState("GLOBE");
    const [country, setCountry] = useState<Country | null>(null);
    const [number, setNumber] = useState("");
    const [query, setQuery] = useState("");
    const [pickerOpen, setPickerOpen] = useState(false);
    const [colorIdx, setColorIdx] = useState(defaultColor);
    const [speedName, setSpeedName] = useState<keyof typeof SPEEDS>(defaultSpeed);
    const [settingsOpen, setSettingsOpen] = useState(false);

    const modeRef = useRef(mode);
    modeRef.current = mode;

    function aimAt(lat: number, lon: number, z: number) {
        target.current = { yaw: toRad(lon) - Math.PI / 2, pitch: toRad(lat), active: true };
        zoomTarget.current = z;
    }
    function computeCenter(iso: string, lat: number, lon: number) {
        const cv = {
            x: Math.cos(toRad(lat)) * Math.cos(toRad(lon)),
            y: Math.sin(toRad(lat)),
            z: Math.cos(toRad(lat)) * Math.sin(toRad(lon)),
        };
        let mx = 0.0001;
        const all = [...(dots as Dot[]).filter((d) => d.c === iso).map((d) => ({ x: d.x, y: d.y, z: d.z })), ...detail.current];
        for (const p of all) {
            const dx = p.x - cv.x, dy = p.y - cv.y, dz = p.z - cv.z;
            const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (d > mx) mx = d;
        }
        return { cv, mx };
    }
    function startFade() {
        if (glowIso.current) {
            fadeIso.current = glowIso.current; fadeStart.current = performance.now();
            fadeCenter.current = center.current; fadeMax.current = maxDist.current;
        }
    }
    function selectRegion(name: string) {
        setRegion(name); setCountry(null);
        startFade(); glowIso.current = null;
        detail.current = []; arrived.current = false;
        const c = CONTINENTS[name];
        if (c) aimAt(c[0], c[1], ZOOM_CONTINENT);
        else { target.current.active = false; zoomTarget.current = 1; }
    }
    function selectCountry(c: Country) {
        setCountry(c); setPickerOpen(false); setQuery("");
        const hadGlow = !!glowIso.current;
        startFade(); glowIso.current = null; arrived.current = false;
        const go = () => {
            aimAt(c.lat, c.lon, zoomForSpan(countrySpan(c.iso)));
            glowIso.current = c.iso;
            detail.current = (WORLD_COVER[c.iso] || 0) >= 12 ? [] : genDetail(c.iso);
            const { cv, mx } = computeCenter(c.iso, c.lat, c.lon);
            center.current = cv; maxDist.current = mx;
        };
        if (hadGlow) setTimeout(go, EXIT_MS); else go();
    }
    function pickColor(i: number) { setColorIdx(i); glowColor.current = GLOW_COLORS[i].rgb; }
    function pickSpeed(n: keyof typeof SPEEDS) { setSpeedName(n); speedRef.current = SPEEDS[n]; }

    function submit() {
        if (!country || number.length < 5) return;
        onSubmit?.({ iso: country.iso, dial: country.dial, number, e164: `${country.dial}${number}` });
    }

    // ---- responsive canvas + render loop ----
    useEffect(() => {
        const rawCanvas = canvasRef.current;
        const rawWrap = wrapRef.current;
        if (!rawCanvas || !rawWrap) return;
        const canvas = rawCanvas;
        const wrap = rawWrap;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const c2d = ctx;
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

        function resize() {
            const w = Math.max(160, Math.min(wrap.clientWidth, 560)); // clamp
            sizeRef.current = w;
            canvas.width = w * dpr; canvas.height = w * dpr;
            canvas.style.width = w + "px"; canvas.style.height = w + "px";
            c2d.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(wrap);

        let frame = 0;
        const wrapAngle = (d: number) => Math.atan2(Math.sin(d), Math.cos(d));

        function radial(p: { x: number; y: number; z: number }, cv: { x: number; y: number; z: number }, mx: number) {
            const dx = p.x - cv.x, dy = p.y - cv.y, dz = p.z - cv.z;
            return Math.min(1, Math.sqrt(dx * dx + dy * dy + dz * dz) / mx);
        }

        function draw() {
            const SIZE = sizeRef.current;
            const BASE_R = SIZE * 0.42, cx = SIZE / 2, cy = SIZE / 2;
            const { ease: EASE, blackout: BLACKOUT, grow: GROW } = speedRef.current;
            c2d.clearRect(0, 0, SIZE, SIZE);
            const m = modeRef.current;
            zoom.current += (zoomTarget.current - zoom.current) * EASE;
            const R = BASE_R * zoom.current;
            const now = performance.now();
            const [gr, gg, gb] = glowColor.current;
            const softPulse = 0.7 + 0.15 * Math.sin(now / 700);
            const ds = SIZE / 320; // dot-size scale relative to the original 320px design

            if (m === "map") {
                for (const p of dots as Dot[]) {
                    const lat = Math.asin(p.y), lon = Math.atan2(p.z, p.x);
                    const sx = cx - (lon / Math.PI) * R;
                    const sy = cy - (lat / (Math.PI / 2)) * R * 0.6;
                    c2d.beginPath(); c2d.fillStyle = `rgba(235,240,255,${0.85 * softPulse + 0.15})`;
                    c2d.arc(sx, sy, 0.6 * ds, 0, Math.PI * 2); c2d.fill();
                }
                frame = requestAnimationFrame(draw); return;
            }

            if (target.current.active) {
                rot.current.yaw += wrapAngle(target.current.yaw - rot.current.yaw) * EASE;
                rot.current.pitch += (target.current.pitch - rot.current.pitch) * EASE;
            }
            if (m === "spin" && !target.current.active) rot.current.yaw += 0.003;

            if (glowIso.current && !arrived.current) {
                const dY = Math.abs(wrapAngle(target.current.yaw - rot.current.yaw));
                const dP = Math.abs(target.current.pitch - rot.current.pitch);
                if (dY < 0.25 && dP < 0.25) { arrived.current = true; glowStart.current = now; }
            }
            if (fadeIso.current && (now - fadeStart.current) / 1000 > BLACKOUT + 0.3) fadeIso.current = null;

            const yaw = rot.current.yaw, pitch = rot.current.pitch;
            const cosY = Math.cos(yaw), sinY = Math.sin(yaw);
            const cosP = Math.cos(pitch), sinP = Math.sin(pitch);
            const gi = glowIso.current, fi = fadeIso.current;
            const cv = center.current, mx = maxDist.current;
            const fcv = fadeCenter.current, fmx = fadeMax.current;

            for (const p of dots as Dot[]) {
                const x1 = p.x * cosY + p.z * sinY;
                const z1 = -p.x * sinY + p.z * cosY;
                const y1 = p.y;
                const y2 = y1 * cosP - z1 * sinP;
                const z2 = y1 * sinP + z1 * cosP;
                if (z2 <= 0) continue;
                const sx = cx - x1 * R, sy = cy - y2 * R;

                const baseA = (0.55 + 0.45 * z2) * softPulse;
                c2d.beginPath();
                c2d.fillStyle = `rgba(225,232,250,${baseA})`;
                c2d.arc(sx, sy, 0.55 * ds, 0, Math.PI * 2); c2d.fill();
                c2d.beginPath();
                c2d.fillStyle = `rgba(200,215,255,${0.12 * baseA})`;
                c2d.arc(sx, sy, 1.6 * ds, 0, Math.PI * 2); c2d.fill();

                if (gi && p.c === gi && arrived.current) {
                    const t = (now - glowStart.current) / 1000;
                    const r = radial(p, cv, mx);
                    const darkFront = 1 - Math.min(1, t / BLACKOUT);
                    const dark = r >= darkFront ? Math.min(1, (t / BLACKOUT) * 1.5) : 0;
                    const t2 = t - (BLACKOUT + 0.15);
                    const growFront = Math.min(1, t2 / GROW);
                    let bright = 0;
                    if (t2 > 0 && r <= growFront) {
                        const settle = Math.max(0, Math.min(1, (t2 - GROW - 0.4) / 1.0));
                        const pulseNow = settle >= 1 ? (0.95 + 0.1 * Math.sin(now / 500)) : 1.3;
                        bright = Math.min(1, ((growFront - r) / 0.25 + 0.3)) * pulseNow;
                    }
                    if (bright > 0.001) {
                        c2d.beginPath();
                        c2d.fillStyle = `rgba(${gr},${gg},${gb},${0.4 * bright})`;
                        c2d.arc(sx, sy, 3.0 * ds, 0, Math.PI * 2); c2d.fill();
                        c2d.beginPath();
                        c2d.fillStyle = `rgba(${gr},${gg},${gb},${Math.min(1, 1.3 * bright)})`;
                        c2d.arc(sx, sy, 1.2 * ds, 0, Math.PI * 2); c2d.fill();
                    } else if (dark > 0.001) {
                        c2d.beginPath();
                        c2d.fillStyle = `rgba(8,8,10,${0.92 * dark})`;
                        c2d.arc(sx, sy, 0.9 * ds, 0, Math.PI * 2); c2d.fill();
                    }
                } else if (fi && p.c === fi) {
                    const t = (now - fadeStart.current) / 1000;
                    const r = radial(p, fcv, fmx);
                    const off = Math.min(1, t / BLACKOUT);
                    const lev = r >= (1 - off) ? 0 : 1;
                    if (lev > 0.001) {
                        c2d.beginPath();
                        c2d.fillStyle = `rgba(${gr},${gg},${gb},0.95)`;
                        c2d.arc(sx, sy, 1.1 * ds, 0, Math.PI * 2); c2d.fill();
                    }
                }
            }

            for (const p of detail.current) {
                const x1 = p.x * cosY + p.z * sinY;
                const z1 = -p.x * sinY + p.z * cosY;
                const y1 = p.y;
                const y2 = y1 * cosP - z1 * sinP;
                const z2 = y1 * sinP + z1 * cosP;
                if (z2 <= 0) continue;
                const sx = cx - x1 * R, sy = cy - y2 * R;
                if (!arrived.current) continue;
                const t = (now - glowStart.current) / 1000;
                const r = radial(p, cv, mx);
                const t2 = t - (BLACKOUT + 0.15);
                const growFront = Math.min(1, t2 / GROW);
                let bright = 0;
                if (t2 > 0 && r <= growFront) {
                    const settle = Math.max(0, Math.min(1, (t2 - GROW - 0.4) / 1.0));
                    const pulseNow = settle >= 1 ? (0.95 + 0.1 * Math.sin(now / 500)) : 1.3;
                    bright = Math.min(1, ((growFront - r) / 0.25 + 0.3)) * pulseNow;
                }
                if (bright > 0.001) {
                    c2d.beginPath();
                    c2d.fillStyle = `rgba(${gr},${gg},${gb},${0.35 * bright})`;
                    c2d.arc(sx, sy, 2.2 * ds, 0, Math.PI * 2); c2d.fill();
                    c2d.beginPath();
                    c2d.fillStyle = `rgba(${gr},${gg},${gb},${Math.min(1, 1.3 * bright)})`;
                    c2d.arc(sx, sy, 0.7 * ds, 0, Math.PI * 2); c2d.fill();
                }
            }

            frame = requestAnimationFrame(draw);
        }
        draw();
        return () => { cancelAnimationFrame(frame); ro.disconnect(); };
    }, []);

    const filtered = query
        ? COUNTRIES.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
        : COUNTRIES;

    const btn = (active: boolean): React.CSSProperties => ({
        padding: "6px 10px", borderRadius: 8, fontSize: 12, cursor: "pointer",
        border: "1px solid #333", background: active ? "#1e3a5f" : "transparent",
        color: active ? "#7db9ff" : "#aaa", whiteSpace: "nowrap",
    });

    return (
        <div className={className}
            style={{
                background: "#08080a", padding: 20, borderRadius: 16, width: "100%", maxWidth: 560,
                color: "#fff", fontFamily: "system-ui", position: "relative", boxSizing: "border-box", ...style
            }}>

            {/* header + gear */}
            <div style={{ position: "relative", marginBottom: 14 }}>
                <h2 style={{ textAlign: "center", margin: "0 0 4px", fontSize: 20 }}>Enter your phone</h2>
                <p style={{ textAlign: "center", margin: 0, fontSize: 13, color: "#888" }}>Select your country and number</p>
                {showSettings && (
                    <button onClick={() => setSettingsOpen((o) => !o)} title="Settings"
                        style={{
                            position: "absolute", top: -2, right: 0, width: 30, height: 30, borderRadius: 8,
                            border: "1px solid #2a2a2a", background: "#141414", color: "#aaa", cursor: "pointer", fontSize: 15
                        }}>
                        ⚙
                    </button>
                )}
            </div>

            {/* settings menu */}
            {showSettings && settingsOpen && (
                <div style={{ background: "#121212", border: "1px solid #2a2a2a", borderRadius: 12, padding: 14, marginBottom: 14 }}>
                    <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>Speed</div>
                    <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                        {(Object.keys(SPEEDS) as (keyof typeof SPEEDS)[]).map((n) => (
                            <button key={n} onClick={() => pickSpeed(n)} style={btn(speedName === n)}>{n}</button>
                        ))}
                    </div>
                    <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>Mode</div>
                    <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                        {([["spin", "3D Spin"], ["static", "3D Static"], ["map", "2D Map"]] as [Mode, string][]).map(([key, label]) => (
                            <button key={key} onClick={() => setMode(key)} style={btn(mode === key)}>{label}</button>
                        ))}
                    </div>
                    <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>Glow color</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {GLOW_COLORS.map((col, i) => (
                            <button key={col.name} onClick={() => pickColor(i)} title={col.name}
                                style={{
                                    width: 22, height: 22, borderRadius: "50%", cursor: "pointer",
                                    background: `rgb(${col.rgb[0]},${col.rgb[1]},${col.rgb[2]})`,
                                    border: colorIdx === i ? "2px solid #fff" : "2px solid #333"
                                }} />
                        ))}
                    </div>
                </div>
            )}

            {/* responsive globe */}
            <div ref={wrapRef} style={{ width: "100%", aspectRatio: "1 / 1", overflow: "hidden", margin: "0 auto", maxWidth: 420 }}>
                <canvas ref={canvasRef} style={{ display: "block", margin: "0 auto" }} />
            </div>

            {/* continent quick-jumps */}
            <div style={{ display: "flex", gap: 8, marginTop: 14, justifyContent: "center", flexWrap: "wrap" }}>
                {Object.keys(CONTINENTS).map((name) => (
                    <button key={name} onClick={() => selectRegion(name)} style={btn(region === name)}>{name}</button>
                ))}
            </div>

            {/* code picker + number */}
            <div style={{ display: "flex", gap: 8, marginTop: 14, position: "relative" }}>
                <button onClick={() => setPickerOpen((o) => !o)}
                    style={{
                        display: "flex", alignItems: "center", gap: 6, padding: "10px 12px", borderRadius: 10,
                        border: "1px solid #2a2a2a", background: "#141414", fontSize: 14, color: "#fff",
                        cursor: "pointer", minWidth: 86, justifyContent: "center"
                    }}>
                    {country ? <>{country.flag} {country.dial}</> : <span style={{ color: "#888" }}>🌐 +—</span>}
                    <span style={{ color: "#666", fontSize: 10 }}>▼</span>
                </button>

                <input value={number} onChange={(e) => setNumber(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="Phone number"
                    style={{
                        flex: 1, minWidth: 0, padding: "10px 12px", borderRadius: 10, fontSize: 14,
                        border: "1px solid #2a2a2a", background: "#141414", color: "#fff", outline: "none"
                    }} />

                {pickerOpen && (
                    <div style={{
                        position: "absolute", top: "100%", left: 0, width: 260, marginTop: 6,
                        background: "#121212", border: "1px solid #2a2a2a", borderRadius: 10, zIndex: 20, overflow: "hidden"
                    }}>
                        <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search country..."
                            style={{
                                width: "100%", boxSizing: "border-box", padding: "9px 12px", fontSize: 13,
                                border: "none", borderBottom: "1px solid #2a2a2a", background: "#181818", color: "#fff", outline: "none"
                            }} />
                        <div style={{ maxHeight: 220, overflowY: "auto" }}>
                            {filtered.map((c) => (
                                <div key={c.iso} onClick={() => selectCountry(c)}
                                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", cursor: "pointer", fontSize: 14 }}>
                                    <span>{c.flag}</span><span style={{ flex: 1 }}>{c.name}</span>
                                    <span style={{ color: "#888" }}>{c.dial}</span>
                                </div>
                            ))}
                            {filtered.length === 0 && <div style={{ padding: 12, color: "#666", fontSize: 13 }}>No match</div>}
                        </div>
                    </div>
                )}
            </div>

            <button disabled={!country || number.length < 5} onClick={submit}
                style={{
                    width: "100%", marginTop: 14, padding: 12, borderRadius: 12, fontSize: 15,
                    cursor: country && number.length >= 5 ? "pointer" : "not-allowed", border: "none",
                    background: country && number.length >= 5 ? "#fff" : "#222",
                    color: country && number.length >= 5 ? "#000" : "#666", fontWeight: 600
                }}>
                Continue
            </button>
        </div>
    );
}