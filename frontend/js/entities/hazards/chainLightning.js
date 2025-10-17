// ChainLightning - Orb that creates electric chains between nearby objects

class ChainLightning {
  constructor(x, y) {
    const config = GAME_CONFIG.newObjects.chainLightning;

    this.x = x || canvas.width / 2;
    this.y = y || canvas.height / 2;
    this.radius = config.radius;
    this.chainRange = config.chainRange;
    this.maxChains = config.maxChains;
    this.damage = config.damage;
    this.chainInterval = config.chainInterval;
    this.lifetime = config.lifetime;
    this.age = 0;
    this.color = config.color;
    this.glowIntensity = config.glowIntensity;

    this.chainTimer = 0;
    this.currentChains = [];

    // Electric particles around orb
    this.particles = [];
    for (let i = 0; i < 20; i++) {
      this.particles.push({
        angle: Math.random() * Math.PI * 2,
        distance: this.radius + Math.random() * 15,
        speed: (Math.random() - 0.5) * 0.2,
        brightness: Math.random(),
      });
    }
  }

  draw() {
    ctx.save();

    // DEBUG - Force visible for testing
    if (this.age < 10) {
      console.log(
        `⚡ DRAWING ChainLightning at (${this.x}, ${this.y}), age=${this.age}, chains=${this.currentChains.length}`
      );
    }

    const alpha = Math.max(0, (this.lifetime - this.age) / this.lifetime);

    // Draw lightning chains FIRST (so they're behind the orb)
    this.currentChains.forEach((chain) => {
      ctx.save(); // IMPORTANT: Save before each chain
      const chainAlpha = chain.age / 15; // Fade in over 15 frames
      ctx.globalAlpha = Math.min(alpha, chainAlpha);

      this.drawLightningBolt(
        chain.startX,
        chain.startY,
        chain.endX,
        chain.endY,
        3
      );
      ctx.restore(); // IMPORTANT: Restore after each chain
    });

    // Draw electric particles
    ctx.globalAlpha = alpha;
    this.particles.forEach((p) => {
      const x = this.x + Math.cos(p.angle) * p.distance;
      const y = this.y + Math.sin(p.angle) * p.distance;

      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 235, 59, ${p.brightness})`;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 8;
      ctx.fill();
    });

    // Draw central orb (ALWAYS VISIBLE even without chains)
    const pulse = Math.sin(this.age * 0.1) * 0.3 + 0.7;

    // EXTRA LARGE Outer glow for visibility
    ctx.globalAlpha = alpha * 0.5;
    const outerGradient = ctx.createRadialGradient(
      this.x,
      this.y,
      0,
      this.x,
      this.y,
      this.radius * 4 // BIGGER
    );
    outerGradient.addColorStop(0, `rgba(255, 235, 59, ${alpha * 0.6})`);
    outerGradient.addColorStop(0.5, `rgba(255, 235, 59, ${alpha * 0.3})`);
    outerGradient.addColorStop(1, "rgba(255, 235, 59, 0)");
    ctx.fillStyle = outerGradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 4, 0, Math.PI * 2);
    ctx.fill();

    // Mid glow
    const gradient = ctx.createRadialGradient(
      this.x,
      this.y,
      0,
      this.x,
      this.y,
      this.radius * 2
    );
    gradient.addColorStop(0, `rgba(255, 235, 59, ${alpha * 0.8 * pulse})`);
    gradient.addColorStop(0.5, `rgba(255, 235, 59, ${alpha * 0.4 * pulse})`);
    gradient.addColorStop(1, "rgba(255, 235, 59, 0)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 2, 0, Math.PI * 2);
    ctx.fill();

    // Core orb
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = this.glowIntensity;
    ctx.fill();

    // Inner bright spot (WHITE - very visible)
    ctx.globalAlpha = 1.0; // FULL alpha
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 15;
    ctx.fill();

    ctx.restore();
  }

  drawLightningBolt(x1, y1, x2, y2, segments) {
    ctx.save(); // CRITICAL: Save state before drawing

    // Draw OUTER GLOW
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 8;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 25;
    ctx.setLineDash([]); // Reset dash

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Draw MAIN BOLT
    ctx.globalAlpha = 1.0;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 4;
    ctx.shadowBlur = 15;

    ctx.beginPath();
    ctx.moveTo(x1, y1);

    // Create jagged lightning effect
    const dx = x2 - x1;
    const dy = y2 - y1;

    for (let i = 1; i < segments; i++) {
      const t = i / segments;
      const x = x1 + dx * t + (Math.random() - 0.5) * 20;
      const y = y1 + dy * t + (Math.random() - 0.5) * 20;
      ctx.lineTo(x, y);
    }

    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Draw thinner BRIGHT inner bolt (WHITE)
    ctx.globalAlpha = 1.0;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 10;
    ctx.stroke();

    ctx.restore(); // CRITICAL: Restore state after drawing
  }

  update() {
    this.age++;
    this.chainTimer++;

    // DEBUG LOG
    if (this.age % 60 === 0) {
      console.log(
        `⚡ ChainLightning (${this.x.toFixed(0)}, ${this.y.toFixed(0)}): age=${
          this.age
        }/${this.lifetime}, chains=${this.currentChains.length}`
      );
    }

    // Update particles
    this.particles.forEach((p) => {
      p.angle += p.speed;
      p.distance += Math.sin(this.age * 0.1 + p.angle) * 0.3;
      p.brightness = 0.5 + Math.sin(this.age * 0.2 + p.angle) * 0.5;
    });

    // Update existing chains (they fade quickly)
    this.currentChains = this.currentChains.filter((chain) => {
      chain.age++;
      return chain.age < 30; // Chains last for 30 frames
    });

    // Create new chains at intervals
    if (this.chainTimer >= this.chainInterval) {
      this.chainTimer = 0;
      this.createChains();
    }

    return this.age >= this.lifetime;
  }

  createChains() {
    // CRITICAL: Don't create chains if lightning orb is off-screen
    const buffer = 100;
    const isOrbOnScreen =
      this.x > -buffer &&
      this.x < canvas.width + buffer &&
      this.y > -buffer &&
      this.y < canvas.height + buffer;

    if (!isOrbOnScreen) {
      // console.log("⚡ Chain Lightning: Orb off-screen, no chains created");
      return;
    }

    const targets = this.findNearbyTargets();

    if (targets.length === 0) return;

    // Sort by distance
    targets.sort((a, b) => a.distance - b.distance);

    // Create chains to closest targets
    const chainsToCreate = Math.min(this.maxChains, targets.length);

    for (let i = 0; i < chainsToCreate; i++) {
      const target = targets[i];

      this.currentChains.push({
        startX: this.x,
        startY: this.y,
        endX: target.obj.x,
        endY: target.obj.y,
        age: 0,
      });

      // Apply damage/effect to target
      this.affectTarget(target.obj);

      // Chain can continue from this target to other nearby objects
      if (i < chainsToCreate - 1 && Math.random() > 0.5) {
        const nextTarget = targets[i + 1];
        this.currentChains.push({
          startX: target.obj.x,
          startY: target.obj.y,
          endX: nextTarget.obj.x,
          endY: nextTarget.obj.y,
          age: 0,
        });
      }
    }

    // Play sound effect
    if (typeof playSound === "function") {
      playSound("thunder", 0.3);
    }
  }

  findNearbyTargets() {
    const targets = [];

    // Check asteroids
    asteroids.forEach((asteroid) => {
      const dist = Math.hypot(asteroid.x - this.x, asteroid.y - this.y);
      if (dist < this.chainRange) {
        targets.push({ obj: asteroid, distance: dist, type: "asteroid" });
      }
    });

    // Check missiles
    missiles.forEach((missile) => {
      const dist = Math.hypot(missile.x - this.x, missile.y - this.y);
      if (dist < this.chainRange) {
        targets.push({ obj: missile, distance: dist, type: "missile" });
      }
    });

    // Check fragments
    fragments.forEach((fragment) => {
      const dist = Math.hypot(fragment.x - this.x, fragment.y - this.y);
      if (dist < this.chainRange) {
        targets.push({ obj: fragment, distance: dist, type: "fragment" });
      }
    });

    // Check player (if vulnerable)
    if (player && !player.shieldActive && !player.thunderShieldActive) {
      const dist = Math.hypot(player.x - this.x, player.y - this.y);
      if (dist < this.chainRange) {
        targets.push({ obj: player, distance: dist, type: "player" });
      }
    }

    return targets;
  }

  affectTarget(target) {
    // Chains are only created from on-screen orbs, so this is safe
    if (target === player) {
      // Damage player
      if (typeof endGame === "function") {
        // Small damage over time from lightning
        if (
          !player.lastLightningDamage ||
          Date.now() - player.lastLightningDamage > 500
        ) {
          player.lastLightningDamage = Date.now();
          // Player takes minor damage
          if (Math.random() < this.damage) {
            console.log("⚡ Chain Lightning: Player hit by lightning");
            endGame("chain_lightning");
          }
        }
      }
      return;
    }

    // Mark as electrified for visual effect
    if (target.constructor.name === "Asteroid") {
      target.charged = true;
      target.chargeColor = this.color;
      setTimeout(() => {
        target.charged = false;
      }, 1000);
    }

    // Push target slightly
    if (target.velocity) {
      const angle = Math.atan2(target.y - this.y, target.x - this.x);
      const pushForce = 0.5;
      target.velocity.x += Math.cos(angle) * pushForce;
      target.velocity.y += Math.sin(angle) * pushForce;
    }
  }
}
