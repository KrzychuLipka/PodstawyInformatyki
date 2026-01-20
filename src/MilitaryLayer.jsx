import { useEffect, useRef, useState } from "react";
import { GeoJSON, useMap } from "react-leaflet";

const MILITARY_TYPES = [
    "barracks",
    "naval_base",
    "airfield",
    "training_area",
    "range",
    "office",
    "danger_area",
    "shelter",
    "bunker",
];

const MILITARY_LABELS = {
    barracks: "Koszary",
    naval_base: "Baza morska",
    airfield: "Lotnisko wojskowe",
    training_area: "Poligon szkoleniowy",
    range: "Strzelnica wojskowa",
    office: "Biuro wojskowe",
    danger_area: "Strefa niebezpieczna",
    shelter: "Schrony",
    bunker: "Bunkier",
};

export default function MilitaryOSMLayer() {
    const [militaryType, setMilitaryType] = useState("barracks");
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);


    const [lineColor, setLineColor] = useState("#ff0000");
    const [lineWeight, setLineWeight] = useState(6);
    const [lineOpacity, setLineOpacity] = useState(1);

    const layerRef = useRef(null);
    const map = useMap();

    const fetchData = async (type) => {
        setLoading(true);
        setData(null);

        const url = `/data/${type}.json`;

        try {
            const result = await fetch(url)

            if (!result.ok) {
                console.error("File not found.", url);
                setLoading(false);
                return;
            }

            const geojson = await result.json()
            setData(geojson);
        } catch (error) {
            console.error("File read error", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(militaryType);
    }, [militaryType]);

    useEffect(() => {
        if (!data || !layerRef.current) return;
        const bounds = layerRef.current.getBounds();
        if (bounds.isValid()) map.fitBounds(bounds, { animate: true });
    }, [data, map]);

    const featureCount = data?.features?.length || 0;

    return (
        <>
            {loading && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.5)",
                        zIndex: 99999,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "24px",
                        fontWeight: "bold",
                    }}
                >
                    Ładowanie: {MILITARY_LABELS[militaryType]}
                </div>
            )}

            <div
                style={{
                    position: "absolute",
                    top: "20px",
                    left: "80px",
                    zIndex: 9999,
                    background: "rgba(255,255,255,0.9)",
                    padding: "10px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
                    width: "65vw",
                }}
            >
                <div style={{ fontWeight: "bold", marginBottom: "6px" }}>
                    Typ obiektu wojskowego:
                </div>

                {MILITARY_TYPES.map((type) => (
                    <button
                        key={type}
                        onClick={() => setMilitaryType(type)}
                        title={MILITARY_LABELS[type]}
                        style={{
                            margin: "4px",
                            padding: "6px 10px",
                            borderRadius: "6px",
                            border: "1px solid #555",
                            background: type === militaryType ? "#c62828" : "#eee",
                            color: type === militaryType ? "#fff" : "#000",
                            cursor: "pointer",
                        }}
                    >
                        {MILITARY_LABELS[type]}
                    </button>
                ))}
            </div>

            <div
                style={{
                    position: "absolute",
                    bottom: "20px",
                    left: "20px",
                    zIndex: 9999,
                    background: "rgba(255,255,255,0.9)",
                    padding: "10px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
                    minWidth: "220px",
                }}
            >
                <div style={{ fontWeight: "bold", marginBottom: "6px" }}>
                    Legenda
                </div>

                <div>
                    <strong>Typ:</strong> {MILITARY_LABELS[militaryType]}
                </div>

                <div>
                    <strong>Liczba obiektów:</strong> {featureCount}
                </div>
            </div>

            <div
                style={{
                    position: "absolute",
                    bottom: "20px",
                    right: "20px",
                    zIndex: 9999,
                    background: "rgba(255,255,255,0.9)",
                    padding: "12px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
                    width: "220px",
                }}
            >
                <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
                    Styl warstwy
                </div>

                <div style={{ marginBottom: "8px" }}>
                    <label>Kolor:</label>
                    <input
                        type="color"
                        value={lineColor}
                        onChange={(e) => setLineColor(e.target.value)}
                        style={{ width: "100%" }}
                    />
                </div>

                <div style={{ marginBottom: "8px" }}>
                    <label>Grubość: {lineWeight}</label>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={lineWeight}
                        onChange={(e) => setLineWeight(Number(e.target.value))}
                        style={{ width: "100%" }}
                    />
                </div>

                <div>
                    <label>Przezroczystość: {lineOpacity}</label>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={lineOpacity}
                        onChange={(e) => setLineOpacity(Number(e.target.value))}
                        style={{ width: "100%" }}
                    />
                </div>
            </div>

            {data && (
                <GeoJSON
                    key={militaryType}
                    data={data}
                    ref={layerRef}
                    style={() => ({
                        color: lineColor,
                        weight: lineWeight,
                        opacity: lineOpacity,
                        fillColor: lineColor,
                        fillOpacity: lineOpacity * 0.45,
                    })}
                />
            )}
        </>
    );
}
