import { Rive, Fit, Alignment, Layout, decodeImage, decodeFont } from "@rive-app/canvas";

const canvas = document.getElementById("rive-canvas");

// Create a responsive layout
const layout = new Layout({
    fit: Fit.Layout,  
    alignment: Alignment.Center,
});

// Import asset files that are used in the Rive animation
const assetFiles = {
    'Clausten': new URL('./Clausten-2952506.ttf', import.meta.url),
    'Inter': new URL('./Inter-594377.ttf', import.meta.url),
    'Le Monde Livre Std': new URL('./Le Monde Livre Std-2242253.ttf', import.meta.url),
    'Assets 2': new URL('./Assets 2-2951427.webp', import.meta.url),
    'Ball TExt': new URL('./Ball TExt-2951401.webp', import.meta.url),
    'Homepage Banner Hero - Mobile-1': new URL('./Homepage Banner Hero - Mobile-1-2952490.jpeg', import.meta.url),
    'Homepage Banner Hero - Mobile': new URL('./Homepage Banner Hero - Mobile-2956052.jpeg', import.meta.url)
};

// Function to load font asset
const loadFontAsset = async (asset) => {
    try {
        const fontName = asset.name;
        const fontUrl = assetFiles[fontName];
        if (!fontUrl) {
            console.error(`Font file not found for: ${fontName}`);
            return false;
        }

        const response = await fetch(fontUrl);
        const arrayBuffer = await response.arrayBuffer();
        const font = await decodeFont(new Uint8Array(arrayBuffer));
        
        asset.setFont(font);
        console.log(`Font loaded successfully: ${fontName}`);
        
        font.unref();
        return true;
    } catch (error) {
        console.error('Error loading font:', error);
        return false;
    }
};

// Function to load and decode an image file
const loadImageAsset = async (asset) => {
    console.log('Attempting to load image for asset:', asset.name);
    try {
        const imageUrl = assetFiles[asset.name];
        if (!imageUrl) {
            console.error(`Image file not found for: ${asset.name}`);
            return false;
        }

        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        const image = await decodeImage(uint8Array);
        console.log('Image decoded successfully:', asset.name);
        
        asset.setRenderImage(image);
        console.log('Image set to asset successfully:', asset.name);
        
        image.unref();
        return true;
    } catch (error) {
        console.error('Error in loadImageAsset:', error);
        return false;
    }
};

// Import the Rive file
const riveFile = new URL('./ad_12_runtime.riv', import.meta.url);

// Create new Rive instance
const r = new Rive({
    src: riveFile.href,
    canvas: canvas,
    layout: layout,
    autoplay: true,
    stateMachines: "State Machine 1",
    artboard: "Wide RT",
    onLoad: () => {
        console.log('Animation loaded successfully');
        console.log('Available state machines:', r.stateMachineNames);
        console.log('Current artboard:', r.activeArtboard?.name);
    },
    onLoadError: (err) => {
        console.error('Error loading animation:', err);
    },
    assetLoader: async (asset, _bytes) => {
        console.log('Loading asset:', asset.name, 'Type:', asset.cdnUuid);
        
        if (asset.isFont) {
            return await loadFontAsset(asset);
        } else if (asset.isImage) {
            return await loadImageAsset(asset);
        }
        return false;
    }
});

// Function to update canvas size
const updateCanvasSize = () => {
    const devicePixelRatio = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
};

// Add window resize listener
window.addEventListener('resize', updateCanvasSize);

// Initial canvas size setup
updateCanvasSize();

// Handle device pixel ratio changes
window.matchMedia('(resolution)').addEventListener('change', updateCanvasSize);
