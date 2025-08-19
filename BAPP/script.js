// Game state
let gameState = {
    isCountdownActive: true,
    isCakeIntact: true,
    hasFirstSliceBeenCut: false,
    isEnvelopePhase: false,
    isMessageShown: false
};

// DOM elements
const countdown = document.getElementById('countdown');
const gameContainer = document.getElementById('gameContainer');
const cake = document.getElementById('cake');
const cutLine = document.getElementById('cutLine');
const birthdayMessage = document.getElementById('birthdayMessage');
const envelopeContainer = document.getElementById('envelopeContainer');
const envelope = document.getElementById('envelope');
const letterPopup = document.getElementById('letterPopup');
const closeLetter = document.getElementById('closeLetter');
const confettiContainer = document.getElementById('confetti');
const cuttingSound = document.getElementById('cuttingSound');
const cheeringSound = document.getElementById('cheeringSound');

// Touch/Mouse tracking
let isDrawing = false;
let startX, startY, endX, endY;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    startCountdown();
    setupEventListeners();
    createBackgroundMusic();
});

// Countdown timer
function startCountdown() {
    let countdownNumber = document.getElementById('countdown-number');
    let count = 3;
    
    const countdownInterval = setInterval(() => {
        countdownNumber.textContent = count;
        countdownNumber.style.animation = 'none';
        
        // Trigger reflow to restart animation
        countdownNumber.offsetHeight;
        countdownNumber.style.animation = 'pulse 1s ease-in-out';
        
        count--;
        
        if (count < 0) {
            clearInterval(countdownInterval);
            endCountdown();
        }
    }, 1000);
}

function endCountdown() {
    countdown.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    gameState.isCountdownActive = false;
    
    // Add entrance animation to cake
    cake.style.animation = 'bounceIn 1s ease-out';
}

// Event listeners setup
function setupEventListeners() {
    // Mouse events
    cake.addEventListener('mousedown', startCutting);
    document.addEventListener('mousemove', updateCutting);
    document.addEventListener('mouseup', endCutting);
    
    // Touch events
    cake.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // Envelope click
    envelope.addEventListener('click', openEnvelope);
    envelope.addEventListener('touchstart', openEnvelope);
    
    // Letter popup close
    closeLetter.addEventListener('click', closeLetterPopup);
    letterPopup.addEventListener('click', function(e) {
        if (e.target === letterPopup || e.target.classList.contains('letter-overlay')) {
            closeLetterPopup();
        }
    });
}

// Mouse cutting functions
function startCutting(e) {
    if (!gameState.isCakeIntact || gameState.isCountdownActive) return;
    
    isDrawing = true;
    const rect = cake.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;
    
    cutLine.classList.remove('hidden');
    cake.style.cursor = 'grabbing';
}

function updateCutting(e) {
    if (!isDrawing || !gameState.isCakeIntact) return;
    
    const rect = cake.getBoundingClientRect();
    endX = e.clientX - rect.left;
    endY = e.clientY - rect.top;
    
    updateCutLineDisplay();
}

function endCutting(e) {
    if (!isDrawing || !gameState.isCakeIntact) return;
    
    isDrawing = false;
    cake.style.cursor = 'crosshair';
    
    // Check if cut is valid (minimum distance)
    const distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
    
    if (distance > 50) {
        performCut();
    } else {
        cutLine.classList.add('hidden');
    }
}

// Touch handling functions
function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    startCutting(mouseEvent);
}

function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    updateCutting(mouseEvent);
}

function handleTouchEnd(e) {
    e.preventDefault();
    const mouseEvent = new MouseEvent('mouseup', {});
    endCutting(mouseEvent);
}

// Update cut line display
function updateCutLineDisplay() {
    const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
    const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;
    
    cutLine.style.width = length + 'px';
    cutLine.style.left = startX + 'px';
    cutLine.style.top = startY + 'px';
    cutLine.style.transform = `rotate(${angle}deg)`;
    cutLine.style.transformOrigin = '0 50%';
}

// Perform cake cutting
function performCut() {
    if (!gameState.isCakeIntact) return;
    
    // Play cutting sound
    playCuttingSound();
    
    // Create cake slice animation
    createCakeSlice();
    
    // Update game state
    gameState.isCakeIntact = false;
    
    // Show birthday message if first cut
    if (!gameState.hasFirstSliceBeenCut) {
        gameState.hasFirstSliceBeenCut = true;
        setTimeout(() => {
            showBirthdayMessage();
        }, 500);
    }
    
    // Hide cut line
    setTimeout(() => {
        cutLine.classList.add('hidden');
    }, 100);
    
    // Create confetti
    createConfetti();
    
    // Transition to envelope phase
    setTimeout(() => {
        showEnvelope();
    }, 3000);
}

// Create cake slice animation
function createCakeSlice() {
    const cakeRect = cake.getBoundingClientRect();
    const slice = document.createElement('div');
    slice.className = 'cake-slice';
    
    // Style the slice to look like part of the cake
    slice.style.width = '80px';
    slice.style.height = '100px';
    slice.style.background = 'linear-gradient(45deg, #ff9a9e 0%, #fad0c4 100%)';
    slice.style.borderRadius = '10px';
    slice.style.position = 'absolute';
    slice.style.left = (startX - 40) + 'px';
    slice.style.top = (startY - 50) + 'px';
    slice.style.zIndex = '15';
    slice.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';
    
    cake.appendChild(slice);
    
    // Remove slice after animation
    setTimeout(() => {
        if (slice.parentNode) {
            slice.parentNode.removeChild(slice);
        }
    }, 2000);
}

// Show birthday message
function showBirthdayMessage() {
    birthdayMessage.classList.remove('hidden');
    playCheeringSound();
}

// Show envelope
function showEnvelope() {
    gameContainer.classList.add('hidden');
    envelopeContainer.classList.remove('hidden');
    gameState.isEnvelopePhase = true;
}

// Open envelope
function openEnvelope(e) {
    if (!gameState.isEnvelopePhase || gameState.isMessageShown) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Add open class to trigger envelope animation
    envelope.classList.add('open');
    gameState.isMessageShown = true;
    
    // Show letter popup after envelope opens
    setTimeout(() => {
        showLetterPopup();
    }, 800);
}

// Show letter popup window
function showLetterPopup() {
    letterPopup.classList.remove('hidden');
    createConfetti();
    playCheeringSound();
    
    // Prevent body scroll when popup is open
    document.body.style.overflow = 'hidden';
}

// Close letter popup
function closeLetterPopup() {
    letterPopup.classList.add('hidden');
    
    // Restore body scroll
    document.body.style.overflow = 'auto';
}

// Create confetti effect
function createConfetti() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#ff9a9e'];
    
    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            createConfettiPiece(colors[Math.floor(Math.random() * colors.length)]);
        }, i * 20);
    }
}

function createConfettiPiece(color) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti-piece';
    confetti.style.backgroundColor = color;
    confetti.style.left = Math.random() * window.innerWidth + 'px';
    confetti.style.animationDelay = Math.random() * 2 + 's';
    confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
    
    // Random shapes
    const shapes = ['square', 'circle', 'triangle'];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    
    switch (shape) {
        case 'circle':
            confetti.style.borderRadius = '50%';
            break;
        case 'triangle':
            confetti.style.width = '0';
            confetti.style.height = '0';
            confetti.style.backgroundColor = 'transparent';
            confetti.style.borderLeft = '5px solid transparent';
            confetti.style.borderRight = '5px solid transparent';
            confetti.style.borderBottom = `10px solid ${color}`;
            break;
    }
    
    confettiContainer.appendChild(confetti);
    
    // Remove confetti after animation
    setTimeout(() => {
        if (confetti.parentNode) {
            confetti.parentNode.removeChild(confetti);
        }
    }, 4000);
}

// Sound functions
function playCuttingSound() {
    try {
        cuttingSound.currentTime = 0;
        cuttingSound.play().catch(e => {
            console.log('Could not play cutting sound:', e);
        });
    } catch (e) {
        console.log('Sound not available');
    }
}

function playCheeringSound() {
    try {
        cheeringSound.currentTime = 0;
        cheeringSound.play().catch(e => {
            console.log('Could not play cheering sound:', e);
        });
    } catch (e) {
        console.log('Sound not available');
    }
}

// Create background music context
function createBackgroundMusic() {
    // Create a simple celebratory tone using Web Audio API
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        function playNote(frequency, duration, delay = 0) {
            setTimeout(() => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + duration);
            }, delay);
        }
        
        // Play happy birthday melody when cake is cut
        window.playHappyBirthdayMelody = function() {
            const melody = [
                { note: 264, duration: 0.5 }, // C
                { note: 264, duration: 0.5 }, // C
                { note: 297, duration: 1 },   // D
                { note: 264, duration: 1 },   // C
                { note: 352, duration: 1 },   // F
                { note: 330, duration: 2 }    // E
            ];
            
            let delay = 0;
            melody.forEach((note, index) => {
                playNote(note.note, note.duration, delay * 1000);
                delay += note.duration;
            });
        };
        
    } catch (e) {
        console.log('Web Audio API not supported');
    }
}

// Add some sparkle effects to candles
function addCandleSparkles() {
    const candles = document.querySelectorAll('.candle');
    
    candles.forEach((candle, index) => {
        setInterval(() => {
            const sparkle = document.createElement('div');
            sparkle.style.position = 'absolute';
            sparkle.style.width = '3px';
            sparkle.style.height = '3px';
            sparkle.style.backgroundColor = '#fff';
            sparkle.style.borderRadius = '50%';
            sparkle.style.top = '-20px';
            sparkle.style.left = '50%';
            sparkle.style.transform = 'translateX(-50%)';
            sparkle.style.opacity = '0.8';
            sparkle.style.animation = 'sparkleFloat 1s ease-out forwards';
            
            candle.appendChild(sparkle);
            
            setTimeout(() => {
                if (sparkle.parentNode) {
                    sparkle.parentNode.removeChild(sparkle);
                }
            }, 1000);
        }, Math.random() * 3000 + 1000);
    });
}

// Add sparkle animation
const sparkleCSS = `
@keyframes sparkleFloat {
    0% {
        transform: translateX(-50%) translateY(0) scale(1);
        opacity: 0.8;
    }
    100% {
        transform: translateX(-50%) translateY(-20px) scale(0);
        opacity: 0;
    }
}
`;

// Inject sparkle CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = sparkleCSS;
document.head.appendChild(styleSheet);

// Start candle sparkles after countdown
setTimeout(() => {
    if (!gameState.isCountdownActive) {
        addCandleSparkles();
    }
}, 6000);

// Add touch feedback for better mobile experience
function addTouchFeedback() {
    cake.addEventListener('touchstart', function() {
        this.style.transform = 'scale(0.98)';
    });
    
    cake.addEventListener('touchend', function() {
        this.style.transform = 'scale(1)';
    });
    
    envelope.addEventListener('touchstart', function() {
        this.style.transform = 'scale(0.98)';
    });
    
    envelope.addEventListener('touchend', function() {
        this.style.transform = 'scale(1.05)';
    });
}

// Initialize touch feedback
addTouchFeedback();

// Prevent default touch behaviors that might interfere
document.addEventListener('touchmove', function(e) {
    if (e.target.closest('.cake') || e.target.closest('.envelope')) {
        e.preventDefault();
    }
}, { passive: false });

// Add resize handler for responsive behavior
window.addEventListener('resize', function() {
    // Reset any ongoing interactions on resize
    if (isDrawing) {
        isDrawing = false;
        cutLine.classList.add('hidden');
        cake.style.cursor = 'crosshair';
    }
});

// Add keyboard support for accessibility
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
        if (gameState.isEnvelopePhase && !gameState.isMessageShown) {
            openEnvelope(e);
        }
    }
    
    // Close letter popup with Escape key
    if (e.key === 'Escape' && !letterPopup.classList.contains('hidden')) {
        closeLetterPopup();
    }
    
    if (gameState.isCakeIntact && !gameState.isCountdownActive) {
        if (e.key === 'Enter' || e.key === ' ') {
            // Simulate a cut in the center of the cake
            const rect = cake.getBoundingClientRect();
            startX = rect.width / 2 - 50;
            startY = rect.height / 2;
            endX = rect.width / 2 + 50;
            endY = rect.height / 2;
            performCut();
        }
    }
});

// Performance optimization: Cleanup old confetti
setInterval(() => {
    const oldConfetti = confettiContainer.querySelectorAll('.confetti-piece');
    oldConfetti.forEach(piece => {
        const rect = piece.getBoundingClientRect();
        if (rect.top > window.innerHeight + 100) {
            piece.remove();
        }
    });
}, 5000);
