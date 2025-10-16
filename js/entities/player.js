class Player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.trail = [];
    this.velocity = { x: 0, y: 0 };
    this.shieldActive = false;
    this.shieldTimer = 0;
    this.shieldDuration = 600; // 10 seconds at 60fps
    this.shieldHitFlash = 0; // Counter for shield hit animation
    this.thunderShieldActive = false;
    this.thunderShieldTimer = 0;
    this.thunderShieldDuration = 1200; // 20 seconds at 60fps (tăng từ 10 giây lên 20 giây)
    this.thunderShieldRadius = this.radius * 3.5; // Range of the thunder shield
    this.thunderBolts = [];
    this.thunderTimer = 0;
    this.thunderStrikeAvailable = false; // Can player use thunder strike ability?
    this.thunderStrikeCooldown = 0; // Cooldown for thunder strike ability
    this.thunderStrikeMaxCooldown = 90; // 1.5 seconds cooldown
    this.asteroidsInShield = new Set(); // Theo dõi thiên thạch trong vùng shield
    this.missilesInShield = new Set(); // Theo dõi tên lửa trong vùng shield
  }
  draw() {
    this.trail.forEach((part) => {
      ctx.beginPath();
      ctx.arc(part.x, part.y, part.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 255, 255, ${part.alpha})`;
      ctx.fill();
    });
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.beginPath();
    ctx.moveTo(0, -this.radius);
    ctx.lineTo(this.radius * 0.8, this.radius * 0.8);
    ctx.lineTo(-this.radius * 0.8, this.radius * 0.8);
    ctx.closePath();
    const shadowColor = this.color;
    ctx.shadowColor = shadowColor;
    ctx.shadowBlur = 15;
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw regular shield if active
    if (this.shieldActive) {
      let shieldAlpha = Math.min(1, this.shieldTimer / 60);

      // Flashing effect in last 5 seconds (300 frames)
      if (this.shieldTimer <= 300) {
        const flashSpeed = this.shieldTimer <= 120 ? 0.3 : 0.15; // Faster flash when almost expired
        shieldAlpha *= Math.sin(Date.now() * flashSpeed) * 0.4 + 0.6;
      }

      // Intensify shield when hit
      let shieldIntensity = 0.7;
      let shieldColor = "#00ffff";
      let shieldWidth = 3;

      // Shield hit flash effect
      if (this.shieldHitFlash > 0) {
        shieldIntensity = 1.0;
        shieldAlpha = Math.min(1.5, shieldAlpha * 1.5);
        shieldColor = "#ffffff";
        shieldWidth = 5;
        this.shieldHitFlash--;
      }

      ctx.globalAlpha = shieldAlpha * shieldIntensity;

      // Outer shield ring
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 2.5, 0, Math.PI * 2);
      const shieldGradient = ctx.createRadialGradient(
        0,
        0,
        this.radius,
        0,
        0,
        this.radius * 2.5
      );

      if (this.shieldHitFlash > 0) {
        shieldGradient.addColorStop(0, "rgba(255, 255, 255, 0.3)");
        shieldGradient.addColorStop(0.5, "rgba(100, 255, 255, 0.6)");
        shieldGradient.addColorStop(1, "rgba(0, 255, 255, 0.9)");
      } else {
        shieldGradient.addColorStop(0, "rgba(0, 255, 255, 0)");
        shieldGradient.addColorStop(0.7, "rgba(0, 255, 255, 0.4)");
        shieldGradient.addColorStop(1, "rgba(0, 255, 255, 0.8)");
      }

      ctx.strokeStyle = shieldGradient;
      ctx.lineWidth = shieldWidth;
      ctx.stroke();

      // Inner shield glow
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 1.8, 0, Math.PI * 2);
      ctx.strokeStyle = shieldColor;
      ctx.lineWidth = this.shieldHitFlash > 0 ? 2 : 1;
      ctx.stroke();

      ctx.globalAlpha = 1;
    }

    // Draw thunder shield if active
    if (this.thunderShieldActive) {
      let thunderAlpha = Math.min(1, this.thunderShieldTimer / 60);

      // Flashing effect in last 5 seconds (300 frames)
      if (this.thunderShieldTimer <= 300) {
        const flashSpeed = this.thunderShieldTimer <= 120 ? 0.3 : 0.15; // Faster flash when almost expired
        thunderAlpha *= Math.sin(Date.now() * flashSpeed) * 0.5 + 0.5;
      }

      ctx.globalAlpha = thunderAlpha * 0.6;

      // Thunder shield outer ring
      ctx.beginPath();
      ctx.arc(0, 0, this.thunderShieldRadius, 0, Math.PI * 2);
      const thunderGradient = ctx.createRadialGradient(
        0,
        0,
        this.radius,
        0,
        0,
        this.thunderShieldRadius
      );
      thunderGradient.addColorStop(0, "rgba(255, 255, 0, 0)");
      thunderGradient.addColorStop(0.6, "rgba(255, 255, 0, 0.2)");
      thunderGradient.addColorStop(1, "rgba(255, 200, 0, 0.4)");
      ctx.strokeStyle = thunderGradient;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Electric arcs
      const arcCount = 8;
      for (let i = 0; i < arcCount; i++) {
        if (Math.random() < 0.3) {
          // Random flickering effect
          const angle =
            (i / arcCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
          const length = this.thunderShieldRadius * 0.8;

          ctx.beginPath();
          ctx.moveTo(0, 0);

          // Create jagged lightning
          let x = 0,
            y = 0;
          const segments = 4;
          for (let j = 1; j <= segments; j++) {
            const segLength = (j / segments) * length;
            const jitter = length * 0.15 * (j < segments ? 1 : 0);
            x = Math.cos(angle) * segLength + (Math.random() - 0.5) * jitter;
            y = Math.sin(angle) * segLength + (Math.random() - 0.5) * jitter;
            ctx.lineTo(x, y);
          }

          ctx.strokeStyle = "#ffff00";
          ctx.lineWidth = 1 + Math.random();
          ctx.shadowColor = "#ffff00";
          ctx.shadowBlur = 10;
          ctx.stroke();
        }
      }

      // Inner thunder glow
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 2, 0, Math.PI * 2);
      ctx.strokeStyle = "#ffff00";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Show indicator if thunder strike is available
      if (this.thunderStrikeAvailable) {
        // Pulsing bright indicator at center
        const pulseSize = Math.sin(Date.now() * 0.01) * 0.2 + 0.8;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.7 * pulseSize, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.globalAlpha = thunderAlpha * 0.8;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.4 * pulseSize, 0, Math.PI * 2);
        ctx.fillStyle = "#ffff00";
        ctx.globalAlpha = thunderAlpha;
        ctx.fill();
      }
      // Show cooldown indicator
      else if (this.thunderStrikeCooldown > 0) {
        // Circular progress indicator
        const progress =
          1 - this.thunderStrikeCooldown / this.thunderStrikeMaxCooldown;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(
          0,
          0,
          this.radius * 0.5,
          -Math.PI / 2,
          -Math.PI / 2 + Math.PI * 2 * progress
        );
        ctx.closePath();
        ctx.fillStyle = "#555500";
        ctx.globalAlpha = thunderAlpha * 0.5;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }
  update() {
    // Apply velocity from external forces like gravity
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    // Dampen velocity over time (friction)
    this.velocity.x *= GAME_CONFIG.player.friction;
    this.velocity.y *= GAME_CONFIG.player.friction;

    // Responsive but smooth controls for precision feel
    const ease = GAME_CONFIG.player.responsiveness;
    this.x += (mouse.x - this.x) * ease;
    this.y += (mouse.y - this.y) * ease;

    // Keep player within screen bounds
    this.x = Math.max(this.radius, Math.min(width - this.radius, this.x));
    this.y = Math.max(this.radius, Math.min(height - this.radius, this.y));

    this.trail.push({
      x: this.x,
      y: this.y + 10,
      radius: this.radius / 3,
      alpha: 1,
    });
    // Limit trail length for performance
    if (this.trail.length > GAME_CONFIG.player.trailLength) {
      this.trail.shift();
    }

    for (let i = this.trail.length - 1; i >= 0; i--) {
      this.trail[i].alpha -= GAME_CONFIG.player.trailFadeSpeed;
      this.trail[i].radius -= 0.1;
      if (this.trail[i].alpha <= 0) this.trail.splice(i, 1);
    }

    // Update regular shield
    if (this.shieldActive) {
      this.shieldTimer--;
      if (this.shieldTimer <= 0) {
        this.shieldActive = false;
      }
    }

    // Update thunder shield
    if (this.thunderShieldActive) {
      this.thunderShieldTimer--;
      this.thunderTimer++;

      // Kiểm tra vật thể gần đó thường xuyên hơn (từ 5 frames xuống 2 frames)
      // để đảm bảo không bỏ lỡ vật thể đi qua nhanh
      if (this.thunderTimer % 2 === 0) {
        this.checkThunderShieldCollisions();
      }

      // Make thunder strike ability available
      if (!this.thunderStrikeAvailable && this.thunderStrikeCooldown <= 0) {
        this.thunderStrikeAvailable = true;
      }

      // Update thunder strike cooldown
      if (this.thunderStrikeCooldown > 0) {
        this.thunderStrikeCooldown--;
      }

      if (this.thunderShieldTimer <= 0) {
        this.thunderShieldActive = false;
        this.thunderStrikeAvailable = false;
        showEventText("⚡ Thunder Shield Deactivated ⚡");
      }
    }

    this.draw();
  }

  activateShield() {
    this.shieldActive = true;
    this.shieldTimer = this.shieldDuration;
    this.shieldHitFlash = 0; // Initialize the hit flash effect
    playSound("shield");
  }

  // Method to trigger shield hit animation
  shieldHit() {
    if (this.shieldActive) {
      this.shieldHitFlash = 20; // Flash duration in frames

      // Create shield impact particles
      for (let i = 0; i < 8; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = this.radius * 2;
        particles.push(
          new Particle(
            this.x + Math.cos(angle) * distance,
            this.y + Math.sin(angle) * distance,
            Math.random() * 2 + 1.5,
            "#00ffff",
            {
              x: Math.cos(angle) * 4,
              y: Math.sin(angle) * 4,
            }
          )
        );
      }

      playSound("shield-hit");
    }
  }

  activateThunderShield() {
    this.thunderShieldActive = true;
    this.thunderShieldTimer = this.thunderShieldDuration;
    this.thunderTimer = 0;

    // Activate thunder strike ability immediately
    this.thunderStrikeAvailable = true;
    this.thunderStrikeCooldown = 0;

    // Increase player speed slightly while thunder shield is active
    globalSpeedMultiplier *= 0.8;

    // Tạo hiệu ứng sét xung quanh người chơi khi kích hoạt
    const angleCount = 5;
    for (let i = 0; i < angleCount; i++) {
      const angle = (i / angleCount) * Math.PI * 2;
      const targetX = this.x + Math.cos(angle) * this.thunderShieldRadius * 0.8;
      const targetY = this.y + Math.sin(angle) * this.thunderShieldRadius * 0.8;

      // Tạo hiệu ứng tia sét theo nhiều hướng
      setTimeout(() => {
        if (this.thunderShieldActive) {
          this.createLightningStrike(targetX, targetY, true);
        }
      }, i * 100); // Tạo hiệu ứng lần lượt
    }

    // Visual effect
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      particles.push(
        new Particle(
          this.x + Math.cos(angle) * this.radius * 2,
          this.y + Math.sin(angle) * this.radius * 2,
          3,
          "#ffff00",
          {
            x: Math.cos(angle) * 5,
            y: Math.sin(angle) * 5,
          }
        )
      );
    }

    showEventText(
      "⚡ THUNDER SHIELD ACTIVATED! Lasts 20s - Auto zaps nearby objects! ⚡"
    );
    playSound("powerup");
  }

  checkThunderShieldCollisions() {
    if (!this.thunderShieldActive) return;

    let targetFound = false;

    // Debug hiệu ứng tia sét ngẫu nhiên nếu không tìm thấy mục tiêu nào
    const shouldCreateRandomLightning = Math.random() < 0.05; // 5% cơ hội tạo tia sét ngẫu nhiên

    // Theo dõi các thiên thạch trong vùng thunder shield
    if (!this.asteroidsInShield) {
      this.asteroidsInShield = new Set();
    }

    // Set tạm thời để theo dõi các thiên thạch đang ở trong shield
    const currentAsteroidsInShield = new Set(); // Check asteroids
    for (let i = asteroids.length - 1; i >= 0; i--) {
      const ast = asteroids[i];
      const dist = Math.hypot(ast.x - this.x, ast.y - this.y);
      const inShieldRange = dist < this.thunderShieldRadius + ast.radius;

      // Nếu thiên thạch trong vùng shield
      if (inShieldRange) {
        currentAsteroidsInShield.add(ast.id || i);

        // Nếu thiên thạch này chưa được xử lý trước đó (mới vào vùng shield)
        // hoặc chỉ xử lý định kỳ cho các thiên thạch đã nằm trong vùng (khoảng 1 giây/lần)
        if (!this.asteroidsInShield.has(ast.id || i) || Math.random() < 0.02) {
          // Set flag that target was found
          targetFound = true;

          // Create lightning effect to the asteroid
          this.createLightningStrike(ast.x, ast.y);

          // Create explosion particles
          for (let j = 0; j < 8; j++) {
            const angle = Math.random() * Math.PI * 2;
            particles.push(
              new Particle(
                ast.x + Math.cos(angle) * 5,
                ast.y + Math.sin(angle) * 5,
                Math.random() * 3 + 1,
                "#ffff00",
                {
                  x: Math.cos(angle) * 6,
                  y: Math.sin(angle) * 6,
                }
              )
            );
          }

          // Remove asteroid and add score
          asteroids.splice(i, 1);
          score += 15;
          playSound("explosion", 0.4);
          playSound("thunder", 0.5);

          // Break after handling one asteroid to avoid too many lightning strikes at once
          break;
        }
      }
    }

    // Cập nhật danh sách thiên thạch trong vùng shield
    this.asteroidsInShield = currentAsteroidsInShield;

    // Check missiles
    if (!targetFound) {
      // Theo dõi các tên lửa trong vùng thunder shield
      if (!this.missilesInShield) {
        this.missilesInShield = new Set();
      }

      // Set tạm thời để theo dõi các tên lửa đang ở trong shield
      const currentMissilesInShield = new Set();

      for (let i = missiles.length - 1; i >= 0; i--) {
        const missile = missiles[i];
        const dist = Math.hypot(missile.x - this.x, missile.y - this.y);
        const inShieldRange = dist < this.thunderShieldRadius + missile.radius;

        if (inShieldRange) {
          currentMissilesInShield.add(missile.id || i);

          // Nếu tên lửa này chưa được xử lý trước đó (mới vào vùng shield)
          // hoặc chỉ xử lý định kỳ cho các tên lửa đã nằm trong vùng (khoảng 1 giây/lần)
          if (
            !this.missilesInShield.has(missile.id || i) ||
            Math.random() < 0.02
          ) {
            // Create lightning effect to the missile
            this.createLightningStrike(missile.x, missile.y);

            // Make the missile explode
            missile.explode(true);
            score += 25;
            playSound("thunder", 0.5);
            targetFound = true;
            break;
          }
        }
      }

      // Cập nhật danh sách tên lửa trong vùng shield
      this.missilesInShield = currentMissilesInShield;
    }

    // Nếu không có mục tiêu và đến thời điểm tạo hiệu ứng ngẫu nhiên
    if (!targetFound && shouldCreateRandomLightning) {
      // Tạo một tia sét ngẫu nhiên trong phạm vi thunder shield
      const angle = Math.random() * Math.PI * 2;
      const distance = this.thunderShieldRadius * (0.6 + Math.random() * 0.4);
      const targetX = this.x + Math.cos(angle) * distance;
      const targetY = this.y + Math.sin(angle) * distance;

      // Tạo hiệu ứng tia sét
      this.createLightningStrike(targetX, targetY, false);

      // Tạo particle tại điểm đích
      for (let i = 0; i < 4; i++) {
        const particleAngle = Math.random() * Math.PI * 2;
        particles.push(
          new Particle(targetX, targetY, Math.random() * 2 + 1, "#ffff00", {
            x: Math.cos(particleAngle) * 3,
            y: Math.sin(particleAngle) * 3,
          })
        );
      }

      // Phát âm thanh nhỏ hơn
      if (Math.random() < 0.5) {
        playSound("thunder", 0.2);
      }
    }
  }

  // Trigger a ranged thunder strike - automatically finds targets within range
  triggerThunderStrike() {
    if (
      !this.thunderShieldActive ||
      !this.thunderStrikeAvailable ||
      this.thunderStrikeCooldown > 0
    ) {
      return false; // Can't use ability
    }

    // Look for targets within strike range (longer than shield radius)
    const strikeRadius = this.thunderShieldRadius * 2.5;
    let targetFound = false;
    let targetX = 0;
    let targetY = 0;
    let closestDist = strikeRadius; // Find the closest target

    // Check for asteroids within range
    for (let i = asteroids.length - 1; i >= 0; i--) {
      const ast = asteroids[i];
      const dist = Math.hypot(ast.x - this.x, ast.y - this.y);

      // If asteroid is within strike range and closer than current target
      if (dist < strikeRadius && dist < closestDist) {
        targetX = ast.x;
        targetY = ast.y;
        targetFound = true;
        closestDist = dist;

        // Tag this asteroid for removal later (after finding best target)
        ast._targetForRemoval = true;
      }
    }

    // Remove and handle the closest asteroid we found
    for (let i = asteroids.length - 1; i >= 0; i--) {
      const ast = asteroids[i];
      if (ast._targetForRemoval) {
        // Create explosion particles
        for (let j = 0; j < 12; j++) {
          const angle = Math.random() * Math.PI * 2;
          particles.push(
            new Particle(
              ast.x + Math.cos(angle) * 5,
              ast.y + Math.sin(angle) * 5,
              Math.random() * 3 + 1,
              "#ffff00",
              {
                x: Math.cos(angle) * 6,
                y: Math.sin(angle) * 6,
              }
            )
          );
        }

        // Remove asteroid and add score
        asteroids.splice(i, 1);
        score += 20;
        playSound("explosion", 0.4);
        break; // Only remove one asteroid per strike
      }
    }

    // Check for missiles if no asteroid was found or if we want to prioritize missiles
    if (!targetFound || closestDist > strikeRadius * 0.5) {
      for (let i = missiles.length - 1; i >= 0; i--) {
        const missile = missiles[i];
        const dist = Math.hypot(missile.x - this.x, missile.y - this.y);

        // If missile is within strike range from player
        if (dist < strikeRadius && (!targetFound || dist < closestDist)) {
          targetX = missile.x;
          targetY = missile.y;
          targetFound = true;
          closestDist = dist;

          // Make the missile explode
          missile.explode(true);
          score += 30; // More points for taking out missiles
          break;
        }
      }
    }

    // If no specific target found, but player has thunder ability available, strike in front of player
    if (!targetFound) {
      // Calculate a position in front of the player
      const angle = Math.atan2(mouse.y - this.y, mouse.x - this.x);
      targetX = this.x + Math.cos(angle) * (this.thunderShieldRadius * 1.5);
      targetY = this.y + Math.sin(angle) * (this.thunderShieldRadius * 1.5);
      targetFound = true;

      // Create visual effect
      for (let i = 0; i < 8; i++) {
        const particleAngle = angle + ((Math.random() - 0.5) * Math.PI) / 4;
        particles.push(
          new Particle(
            targetX + Math.cos(particleAngle) * 5,
            targetY + Math.sin(particleAngle) * 5,
            Math.random() * 3 + 1,
            "#ffff00",
            {
              x: Math.cos(particleAngle) * 4,
              y: Math.sin(particleAngle) * 4,
            }
          )
        );
      }
    }

    // If we have a valid target, create the lightning strike
    if (targetFound) {
      // Create a more powerful lightning strike with multiple branches
      this.createLightningStrike(targetX, targetY, true);

      // Start cooldown
      this.thunderStrikeAvailable = false;
      this.thunderStrikeCooldown = this.thunderStrikeMaxCooldown;

      // Play thunder sound
      playSound("thunder");
      return true;
    }

    return false;
  }

  createLightningStrike(targetX, targetY, isPowerful = false) {
    // Calculate vector from player to target
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const angle = Math.atan2(dy, dx);
    const distance = Math.hypot(dx, dy);

    // Đảm bảo khoảng cách tối thiểu để tia sét luôn thấy rõ
    const minDistance = this.radius * 3;
    const actualDistance = Math.max(distance, minDistance);

    // Create lightning segments
    const segments = [];
    const segmentCount = isPowerful ? 10 : 6; // Tăng số đoạn cho sét mạnh
    const segmentLength = actualDistance / segmentCount;

    for (let i = 1; i <= segmentCount; i++) {
      const baseX = this.x + Math.cos(angle) * segmentLength * i;
      const baseY = this.y + Math.sin(angle) * segmentLength * i;

      // Add jitter to all except the last segment
      const jitter = i < segmentCount ? (isPowerful ? 15 : 10) : 0; // Tăng độ nhiễu cho sét mạnh
      const offsetX = (Math.random() - 0.5) * jitter;
      const offsetY = (Math.random() - 0.5) * jitter;

      segments.push({
        x: baseX + offsetX,
        y: baseY + offsetY,
      });
    }

    // Draw lightning effect
    ctx.save();
    ctx.strokeStyle = isPowerful ? "#ffffff" : "#ffff00"; // Đổi màu cho sét mạnh
    ctx.lineWidth = isPowerful ? 5 : 2; // Tăng độ dày cho sét mạnh
    ctx.shadowColor = "#ffff00";
    ctx.shadowBlur = isPowerful ? 30 : 15; // Tăng độ mờ cho sét mạnh

    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    segments.forEach((segment) => {
      ctx.lineTo(segment.x, segment.y);
    });
    ctx.stroke();

    // For powerful strikes, add secondary branches
    if (isPowerful) {
      // Add more secondary branches for powerful strikes
      const branchCount = 4 + Math.floor(Math.random() * 3); // 4-6 nhánh

      for (let i = 0; i < branchCount; i++) {
        // Branch from a random segment (excluding first and last)
        const branchIndex = 1 + Math.floor(Math.random() * (segmentCount - 2));
        const branchStartX =
          this.x + Math.cos(angle) * segmentLength * branchIndex;
        const branchStartY =
          this.y + Math.sin(angle) * segmentLength * branchIndex;

        // Random branch angle (perpendicular to main bolt ±45°)
        const branchAngle =
          angle +
          (Math.PI / 2) *
            (Math.random() > 0.5 ? 1 : -1) *
            (0.5 + Math.random() * 0.5);
        const branchLength = distance * (0.4 + Math.random() * 0.3); // Nhánh dài hơn

        // Create branch segments
        const branchSegments = [];
        const branchSegmentCount = 4; // Tăng số đoạn mỗi nhánh
        const branchSegmentLength = branchLength / branchSegmentCount;

        for (let j = 1; j <= branchSegmentCount; j++) {
          const bBaseX =
            branchStartX + Math.cos(branchAngle) * branchSegmentLength * j;
          const bBaseY =
            branchStartY + Math.sin(branchAngle) * branchSegmentLength * j;

          const jitter = 12; // Tăng độ nhiễu
          const offsetX = (Math.random() - 0.5) * jitter;
          const offsetY = (Math.random() - 0.5) * jitter;

          branchSegments.push({
            x: bBaseX + offsetX,
            y: bBaseY + offsetY,
          });
        }

        // Draw branch
        ctx.beginPath();
        ctx.moveTo(branchStartX, branchStartY);
        branchSegments.forEach((segment) => {
          ctx.lineTo(segment.x, segment.y);
        });
        ctx.strokeStyle = "#ffffff"; // Màu trắng sáng hơn
        ctx.lineWidth = 3; // Đường nét dày hơn
        ctx.stroke();
      }

      // Thêm hiệu ứng tỏa sáng ở điểm đích
      ctx.beginPath();
      ctx.arc(targetX, targetY, 15, 0, Math.PI * 2);
      const glowGradient = ctx.createRadialGradient(
        targetX,
        targetY,
        0,
        targetX,
        targetY,
        30
      );
      glowGradient.addColorStop(0, "rgba(255, 255, 255, 0.8)");
      glowGradient.addColorStop(0.5, "rgba(255, 255, 100, 0.5)");
      glowGradient.addColorStop(1, "rgba(255, 255, 0, 0)");
      ctx.fillStyle = glowGradient;
      ctx.fill();
    }

    ctx.restore();

    // Tạo thêm hiệu ứng particles cho điểm đích khi phóng điện
    if (isPowerful) {
      for (let i = 0; i < 12; i++) {
        const particleAngle = Math.random() * Math.PI * 2;
        const particleSpeed = 2 + Math.random() * 4;
        particles.push(
          new Particle(targetX, targetY, Math.random() * 3 + 2, "#ffff00", {
            x: Math.cos(particleAngle) * particleSpeed,
            y: Math.sin(particleAngle) * particleSpeed,
          })
        );
      }
    }
  }
}
