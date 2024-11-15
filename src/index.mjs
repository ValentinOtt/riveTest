import "./style.css";
import { Rive, Fit, Alignment, Layout, decodeImage } from "@rive-app/canvas";

const canvas = document.getElementById("rive-canvas");

// Create a more responsive layout
const layout = new Layout({
    fit: Fit.Contain,  
    alignment: Alignment.Center,
});

// Import image file
const imageFile = new URL('./Tall 2-2701872.jpeg', import.meta.url);

// Function to convert JPEG to PNG using canvas
const convertToPNG = async (sourceUrl) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            // Create a canvas to draw the image
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            
            // Draw image and convert to PNG
            ctx.drawImage(img, 0, 0);
            
            // Convert to PNG data URL
            try {
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, 'image/png');
            } catch (error) {
                reject(error);
            }
        };
        img.onerror = (e) => {
            console.error('Image load error:', e);
            reject(new Error('Failed to load image: ' + sourceUrl));
        };

        console.log('Attempting to load image from:', sourceUrl);
        img.src = sourceUrl;
    });
};

// Function to load and decode an image file
const loadImageAsset = async (asset) => {
    console.log('Attempting to load image for asset:', asset.name);
    try {
        // Convert JPEG to PNG using the imported URL
        const pngBlob = await convertToPNG(imageFile.href);
        console.log('Image converted to PNG');

        // Convert blob to array buffer
        const arrayBuffer = await pngBlob.arrayBuffer();
        console.log('PNG converted to array buffer, size:', arrayBuffer.byteLength);

        // Create Uint8Array from array buffer
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Decode the image
        const image = await decodeImage(uint8Array);
        console.log('Image decoded successfully');
        
        // Set the image to the asset
        asset.setRenderImage(image);
        console.log('Image set to asset successfully');
        
        // Release the reference
        image.unref();
        return true;
    } catch (error) {
        console.error('Error in loadImageAsset:', error);
        return false;
    }
};

// Import the Rive file as a URL
const riveFile = new URL('./ad_10.riv', import.meta.url);

// New Rive instance
const r = new Rive({
    src: riveFile.href,
    canvas: canvas,
    layout: layout,
    autoplay: true,
    stateMachines: "State Machine 1",
    artboard: "Tall RT 2",
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

        if (asset.isImage && asset.name === "Tall 2") {
            console.log('Found matching image asset, loading...');
            loadImageAsset(asset);
            return true;
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
        fit: Fit.Contain,
        alignment: Alignment.Center,
    });
    
    // Resize the drawing surface
    r.resizeDrawingSurfaceToCanvas();
}

// Add window resize handler with debounce
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        updateCanvasSize();
    }, 100);
}, false);