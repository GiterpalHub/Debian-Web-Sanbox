export const defaultEnv = `
# Edit values to personalize your portfolio
NAME=Alex Doe
TITLE=Full Stack Developer
BIO=A passionate developer specializing in creating modern, responsive web applications.
SKILLS=React, Node.js, JavaScript, Python, SQL, Docker
PROJECT_1_NAME=Project Alpha
PROJECT_1_DESC=A full-stack e-commerce platform built with the MERN stack.
PROJECT_2_NAME=Project Beta
PROJECT_2_DESC=A data visualization dashboard using D3.js and React.
GITHUB_USERNAME=alex-doe
LINKEDIN_USERNAME=alexdoe
EMAIL=alex.doe@example.com
`;

export const templateHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{NAME}}'s Portfolio</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet">
    <style>{{CSS}}</style>
</head>
<body>

    <header class="hero">
        <div class="hero-content">
            <h1 class="fade-in-down">{{NAME}}</h1>
            <p class="fade-in-down" style="animation-delay: 0.2s;">{{TITLE}}</p>
            <a href="mailto:{{EMAIL}}" class="cta-button fade-in-down" style="animation-delay: 0.4s;">Hire Me</a>
        </div>
    </header>

    <main>
        <section class="about fade-in-up">
            <h2>About Me</h2>
            <p>{{BIO}}</p>
        </section>

        <section class="skills fade-in-up">
            <h2>My Skills</h2>
            <div id="skills-container" data-skills="{{SKILLS}}">
                </div>
        </section>

        <section class="projects fade-in-up">
            <h2>Projects</h2>
            <div class="projects-grid">
                <div class="project-card">
                    <h3>{{PROJECT_1_NAME}}</h3>
                    <p>{{PROJECT_1_DESC}}</p>
                </div>
                <div class="project-card">
                    <h3>{{PROJECT_2_NAME}}</h3>
                    <p>{{PROJECT_2_DESC}}</p>
                </div>
            </div>
        </section>
    </main>

    <footer class="contact fade-in-up">
        <h2>Get in Touch</h2>
        <div class="contact-links">
            <a href="https://github.com/{{GITHUB_USERNAME}}" target="_blank">GitHub</a>
            <a href="https://linkedin.com/in/{{LINKEDIN_USERNAME}}" target="_blank">LinkedIn</a>
            <a href="mailto:{{EMAIL}}">Email</a>
        </div>
        <p class="footer-credit">© 2025 {{NAME}}. Built via Debian Web Sandbox.</p>
    </footer>

    <script>{{JS}}</script>
</body>
</html>
`;

export const templateCSS = `
:root {
    --primary-color: #0000aa;
    --secondary-color: #0d0d2b;
    --text-color: #333;
    --light-gray: #f4f4f9;
    --white: #ffffff;
    --shadow: 0 4px 12px rgba(0,0,0,0.05);
}

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background-color: var(--white);
    color: var(--text-color);
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
}

/* Hero Section */
.hero {
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    color: var(--white);
    height: 70vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 0 1rem;
}

.hero-content h1 {
    font-size: 3.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
}

.hero-content p {
    font-size: 1.25rem;
    opacity: 0.9;
    margin-bottom: 1.5rem;
}

.cta-button {
    display: inline-block;
    background: var(--white);
    color: var(--primary-color);
    padding: 0.75rem 1.5rem;
    border-radius: 5px;
    text-decoration: none;
    font-weight: 500;
    font-size: 1rem;
    transition: all 0.3s ease;
}

.cta-button:hover {
    background: var(--light-gray);
    transform: translateY(-2px);
}

/* Main Content */
main {
    max-width: 900px;
    width: 90%;
    margin: 0 auto;
    padding: 2rem 0;
}

section {
    padding: 2.5rem 0;
    border-bottom: 1px solid #e0e0e0;
}

section:last-of-type {
    border-bottom: none;
}

section h2 {
    font-size: 2rem;
    color: var(--primary-color);
    margin-bottom: 1.5rem;
}

/* Skills Section */
.skills-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
}

.skill-tag {
    background-color: var(--light-gray);
    color: var(--primary-color);
    padding: 0.5rem 1rem;
    border-radius: 25px;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.3s ease;
}

.skill-tag:hover {
    background-color: var(--primary-color);
    color: var(--white);
}

/* Projects Section */
.projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
}

.project-card {
    background: var(--white);
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: var(--shadow);
    transition: all 0.3s ease;
}

.project-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.08);
}

.project-card h3 {
    color: var(--primary-color);
    margin-bottom: 0.5rem;
}

/* Footer (Contact) */
footer.contact {
    background-color: var(--secondary-color);
    color: var(--white);
    text-align: center;
    padding: 3rem 1rem;
}

footer.contact h2 {
    color: var(--white);
    margin-bottom: 1.5rem;
}

.contact-links {
    margin-bottom: 1.5rem;
}

.contact-links a {
    color: var(--white);
    text-decoration: none;
    font-size: 1.1rem;
    margin: 0 1rem;
    transition: opacity 0.3s ease;
}

.contact-links a:hover {
    opacity: 0.7;
}

.footer-credit {
    font-size: 0.9rem;
    opacity: 0.6;
}

/* Animations */
@keyframes fadeInDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

.fade-in-down {
    opacity: 0;
    animation: fadeInDown 0.6s ease-out forwards;
}

.fade-in-up {
    opacity: 0;
    /* We'll use JS to trigger this on scroll, but for now, just fade it in */
    animation: fadeInUp 0.6s ease-out forwards;
    animation-delay: 0.2s; /* Apply a small base delay */
}
`;

export const templateJS = `
console.log("Portfolio script loaded for {{NAME}}");


document.addEventListener('DOMContentLoaded', () => {
    const skillsContainer = document.getElementById('skills-container');
    const skillsString = skillsContainer.dataset.skills || "";
    const skillsArray = skillsString.split(',').map(skill => skill.trim()).filter(skill => skill);

    skillsContainer.innerHTML = ''; 

    if (skillsArray.length > 0) {
        skillsArray.forEach(skill => {
            const skillTag = document.createElement('span');
            skillTag.className = 'skill-tag';
            skillTag.textContent = skill;
            skillsContainer.appendChild(skillTag);
        });
    } else {
        skillsContainer.textContent = "No skills listed.";
    }
});
`;
