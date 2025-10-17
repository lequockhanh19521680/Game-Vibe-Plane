function triggerScreenShake(intensity) {
  canvas.classList.add("shake");
  setTimeout(
    () => canvas.classList.remove("shake"),
    GAME_CONFIG.visual.screenShake.duration * 1000
  );
}

// Universal Warning System - Tạo cảnh báo cho bất kỳ object nào
function createUniversalWarning(
  x,
  y,
  type,
  effectRadius = null,
  customDelay = null
) {
  if (!GAME_CONFIG.ui.warning.universal.enabled) return null;

  const duration = GAME_CONFIG.ui.warning.universal.duration;
  const delay = customDelay || GAME_CONFIG.ui.warning.universal.delay;

  // Tạo warning với thông tin về vùng ảnh hưởng
  const warning = new Warning(x, y, type, duration, 0, effectRadius);
  warnings.push(warning);

  // Phát âm thanh cảnh báo
  playSound("warning");

  return {
    warning: warning,
    delay: delay,
    remove: () => {
      const index = warnings.indexOf(warning);
      if (index > -1) warnings.splice(index, 1);
    },
  };
}

// Mobile detection and adjustment functions
function detectMobile() {
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  // Only treat as mobile if true mobile device, not just small screen
  GAME_CONFIG.ui.mobile.detected = isMobile;

  if (GAME_CONFIG.ui.mobile.detected) {
    console.log("Mobile device detected, applying mobile optimizations");
    applyMobileOptimizations();
  }

  return GAME_CONFIG.ui.mobile.detected;
}

function applyMobileOptimizations() {
  // Scale down various game elements for mobile
  const mobile = GAME_CONFIG.ui.mobile;

  // Adjust player size
  GAME_CONFIG.player.radius *= mobile.objects.playerSizeMultiplier;

  // Adjust asteroid sizes
  GAME_CONFIG.asteroids.minRadius *= mobile.objects.asteroidSizeMultiplier;
  GAME_CONFIG.asteroids.maxRadius *= mobile.objects.asteroidSizeMultiplier;

  // Adjust missile size
  GAME_CONFIG.missiles.radius *= mobile.objects.missileSizeMultiplier;

  // Adjust black hole sizes
  GAME_CONFIG.blackHoles.baseRadius *= mobile.objects.blackHoleSizeMultiplier;
  GAME_CONFIG.blackHoles.baseMaxRadius *=
    mobile.objects.blackHoleSizeMultiplier;
  GAME_CONFIG.blackHoles.baseGravityRadius *=
    mobile.objects.effectRadiusMultiplier;

  // Adjust laser hit detection
  GAME_CONFIG.lasers.playerHitRadius *= mobile.objects.laserWidthMultiplier;

  // Adjust various effect radii
  GAME_CONFIG.newObjects.freezeZone.radius *=
    mobile.objects.effectRadiusMultiplier;
  GAME_CONFIG.newObjects.magneticField.radius *=
    mobile.objects.effectRadiusMultiplier;
  GAME_CONFIG.newObjects.gravityWave.radius *=
    mobile.objects.effectRadiusMultiplier;

  // Adjust UI text sizes
  document.documentElement.style.setProperty(
    "--mobile-font-scale",
    mobile.text.baseFontSizeMultiplier
  );
}

// Enhanced spawn function with warning system
function spawnWithWarning(objectType, x, y, options = {}) {
  let effectRadius = null;
  let warningType = objectType;
  let delay = GAME_CONFIG.ui.warning.universal.delay;

  // Determine effect radius and warning properties based on object type
  switch (objectType) {
    case "asteroid":
      effectRadius = options.radius || GAME_CONFIG.asteroids.maxRadius;
      break;
    case "blackhole":
      effectRadius =
        options.gravityRadius || GAME_CONFIG.blackHoles.baseGravityRadius;
      delay = GAME_CONFIG.blackHoles.warningDelay;
      break;
    case "missile":
      effectRadius = options.radius || GAME_CONFIG.missiles.radius;
      delay = GAME_CONFIG.missiles.warningDelay;
      break;
    case "laser":
      warningType = "laser";
      delay = GAME_CONFIG.lasers.warningTime * (1000 / 60);
      break;
    case "mine":
      effectRadius = options.explosionRadius || 100;
      break;
    case "plasma":
      effectRadius = options.radius || 60;
      break;
    case "freeze":
      effectRadius = options.radius || GAME_CONFIG.newObjects.freezeZone.radius;
      break;
    case "magnetic":
      effectRadius =
        options.radius || GAME_CONFIG.newObjects.magneticField.radius;
      break;
    case "lightning":
      effectRadius = options.radius || 100;
      break;
    case "gravity":
      effectRadius =
        options.maxRadius || GAME_CONFIG.newObjects.gravityWave.maxRadius;
      break;
    case "time":
      effectRadius =
        options.radius || GAME_CONFIG.newObjects.timeDistortion.radius;
      break;
  }

  // Create warning
  const warningData = createUniversalWarning(
    x,
    y,
    warningType,
    effectRadius,
    delay
  );

  return {
    warningData: warningData,
    spawn: (createObjectCallback) => {
      setTimeout(() => {
        if (isGameRunning && warningData) {
          warningData.remove();
          createObjectCallback();
        }
      }, delay);
    },
  };
}

function triggerAsteroidCircle() {
  const config = GAME_CONFIG.events.asteroidCircle;

  // Tạo vị trí ngẫu nhiên cho trung tâm vòng tròn
  const centerX =
    config.centerVariation +
    Math.random() * (canvas.width - 2 * config.centerVariation);
  const centerY =
    config.centerVariation +
    Math.random() * (canvas.height - 2 * config.centerVariation);

  // Tạo warning nhấp nháy trước
  const circleWarning = new CircleWarning(centerX, centerY, config.radius);
  warnings.push(circleWarning);

  // Sau thời gian warning, spawn asteroids thành vòng tròn
  setTimeout(() => {
    // Remove warning
    const warningIndex = warnings.indexOf(circleWarning);
    if (warningIndex > -1) {
      warnings.splice(warningIndex, 1);
    }

    // Spawn asteroids trong formation vòng tròn
    for (let i = 0; i < config.count; i++) {
      const angle = (i / config.count) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * config.radius;
      const y = centerY + Math.sin(angle) * config.radius;

      // Di chuyển về hướng ra xa - đảo ngược hướng
      const dx = Math.cos(angle) * config.speed;
      const dy = Math.sin(angle) * config.speed;

      // Tạo thiên thạch đặc biệt, không bị ảnh hưởng bởi trọng lực
      const asteroid = new Asteroid(x, y, config.asteroidRadius, "#ffbb33", {
        x: dx,
        y: dy,
      });

      // Đánh dấu thiên thạch này là thuộc vòng tròn và không bị ảnh hưởng bởi trọng lực
      asteroid.isCircleFormation = true;
      asteroid.ignoreGravity = true;

      asteroids.push(asteroid);
    }
  }, config.warningTime * (1000 / 60)); // Convert frames to milliseconds
}

function triggerAsteroidBelt() {
  const config = GAME_CONFIG.events.asteroidBelt;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  // Tạo warning nhấp nháy trước
  const beltWarning = new BeltWarning(centerX, centerY, config.beltRadius);
  warnings.push(beltWarning);

  // Sau thời gian warning, spawn asteroid belt
  setTimeout(() => {
    // Remove warning
    const warningIndex = warnings.indexOf(beltWarning);
    if (warningIndex > -1) {
      warnings.splice(warningIndex, 1);
    }

    // Spawn asteroid belt quanh màn hình
    for (let i = 0; i < config.count; i++) {
      const angle = (i / config.count) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * config.beltRadius;
      const y = Math.max(50, centerY - Math.sin(angle) * config.beltRadius); // Đảm bảo thiên thạch ở phía trên

      // Điều chỉnh vận tốc để di chuyển xuống
      const velocityX = Math.cos(angle) * config.asteroidSpeed * 0.3; // Giảm vận tốc ngang
      const velocityY =
        Math.abs(Math.sin(angle) * config.asteroidSpeed) +
        config.asteroidSpeed * 0.5; // Đảm bảo di chuyển xuống

      asteroids.push(
        new Asteroid(x, y, 15 + Math.random() * 10, "#ffbb33", {
          x: velocityX,
          y: velocityY,
        })
      );
    }
  }, 180 * (1000 / 60)); // 3 seconds warning
}
