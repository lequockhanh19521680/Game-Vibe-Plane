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
    this.shieldDuration = 900; // Tăng lên 15 giây (900 frames ở 60fps) để có nhiều thời gian bảo vệ hơn
    this.shieldHitFlash = 0; // Counter for shield hit animation
    this.thunderShieldActive = false;
    this.thunderShieldTimer = 0;
    this.thunderShieldDuration = 1500; // Tăng lên 25 giây (1500 frames ở 60fps) để có nhiều thời gian bảo vệ hơn
    this.thunderShieldRadius = this.radius * 3.5; // Range of the thunder shield
    this.thunderDetectionRadius = this.radius * 12.0; // Tăng phạm vi phát hiện lên gấp đôi (từ 6.0 lên 12.0) theo yêu cầu
    this.thunderBolts = [];
    this.thunderTimer = 0;
    this.thunderStrikeAvailable = false; // Can player use thunder strike ability?
    this.thunderStrikeCooldown = 0; // Cooldown for thunder strike ability
    this.thunderStrikeMaxCooldown = 90; // 1.5 seconds cooldown
    this.thunderCounterFlashIntensity = 0; // Hiệu ứng flash khi phản đòn xung kích
    this.asteroidsInShield = new Set(); // Theo dõi thiên thạch trong vùng shield
    this.missilesInShield = new Set(); // Theo dõi tên lửa trong vùng shield
    this.nearbyObjectCooldowns = {}; // Theo dõi cooldown cho các vật thể gần đó
  }
  draw() {
    this.trail.forEach((part) => {
      // Safety check: only draw if radius is positive
      if (part.radius > 0) {
        ctx.beginPath();
        ctx.arc(part.x, part.y, part.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 255, ${part.alpha})`;
        ctx.fill();
      }
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

      // Add counter-shockwave flash effect
      if (this.thunderCounterFlashIntensity > 0) {
        // Toàn màn hình flash trắng khi kích hoạt phản đòn
        ctx.fillStyle = `rgba(255, 255, 255, ${
          this.thunderCounterFlashIntensity * 0.7
        })`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Tăng độ sáng khiên
        thunderAlpha = Math.min(1.5, thunderAlpha * 2);
      }

      ctx.globalAlpha = thunderAlpha * 0.6;

      // Đã loại bỏ hoàn toàn phần vẽ vùng phát hiện mở rộng (detection zone) theo yêu cầu
      // Không vẽ viền ngoài, chỉ hiển thị tia sét từ thunder shield

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
      // Remove trail parts with negative or zero radius to prevent arc() errors
      if (this.trail[i].alpha <= 0 || this.trail[i].radius <= 0) {
        this.trail.splice(i, 1);
      }
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

      // Kiểm tra vật thể gần đó LIÊN TỤC mỗi frame
      // để đảm bảo không bỏ lỡ vật thể đi qua nhanh và phản ứng tức thì
      this.checkThunderShieldCollisions();

      // Make thunder strike ability available
      if (!this.thunderStrikeAvailable && this.thunderStrikeCooldown <= 0) {
        this.thunderStrikeAvailable = true;
      }

      // Update thunder strike cooldown
      if (this.thunderStrikeCooldown > 0) {
        this.thunderStrikeCooldown--;
      }

      // Update counter flash effect
      if (this.thunderCounterFlashIntensity > 0) {
        this.thunderCounterFlashIntensity -= 0.05;
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

    // Đã loại bỏ hiệu ứng hạt điện văng ra khi kích hoạt shield để tránh gây lag

    showEventText(
      "⚡ THUNDER SHIELD ACTIVATED! Lasts 25s - Zaps objects in shield and nearby! ⚡"
    );
    playSound("powerup");
  }

  checkThunderShieldCollisions() {
    if (!this.thunderShieldActive) return;

    let targetFound = false;

    // Khởi tạo hệ thống cooldown nếu chưa có
    if (!this.nearbyObjectCooldowns) {
      this.nearbyObjectCooldowns = {};
    }

    // Debug hiệu ứng tia sét ngẫu nhiên nếu không tìm thấy mục tiêu nào
    const shouldCreateRandomLightning = Math.random() < 0.05; // 5% cơ hội tạo tia sét ngẫu nhiên

    // Theo dõi các thiên thạch trong vùng thunder shield
    if (!this.asteroidsInShield) {
      this.asteroidsInShield = new Set();
    }

    // Set tạm thời để theo dõi các thiên thạch đang ở trong shield
    const currentAsteroidsInShield = new Set(); // Check asteroids

    // Mảng chứa các thiên thạch gần shield nhưng chưa va chạm
    let nearbyAsteroids = [];

    for (let i = asteroids.length - 1; i >= 0; i--) {
      const ast = asteroids[i];
      const dist = Math.hypot(ast.x - this.x, ast.y - this.y);
      const inShieldRange = dist < this.thunderShieldRadius + ast.radius;

      // 1. Xử lý thiên thạch trong vùng shield (logic hiện tại)
      if (inShieldRange) {
        currentAsteroidsInShield.add(ast.id || i);

        if (!this.asteroidsInShield.has(ast.id || i) || Math.random() < 0.02) {
          targetFound = true;

          this.createLightningStrike(ast.x, ast.y);

          // Đã loại bỏ hiệu ứng explosion particles để tránh lag          // Remove asteroid and add score
          asteroids.splice(i, 1);
          score += 15;
          playSound("explosion", 0.4);
          playSound("thunder", 0.5);

          // Break after handling one asteroid to avoid too many lightning strikes at once
          break;
        }
      }
      // 2. Tìm thiên thạch gần shield nhưng chưa va chạm
      else if (dist < this.thunderDetectionRadius + ast.radius) {
        const objectId = `asteroid_${ast.id || i}`;

        // Kiểm tra xem thiên thạch này có đang trong thời gian cooldown không
        if (
          !this.nearbyObjectCooldowns[objectId] ||
          this.thunderTimer > this.nearbyObjectCooldowns[objectId]
        ) {
          nearbyAsteroids.push({
            index: i,
            asteroid: ast,
            distance: dist,
            id: objectId,
          });
        }
      }
    }

    // Cập nhật danh sách thiên thạch trong vùng shield
    this.asteroidsInShield = currentAsteroidsInShield;

    // Mảng chứa các tên lửa gần shield nhưng chưa va chạm
    let nearbyMissiles = [];

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

        // 1. Xử lý tên lửa trong vùng shield (logic hiện tại)
        if (inShieldRange) {
          currentMissilesInShield.add(missile.id || i);

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
        // 2. Tìm tên lửa gần shield nhưng chưa va chạm
        else if (dist < this.thunderDetectionRadius + missile.radius) {
          const objectId = `missile_${missile.id || i}`;

          // Kiểm tra xem tên lửa này có đang trong thời gian cooldown không
          if (
            !this.nearbyObjectCooldowns[objectId] ||
            this.thunderTimer > this.nearbyObjectCooldowns[objectId]
          ) {
            nearbyMissiles.push({
              index: i,
              missile: missile,
              distance: dist,
              id: objectId,
            });
          }
        }
      }

      // Cập nhật danh sách tên lửa trong vùng shield
      this.missilesInShield = currentMissilesInShield;
    }

    // 3. Xử lý các vật thể gần kề - Tấn công vật thể gần nhất
    // nếu chưa tìm thấy mục tiêu trong shield
    if (!targetFound) {
      // Sắp xếp tất cả vật thể gần kề theo khoảng cách
      const allNearbyObjects = [...nearbyAsteroids, ...nearbyMissiles].sort(
        (a, b) => a.distance - b.distance
      );

      // Nếu có vật thể gần kề, tấn công vật thể gần nhất
      if (allNearbyObjects.length > 0) {
        const nearestObject = allNearbyObjects[0];

        // Xác suất phóng sét dựa trên khoảng cách - càng gần càng cao khả năng phóng sét
        const maxDistance = this.thunderDetectionRadius;
        const distanceFactor = 1 - nearestObject.distance / maxDistance;
        const strikeChance = 0.7 + distanceFactor * 0.25; // Tăng cơ hội từ 70% đến 95% tùy khoảng cách

        if (Math.random() < strikeChance) {
          targetFound = true;

          if (nearestObject.asteroid) {
            // Tấn công thiên thạch gần kề
            const ast = nearestObject.asteroid;

            // Hiệu ứng tia sét đính vào thiên thạch trong 0.75 giây trước khi phá hủy
            // Lưu lại asteroid để đảm bảo không bị xóa trong thời gian này
            ast.thunderStruck = true; // Đánh dấu đã bị sét đánh

            // Tạo hiệu ứng tia sét đính vào thiên thạch
            this.createLightningStrike(ast.x, ast.y, true);

            // Thêm hiệu ứng điện tập trung vào thiên thạch
            const createFocusedLightningEffect = () => {
              if (isGameRunning && ast && !ast.destroyed) {
                // Tạo hiệu ứng điện tập trung vào thiên thạch (không phân tán)
                // Lấy một điểm trên đường thẳng giữa người chơi và thiên thạch
                const directionX = ast.x - this.x;
                const directionY = ast.y - this.y;
                const length = Math.hypot(directionX, directionY);
                const normalizedX = directionX / length;
                const normalizedY = directionY / length;

                // Tính toán vị trí bắt đầu gần người chơi
                const startDist =
                  this.radius * 4 + Math.random() * this.radius * 2;
                const startX = this.x + normalizedX * startDist;
                const startY = this.y + normalizedY * startDist;

                // Tạo tia sét tập trung theo đường thẳng từ người chơi đến thiên thạch
                this.createLightningStrike(startX, startY, false);
              }
            };

            // Tạo hiệu ứng điện tập trung vào mục tiêu
            const lightningIntervalId = setInterval(
              createFocusedLightningEffect,
              150
            );

            // Phát âm thanh sấm sét liên tục
            playSound("thunder", 0.4);
            setTimeout(() => {
              if (isGameRunning) {
                playSound("thunder", 0.6);
              }
            }, 300);

            // Sau 0.75 giây, phá hủy thiên thạch
            setTimeout(() => {
              if (isGameRunning && ast && !ast.destroyed) {
                clearInterval(lightningIntervalId);

                // Đã loại bỏ hiệu ứng nổ có nhiều hạt để tránh gây lag

                // Đánh dấu đã phá hủy để không bị xử lý lại
                ast.destroyed = true;

                // Tìm và xóa thiên thạch khỏi mảng
                const index = asteroids.findIndex((a) => a === ast);
                if (index !== -1) {
                  asteroids.splice(index, 1);
                  score += 25;
                  playSound("explosion", 0.8);
                  playSound("thunder", 0.9);

                  // Hiệu ứng rung màn hình
                  if (typeof triggerScreenShake === "function") {
                    triggerScreenShake(0.4);
                  }
                }
              }
            }, 750); // 0.75 giây

            // Hiệu ứng rung màn hình nhẹ khi tia sét đánh trúng
            if (typeof triggerScreenShake === "function") {
              triggerScreenShake(0.3);
            }
          } else if (nearestObject.missile) {
            // Tấn công tên lửa gần kề
            const missile = nearestObject.missile;

            // Hiệu ứng tia sét đính vào tên lửa trong 0.75 giây trước khi phá hủy
            // Lưu lại tên lửa để đảm bảo không bị xóa trong thời gian này
            missile.thunderStruck = true; // Đánh dấu đã bị sét đánh

            // Tạo hiệu ứng tia sét đính vào tên lửa
            this.createLightningStrike(missile.x, missile.y, true);

            // Thêm hiệu ứng điện tập trung vào tên lửa
            const createFocusedLightningEffect = () => {
              if (isGameRunning && missile && !missile.destroyed) {
                // Tạo hiệu ứng điện tập trung (không phân tán)
                // Lấy một điểm trên đường thẳng giữa người chơi và tên lửa
                const directionX = missile.x - this.x;
                const directionY = missile.y - this.y;
                const length = Math.hypot(directionX, directionY);
                const normalizedX = directionX / length;
                const normalizedY = directionY / length;

                // Tính toán vị trí bắt đầu gần người chơi hoặc điểm ngẫu nhiên trên đường thẳng
                const ratio = Math.random() * 0.5; // Điểm bắt đầu nằm trong khoảng 0-50% đường thẳng
                const startX = this.x + normalizedX * length * ratio;
                const startY = this.y + normalizedY * length * ratio;

                // Tạo tia sét đến tên lửa
                this.createLightningStrike(startX, startY, false);
              }
            };

            // Tạo hiệu ứng điện tập trung vào mục tiêu với tần suất cao hơn
            const lightningIntervalId = setInterval(
              createFocusedLightningEffect,
              120
            );

            // Phát âm thanh sấm sét liên tục
            playSound("thunder", 0.4);
            setTimeout(() => {
              if (isGameRunning) {
                playSound("thunder", 0.6);
              }
            }, 300);

            // Sau 0.75 giây, phá hủy tên lửa
            setTimeout(() => {
              if (isGameRunning && missile && !missile.destroyed) {
                clearInterval(lightningIntervalId);

                // Đã loại bỏ hiệu ứng nổ có nhiều hạt để tránh gây lag

                // Đánh dấu đã phá hủy để không bị xử lý lại
                missile.destroyed = true;

                // Cho tên lửa nổ
                missile.explode(true);
                score += 35;
                playSound("thunder", 0.9);

                // Hiệu ứng rung màn hình
                if (typeof triggerScreenShake === "function") {
                  triggerScreenShake(0.4);
                }
              }
            }, 750); // 0.75 giây

            // Hiệu ứng rung màn hình nhẹ khi tia sét đánh trúng
            if (typeof triggerScreenShake === "function") {
              triggerScreenShake(0.5); // Tăng cường độ rung từ 0.4 lên 0.5
            }
          }

          // Đặt cooldown cho vật thể này
          this.nearbyObjectCooldowns[nearestObject.id] = this.thunderTimer + 60; // Giảm thời gian cooldown xuống 1 giây để phóng điện thường xuyên hơn
        }
      }
    }

    // Xóa bỏ các cooldown cũ để tránh rò rỉ bộ nhớ
    for (const key in this.nearbyObjectCooldowns) {
      if (this.nearbyObjectCooldowns[key] < this.thunderTimer - 300) {
        delete this.nearbyObjectCooldowns[key];
      }
    }

    // Nếu không có mục tiêu và đến thời điểm tạo hiệu ứng ngẫu nhiên
    // Giảm cơ hội tạo hiệu ứng sét ngẫu nhiên để tránh hiệu ứng gây lag
    if (!targetFound && Math.random() < 0.03) {
      // Giảm xác suất từ 15% xuống 3%
      // Chỉ tạo một tia sét để giảm hiệu ứng gây lag
      const angle = Math.random() * Math.PI * 2;
      const distance = this.thunderShieldRadius * (0.5 + Math.random() * 0.5);
      const targetX = this.x + Math.cos(angle) * distance;
      const targetY = this.y + Math.sin(angle) * distance;

      // Tạo hiệu ứng tia sét, không thêm các hiệu ứng hạt
      this.createLightningStrike(targetX, targetY, false);

      // Chỉ phát âm thanh với xác suất thấp và âm lượng nhỏ để tránh nhiễu
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

    // Vẽ tia sét chính - tập trung hơn, ít gấp khúc hơn
    ctx.save();

    // Màu sắc và độ rộng
    ctx.strokeStyle = isPowerful ? "#ffffff" : "#ffff00";
    ctx.lineWidth = isPowerful ? 6 : 3; // Tăng độ dày để tia sét nổi bật hơn
    ctx.shadowColor = "#ffff00";
    ctx.shadowBlur = isPowerful ? 25 : 15;

    // Vẽ tia sét chính - ít gấp khúc hơn, tập trung hơn
    const segmentCount = isPowerful ? 8 : 5; // Giảm số đoạn để ít gấp khúc hơn
    const segmentLength = actualDistance / segmentCount;

    // Giảm biên độ gấp khúc so với trước đây
    const maxJitter = isPowerful ? 8 : 5; // Giảm độ nhiễu để tia thẳng hơn

    // Vẽ tia sét chính tập trung
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);

    // Tạo các đoạn tia sét với độ lệch giảm dần về phía mục tiêu
    let prevX = this.x;
    let prevY = this.y;

    for (let i = 1; i <= segmentCount; i++) {
      const baseX = this.x + Math.cos(angle) * segmentLength * i;
      const baseY = this.y + Math.sin(angle) * segmentLength * i;

      // Giảm độ lệch khi gần đến mục tiêu để tia trông tập trung hơn
      const jitterFactor = i < segmentCount ? 1 - i / segmentCount : 0;
      const jitter = maxJitter * jitterFactor;

      // Đảm bảo tia cuối cùng luôn đi thẳng vào mục tiêu
      let pointX, pointY;
      if (i === segmentCount) {
        pointX = targetX;
        pointY = targetY;
      } else {
        pointX = baseX + (Math.random() - 0.5) * jitter;
        pointY = baseY + (Math.random() - 0.5) * jitter;
      }

      ctx.lineTo(pointX, pointY);
      prevX = pointX;
      prevY = pointY;
    }
    ctx.stroke();

    // Nếu là tia sét mạnh, vẽ thêm tia sét thứ hai đi gần song song
    if (isPowerful) {
      // Tia sét thứ hai - tăng cường hiệu ứng tập trung
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);

      // Dùng góc lệch nhỏ so với tia chính
      const secondaryAngleOffset = (Math.random() - 0.5) * 0.2; // Góc lệch nhỏ
      const secondaryAngle = angle + secondaryAngleOffset;

      for (let i = 1; i <= segmentCount; i++) {
        const baseX = this.x + Math.cos(secondaryAngle) * segmentLength * i;
        const baseY = this.y + Math.sin(secondaryAngle) * segmentLength * i;

        // Giảm độ nhiễu khi gần đến mục tiêu
        const jitterFactor =
          i < segmentCount ? (1 - i / segmentCount) * 0.7 : 0;
        const jitter = maxJitter * jitterFactor;

        let pointX, pointY;
        if (i === segmentCount) {
          // Đoạn cuối cùng sẽ hướng vào mục tiêu
          pointX = targetX;
          pointY = targetY;
        } else {
          pointX = baseX + (Math.random() - 0.5) * jitter;
          pointY = baseY + (Math.random() - 0.5) * jitter;
        }

        ctx.lineTo(pointX, pointY);
      }

      ctx.lineWidth = 3; // Mỏng hơn tia chính
      ctx.strokeStyle = "#99ffff"; // Màu xanh nhạt hơn
      ctx.stroke();

      // Thêm hiệu ứng tỏa sáng ở điểm đích - nhỏ hơn và tập trung hơn
      ctx.beginPath();
      ctx.arc(targetX, targetY, 10, 0, Math.PI * 2);
      const glowGradient = ctx.createRadialGradient(
        targetX,
        targetY,
        0,
        targetX,
        targetY,
        20 // Giảm kích thước hiệu ứng
      );
      glowGradient.addColorStop(0, "rgba(255, 255, 255, 0.9)");
      glowGradient.addColorStop(0.5, "rgba(255, 255, 100, 0.6)");
      glowGradient.addColorStop(1, "rgba(255, 255, 0, 0)");
      ctx.fillStyle = glowGradient;
      ctx.fill();

      // Thêm vòng tròn tập trung
      ctx.beginPath();
      ctx.arc(targetX, targetY, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
    }

    ctx.restore();
  }

  // Phương thức mới: Tạo phản đòn sóng xung kích điện
  triggerThunderCounterShockwave() {
    if (!this.thunderShieldActive) return; // Chỉ kích hoạt khi có khiên thunder

    // Hiệu ứng flash trước khi phản đòn
    this.thunderCounterFlashIntensity = 1.0; // Sẽ giảm dần trong update()

    // Tạo hiệu ứng xung kích điện toàn màn hình
    const shockwaveRadius = Math.max(canvas.width, canvas.height) * 1.2; // Đảm bảo phủ toàn màn hình

    // Tạo hiệu ứng sóng xung kích điện
    this.createElectricShockwave(shockwaveRadius);

    // Hiệu ứng rung mạnh khi phản đòn
    if (typeof triggerScreenShake === "function") {
      triggerScreenShake(1.0); // Rung mạnh
    }

    // Thông báo sự kiện
    showEventText("⚡⚡⚡ THUNDER COUNTER-SHOCKWAVE! ⚡⚡⚡");

    // Âm thanh cực mạnh
    playSound("thunder", 1.0);

    // Tiêu diệt tất cả vật thể trên màn hình
    this.destroyAllObjects();

    // Bonus điểm
    score += 500;
  }

  // Hiệu ứng sóng xung kích điện lan tỏa
  createElectricShockwave(maxRadius) {
    // Tạo hiệu ứng sét đánh xung quanh người chơi
    const initialStrikes = 12; // Số tia sét ban đầu
    for (let i = 0; i < initialStrikes; i++) {
      const angle = (i / initialStrikes) * Math.PI * 2;
      const distance = 200 + Math.random() * 100;
      const targetX = this.x + Math.cos(angle) * distance;
      const targetY = this.y + Math.sin(angle) * distance;

      // Tạo tia sét từ người chơi đi ra
      this.createLightningStrike(targetX, targetY, true);

      // Phát tia sét dần dần để tạo hiệu ứng lan tỏa
      setTimeout(() => {
        if (isGameRunning) {
          const farDistance = distance * 2;
          const farTargetX = this.x + Math.cos(angle) * farDistance;
          const farTargetY = this.y + Math.sin(angle) * farDistance;
          this.createLightningStrike(farTargetX, farTargetY, true);
        }
      }, 100 + i * 30);
    }

    // Tạo vòng sáng lan tỏa
    const shockwave = {
      radius: 0,
      maxRadius: maxRadius,
      speed: 20,
      alpha: 0.8,
    };

    // Thêm vào mảng hiệu ứng (đảm bảo biến effects đã được định nghĩa)
    if (typeof effects === "undefined") {
      window.effects = [];
    }

    effects.push({
      update: function () {
        if (shockwave.radius < shockwave.maxRadius) {
          // Vẽ sóng xung kích điện
          ctx.save();
          ctx.globalAlpha =
            shockwave.alpha * (1 - shockwave.radius / shockwave.maxRadius);

          // Vòng tròn sáng
          ctx.beginPath();
          ctx.arc(player.x, player.y, shockwave.radius, 0, Math.PI * 2);
          ctx.strokeStyle = "#ffff00";
          ctx.lineWidth = 8;
          ctx.stroke();

          // Vòng điện phóng
          ctx.beginPath();
          const segments = 40;
          for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const jitter = Math.sin(Date.now() * 0.01 + i) * 15;
            const r = shockwave.radius + jitter;

            const x = player.x + Math.cos(angle) * r;
            const y = player.y + Math.sin(angle) * r;

            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.closePath();
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 3;
          ctx.stroke();

          ctx.restore();

          // Tạo hiệu ứng sét ở vòng xung kích
          if (Math.random() < 0.3) {
            const angle = Math.random() * Math.PI * 2;
            const lightningX = player.x + Math.cos(angle) * shockwave.radius;
            const lightningY = player.y + Math.sin(angle) * shockwave.radius;

            // Tạo điểm đích xa hơn
            const targetAngle = angle + (Math.random() - 0.5) * 0.5; // ±25° so với hướng chính
            const targetDistance = 100 + Math.random() * 200;
            const targetX = lightningX + Math.cos(targetAngle) * targetDistance;
            const targetY = lightningY + Math.sin(targetAngle) * targetDistance;

            // Vẽ sét từ vòng xung kích đi ra ngoài
            player.createLightningStrike(targetX, targetY, false);
          }

          // Mở rộng vòng xung kích
          shockwave.radius += shockwave.speed;
          return true;
        } else {
          return false; // Kết thúc hiệu ứng
        }
      },
    });
  }

  // Tiêu diệt tất cả vật thể trên màn hình
  destroyAllObjects() {
    // Tiêu diệt tất cả thiên thạch
    for (let i = asteroids.length - 1; i >= 0; i--) {
      const ast = asteroids[i];
      // Thêm điểm
      score += Math.floor(ast.radius);
      // Tạo hiệu ứng nổ
      createExplosion(ast.x, ast.y, ast.radius);
      // Xóa thiên thạch
      asteroids.splice(i, 1);
    }

    // Tiêu diệt tất cả tên lửa
    for (let i = missiles.length - 1; i >= 0; i--) {
      const missile = missiles[i];
      // Cho tên lửa nổ
      missile.explode(true);
      score += 30;
      missiles.splice(i, 1);
    }

    // Tiêu diệt các vật thể khác
    if (typeof plasmaFields !== "undefined") plasmaFields = [];
    if (typeof laserMines !== "undefined") laserMines = [];
    if (typeof laserBeams !== "undefined") laserBeams = [];
    if (typeof laserTurrets !== "undefined") laserTurrets = [];
    if (typeof freezeZones !== "undefined") freezeZones = [];
    if (typeof magneticStorms !== "undefined") magneticStorms = [];
    if (typeof superNovas !== "undefined") superNovas = [];
    if (typeof lightningStorms !== "undefined") lightningStorms = [];

    // Âm thanh hủy diệt toàn cục
    playSound("explosion", 1.0);
  }
}
