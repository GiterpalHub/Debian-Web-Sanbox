export const defaultEnv = `
# KONFIGURASI PROFIL PENGGUNA (CYBERPUNK THEME)
FULLNAME=Your Name

NAME=Hacker One
TITLE=System Architect & Fullstack Operative
BIO=Operative detected. Specializing in breaching secure systems and building robust web infrastructures. Mission status: Active.
SKILLS=JavaScript, React.js, Cyber Security, Python, Linux, Docker, SQL
PROJECT_1_NAME=Project Red Protocol
PROJECT_1_DESC=A decentralized secure communication tool built for anonymous data transfer.
PROJECT_2_NAME=Neural Network Dashboard
PROJECT_2_DESC=AI-driven visualization interface for tracking real-time server metrics.
GITHUB_USERNAME=hacker-one
LINKEDIN_USERNAME=hackerone
EMAIL=contact@hacker.one
`;

export const templateHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SAFE_MODE // {{NAME}}</title>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Russo+One&display=swap" rel="stylesheet">
    <style>{{CSS}}</style>
</head>
<body>
    <div class="scanlines"></div>
    <div class="noise"></div>
    
    <div class="container">
        <header class="cyber-header">
            <div class="header-decoration top-left"></div>
            <div class="header-decoration top-right"></div>
            
            <div class="identity-box">
                <div class="glitch-wrapper">
                    <h1 class="glitch" data-text="{{NAME}}">{{NAME}}</h1>
                </div>
                <div class="status-bar">
                    <span class="status-dot"></span> SYSTEM ONLINE // MODE: SAFE
                </div>
                <p class="role-title">{{TITLE}}</p>
            </div>
            
            <div class="action-module">
                <a href="mailto:{{EMAIL}}" class="cyber-btn primary">
                    <span class="btn-content">INITIATE_CONTACT</span>
                    <span class="btn-glitch"></span>
                </a>
            </div>
        </header>

        <main>
            <section class="panel about-panel">
                <h2 class="section-title">01_USER_PROFILE</h2>
                <div class="terminal-box">
                    <p class="typing-effect">{{BIO}}</p>
                </div>
            </section>

            <section class="panel skills-panel">
                <h2 class="section-title">02_CAPABILITIES</h2>
                <div class="skills-grid" id="skills-container" data-skills="{{SKILLS}}">
                    </div>
            </section>

            <section class="panel projects-panel">
                <h2 class="section-title">03_HOSTER_ARCHIVES</h2>
                <div class="projects-grid">
                    <div class="project-card">
                        <div class="card-header">
                            <span class="folder-icon">DIR://001</span>
                            <h3>{{PROJECT_1_NAME}}</h3>
                        </div>
                        <div class="card-body">
                            <p>{{PROJECT_1_DESC}}</p>
                        </div>
                        <div class="card-footer">
                            <span class="hash">#ENCRYPTED</span>
                        </div>
                    </div>

                    <div class="project-card">
                        <div class="card-header">
                            <span class="folder-icon">DIR://002</span>
                            <h3>{{PROJECT_2_NAME}}</h3>
                        </div>
                        <div class="card-body">
                            <p>{{PROJECT_2_DESC}}</p>
                        </div>
                        <div class="card-footer">
                            <span class="hash">#PUBLIC</span>
                        </div>
                    </div>
                </div>
            </section>
        </main>

        <footer class="cyber-footer">
            <div class="footer-links">
                <a href="https://github.com/{{GITHUB_USERNAME}}" target="_blank" class="link-item">[ GITHUB_REPO ]</a>
                <a href="https://linkedin.com/in/{{LINKEDIN_USERNAME}}" target="_blank" class="link-item">[ LINKEDIN_FLEX ]</a>
            </div>
            <div class="system-msg">
                <p>© 2025 SYSTEM SECURE. POWERED BY HIMA TRPL x GITERPAL</p>
            </div>
        </footer>
    </div>

    <script>{{JS}}</script>
</body>
</html>
`;

export const templateCSS = `
:root {
    --bg-color: #050505;
    --panel-bg: #0a0a0a;
    --primary-color: #be29ec; /* UNGU NEON */
    --dim-color: #3d004e;     /* UNGU GELAP */
    --text-main: #e0e0e0;
    --text-dim: #888;
    --font-head: 'Russo One', sans-serif;
    --font-code: 'JetBrains Mono', monospace;
}

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    background-color: var(--bg-color);
    color: var(--text-main);
    font-family: var(--font-code);
    overflow-x: hidden;
    line-height: 1.6;
}

/* Background Effects */
.scanlines {
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.2));
    background-size: 100% 4px;
    pointer-events: none;
    z-index: 10;
    opacity: 0.6;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
    position: relative;
    z-index: 2;
}

/* Header / Hero */
.cyber-header {
    border: 1px solid var(--dim-color);
    padding: 3rem 2rem;
    margin-bottom: 3rem;
    position: relative;
    background: radial-gradient(circle at top right, #1a001a, #000); /* Aksen Ungu Gelap */
    clip-path: polygon(0 0, 100% 0, 100% 85%, 95% 100%, 0 100%);
}

.header-decoration {
    position: absolute;
    width: 20px;
    height: 20px;
    border: 2px solid var(--primary-color);
    transition: all 0.3s ease;
}
.top-left { top: 10px; left: 10px; border-right: none; border-bottom: none; }
.top-right { top: 10px; right: 10px; border-left: none; border-bottom: none; }

.identity-box h1 {
    font-family: var(--font-head);
    font-size: clamp(2.5rem, 5vw, 4rem);
    color: var(--primary-color);
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 0.5rem;
    text-shadow: 0 0 10px rgba(190, 41, 236, 0.5); /* Glow Ungu */
}

.role-title {
    font-size: 1.2rem;
    color: var(--text-main);
    margin-bottom: 1.5rem;
}

.status-bar {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-size: 0.8rem;
    background: var(--dim-color);
    color: var(--primary-color);
    padding: 4px 10px;
    margin-bottom: 1rem;
    border: 1px solid var(--primary-color);
}

.status-dot {
    width: 8px;
    height: 8px;
    background-color: var(--primary-color);
    border-radius: 50%;
    box-shadow: 0 0 8px var(--primary-color);
    animation: blink 2s infinite;
}

/* Sections */
.panel {
    margin-bottom: 4rem;
}

.section-title {
    font-family: var(--font-head);
    color: var(--text-main);
    font-size: 1.5rem;
    border-bottom: 2px solid var(--dim-color);
    padding-bottom: 0.5rem;
    margin-bottom: 1.5rem;
    display: inline-block;
}

/* About Terminal Box */
.terminal-box {
    background: rgba(190, 41, 236, 0.05); /* Ungu Transparan */
    border-left: 3px solid var(--primary-color);
    padding: 1.5rem;
    font-size: 1.1rem;
}

/* Skills Grid */
.skills-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1rem;
}

.skill-chip {
    background: #000;
    border: 1px solid var(--text-dim);
    color: var(--text-main);
    padding: 0.8rem;
    text-align: center;
    font-size: 0.9rem;
    text-transform: uppercase;
    transition: 0.3s;
    position: relative;
    overflow: hidden;
}

.skill-chip:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
    box-shadow: 0 0 15px rgba(190, 41, 236, 0.2);
    transform: translateY(-2px);
}

.skill-chip::before {
    content: '';
    position: absolute;
    top: 0; left: 0; width: 2px; height: 100%;
    background: var(--primary-color);
    opacity: 0;
    transition: 0.3s;
}
.skill-chip:hover::before { opacity: 1; }

/* Projects Grid */
.projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

.project-card {
    background: var(--panel-bg);
    border: 1px solid #333;
    padding: 0;
    transition: 0.3s;
    position: relative;
}

.project-card:hover {
    border-color: var(--primary-color);
}

.card-header {
    background: #111;
    padding: 1rem;
    border-bottom: 1px solid #333;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.card-header h3 {
    color: var(--primary-color);
    font-size: 1.1rem;
}

.folder-icon {
    font-size: 0.7rem;
    color: #666;
}

.card-body {
    padding: 1.5rem;
    min-height: 100px;
}

.card-footer {
    padding: 0.5rem 1.5rem;
    border-top: 1px solid #222;
    text-align: right;
    font-size: 0.8rem;
    color: #666;
}

/* Button */
.cyber-btn {
    position: relative;
    display: inline-block;
    padding: 1rem 2rem;
    background: transparent;
    color: var(--primary-color);
    text-decoration: none;
    text-transform: uppercase;
    font-weight: bold;
    border: 1px solid var(--primary-color);
    transition: 0.2s;
    clip-path: polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%);
}

.cyber-btn:hover {
    background: var(--primary-color);
    color: #000;
    box-shadow: 0 0 20px rgba(190, 41, 236, 0.4);
}

/* Footer */
.cyber-footer {
    margin-top: 4rem;
    border-top: 2px solid #222;
    padding-top: 2rem;
    text-align: center;
}

.footer-links {
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin-bottom: 1.5rem;
}

.link-item {
    color: var(--text-dim);
    text-decoration: none;
    transition: 0.3s;
    position: relative;
}

.link-item:hover {
    color: var(--primary-color);
    letter-spacing: 1px;
    text-shadow: 0 0 8px var(--primary-color);
}

.system-msg {
    font-size: 0.75rem;
    color: #444;
}

/* Animations */
@keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
}

@media (max-width: 768px) {
    .cyber-header {
        padding: 2rem 1rem;
        clip-path: none;
        border-bottom: 4px solid var(--primary-color);
    }
    
    .identity-box h1 {
        font-size: 2rem;
    }
    
    .footer-links {
        flex-direction: column;
        gap: 1rem;
    }
}
`;

export const templateJS = `
document.addEventListener('DOMContentLoaded', () => {
    // 1. Skill Rendering
    const skillsContainer = document.getElementById('skills-container');
    const skillsString = skillsContainer.dataset.skills || "";
    const skillsArray = skillsString.split(',').map(s => s.trim()).filter(s => s);

    skillsContainer.innerHTML = ''; 

    if (skillsArray.length > 0) {
        skillsArray.forEach((skill, index) => {
            const chip = document.createElement('div');
            chip.className = 'skill-chip';
            chip.innerHTML = \`\${skill} <span style="font-size:0.6em; float:right; opacity:0.5">Lv.\${Math.floor(Math.random() * 9) + 1}</span>\`;
            
            // Stagger animation
            chip.style.animation = \`fadeIn 0.5s ease forwards \${index * 0.1}s\`;
            chip.style.opacity = '0'; // Initial state for JS animation
            
            skillsContainer.appendChild(chip);
            
            // Manual fade in via JS just in case
            setTimeout(() => { chip.style.opacity = '1'; }, index * 100);
        });
    }

    // 2. Glitch Text Effect on Header
    const glitchTitle = document.querySelector('.glitch');
    if(glitchTitle) {
        let originalText = glitchTitle.getAttribute('data-text');
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*";
        
        let interval = null;
        
        glitchTitle.onmouseover = event => {  
            let iteration = 0;
            clearInterval(interval);
            
            interval = setInterval(() => {
                event.target.innerText = event.target.innerText
                .split("")
                .map((letter, index) => {
                    if(index < iteration) {
                        return originalText[index];
                    }
                    return letters[Math.floor(Math.random() * 26)];
                })
                .join("");
                
                if(iteration >= originalText.length){ 
                    clearInterval(interval);
                }
                
                iteration += 1 / 3;
            }, 30);
        }
    }
});
`;
