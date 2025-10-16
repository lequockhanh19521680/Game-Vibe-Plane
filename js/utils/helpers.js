function triggerScreenShake(intensity) {
  canvas.classList.add("shake");
  setTimeout(
    () => canvas.classList.remove("shake"),
    GAME_CONFIG.visual.screenShake.duration * 1000
  );
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
