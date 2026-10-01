from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

# Expanded preset library for a more premium style editor
PRESETS = [
    {
        "id": "festive_golden",
        "title": "✨ Festive Red & Gold Glow",
        "description": "Warm, rich tones made for traditional outfits and festive portraits.",
        "category": "Festive",
        "filter": "sepia(25%) saturate(160%) contrast(115%) brightness(105%)"
    },
    {
        "id": "cinema_warmth",
        "title": "🌅 Warm Golden Hour",
        "description": "Cinematic warmth with soft highlights and cozy depth.",
        "category": "Cinematic",
        "filter": "sepia(35%) saturate(145%) contrast(110%) brightness(108%)"
    },
    {
        "id": "reel_aesthetic",
        "title": "📱 Trending Reel Aesthetic",
        "description": "Clean viral social-media color grading with subtle pastel contrast.",
        "category": "Social",
        "filter": "contrast(105%) brightness(112%) saturate(125%) hue-rotate(-10deg)"
    },
    {
        "id": "soft_portrait",
        "title": "🌸 Soft Portrait Bloom",
        "description": "Dreamy portrait polish with gentle pink undertones.",
        "category": "Portrait",
        "filter": "contrast(95%) brightness(115%) saturate(115%) sepia(10%)"
    },
    {
        "id": "vintage_film",
        "title": "🎞️ 90s Film Grain",
        "description": "Retro film-inspired tones with nostalgic matte shadows.",
        "category": "Retro",
        "filter": "sepia(30%) contrast(120%) brightness(102%) saturate(110%)"
    },
    {
        "id": "vibrant_festive",
        "title": "🔴 Royal Festive Red Boost",
        "description": "High-energy festive color pop for jewelry, dresses, and details.",
        "category": "Festive",
        "filter": "saturate(190%) contrast(125%) brightness(102%)"
    },
    {
        "id": "cyberpunk",
        "title": "🌃 Cyberpunk Neon",
        "description": "Bold futuristic contrast with blue and magenta highlights.",
        "category": "Neon",
        "filter": "contrast(140%) hue-rotate(180deg) saturate(180%)"
    },
    {
        "id": "dramatic_noir",
        "title": "🖤 Dramatic Noir B&W",
        "description": "High-contrast monochrome for dramatic editorial styling.",
        "category": "Monochrome",
        "filter": "grayscale(100%) contrast(180%) brightness(90%)"
    },
    {
        "id": "emerald_mood",
        "title": "🌿 Moody Emerald Green",
        "description": "Rich natural greens with cool outdoor shadows.",
        "category": "Nature",
        "filter": "contrast(125%) saturate(130%) hue-rotate(25deg) brightness(95%)"
    },
    {
        "id": "retro_anime",
        "title": "🎨 90s Retro Anime",
        "description": "Cell-shaded nostalgia with warm, saturated color energy.",
        "category": "Retro",
        "filter": "sepia(20%) contrast(130%) brightness(110%) saturate(150%)"
    },
    {
        "id": "sunset_flare",
        "title": "🌆 Sunset Sunburst",
        "description": "Golden orange glow with cinematic purple warmth.",
        "category": "Cinematic",
        "filter": "sepia(45%) saturate(170%) hue-rotate(-15deg) contrast(115%)"
    },
    {
        "id": "cool_breeze",
        "title": "❄️ Cool Aesthetic Blue",
        "description": "Crisp cool tones with elevated white highlights.",
        "category": "Minimal",
        "filter": "hue-rotate(190deg) saturate(120%) contrast(110%) brightness(105%)"
    },
    {
        "id": "high_glamour",
        "title": "💄 Glamour Studio Light",
        "description": "Clean studio portrait lighting for a polished editorial finish.",
        "category": "Portrait",
        "filter": "brightness(120%) contrast(115%) saturate(110%)"
    },
    {
        "id": "matte_pop",
        "title": "📸 Modern Matte Finish",
        "description": "Soft matte styling designed for modern feed aesthetics.",
        "category": "Minimal",
        "filter": "contrast(88%) brightness(110%) saturate(135%)"
    },
    {
        "id": "hyper_pop",
        "title": "⚡ Ultra Color Pop",
        "description": "Maximum vibrancy and clarity for eye-catching social posts.",
        "category": "Social",
        "filter": "saturate(220%) contrast(130%) brightness(105%)"
    },
    {
        "id": "pearl_frost",
        "title": "✨ Pearl Frost",
        "description": "Fresh pastel whites and cool highlights for elegant product images.",
        "category": "Luxury",
        "filter": "brightness(118%) contrast(108%) saturate(80%) blur(0.2px)"
    },
    {
        "id": "midnight_edit",
        "title": "🌙 Midnight Edit",
        "description": "Dark cinematic polish with cool shadows and rich contrast.",
        "category": "Dark",
        "filter": "brightness(86%) contrast(135%) saturate(110%) hue-rotate(210deg)"
    }
]


@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')


@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)


@app.route('/api/presets', methods=['GET'])
def get_presets():
    return jsonify({"status": "success", "presets": PRESETS})


@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "service": "styleshift-ai"})


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)