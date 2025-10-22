// Event text queue system to prevent flickering
let eventTextQueue = [];
let isShowingEventText = false;
let currentEventTimeout = null;
let lastEventTriggerTime = 0; // Timestamp of the last triggered event

// Safe translation helper
const safeT = (key, fallback) => {
  if (window.gameSettings && typeof window.gameSettings.t === "function") {
    return window.gameSettings.t(key) || fallback;
  }
  return fallback;
};

/**
 * Public function to show event text, using a queue.
 */
function showEventText(text) {
  console.log("showEventText called with:", text);
  if (isShowingEventText) {
    eventTextQueue.push(text);
    console.log("Added to queue:", text);
    return;
  }
  isShowingEventText = true;
  displayEventText(text);
}

/**
 * Internal function to display text and handle animations/timers.
 */
function displayEventText(text) {
  console.log("displayEventText called with:", text);
  if (currentEventTimeout) {
    clearTimeout(currentEventTimeout);
    currentEventTimeout = null;
  }
  const eventTextElement = document.getElementById("event-text");
  if (!eventTextElement) {
    console.warn("Event text element not found!");
    isShowingEventText = false;
    return;
  }
  console.log("Event text element found, displaying:", text);
  eventTextElement.innerText = text;
  eventTextElement.style.fontSize = GAME_CONFIG.ui.eventText.fontSize;
  eventTextElement.style.opacity = "1";
  eventTextElement.style.textShadow = "0 0 15px #ffff00, 0 0 25px #ffff00";
  eventTextElement.style.zIndex = "1000";

  // Shake effect
  let shakeCount = 0;
  const shakeInterval = setInterval(() => {
    shakeCount++;
    if (shakeCount > 5) {
      clearInterval(shakeInterval);
      eventTextElement.style.transform = "translateX(-50%)";
      return;
    }
    const direction = shakeCount % 2 === 0 ? 1 : -1;
    eventTextElement.style.transform = `translateX(calc(-50% + ${
      direction * 3
    }px))`;
  }, 50);

  // Color flash effect
  eventTextElement.style.animation = "textFlash 0.5s linear 3";
  if (!document.querySelector("#event-text-style")) {
    const style = document.createElement("style");
    style.id = "event-text-style";
    style.textContent = `
      @keyframes textFlash {
        0% { color: white; }
        50% { color: #ffff00; }
        100% { color: white; }
      }
    `;
    document.head.appendChild(style);
  }

  currentEventTimeout = setTimeout(() => {
    eventTextElement.style.opacity = "0";
    eventTextElement.style.textShadow = "none";
    eventTextElement.style.animation = "none";
    isShowingEventText = false;
    currentEventTimeout = null;
    if (eventTextQueue.length > 0) {
      const nextText = eventTextQueue.shift();
      showEventText(nextText);
    }
  }, GAME_CONFIG.ui.eventText.duration);
}

/**
 * Resets the event system.
 */
function resetEventSystem() {
  eventTextQueue.length = 0;
  if (currentEventTimeout) {
    clearTimeout(currentEventTimeout);
    currentEventTimeout = null;
  }
  isShowingEventText = false;
  lastEventTriggerTime = 0; // Reset cooldown timer on game reset
  const eventTextElement = document.getElementById("event-text");
  if (eventTextElement) {
    eventTextElement.style.opacity = "0";
    eventTextElement.style.textShadow = "none";
    eventTextElement.style.animation = "none";
    eventTextElement.style.transform = "translateX(-50%)";
  }
}

/**
 * Triggers a random event based on score thresholds and weights.
 */
function triggerRandomEvent() {
  console.log("--- triggerRandomEvent FUNCTION CALLED ---");

  // YÊU CẦU 3: Kiểm tra thời gian chờ giữa các sự kiện (10 giây)
  const now = Date.now();
  const cooldown = 10000; // 10 giây tính bằng mili giây
  if (now - lastEventTriggerTime < cooldown) {
    console.log(
      `-> Event cooldown active. Time remaining: ${(
        (cooldown - (now - lastEventTriggerTime)) /
        1000
      ).toFixed(1)}s`
    );
    return; // Vẫn đang trong thời gian chờ, không kích hoạt sự kiện mới
  }

  // YÊU CẦU 3: Đảm bảo các sự kiện được chọn ngẫu nhiên dựa trên trọng số
  // Lấy danh sách các sự kiện có sẵn và trọng số của chúng từ config
  const baseEventWeights = Object.entries(
    GAME_CONFIG.events.unlockThresholds || {}
  )
    .map(([type, scoreThreshold]) => ({
      type,
      // Gán trọng số mặc định nếu không có trong danh sách trọng số cơ bản cũ (có thể tinh chỉnh)
      weight:
        {
          asteroidShower: 30,
          instantMissiles: 25,
          giantBlackHole: 15,
          // ... thêm các sự kiện khác với trọng số nếu cần ...
        }[type] || 10, // Trọng số mặc định là 10
      scoreThreshold,
    }))
    // Lọc ra các sự kiện chưa xác định (nếu có)
    .filter((event) => event.type && event.weight > 0);

  const unlockThresholds = GAME_CONFIG.events.unlockThresholds || {};

  console.log(`-> Current score for event check: ${score}`);

  // Lọc các sự kiện có thể kích hoạt dựa trên điểm số hiện tại
  const availableEvents = baseEventWeights.filter((event) => {
    const threshold = unlockThresholds[event.type] || 0;
    const isAvailable = score >= threshold;
    return isAvailable;
  });

  if (availableEvents.length === 0) {
    console.log(
      "-> No events available for current score. Checking default..."
    );
    // Nếu không có sự kiện nào phù hợp, thử dùng sự kiện mặc định nếu điểm số đủ
    const defaultEvent =
      baseEventWeights.find((e) => e.type === "asteroidShower") ||
      baseEventWeights[0];
    if (defaultEvent && score >= (unlockThresholds[defaultEvent.type] || 0)) {
      console.log(`-> Using default event: ${defaultEvent.type}`);
      availableEvents.push(defaultEvent);
    } else {
      console.log("-> No events available, including default. Exiting.");
      return;
    }
  }

  console.log(
    `-> Available events (${availableEvents.length}):`,
    availableEvents.map((e) => `${e.type} (w:${e.weight})`)
  );

  // Tính tổng trọng số của các sự kiện có sẵn
  const totalWeight = availableEvents.reduce(
    (sum, event) => sum + event.weight,
    0
  );
  console.log(`-> Total weight: ${totalWeight}`);

  if (totalWeight <= 0) {
    console.log("-> Total weight is zero, cannot select event. Exiting.");
    return;
  }

  // Chọn ngẫu nhiên một sự kiện dựa trên trọng số
  let random = Math.random() * totalWeight;
  let selectedEvent = availableEvents[0].type; // Mặc định là sự kiện đầu tiên

  console.log(`-> Random value (0 - ${totalWeight}): ${random}`);

  for (const event of availableEvents) {
    console.log(
      `   - Checking ${event.type} (weight ${event.weight})... Current random: ${random}`
    );
    if (random < event.weight) {
      selectedEvent = event.type;
      console.log(`   --> Selected: ${selectedEvent}`);
      break;
    }
    random -= event.weight;
  }

  const randomEventType = selectedEvent;
  console.log(`-> FINAL SELECTED EVENT: ${randomEventType}`);

  // Ghi lại thời gian sự kiện này được kích hoạt TRƯỚC khi bắt đầu logic sự kiện
  lastEventTriggerTime = Date.now();

  // Đặt thời gian kết thúc hiệu lực của sự kiện (có thể không dùng đến)
  eventActive.endTime =
    timers.difficulty + Math.floor(GAME_CONFIG.events.duration * 0.75);

  // Kích hoạt logic cho sự kiện đã chọn
  switch (randomEventType) {
    case "asteroidShower":
      eventActive.type = "asteroidShower";
      showEventText(safeT("event.asteroidShower", "Asteroid Shower!"));
      // YÊU CẦU 1: Điều chỉnh số lượng tiểu hành tinh trong sự kiện
      const showerConfig = GAME_CONFIG.events.asteroidShower || {};
      const totalAsteroids = showerConfig.asteroidCount || 15; // Lấy từ config hoặc mặc định 15
      const waves = showerConfig.waveCount || 3;
      const waveDelay = showerConfig.waveDelay || 1200;
      const spawnDelayInWave = showerConfig.spawnDelayInWave || 100;
      const asteroidsPerWave = Math.floor(totalAsteroids / waves);

      for (let wave = 0; wave < waves; wave++) {
        setTimeout(() => {
          if (isGameRunning) {
            const directions = ["top", "left", "right", "bottom"];
            const direction =
              directions[Math.floor(Math.random() * directions.length)];
            for (let i = 0; i < asteroidsPerWave; i++) {
              setTimeout(() => {
                if (isGameRunning) {
                  asteroids.push(createMiniShowerAsteroid(direction));
                }
              }, i * spawnDelayInWave);
            }
          }
        }, wave * waveDelay);
      }
      break;

    case "instantMissiles":
      eventActive.type = "instantMissiles";
      showEventText(safeT("event.missileIncoming", "Missile Incoming!"));
      const instantSides = ["left", "right", "top", "bottom"];
      const missileCount = 2; // Số lượng tên lửa xuất hiện
      for (let i = 0; i < missileCount; i++) {
        const side =
          instantSides[Math.floor(Math.random() * instantSides.length)];
        let warningX, warningY, warningAngle, spawnX, spawnY, missileAngle;
        const warningOffset = 50;
        const spawnOffset = 30;

        switch (side) {
          case "left":
            warningX = warningOffset;
            warningY = 100 + Math.random() * (height - 200);
            warningAngle = 0;
            spawnX = -spawnOffset;
            spawnY = warningY;
            missileAngle = 0;
            break;
          case "right":
            warningX = width - warningOffset;
            warningY = 100 + Math.random() * (height - 200);
            warningAngle = Math.PI;
            spawnX = width + spawnOffset;
            spawnY = warningY;
            missileAngle = Math.PI;
            break;
          case "top":
            warningX = 100 + Math.random() * (width - 200);
            warningY = warningOffset;
            warningAngle = Math.PI / 2;
            spawnX = warningX;
            spawnY = -spawnOffset;
            missileAngle = Math.PI / 2;
            break;
          case "bottom":
            warningX = 100 + Math.random() * (width - 200);
            warningY = height - warningOffset;
            warningAngle = -Math.PI / 2;
            spawnX = warningX;
            spawnY = height + spawnOffset;
            missileAngle = -Math.PI / 2;
            break;
        }

        setTimeout(() => {
          if (isGameRunning) {
            const warningSystem = spawnWithWarning(
              "missile",
              warningX,
              warningY,
              {
                angle: warningAngle,
                duration: GAME_CONFIG.entities.missiles.warningDuration,
              }
            );
            warningSystem.spawn(() => {
              missiles.push(new Missile(spawnX, spawnY, missileAngle));
            });
          }
          // Độ trễ giữa các tên lửa (sử dụng duration của warning)
        }, i * GAME_CONFIG.entities.missiles.warningDuration * (1000 / 60));
      }
      break;

    case "giantBlackHole":
      eventActive.type = "giantBlackHole";
      showEventText(safeT("event.giantBlackHole", "Giant Black Hole!"));

      const eventConf = GAME_CONFIG.events.giantBlackHole;
      const baseConf = GAME_CONFIG.entities.blackHoles;
      const { level: currentLevel } = getLevelInfo(score);
      const difficultyLevel = currentLevel - 1;

      // Xuất hiện gần giữa màn hình với một chút biến thể
      const bhX = width / 2 + (Math.random() - 0.5) * (width * 0.2);
      const bhY = height / 2 + (Math.random() - 0.5) * (height * 0.2);

      // Tính toán các thông số cho lỗ đen khổng lồ dựa trên hệ số nhân
      const giantOptions = {
        isTemporary: true, // Đặt là tạm thời
        lifetime: eventConf.lifetime,
        baseRadius: eventConf.baseRadius,
        maxRadius:
          (baseConf.baseMaxRadius +
            difficultyLevel * baseConf.radiusIncreasePerLevel) *
          eventConf.maxRadiusMultiplier,
        gravityRadius:
          (baseConf.baseGravityRadius +
            difficultyLevel * baseConf.gravityRadiusIncreasePerLevel) *
          eventConf.gravityRadiusMultiplier,
        strength:
          (baseConf.baseStrength +
            difficultyLevel * baseConf.strengthIncreasePerLevel) *
          eventConf.strengthMultiplier,
        growthRate:
          (baseConf.baseGrowthRate +
            difficultyLevel * baseConf.growthRateIncreasePerLevel) *
          eventConf.growthRateMultiplier,
        // color: eventConf.color // Nếu lớp BlackHole hỗ trợ màu tùy chỉnh
      };

      const warningSystem = spawnWithWarning("blackhole", bhX, bhY, {
        duration: eventConf.warningTime,
        // warningType: 'giantBlackHole' // Ví dụ, yêu cầu thay đổi trong lớp Warning
      });
      warningSystem.spawn(() => {
        // Truyền giantOptions vào constructor của BlackHole
        blackHoles.push(new BlackHole(bhX, bhY, giantOptions));
        playSound("blackhole"); // Cân nhắc âm thanh sâu hơn/mạnh hơn
      });
      break;

    default:
      console.warn("Unknown event type selected:", randomEventType);
      // Đặt lại thời gian kích hoạt cuối cùng nếu sự kiện không xác định để tránh bị kẹt cooldown
      lastEventTriggerTime = 0;
      break;
  }
}

// Expose functions globally
window.triggerRandomEvent = triggerRandomEvent;
window.showEventText = showEventText;
window.resetEventSystem = resetEventSystem;
window.safeT = safeT; // Expose safe translate helper
