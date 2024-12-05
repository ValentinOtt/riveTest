import "./style.css";
import { Rive, Fit, Alignment, Layout, decodeImage, decodeFont } from "@rive-app/canvas";

const canvas = document.getElementById("rive-canvas");

// Create a more responsive layout
const layout = new Layout({
    fit: Fit.Layout,  
    alignment: Alignment.Center,
});

// Import all asset files
const assetFiles = {
    'Badge New 3': new URL('./Badge New 3-2705903.webp', import.meta.url),
    'Badge New 2': new URL('./Badge New 2-2699150.webp', import.meta.url),
    'Badge New 1 F': new URL('./Badge New 1 F-2699137.webp', import.meta.url),
    'Badge New 3 f': new URL('./Badge New 3 f-2705904.webp', import.meta.url),
    'kit1_1': new URL('./kit1_1-2672703.png', import.meta.url),
    'kit1_2': new URL('./kit1_2-2672706.png', import.meta.url),
    'kit1_3': new URL('./kit1_3-2672705.png', import.meta.url),
    'kit1_4': new URL('./kit1_4-2672707.png', import.meta.url),
    'Inter': new URL('./Inter-594377.ttf', import.meta.url),
    'Le Monde Livre Std': new URL('./Le Monde Livre Std-2242253.ttf', import.meta.url),
    'Tall 2': new URL('./Tall 2-2701872.jpeg', import.meta.url)
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
        
        // Set the font to the asset
        asset.setFont(font);
        console.log(`Font loaded successfully: ${fontName}`);
        
        // Clean up the font reference
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
        
        // Decode the image
        const image = await decodeImage(uint8Array);
        console.log('Image decoded successfully:', asset.name);
        
        // Set the image to the asset
        asset.setRenderImage(image);
        console.log('Image set to asset successfully:', asset.name);
        
        // Release the reference
        image.unref();
        return true;
    } catch (error) {
        console.error('Error in loadImageAsset:', error);
        return false;
    }
};

// Import the Rive file as a URL
const riveFile = new URL('./banner.riv', import.meta.url);

// New Rive instance
const r = new Rive({
    src: riveFile.href,
    canvas: canvas,
    layout: layout,
    autoplay: true,
    stateMachines: "Top Bar SM",
    artboard: "Top Bar",
    onLoad: () => {
        console.log('Animation loaded successfully');
        console.log('Available state machines:', r.stateMachineNames);
        console.log('Current artboard:', r.activeArtboard?.name);
        
        // Initial resize
        updateCanvasSize();
    },
    onLoadError: (err) => {
        console.error('Error loading animation:', err);
    },
    assetLoader: (asset, bytes) => {
        console.log('Asset loader called for:', {
            name: asset.name,
            fileExtension: asset.fileExtension,
            isImage: asset.isImage,
            isFont: asset.isFont,
            cdnUuid: asset.cdnUuid
        });

        // If the asset has bytes or a CDN UUID, let Rive handle it
        if (asset.cdnUuid.length > 0 || bytes.length > 0) {
            return false;
        }

        if (asset.isImage) {
            return loadImageAsset(asset);
        } else if (asset.isFont) {
            return loadFontAsset(asset);
        }
        
        console.log('Asset not handled by our loader');
        return false;
    }
});

// Function to update canvas size
function updateCanvasSize() {
    const container = canvas.parentElement;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Set canvas size to match container
    canvas.width = containerWidth;
    canvas.height = containerHeight;
    
    // Update Rive layout
    r.layout = new Layout({
        fit: Fit.Layout,
        alignment: Alignment.Center,
    });
    
    // Resize the drawing surface
    r.resizeDrawingSurfaceToCanvas();
}

// Add window resize listener
window.addEventListener('resize', updateCanvasSize);

// Add device pixel ratio change listener
window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`)
    .addEventListener('change', updateCanvasSize);