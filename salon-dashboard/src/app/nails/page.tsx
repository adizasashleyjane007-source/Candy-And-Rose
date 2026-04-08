"use client";

import { useState, useEffect, useRef } from "react";
import {
    Sparkles, Check, Info, Shapes, Hand, Target,
    Star, Heart, Palette, Wand2, Eraser, Download,
    ChevronDown, Droplets, Layers, FlaskConical, Sun,
    Type, Edit3, MousePointer2, Plus, ArrowRight,
    Trash2, Moon, Cloud, Zap, Diamond, Move, Circle
} from "lucide-react";
import Header from "@/components/Header";

const NAIL_TEXTURES = [
    { id: "glossy", name: "High Gloss", icon: <Droplets className="w-4 h-4" /> },
    { id: "matte", name: "Classic Matte", icon: <FlaskConical className="w-4 h-4" /> },
    { id: "glitter", name: "Sparkling Glitter", icon: <Sparkles className="w-4 h-4" /> },
    { id: "pearlescent", name: "Pearlescent", icon: <Sun className="w-4 h-4" /> },
    { id: "gel", name: "UV Gel Coat", icon: <Layers className="w-4 h-4" /> },
    { id: "acrylic", name: "Luxury Acrylic", icon: <Target className="w-4 h-4" /> },
];

const NAIL_COLORS = [
    "#ec4899", "#f43f5e", "#8b5cf6", "#3b82f6", "#10b981",
    "#f59e0b", "#d1d5db", "#111827", "#ffffff", "#000000",
    "#fb923c", "#facc15", "#4ade80", "#2dd4bf", "#60a5fa"
];

const SHAPE_PATH_MAP: any = {
    "Round": "M50,10 C70,10 90,40 90,80 L90,100 L10,100 L10,80 C10,40 30,10 50,10 Z",
    "Oval": "M50,5 C75,5 90,35 90,75 L90,100 L10,100 L10,75 C10,35 25,5 50,5 Z",
    "Square": "M15,15 L85,15 L85,100 L15,100 Z",
    "Almond": "M50,5 C65,5 85,45 85,85 L85,100 L15,100 L15,85 C15,45 35,5 50,5 Z",
    "Coffin": "M30,10 L70,10 L85,100 L15,100 Z",
    "Stiletto": "M50,0 L85,100 L15,100 Z",
    "Lipstick": "M15,25 L85,5 L85,100 L15,100 Z",
    "Squoval": "M15,20 Q15,10 50,10 Q85,10 85,20 L85,100 L15,100 Z"
};

const ShapeIcon = ({ name, active }: { name: string, active: boolean }) => (
    <svg viewBox="0 0 100 100" className={`w-full h-full p-2 transition-all ${active ? 'fill-white' : 'fill-pink-200 group-hover:fill-pink-400'}`}>
        <path d={SHAPE_PATH_MAP[name] || SHAPE_PATH_MAP["Round"]} />
    </svg>
);

const PolishBottle = ({ color, active, size = "w-6 h-8" }: { color: string, active?: boolean, size?: string }) => (
    <div className={`relative ${size} transition-all duration-300 ${active ? 'scale-110 -translate-y-1' : 'opacity-80 hover:opacity-100 hover:scale-110'}`}>
        <svg viewBox="0 0 40 60" className="w-full h-full drop-shadow-sm">
            <rect x="12" y="0" width="16" height="25" rx="2" fill="url(#goldGradient)" />
            <path d="M5,25 L35,25 C38,25 40,27 40,30 L38,55 C38,58 36,60 33,60 L7,60 C4,60 2,58 2,55 L0,30 C0,27 2,25 5,25 Z" fill={color} />
            <path d="M5,30 L10,30 L8,55 L4,55 Z" fill="white" fillOpacity="0.2" />
            <defs>
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{ stopColor: '#D4AF37' }} />
                    <stop offset="50%" style={{ stopColor: '#FFD700' }} />
                    <stop offset="100%" style={{ stopColor: '#B8860B' }} />
                </linearGradient>
            </defs>
        </svg>
        {active && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-pink-500 rounded-full" />}
    </div>
);

function PrecisionNailStudio({
    selectedShape, primaryColor, secondaryColor, isGradient, selectedTexture, activeTool, setActiveTool, toolConfig
}: {
    selectedShape: string; primaryColor: string; secondaryColor: string; isGradient: boolean; selectedTexture: string; activeTool: string; setActiveTool: any; toolConfig: any;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const artCanvasRef = useRef<HTMLCanvasElement>(null);
    const [textPos, setTextPos] = useState({ x: 400, y: 500 });
    const [isDraggingText, setIsDraggingText] = useState(false);
    const [isPainting, setIsPainting] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current, ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;
        ctx.clearRect(0, 0, 800, 1000);
        const x = 400, y = 550, w = 240, h = 420;
        ctx.save();
        const path = new Path2D(SHAPE_PATH_MAP[selectedShape]);
        ctx.translate(x - (100 * (w / 100) / 2), y - (100 * (h / 100)));
        ctx.scale(w / 100, h / 100);
        if (isGradient) {
            const grad = ctx.createLinearGradient(50, 0, 50, 100);
            grad.addColorStop(0, primaryColor); grad.addColorStop(1, secondaryColor);
            ctx.fillStyle = grad;
        } else { ctx.fillStyle = primaryColor; }
        ctx.fill(path);
        if (selectedTexture === "glossy" || selectedTexture === "gel") {
            ctx.globalAlpha = 0.15; ctx.fillStyle = "white"; ctx.beginPath();
            ctx.ellipse(50, 30, 20, 40, Math.PI / 12, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    }, [selectedShape, primaryColor, secondaryColor, isGradient, selectedTexture]);

    const handleMouseDown = (e: React.MouseEvent) => {
        const canvas = artCanvasRef.current; if (!canvas) return;
        const rect = canvas.getBoundingClientRect(), x = (e.clientX - rect.left) * (800 / rect.width), y = (e.clientY - rect.top) * (1000 / rect.height);
        if (activeTool === "text") {
            if (Math.sqrt(Math.pow(x - textPos.x, 2) + Math.pow(y - textPos.y, 2)) < 100) { setIsDraggingText(true); return; }
        }
        if (activeTool === "draw" || activeTool === "erase") {
            setIsPainting(true);
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.beginPath(); ctx.moveTo(x, y);
                if (activeTool === "erase") { ctx.globalCompositeOperation = "destination-out"; ctx.strokeStyle = "rgba(0,0,0,1)"; }
                else { ctx.globalCompositeOperation = "source-over"; ctx.strokeStyle = toolConfig.drawColor; }
            }
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const canvas = artCanvasRef.current; if (!canvas) return;
        const rect = canvas.getBoundingClientRect(), x = (e.clientX - rect.left) * (800 / rect.width), y = (e.clientY - rect.top) * (1000 / rect.height);
        if (isDraggingText) { setTextPos({ x, y }); return; }
        if (isPainting && (activeTool === "draw" || activeTool === "erase")) {
            const ctx = canvas.getContext("2d"); if (ctx) {
                ctx.save();
                const xN = 400, yN = 550, wN = 240, hN = 420;
                const path = new Path2D(SHAPE_PATH_MAP[selectedShape]);
                ctx.translate(xN - (100 * (wN / 100) / 2), yN - (100 * (hN / 100)));
                ctx.scale(wN / 100, hN / 100);
                ctx.clip(path);
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                if (activeTool === "erase") { ctx.globalCompositeOperation = "destination-out"; ctx.strokeStyle = "rgba(0,0,0,1)"; }
                else { ctx.globalCompositeOperation = "source-over"; ctx.strokeStyle = toolConfig.drawColor; }
                ctx.lineWidth = toolConfig.size || 6; ctx.lineCap = "round"; ctx.lineJoin = "round";
                ctx.lineTo(x, y); ctx.stroke();
                ctx.restore();
            }
        }
    };

    const handleMouseUp = () => { setIsPainting(false); setIsDraggingText(false); };

    const handleStampClick = (e: React.MouseEvent) => {
        if (activeTool !== "stamp") return;
        const canvas = artCanvasRef.current, ctx = canvas?.getContext("2d"); if (!canvas || !ctx) return;
        const rect = canvas.getBoundingClientRect(), x = (e.clientX - rect.left) * (800 / rect.width), y = (e.clientY - rect.top) * (1000 / rect.height);
        ctx.save();
        const xN = 400, yN = 550, wN = 240, hN = 420;
        const path = new Path2D(SHAPE_PATH_MAP[selectedShape]);
        ctx.translate(xN - (100 * (wN / 100) / 2), yN - (100 * (hN / 100)));
        ctx.scale(wN / 100, hN / 100);
        ctx.clip(path);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = toolConfig.stampColor || "white";
        const s = toolConfig.size * 5;
        if (toolConfig.type === "star") drawStar(ctx, x, y, 5, s, s / 2);
        else if (toolConfig.type === "heart") drawHeart(ctx, x, y, s);
        else if (toolConfig.type === "moon") drawMoon(ctx, x, y, s);
        else if (toolConfig.type === "diamond") drawDiamond(ctx, x, y, s);
        else if (toolConfig.type === "diamond-2") drawDiamond(ctx, x, y, s, 1.5);
        else if (toolConfig.type === "sparkle") drawStar(ctx, x, y, 4, s, s / 4);
        else if (toolConfig.type === "gem-1") drawHexGem(ctx, x, y, s);
        else if (toolConfig.type === "gem-2") drawSparkleBrilliance(ctx, x, y, s);
        else if (toolConfig.type === "wand") drawStar(ctx, x, y, 5, s, s / 3);
        else if (toolConfig.type === "circle") drawCircle(ctx, x, y, s / 2);
        else if (toolConfig.type === "cloud") drawCloud(ctx, x, y, s);
        else if (toolConfig.type === "zap") drawZap(ctx, x, y, s);
        ctx.restore();
    };

    const drawStar = (ctx: any, cx: number, cy: number, p: number, o: number, i: number) => {
        let rot = Math.PI / 2 * 3, x = cx, y = cy, step = Math.PI / p;
        ctx.beginPath(); ctx.moveTo(cx, cy - o);
        for (let j = 0; j < p; j++) { x = cx + Math.cos(rot) * o; y = cy + Math.sin(rot) * o; ctx.lineTo(x, y); rot += step; x = cx + Math.cos(rot) * i; y = cy + Math.sin(rot) * i; ctx.lineTo(x, y); rot += step; }
        ctx.lineTo(cx, cy - o); ctx.closePath(); ctx.fill();
    };
    const drawHeart = (ctx: any, x: number, y: number, s: number) => {
        ctx.beginPath(); ctx.moveTo(x, y + s * 0.3); ctx.bezierCurveTo(x, y, x - s / 2, y, x - s / 2, y + s * 0.3); ctx.bezierCurveTo(x - s / 2, y + s * 0.6, x, y + s * 0.8, x, y + s); ctx.bezierCurveTo(x, y + s * 0.8, x + s / 2, y + s * 0.6, x + s / 2, y + s * 0.3); ctx.bezierCurveTo(x + s / 2, y, x, y, x, y + s * 0.3); ctx.fill();
    };
    const drawMoon = (ctx: any, x: number, y: number, s: number) => { ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2, true); ctx.moveTo(x + s * 0.7, y); ctx.arc(x + s * 0.4, y, s, 0, Math.PI * 2, true); ctx.fill("evenodd"); };
    const drawDiamond = (ctx: any, x: number, y: number, s: number, ratio: number = 1) => { ctx.beginPath(); ctx.moveTo(x, y - s * ratio); ctx.lineTo(x + s, y); ctx.lineTo(x, y + s * ratio); ctx.lineTo(x - s, y); ctx.closePath(); ctx.fill(); };
    const drawHexGem = (ctx: any, x: number, y: number, s: number) => {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            ctx.lineTo(x + s * Math.cos(angle), y + s * Math.sin(angle));
        }
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.3)"; ctx.stroke();
    };
    const drawSparkleBrilliance = (ctx: any, x: number, y: number, s: number) => {
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4;
            const r = i % 2 === 0 ? s : s / 3;
            ctx.lineTo(x + r * Math.cos(angle), y + r * Math.sin(angle));
        }
        ctx.closePath(); ctx.fill();
    };
    const drawCircle = (ctx: any, x: number, y: number, r: number) => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); };
    const drawCloud = (ctx: any, x: number, y: number, s: number) => { ctx.beginPath(); ctx.arc(x, y, s * 0.5, Math.PI * 0.5, Math.PI * 1.5); ctx.arc(x + s * 0.5, y - s * 0.3, s * 0.5, Math.PI, Math.PI * 2); ctx.arc(x + s, y, s * 0.5, Math.PI * 1.5, Math.PI * 0.5); ctx.lineTo(x, y + s * 0.5); ctx.fill(); };
    const drawZap = (ctx: any, x: number, y: number, s: number) => { ctx.beginPath(); ctx.moveTo(x + s / 2, y - s); ctx.lineTo(x - s / 2, y); ctx.lineTo(x, y); ctx.lineTo(x - s / 2, y + s); ctx.lineTo(x + s / 2, y); ctx.lineTo(x, y); ctx.closePath(); ctx.fill(); };

    const handleClearArt = () => {
        const artCanvas = artCanvasRef.current;
        if (artCanvas) {
            const ctx = artCanvas.getContext("2d");
            if (ctx) ctx.clearRect(0, 0, 800, 1000);
        }
        setTextPos({ x: 400, y: 500 });
    };

    return (
        <div className="relative w-full h-full min-h-[600px] bg-white rounded-[3rem] border-[10px] border-pink-50 shadow-2xl flex items-center justify-center overflow-hidden">
            <canvas ref={canvasRef} width={800} height={1000} className="absolute inset-0 w-full h-full" />
            <canvas ref={artCanvasRef} width={800} height={1000} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onClick={handleStampClick} className="absolute inset-0 w-full h-full cursor-crosshair z-10" />

            {activeTool === "text" && toolConfig.text && (
                <div className="absolute pointer-events-none select-none z-20 flex flex-col items-center" style={{ left: `${(textPos.x / 800) * 100}%`, top: `${(textPos.y / 1000) * 100}%`, transform: 'translate(-50%, -50%)' }}>
                    <div className="whitespace-nowrap drop-shadow-md tracking-tight leading-none" style={{ fontSize: `${toolConfig.size * 5}px`, color: toolConfig.textColor, fontFamily: toolConfig.fontFamily, fontWeight: (toolConfig.fontFamily?.includes('Script') || toolConfig.fontFamily?.includes('Calligraphy')) ? 'normal' : '900' }}>{toolConfig.text}</div>
                </div>
            )}

            <div className="absolute bottom-10 right-10 flex gap-4 items-end z-20">
                {activeTool === "text" && <p className="text-[10px] font-black text-pink-300 uppercase tracking-widest mb-3 flex items-center gap-1"><Move className="w-4 h-4" /> Drag text</p>}
                <button onClick={() => { if (activeTool === "erase") { setActiveTool("draw"); } else { setActiveTool("erase"); } }} className={`p-5 backdrop-blur-md rounded-3xl transition-all shadow-xl border active:scale-90 group ${activeTool === "erase" ? "bg-pink-500 text-white border-pink-400" : "bg-white/90 text-gray-400 hover:bg-pink-50 border-pink-50"}`} title="Eraser Tool">
                    <Eraser className="w-6 h-6" />
                </button>
                <button onClick={handleClearArt} className="p-5 bg-white/90 backdrop-blur-md rounded-3xl text-red-500 hover:bg-red-50 transition-all shadow-xl border border-red-50 active:scale-90 group" title="Clear Canvas">
                    <Trash2 className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                </button>
            </div>
        </div>
    );
}

export default function NailsAIPage() {
    const [selectedShape, setSelectedShape] = useState("Almond");
    const [primaryColor, setPrimaryColor] = useState("#ec4899");
    const [secondaryColor, setSecondaryColor] = useState("#8b5cf6");
    const [isGradient, setIsGradient] = useState(false);
    const [selectedTexture, setSelectedTexture] = useState("glossy");
    const [activeTool, setActiveTool] = useState("draw");
    const [toolText, setToolText] = useState("PEACE");
    const [activeStampType, setActiveStampType] = useState("star");
    const [brushSize, setBrushSize] = useState(10);
    const [artisticColor, setArtisticColor] = useState("#ffffff");
    const [selectedFont, setSelectedFont] = useState("Inter, sans-serif");

    const nailShapes = ["Round", "Oval", "Square", "Almond", "Coffin", "Stiletto", "Lipstick", "Squoval"];
    const stamps = [
        { id: "star", icon: <Star className="w-5 h-5" /> },
        { id: "heart", icon: <Heart className="w-5 h-5" /> },
        { id: "moon", icon: <Moon className="w-5 h-5" /> },
        { id: "diamond", icon: <Diamond className="w-5 h-5" /> },
        { id: "sparkle", icon: <Sparkles className="w-5 h-5" /> },
        { id: "diamond-2", icon: <Diamond className="w-5 h-5 fill-current" /> },
        { id: "gem-1", icon: <FlaskConical className="w-5 h-5" /> },
        { id: "gem-2", icon: <Sun className="w-5 h-5" /> },
        { id: "wand", icon: <Wand2 className="w-5 h-5" /> },
        { id: "cloud", icon: <Cloud className="w-5 h-5" /> },
        { id: "zap", icon: <Zap className="w-5 h-5" /> },
        { id: "circle", icon: <Circle className="w-5 h-5" /> }
    ];
    const fontStyles = [
        { name: "Modern Sans", value: "Inter, sans-serif" },
        { name: "Classic Serif", value: "'Times New Roman', serif" },
        { name: "Elegant Script", value: "'Brush Script MT', cursive" },
        { name: "Sporty Bold", value: "'Impact', sans-serif" },
        { name: "Digital Mono", value: "'Courier New', monospace" },
        { name: "Luxury Display", value: "'Didot', serif" },
        { name: "Parisian Chic", value: "'Playfair Display', serif" },
        { name: "Funky Retro", value: "'Bungee', cursive" },
        { name: "Soft Rounded", value: "system-ui, sans-serif" },
        { name: "Vintage Slab", value: "'Rockwell', serif" },
        { name: "Gothic Noir", value: "'Old English Text MT', serif" },
        { name: "Modern Minimal", value: "'Helvetica Neue', sans-serif" },
        { name: "Art Deco", value: "'Futura', sans-serif" },
        { name: "Handwritten", value: "'Ink Free', cursive" },
        { name: "Comic Play", value: "'Comic Sans MS', cursive" },
        { name: "Stencil Rugged", value: "'Stencil', sans-serif" },
        { name: "Techno Edge", value: "'Lucida Console', monospace" },
        { name: "Calligraphy", value: "'Edwardian Script ITC', cursive" },
        { name: "Bold Poster", value: "'Arial Black', sans-serif" },
        { name: "Chalk Board", value: "'Marker Felt', cursive" },
        { name: "Papyrus Ancient", value: "'Papyrus', serif" },
        { name: "Copperplate", value: "'Copperplate', serif" }
    ];

    return (
        <div className="flex-1 flex flex-col h-full bg-white overflow-y-auto">
            <Header />
            <div className="px-8 pb-8 flex-1 max-w-[1600px] mx-auto w-full">
                
                {/* Nail Recommendation Section */}
                <div className="mb-12 mt-4">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3 uppercase">
                                <Sparkles className="w-6 h-6 text-pink-500" /> Nail Recommendation
                            </h2>
                            <p className="text-sm text-gray-500 font-medium">Trending designs curated by our stylists</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                        {/* Primary Recommendation Card */}
                        <div className="lg:col-span-5">
                            <div className="group relative h-[300px] bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white transition-all hover:scale-[1.02] duration-500">
                                <img 
                                    src="file:///C:/Users/xianr/.gemini/antigravity/brain/1f091090-91aa-4f7f-ad68-90ce473b3911/nail_collection_feature_2_1775563411780.png" 
                                    alt="Spring Collection 2024"
                                    className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                                <div className="absolute bottom-0 left-0 p-6 w-full translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-500 text-white rounded-full text-[8px] font-black uppercase tracking-widest mb-3">
                                        <Wand2 className="w-2.5 h-2.5" /> Featured Design
                                    </div>
                                    <h4 className="text-xl font-black text-white leading-tight uppercase tracking-tight">Luxury Silk & <br />Gold Marble</h4>
                                </div>
                            </div>
                        </div>

                        {/* Design Grid */}
                        <div className="lg:col-span-7">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 h-full">
                                {[
                                    { img: "nail_design_1_1775563353593.png", title: "Rose Marble", id: "001" },
                                    { img: "nail_design_2_1775563368535.png", title: "Lavender Geometry", id: "002" },
                                    { img: "nail_design_3_1775563387544.png", title: "Holo Pearl", id: "003" },
                                    { img: "nail_collection_feature_2_1775563411780.png", title: "Golden Frost", id: "004" }
                                ].map((design, idx) => (
                                    <div key={idx} className="group relative bg-white rounded-2xl overflow-hidden shadow-lg border border-pink-50 hover:shadow-2xl transition-all duration-500">
                                        <div className="aspect-[4/5] overflow-hidden">
                                            <img 
                                                src={`file:///C:/Users/xianr/.gemini/antigravity/brain/1f091090-91aa-4f7f-ad68-90ce473b3911/${design.img}`} 
                                                alt={design.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                            />
                                        </div>
                                        <div className="p-3 flex flex-col gap-1">
                                            <span className="text-[9px] font-black text-pink-500 uppercase tracking-widest leading-none">#{design.id}</span>
                                            <h5 className="text-[10px] font-bold text-gray-800 tracking-tight leading-tight group-hover:text-pink-600 transition-colors truncate">{design.title}</h5>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                    {/* Left Panel: Primary Artist Tools */}
                    <div className="lg:col-span-3 flex flex-col rotate-[-0.8deg] transition-transform hover:rotate-0 duration-500">
                        <div className="mb-6">
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3 uppercase whitespace-nowrap">
                                <Palette className="w-6 h-6 text-pink-500" /> Customize your Nails
                            </h2>
                        </div>
                        <div className="bg-gradient-to-br from-white to-pink-50/20 rounded-[2rem] p-4 pb-2 shadow-lg border border-pink-100/50 flex flex-col">
                            <h3 className="text-sm font-semibold text-black mb-2.5 flex items-center gap-2">
                                <Palette className="w-4 h-4 text-pink-500" /> Artist Toolkit
                            </h3>

                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-semibold text-black uppercase tracking-wider block">Ink Pigment</label>
                                    <div className="flex flex-wrap gap-2">
                                        {NAIL_COLORS.slice(0, 10).map(c => (
                                            <button key={c} onClick={() => setArtisticColor(c)}>
                                                <PolishBottle color={c} active={artisticColor === c} size="w-5 h-7" />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-1.5">
                                    <button onClick={() => setActiveTool("draw")} className={`flex items-center gap-3.5 p-3 rounded-xl border-[1.5px] transition-all ${activeTool === "draw" ? "bg-pink-500 border-pink-500 text-white shadow-md translate-x-1" : "bg-white border-gray-50 text-gray-500 hover:bg-pink-50/50"}`}><Edit3 className="w-4 h-4" /> <span className="font-semibold text-xs tracking-tight">Paint Brush</span></button>
                                    <button onClick={() => setActiveTool("stamp")} className={`flex items-center gap-3.5 p-3 rounded-xl border-[1.5px] transition-all ${activeTool === "stamp" ? "bg-pink-500 border-pink-500 text-white shadow-md translate-x-1" : "bg-white border-gray-50 text-gray-500 hover:bg-pink-50/50"}`}><Plus className="w-4 h-4" /> <span className="font-semibold text-xs tracking-tight">Design Stamps</span></button>
                                    <button onClick={() => setActiveTool("text")} className={`flex items-center gap-3.5 p-3 rounded-xl border-[1.5px] transition-all ${activeTool === "text" ? "bg-pink-500 border-pink-500 text-white shadow-md translate-x-1" : "bg-white border-gray-50 text-gray-500 hover:bg-pink-50/50"}`}><Type className="w-4 h-4" /> <span className="font-semibold text-xs tracking-tight">Artistic Text</span></button>
                                </div>

                                {activeTool === "stamp" && (
                                    <div className="p-4 bg-white/60 backdrop-blur-md rounded-2xl border border-pink-100/50 grid grid-cols-4 gap-2.5 animate-in fade-in zoom-in-95">
                                        {stamps.map(s => (<button key={s.id} onClick={() => setActiveStampType(s.id)} className={`aspect-square flex items-center justify-center rounded-xl transition-all ${activeStampType === s.id ? "bg-pink-500 text-white shadow-md" : "bg-white text-gray-400 hover:bg-pink-50"}`}>{s.icon}</button>))}
                                    </div>
                                )}

                                {activeTool === "text" && (
                                    <div className="p-4 bg-white/60 backdrop-blur-md rounded-2xl border border-pink-100/50 space-y-3 animate-in fade-in zoom-in-95">
                                        <input type="text" value={toolText} onChange={(e) => setToolText(e.target.value)} placeholder="Enter label..." className="w-full h-11 px-4 bg-white rounded-xl border border-pink-100 font-semibold text-gray-800 text-xs focus:border-pink-300 outline-none shadow-sm transition-all" />
                                        <div className="relative group">
                                            <select value={selectedFont} onChange={(e) => setSelectedFont(e.target.value)} className="w-full h-11 px-4 bg-white rounded-xl border border-pink-100 font-semibold text-gray-800 text-[10px] appearance-none outline-none shadow-sm transition-all cursor-pointer">
                                                {fontStyles.map(f => (<option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.name}</option>))}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400 pointer-events-none group-focus-within:rotate-180 transition-transform" />
                                        </div>
                                    </div>
                                )}

                                <div className="pt-2 border-t border-pink-100/30">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-[10px] font-semibold text-black uppercase tracking-wider">Brush Density</label>
                                        <span className="text-[10px] font-bold text-pink-500 bg-pink-100/50 px-2.5 py-0.5 rounded-full">{brushSize}px</span>
                                    </div>
                                    <input type="range" min="1" max="50" step="1" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} className="w-full h-1.5 bg-pink-100 rounded-full accent-pink-500 cursor-pointer" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Middle: Canvas View */}
                    <div className="lg:col-span-6 flex flex-col pt-2 items-center">
                        <div className="w-full max-w-[500px] h-full flex flex-col">
                            <div className="flex-1 relative mb-3">
                                <PrecisionNailStudio selectedShape={selectedShape} activeTool={activeTool} setActiveTool={setActiveTool} primaryColor={primaryColor} secondaryColor={secondaryColor} isGradient={isGradient} selectedTexture={selectedTexture} toolConfig={{ drawColor: artisticColor, stampColor: artisticColor, textColor: artisticColor, size: brushSize, type: activeStampType, text: toolText, fontFamily: selectedFont }} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <button className="py-3.5 bg-pink-600 text-white rounded-2xl font-bold shadow-lg shadow-pink-100 flex items-center justify-center gap-2.5 active:scale-95 transition-all hover:bg-pink-700">
                                    <Download className="w-4 h-4" /> <span className="uppercase tracking-widest text-[9px]">Export Design</span>
                                </button>
                                <button className="py-3.5 bg-white text-gray-900 border-[1.5px] border-gray-100 rounded-2xl font-bold shadow-md flex items-center justify-center gap-2.5 active:scale-95 transition-all hover:border-pink-200">
                                    <Check className="w-4 h-4 text-green-500" /> <span className="uppercase tracking-widest text-[9px]">Save Draft</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Surface & Base Tools */}
                    <div className="lg:col-span-3 space-y-4 flex flex-col rotate-[0.8deg] transition-transform hover:rotate-0 duration-500">
                        <div className="bg-gradient-to-br from-white to-pink-50/20 rounded-[2rem] p-5 shadow-lg border border-pink-100/50 flex flex-col" style={{ width: 'calc(100% + 1px)' }}>
                            <h3 className="text-sm font-semibold text-black mb-4 uppercase tracking-widest flex items-center gap-2.5"><Shapes className="w-4 h-4 text-pink-500" /> Nail Shapes</h3>
                            <div className="grid grid-cols-4 gap-3 flex-1">
                                {nailShapes.map(s => (
                                    <div key={s} className="flex flex-col items-center gap-1.5">
                                        <button onClick={() => setSelectedShape(s)} className={`aspect-square w-full rounded-xl transition-all hover:scale-110 ${selectedShape === s ? "bg-pink-500 shadow-lg ring-2 ring-pink-100 translate-y-[-2px]" : "bg-gray-50/50"}`}>
                                            <ShapeIcon name={s} active={selectedShape === s} />
                                        </button>
                                        <span className={`text-[9px] font-bold uppercase tracking-tighter ${selectedShape === s ? "text-pink-600" : "text-gray-400"}`}>{s}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-white to-pink-50/20 rounded-[2rem] p-5 shadow-lg border border-pink-100/50 flex flex-col flex-1" style={{ width: 'calc(100% + 1px)' }}>
                            <h3 className="text-sm font-semibold text-black mb-4 uppercase tracking-widest flex items-center gap-2.5"><Droplets className="w-4 h-4 text-pink-500" /> Surface Finish</h3>
                            <div className="flex-1 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-[0.1em] block">Texture Quality</label>
                                    <div className="relative group">
                                        <select value={selectedTexture} onChange={(e) => setSelectedTexture(e.target.value)} className="w-full h-11 px-4 bg-white/80 rounded-xl font-bold text-gray-800 text-xs appearance-none outline-none border border-pink-50 focus:border-pink-200 transition-all cursor-pointer shadow-sm">
                                            {NAIL_TEXTURES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400 pointer-events-none group-focus-within:rotate-180 transition-transform" />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-pink-50/50">
                                    <div className="flex flex-col gap-2 mb-4">
                                        <div className="space-y-0.5">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-[0.1em] block">Base Pigment</label>
                                            <p className="text-[10px] text-pink-400 font-black uppercase tracking-widest">Select Tone</p>
                                        </div>
                                        <button onClick={() => setIsGradient(!isGradient)} className={`flex items-center justify-center gap-2 w-full py-2 rounded-xl transition-all ${isGradient ? "bg-pink-500 text-white shadow-md" : "bg-gray-100 text-gray-400 hover:bg-pink-50"}`}>
                                            <Layers className="w-4 h-4" />
                                            <span className="text-[10px] font-black uppercase">Switch to Dual Tone</span>
                                        </button>
                                    </div>

                                    <div className={`grid ${isGradient ? 'grid-cols-2 gap-3' : 'grid-cols-1'}`}>
                                        <div className="flex flex-wrap gap-2.5">
                                            {NAIL_COLORS.slice(0, 10).map(c => (
                                                <button key={c} onClick={() => setPrimaryColor(c)}>
                                                    <PolishBottle color={c} active={primaryColor === c} size="w-6 h-8" />
                                                </button>
                                            ))}
                                        </div>
                                        {isGradient && (
                                            <div className="flex flex-wrap gap-2.5 animate-in slide-in-from-right-2">
                                                {NAIL_COLORS.slice(5, 15).map(c => (
                                                    <button key={c} onClick={() => setSecondaryColor(c)}>
                                                        <PolishBottle color={c} active={secondaryColor === c} size="w-6 h-8" />
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-pink-100/30">
                                <p className="text-[9px] leading-relaxed font-bold text-pink-600 flex items-start gap-2 uppercase tracking-tight">
                                    <Info className="w-3.5 h-3.5 shrink-0" />
                                    <span>Dual Tone creates stunning ombre gradients.</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
