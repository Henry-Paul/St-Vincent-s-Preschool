// Enhanced Canvas functionality
class DrawingCanvas {
    constructor() {
        this.canvas = document.getElementById('drawing-canvas');
        this.ctx = null;
        this.isDrawing = false;
        this.currentTool = 'brush';
        this.currentColor = 'black';
        this.brushSize = 5;
        
        this.init();
    }
    
    init() {
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        this.setupEventListeners();
        this.setupControls();
    }
    
    setupCanvas() {
        this.resizeCanvas();
        
        // Set initial drawing styles
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.lineWidth = this.brushSize;
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.fillStyle = this.currentColor;
    }
    
    resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.parentElement.getBoundingClientRect();
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        this.canvas.style.width = `${rect.width}px`;
        this.canvas.style.height = `${rect.height}px`;
        
        this.ctx.scale(dpr, dpr);
        
        // Draw grid background
        this.drawGridBackground();
        
        // Reset drawing settings
        this.ctx.lineWidth = this.brushSize;
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.fillStyle = this.currentColor;
    }
    
    drawGridBackground() {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid lines
        this.ctx.strokeStyle = 'rgba(0,0,0,0.05)';
        this.ctx.lineWidth = 1;
        const gridSize = 20;
        
        for (let x = 0; x <= this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
    
    getPosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        const evt = e.touches ? e.touches[0] : e;
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }
    
    startDrawing(e) { 
        this.isDrawing = true; 
        const {x,y} = this.getPosition(e); 
        
        if (this.currentTool === 'brush') {
            this.ctx.beginPath(); 
            this.ctx.moveTo(x,y); 
        } else if (this.currentTool === 'fill') {
            this.floodFill(x, y);
        }
    }
    
    draw(e) { 
        if (!this.isDrawing || this.currentTool !== 'brush') return; 
        e.preventDefault(); 
        const {x,y} = this.getPosition(e); 
        this.ctx.lineTo(x,y); 
        this.ctx.stroke(); 
    }
    
    stopDrawing() { 
        this.isDrawing = false; 
        if (this.currentTool === 'brush') {
            this.ctx.closePath(); 
        }
    }
    
    // Flood fill algorithm
    floodFill(startX, startY) {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const targetColor = this.getPixelColor(imageData, startX, startY);
        const replacementColor = this.hexToRgb(this.currentColor);
        
        this.floodFillRecursive(imageData, Math.floor(startX), Math.floor(startY), targetColor, replacementColor);
        this.ctx.putImageData(imageData, 0, 0);
    }
    
    getPixelColor(imageData, x, y) {
        const index = (Math.floor(y) * imageData.width + Math.floor(x)) * 4;
        return {
            r: imageData.data[index],
            g: imageData.data[index + 1],
            b: imageData.data[index + 2],
            a: imageData.data[index + 3]
        };
    }
    
    setPixelColor(imageData, x, y, color) {
        const index = (y * imageData.width + x) * 4;
        imageData.data[index] = color.r;
        imageData.data[index + 1] = color.g;
        imageData.data[index + 2] = color.b;
        imageData.data[index + 3] = color.a || 255;
    }
    
    colorsMatch(a, b, tolerance = 1) {
        return Math.abs(a.r - b.r) <= tolerance &&
               Math.abs(a.g - b.g) <= tolerance &&
               Math.abs(a.b - b.b) <= tolerance &&
               Math.abs(a.a - (b.a || 255)) <= tolerance;
    }
    
    hexToRgb(hex) {
        if (hex === 'black') return {r: 0, g: 0, b: 0};
        
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : {r: 0, g: 0, b: 0};
    }
    
    floodFillRecursive(imageData, x, y, targetColor, replacementColor) {
        if (x < 0 || x >= imageData.width || y < 0 || y >= imageData.height) {
            return;
        }
        
        const currentColor = this.getPixelColor(imageData, x, y);
        
        if (!this.colorsMatch(currentColor, targetColor)) {
            return;
        }
        
        this.setPixelColor(imageData, x, y, replacementColor);
        
        this.floodFillRecursive(imageData, x + 1, y, targetColor, replacementColor);
        this.floodFillRecursive(imageData, x - 1, y, targetColor, replacementColor);
        this.floodFillRecursive(imageData, x, y + 1, targetColor, replacementColor);
        this.floodFillRecursive(imageData, x, y - 1, targetColor, replacementColor);
    }
    
    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseleave', () => this.stopDrawing());
        
        // Touch events
        this.canvas.addEventListener('touchstart', (e) => this.startDrawing(e));
        this.canvas.addEventListener('touchmove', (e) => this.draw(e));
        this.canvas.addEventListener('touchend', () => this.stopDrawing());
        
        // Window resize
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    setupControls() {
        // Color selection
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentColor = e.target.dataset.color;
                document.querySelector('.color-btn.active').classList.remove('active');
                e.target.classList.add('active');
                
                if (this.currentTool !== 'eraser') {
                    this.ctx.strokeStyle = this.currentColor;
                    this.ctx.fillStyle = this.currentColor;
                }
                
                // Update brush preview
                document.getElementById('brush-preview').style.backgroundColor = this.currentColor;
            });
        });
        
        // Tool selection
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentTool = e.currentTarget.dataset.tool;
                document.querySelector('.tool-btn.active').classList.remove('active');
                e.currentTarget.classList.add('active');
                
                if (this.currentTool === 'eraser') {
                    this.ctx.strokeStyle = 'white';
                    this.ctx.fillStyle = 'white';
                } else {
                    this.ctx.strokeStyle = this.currentColor;
                    this.ctx.fillStyle = this.currentColor;
                }
            });
        });
        
        // Brush size control
        const brushSizeControl = document.getElementById('brush-size');
        const brushPreview = document.getElementById('brush-preview');
        
        brushSizeControl.addEventListener('input', (e) => {
            this.brushSize = parseInt(e.target.value);
            this.ctx.lineWidth = this.brushSize;
            
            // Update brush preview size
            const size = Math.max(5, this.brushSize / 2);
            brushPreview.style.width = `${size}px`;
            brushPreview.style.height = `${size}px`;
        });
        
        // Clear canvas
        document.getElementById('clear-canvas-btn').addEventListener('click', () => {
            if (confirm('Are you sure you want to clear the canvas?')) {
                this.ctx.fillStyle = 'white';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                this.drawGridBackground();
            }
        });
        
        // Save canvas
        document.getElementById('save-canvas-btn').addEventListener('click', () => {
            const dataURL = this.canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = 'st-vincents-drawing.png';
            link.href = dataURL;
            link.click();
        });
        
        // Random color
        document.getElementById('random-color-btn').addEventListener('click', () => {
            const colors = ['#ef4444', '#3b82f6', '#22c55e', '#facc15', '#a855f7', '#ec4899', '#f97316', '#14b8a6'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            this.currentColor = randomColor;
            
            // Update active color button
            document.querySelector('.color-btn.active').classList.remove('active');
            const colorBtn = document.querySelector(`.color-btn[data-color="${randomColor}"]`);
            if (colorBtn) {
                colorBtn.classList.add('active');
            }
            
            if (this.currentTool !== 'eraser') {
                this.ctx.strokeStyle = this.currentColor;
                this.ctx.fillStyle = this.currentColor;
            }
            
            // Update brush preview
            document.getElementById('brush-preview').style.backgroundColor = this.currentColor;
        });
        
        // Set initial brush preview
        document.getElementById('brush-preview').style.width = `${this.brushSize/2}px`;
        document.getElementById('brush-preview').style.height = `${this.brushSize/2}px`;
    }
}

// Initialize canvas when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DrawingCanvas();
});
