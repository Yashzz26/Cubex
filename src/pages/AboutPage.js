class AboutPage {
  constructor() {
    this.name = 'AboutPage';
  }

  render() {
    return `
      <div class="about-page animate-fade-in" style="display: flex; flex-direction: column; gap: var(--spacing-xl); max-width: 800px; margin: 0 auto; width: 100%;">
        <div style="text-align: center;">
          <h2 class="section-title">About Cubix</h2>
          <p class="section-subtitle">Understanding the engineering behind Rubik's Cube solving and animations.</p>
        </div>

        <section class="card" style="display: flex; flex-direction: column; gap: var(--spacing-sm);">
          <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary);">Core Philosophy</h3>
          <p>
            Solving a Rubik's Cube usually requires learning complex notation systems and memorizing long algorithmic transformations. Cubix bridges this gap by offering a fully interactive, browser-based visual solver that demonstrates every face rotation dynamically in 3D.
          </p>
        </section>

        <section class="card" style="display: flex; flex-direction: column; gap: var(--spacing-sm);">
          <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary);">Technical Overview</h3>
          <p>
            Cubix is designed as a modular, client-side application built on top of robust open-source technologies:
          </p>
          <ul style="display: flex; flex-direction: column; gap: var(--spacing-xs); margin-top: var(--spacing-xs); padding-left: var(--spacing-md); list-style-type: disc;">
            <li><strong>3D rendering</strong> is handled by <strong>Three.js</strong>, treating the cube as 27 coordinates with independent texture maps and rotating them around global axes inside a WebGL context.</li>
            <li><strong>Solver engine</strong> uses Herbert Kociemba's two-phase algorithm (integrated via <strong>cubejs</strong>), generating optimized solutions of 22 moves or fewer.</li>
            <li><strong>Color Classification</strong> converts raw video grid colors into normalized HSL or CIELAB spaces to minimize the effect of changing ambient lighting.</li>
            <li><strong>State representation</strong> remains independent of the Three.js rendering queue, ensuring a strict "one source of truth" model.</li>
          </ul>
        </section>

        <section class="card" style="display: flex; flex-direction: column; gap: var(--spacing-sm);">
          <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary);">Rubik's Cube Notation</h3>
          <p>
            Cubix adheres to standard Singmaster notation for face rotations:
          </p>
          <div style="overflow-x: auto; margin-top: var(--spacing-xs);">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
              <thead>
                <tr style="border-bottom: 2px solid var(--border-color);">
                  <th style="padding: var(--spacing-sm);">Symbol</th>
                  <th style="padding: var(--spacing-sm);">Target Face</th>
                  <th style="padding: var(--spacing-sm);">Rotation Action</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom: 1px solid var(--border-color);">
                  <td style="padding: var(--spacing-sm); font-family: monospace; font-weight: bold;">U / U' / U2</td>
                  <td style="padding: var(--spacing-sm);">Up Face (White)</td>
                  <td style="padding: var(--spacing-sm);">90° Clockwise / 90° Counterclockwise / 180° Double</td>
                </tr>
                <tr style="border-bottom: 1px solid var(--border-color);">
                  <td style="padding: var(--spacing-sm); font-family: monospace; font-weight: bold;">D / D' / D2</td>
                  <td style="padding: var(--spacing-sm);">Down Face (Yellow)</td>
                  <td style="padding: var(--spacing-sm);">90° Clockwise / 90° Counterclockwise / 180° Double</td>
                </tr>
                <tr style="border-bottom: 1px solid var(--border-color);">
                  <td style="padding: var(--spacing-sm); font-family: monospace; font-weight: bold;">F / F' / F2</td>
                  <td style="padding: var(--spacing-sm);">Front Face (Green)</td>
                  <td style="padding: var(--spacing-sm);">90° Clockwise / 90° Counterclockwise / 180° Double</td>
                </tr>
                <tr style="border-bottom: 1px solid var(--border-color);">
                  <td style="padding: var(--spacing-sm); font-family: monospace; font-weight: bold;">B / B' / B2</td>
                  <td style="padding: var(--spacing-sm);">Back Face (Blue)</td>
                  <td style="padding: var(--spacing-sm);">90° Clockwise / 90° Counterclockwise / 180° Double</td>
                </tr>
                <tr style="border-bottom: 1px solid var(--border-color);">
                  <td style="padding: var(--spacing-sm); font-family: monospace; font-weight: bold;">L / L' / L2</td>
                  <td style="padding: var(--spacing-sm);">Left Face (Orange)</td>
                  <td style="padding: var(--spacing-sm);">90° Clockwise / 90° Counterclockwise / 180° Double</td>
                </tr>
                <tr style="border-bottom: 1px solid var(--border-color);">
                  <td style="padding: var(--spacing-sm); font-family: monospace; font-weight: bold;">R / R' / R2</td>
                  <td style="padding: var(--spacing-sm);">Right Face (Red)</td>
                  <td style="padding: var(--spacing-sm);">90° Clockwise / 90° Counterclockwise / 180° Double</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    `;
  }

  mount() {
    console.log('AboutPage mounted');
  }

  destroy() {
    console.log('AboutPage unmounted');
  }
}

export default AboutPage;
