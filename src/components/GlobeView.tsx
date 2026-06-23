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
const EASE = 0.06;
const ZOOM_CONTINENT = 1.7;
const toRad = (d: number) => (d * Math.PI) / 180;

// how many world-dots already cover each country
const WORLD_COVER: Record<string, number> = {};
for (const d of dots as Dot[]) if (d.c) WORLD_COVER[d.c] = (WORLD_COVER[d.c] || 0) + 1;

// size of a country in degrees (bigger dimension of its bounding box), capped
function countrySpan(iso: string): number {
    const geom = SHAPES[iso];
    if (!geom) return 30;
    const [[w, s], [e, n]] = geoBounds({ type: "Feature", geometry: geom, properties: {} } as any);
    return Math.min(Math.max(e - w, n - s), 90);
}

// map size -> zoom: big country = gentle zoom, small = strong zoom
function zoomForSpan(span: number): number {
    const s = Math.max(3, Math.min(90, span));
    const t = (Math.log(s) - Math.log(3)) / (Math.log(90) - Math.log(3)); // 0..1
    return 4.2 - t * (4.2 - 1.4); // 4.2 (small) down to 1.4 (big)
}

// size-aware detail-dot generation for small countries (live)
function genDetail(iso: string): { x: number; y: number; z: number }[] {
    const geom = SHAPES[iso];
    if (!geom) return [];
    const feat = { type: "Feature", geometry: geom, properties: {} } as any;
    const [[w, s], [e, n]] = geoBounds(feat);
    const spanLon = Math.max(e - w, 0.1), spanLat = Math.max(n - s, 0.1);
    const sp = Math.max(spanLon, spanLat);
    if (sp > 60) return []; // too big / date-line wrap -> rely on world layer
    const step = Math.max(0.03, sp / 50); // smaller country -> finer step -> more dots
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

export default function GlobeView() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rot = useRef({ yaw: 0.6, pitch: 0.3 });
    const target = useRef({ yaw: 0.6, pitch: 0.3, active: false });
    const zoom = useRef(1);
    const zoomTarget = useRef(1);
    const glowIso = useRef<string | null>(null);
    const detail = useRef<{ x: number; y: number; z: number }[]>([]);

    const [mode, setMode] = useState<Mode>("spin");
    const [region, setRegion] = useState("GLOBE");
    const [country, setCountry] = useState<Country | null>(null);
    const [number, setNumber] = useState("");
    const [query, setQuery] = useState("");
    const [pickerOpen, setPickerOpen] = useState(false);

    const modeRef = useRef(mode);
    modeRef.current = mode;

    function aimAt(lat: number, lon: number, z: number) {
        target.current = { yaw: toRad(lon) - Math.PI / 2, pitch: toRad(lat), active: true };
        zoomTarget.current = z;
    }
    function selectRegion(name: string) {
        setRegion(name); setCountry(null); glowIso.current = null; detail.current = [];
        const c = CONTINENTS[name];
        if (c) aimAt(c[0], c[1], ZOOM_CONTINENT);
        else { target.current.active = false; zoomTarget.current = 1; }
    }
    function selectCountry(c: Country) {
        setCountry(c); setPickerOpen(false); setQuery("");
        const span = countrySpan(c.iso);
        aimAt(c.lat, c.lon, zoomForSpan(span));          // zoom scales with country size
        glowIso.current = c.iso;
        detail.current = (WORLD_COVER[c.iso] || 0) >= 12 ? [] : genDetail(c.iso); // detail for small ones
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const c2d = ctx;
        const SIZE = 320, BASE_R = SIZE * 0.42, cx = SIZE / 2, cy = SIZE / 2;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = SIZE * dpr; canvas.height = SIZE * dpr;
        canvas.style.width = SIZE + "px"; canvas.style.height = SIZE + "px";
        c2d.scale(dpr, dpr);

        let frame = 0;
        const wrap = (d: number) => Math.atan2(Math.sin(d), Math.cos(d));

        function draw() {
            c2d.clearRect(0, 0, SIZE, SIZE);
            const m = modeRef.current;
            zoom.current += (zoomTarget.current - zoom.current) * EASE;
            const R = BASE_R * zoom.current;
            const dotScale = Math.min(zoom.current, 2.5);

            if (m === "map") {
                for (const p of dots as Dot[]) {
                    const lat = Math.asin(p.y), lon = Math.atan2(p.z, p.x);
                    const sx = cx - (lon / Math.PI) * R;
                    const sy = cy - (lat / (Math.PI / 2)) * R * 0.6;
                    c2d.beginPath(); c2d.fillStyle = "rgba(255,255,255,0.8)";
                    c2d.arc(sx, sy, 0.55 * dotScale, 0, Math.PI * 2); c2d.fill();
                }
                frame = requestAnimationFrame(draw); return;
            }

            if (target.current.active) {
                rot.current.yaw += wrap(target.current.yaw - rot.current.yaw) * EASE;
                rot.current.pitch += (target.current.pitch - rot.current.pitch) * EASE;
            }
            if (m === "spin" && !target.current.active) rot.current.yaw += 0.003;

            const yaw = rot.current.yaw, pitch = rot.current.pitch;
            const cosY = Math.cos(yaw), sinY = Math.sin(yaw);
            const cosP = Math.cos(pitch), sinP = Math.sin(pitch);
            const pulse = 0.7 + 0.3 * Math.sin(Date.now() / 400);

            // base world dots
            for (const p of dots as Dot[]) {
                const x1 = p.x * cosY + p.z * sinY;
                const z1 = -p.x * sinY + p.z * cosY;
                const y1 = p.y;
                const y2 = y1 * cosP - z1 * sinP;
                const z2 = y1 * sinP + z1 * cosP;
                if (z2 <= 0) continue;
                const sx = cx - x1 * R, sy = cy - y2 * R;
                const isGlow = glowIso.current && p.c === glowIso.current;
                if (isGlow) {
                    c2d.beginPath();
                    c2d.fillStyle = `rgba(130,200,255,${0.85 * pulse})`;
                    c2d.shadowColor = "rgba(90,170,255,1)";
                    c2d.shadowBlur = 4 * pulse;
                    c2d.arc(sx, sy, (0.7 + 0.35 * pulse) * dotScale, 0, Math.PI * 2);
                    c2d.fill(); c2d.shadowBlur = 0;
                } else {
                    const alpha = 0.3 + 0.6 * z2;
                    c2d.beginPath();
                    c2d.fillStyle = `rgba(255,255,255,${alpha})`;
                    c2d.arc(sx, sy, (0.3 + 0.4 * z2) * dotScale, 0, Math.PI * 2);
                    c2d.fill();
                }
            }

            // live detail dots for small countries (overlay, always glowing)
            for (const p of detail.current) {
                const x1 = p.x * cosY + p.z * sinY;
                const z1 = -p.x * sinY + p.z * cosY;
                const y1 = p.y;
                const y2 = y1 * cosP - z1 * sinP;
                const z2 = y1 * sinP + z1 * cosP;
                if (z2 <= 0) continue;
                const sx = cx - x1 * R, sy = cy - y2 * R;
                c2d.beginPath();
                c2d.fillStyle = `rgba(130,200,255,${0.9 * pulse})`;
                c2d.shadowColor = "rgba(90,170,255,1)";
                c2d.shadowBlur = 4 * pulse;
                c2d.arc(sx, sy, (0.55 + 0.3 * pulse) * dotScale, 0, Math.PI * 2);
                c2d.fill(); c2d.shadowBlur = 0;
            }

            frame = requestAnimationFrame(draw);
        }
        draw();
        return () => cancelAnimationFrame(frame);
    }, []);

    const filtered = query
        ? COUNTRIES.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
        : COUNTRIES;

    const btn = (active: boolean) => ({
        padding: "6px 10px", borderRadius: 8, fontSize: 12, cursor: "pointer",
        border: "1px solid #333", background: active ? "#1e3a5f" : "transparent",
        color: active ? "#7db9ff" : "#aaa", whiteSpace: "nowrap" as const,
    });

    return (
        <div style={{ background: "#08080a", padding: 20, borderRadius: 16, width: 360, color: "#fff", fontFamily: "system-ui", position: "relative" }}>
            <h2 style={{ textAlign: "center", margin: "0 0 4px", fontSize: 20 }}>Enter your phone</h2>
            <p style={{ textAlign: "center", margin: "0 0 14px", fontSize: 13, color: "#888" }}>Select your country and number</p>

            <div style={{ width: 320, height: 320, overflow: "hidden", margin: "0 auto" }}>
                <canvas ref={canvasRef} style={{ display: "block" }} />
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "center" }}>
                {([["spin", "3D Spin"], ["static", "3D Static"], ["map", "2D Map"]] as [Mode, string][]).map(([key, label]) => (
                    <button key={key} onClick={() => setMode(key)}
                        style={{ ...btn(mode === key), background: mode === key ? "#fff" : "transparent", color: mode === key ? "#000" : "#aaa" }}>
                        {label}
                    </button>
                ))}
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "center", flexWrap: "wrap" }}>
                {Object.keys(CONTINENTS).map((name) => (
                    <button key={name} onClick={() => selectRegion(name)} style={btn(region === name)}>{name}</button>
                ))}
            </div>

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
                        flex: 1, padding: "10px 12px", borderRadius: 10, fontSize: 14,
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

            <button disabled={!country || number.length < 5}
                onClick={() => alert(`Submitting ${country?.dial} ${number}`)}
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