import { useEffect, useRef } from 'react';
import kaboom from 'kaboom';
import { useNavigate } from 'react-router-dom';

function ShmupGame() {
    const canvasRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!canvasRef.current) return;

        const k = kaboom({
            canvas: canvasRef.current,
            background: [0, 0, 10],
            width: 1280,
            height: 720,
            letterbox: true,
            scale: 1,
        });

        // Helper to load sprite with transparency (software détourage)
        const loadTransparentSprite = async (name, url) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.src = url;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);

                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;

                    // Replace Magenta (#FF00FF and close variants) with Transparent
                    for (let i = 0; i < data.length; i += 4) {
                        const r = data[i];
                        const g = data[i + 1];
                        const b = data[i + 2];

                        // Check if pixel is Magenta-ish (r > 200, g < 100, b > 200)
                        if (r > 200 && g < 100 && b > 200) {
                            data[i + 3] = 0; // Alpha = 0
                        }
                    }

                    ctx.putImageData(imageData, 0, 0);

                    // Load into kaboom as a data URL
                    k.loadSprite(name, canvas.toDataURL()).then(() => resolve());
                };
                img.onerror = () => {
                    console.error(`Failed to load image: ${url}`);
                    resolve(); // Resolve anyway to not block
                };
            });
        };

        // Load Background normally (no transparency needed)
        k.loadSprite("stars", "/assets/game/background.png");

        // Load Ships with processing
        Promise.all([
            loadTransparentSprite("player", "/assets/game/player_ship_chroma.png"),
            loadTransparentSprite("enemy", "/assets/game/enemy_ship_chroma.png")
        ]).then(() => {
            // Start Game Logic after assets are processed

            k.scene("main", () => {
                // Background Tiling
                const bgScale = (k.width() / 640) + 0.01;
                const h = 640 * bgScale;

                const createBg = (y) => k.add([
                    k.sprite("stars"),
                    k.pos(0, y),
                    k.z(-10),
                    k.scale(bgScale),
                    k.opacity(0.4),
                    "bg"
                ]);

                createBg(0);
                createBg(-h + 1);
                createBg(-(h * 2) + 2);

                k.onUpdate("bg", (b) => {
                    b.pos.y += 120 * k.dt();
                    if (b.pos.y >= h) {
                        b.pos.y -= h * 3 - 3;
                    }
                });

                // Player Setup (Tight Hitbox)
                const player = k.add([
                    k.sprite("player"),
                    k.pos(k.width() / 2, k.height() - 150),
                    k.scale(0.3),
                    k.anchor("center"),
                    k.area({ shape: new k.Rect(k.vec2(-80, -80), 160, 160) }),
                    k.z(10),
                    // No shader needed!
                    "player",
                    {
                        speed: 800,
                        hp: 5,
                    }
                ]);

                // Simple movement logic
                k.onUpdate(() => {
                    if (!player.exists()) return;
                    const dt = k.dt();
                    const moveSpeed = player.speed * dt;

                    if (k.isKeyDown("left") && player.pos.x > 50) player.pos.x -= moveSpeed;
                    if (k.isKeyDown("right") && player.pos.x < k.width() - 50) player.pos.x += moveSpeed;
                    if (k.isKeyDown("up") && player.pos.y > 50) player.pos.y -= moveSpeed;
                    if (k.isKeyDown("down") && player.pos.y < k.height() - 50) player.pos.y += moveSpeed;
                });

                // Shooting
                const spawnBullet = (p) => {
                    k.add([
                        k.rect(10, 40),
                        k.pos(p),
                        k.area(),
                        k.color(0, 255, 255),
                        k.anchor("center"),
                        k.move(k.UP, 2000),
                        k.offscreen({ destroy: true }),
                        k.z(5),
                        "bullet",
                    ]);
                };

                k.onKeyPress("space", () => {
                    if (player.exists()) spawnBullet(player.pos.add(0, -80));
                });

                k.onMouseDown(() => {
                    if (player.exists()) spawnBullet(player.pos.add(0, -80));
                });

                // Enemy Spawning (Adjusted Hitbox)
                k.loop(0.8, () => {
                    k.add([
                        k.sprite("enemy"),
                        k.pos(k.rand(100, k.width() - 100), -200),
                        k.scale(0.25),
                        k.anchor("center"),
                        // Larger Hitbox (320x320) ~60% of sprite width for better collision feel
                        // Shifted +30px to align with sprite visual center
                        k.area({ shape: new k.Rect(k.vec2(-130, -160), 320, 320) }),
                        k.move(k.DOWN, k.rand(400, 700)),
                        k.offscreen({ destroy: true }),
                        k.z(10),
                        "enemy",
                    ]);
                });

                // Collisions
                k.onCollide("bullet", "enemy", (b, e) => {
                    k.destroy(b);
                    k.destroy(e);
                    k.addExplosion(e.pos, 30);
                    score.value += 100;
                    score.text = `Score: ${score.value}`;
                });

                k.onCollide("player", "enemy", (p, e) => {
                    k.destroy(e);
                    k.shake(15);
                    p.hp -= 1;
                    hpBar.text = `HP: ${p.hp}`;
                    k.addExplosion(e.pos, 20);
                    if (p.hp <= 0) {
                        k.destroy(p);
                        k.wait(1.5, () => k.go("gameover", score.value));
                    }
                });

                // UI
                const score = k.add([
                    k.text("Score: 0", { size: 40 }),
                    k.pos(40, 40),
                    k.z(100),
                    { value: 0 },
                ]);

                const hpBar = k.add([
                    k.text("HP: 5", { size: 40 }),
                    k.pos(k.width() - 220, 40),
                    k.z(100),
                ]);

                // Helper for explosions
                k.addExplosion = (p, n) => {
                    for (let i = 0; i < n; i++) {
                        k.add([
                            k.pos(p),
                            k.rect(k.rand(5, 15), k.rand(5, 15)),
                            k.color(k.choose([k.rgb(255, 150, 0), k.rgb(255, 255, 0), k.rgb(255, 255, 255)])),
                            k.move(k.rand(0, 360), k.rand(300, 1000)),
                            k.opacity(1),
                            k.lifespan(0.5),
                            k.z(20),
                            k.anchor("center"),
                        ]);
                    }
                };

                k.onKeyPress("escape", () => navigate('/'));
            });

            k.scene("gameover", (finalScore) => {
                k.add([
                    k.text("MISSION FAILED", { size: 80 }),
                    k.pos(k.width() / 2, k.height() / 2 - 80),
                    k.anchor("center"),
                    k.color(255, 50, 50),
                ]);

                k.add([
                    k.text(`Final Score: ${finalScore}`, { size: 48 }),
                    k.pos(k.width() / 2, k.height() / 2 + 50),
                    k.anchor("center"),
                ]);

                k.add([
                    k.text("SPACE TO RETRY", { size: 32 }),
                    k.pos(k.width() / 2, k.height() / 2 + 150),
                    k.anchor("center"),
                    k.color(200, 200, 200),
                ]);

                k.onKeyPress("space", () => k.go("main"));
                k.onKeyPress("escape", () => navigate('/'));
            });

            k.go("main");
        });

        return () => {
            // Kaboom cleanup happens automatically on effect destruction or k.destroy()
        };
    }, [navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#010108] p-4 sm:p-8 font-sans overflow-hidden select-none">
            <div className="mb-8 flex flex-col sm:flex-row justify-between w-full max-w-[1280px] items-center gap-4">
                <div className="flex items-center gap-4">
                    <span className="text-5xl">🚀</span>
                    <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500 tracking-tighter uppercase italic drop-shadow-[0_0_20px_rgba(0,180,255,0.4)]">
                        Antigravity Shmup
                    </h1>
                </div>
                <button
                    onClick={() => navigate('/')}
                    className="px-8 py-3 bg-white/5 text-white rounded-full border border-white/10 hover:bg-white/15 transition-all font-bold backdrop-blur-xl flex items-center gap-2"
                >
                    ← Exit to Base
                </button>
            </div>

            <div className="w-full max-w-[1280px] aspect-video rounded-3xl overflow-hidden shadow-[0_0_150px_rgba(0,120,255,0.25)] border-4 border-white/5 bg-black">
                <canvas
                    ref={canvasRef}
                    className="w-full h-full block cursor-crosshair"
                ></canvas>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-10 text-gray-700 text-[10px] font-black uppercase tracking-[0.4em] opacity-50">
                <span className="flex items-center gap-2"><kbd className="bg-white/10 px-2 py-1 rounded">ARROWS</kbd> Navigate</span>
                <span className="flex items-center gap-2"><kbd className="bg-white/10 px-2 py-1 rounded">SPACE</kbd> Fire</span>
                <span className="flex items-center gap-2"><kbd className="bg-white/10 px-2 py-1 rounded">ESC</kbd> Abort</span>
            </div>
        </div>
    );
}

export default ShmupGame;
