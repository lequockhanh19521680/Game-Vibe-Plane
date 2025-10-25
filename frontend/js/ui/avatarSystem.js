// Avatar System Module
class AvatarSystem {
  constructor() {
    this.currentAvatar = null;
    this.avatarModal = null;
    this.avatarIcon = null;
    this.selectedAvatarData = null;
    this.isUploading = false;
    
    // Predefined avatar options
    this.predefinedAvatars = {
      space: [
        { id: 'astronaut', emoji: '👨‍🚀', name: 'Astronaut' },
        { id: 'alien', emoji: '👽', name: 'Alien' },
        { id: 'robot', emoji: '🤖', name: 'Robot' },
        { id: 'rocket', emoji: '🚀', name: 'Rocket' },
        { id: 'satellite', emoji: '🛰️', name: 'Satellite' },
        { id: 'ufo', emoji: '🛸', name: 'UFO' },
        { id: 'planet', emoji: '🪐', name: 'Planet' },
        { id: 'star', emoji: '⭐', name: 'Star' }
      ],
      animals: [
        { id: 'cat', emoji: '🐱', name: 'Cat' },
        { id: 'dog', emoji: '🐶', name: 'Dog' },
        { id: 'fox', emoji: '🦊', name: 'Fox' },
        { id: 'wolf', emoji: '🐺', name: 'Wolf' },
        { id: 'bear', emoji: '🐻', name: 'Bear' },
        { id: 'panda', emoji: '🐼', name: 'Panda' },
        { id: 'tiger', emoji: '🐯', name: 'Tiger' },
        { id: 'lion', emoji: '🦁', name: 'Lion' }
      ],
      fantasy: [
        { id: 'wizard', emoji: '🧙‍♂️', name: 'Wizard' },
        { id: 'fairy', emoji: '🧚‍♀️', name: 'Fairy' },
        { id: 'dragon', emoji: '🐉', name: 'Dragon' },
        { id: 'unicorn', emoji: '🦄', name: 'Unicorn' },
        { id: 'vampire', emoji: '🧛‍♂️', name: 'Vampire' },
        { id: 'zombie', emoji: '🧟‍♂️', name: 'Zombie' },
        { id: 'ghost', emoji: '👻', name: 'Ghost' },
        { id: 'skull', emoji: '💀', name: 'Skull' }
      ],
      gaming: [
        { id: 'joystick', emoji: '🕹️', name: 'Joystick' },
        { id: 'gamepad', emoji: '🎮', name: 'Gamepad' },
        { id: 'trophy', emoji: '🏆', name: 'Trophy' },
        { id: 'medal', emoji: '🥇', name: 'Medal' },
        { id: 'crown', emoji: '👑', name: 'Crown' },
        { id: 'gem', emoji: '💎', name: 'Gem' },
        { id: 'fire', emoji: '🔥', name: 'Fire' },
        { id: 'lightning', emoji: '⚡', name: 'Lightning' }
      ]
    };
    
    this.currentCategory = 'space';
    this.init();
  }

  init() {
    this.createAvatarIcon();
    this.createAvatarModal();
    this.loadSavedAvatar();
    this.bindEvents();
  }

  createAvatarIcon() {
    // Create avatar icon container
    const avatarContainer = document.createElement('div');
    avatarContainer.className = 'avatar-icon-container';
    avatarContainer.innerHTML = `
      <div class="avatar-icon" id="avatar-icon">
        <div class="default-avatar">👤</div>
      </div>
    `;
    
    // Insert into the UI container
    const uiContainer = document.getElementById('ui-container');
    if (uiContainer) {
      uiContainer.appendChild(avatarContainer);
      this.avatarIcon = document.getElementById('avatar-icon');
    }
  }

  createAvatarModal() {
    const modalHtml = `
      <div class="avatar-modal" id="avatar-modal">
        <div class="avatar-modal-content">
          <div class="avatar-modal-header">
            <h2>Choose Your Avatar</h2>
            <p>Select from predefined avatars or upload your own custom image</p>
          </div>
          
          <div class="avatar-categories">
            <button class="avatar-category-btn active" data-category="space">🚀 Space</button>
            <button class="avatar-category-btn" data-category="animals">🐱 Animals</button>
            <button class="avatar-category-btn" data-category="fantasy">🧙‍♂️ Fantasy</button>
            <button class="avatar-category-btn" data-category="gaming">🎮 Gaming</button>
          </div>
          
          <div class="avatar-grid" id="avatar-grid">
            <!-- Avatar options will be populated here -->
          </div>
          
          <div class="custom-upload-section">
            <h3>Custom Avatar</h3>
            <div class="upload-area" id="upload-area">
              <div class="upload-icon">📁</div>
              <div class="upload-text">Click to upload or drag & drop</div>
              <div class="upload-requirements">
                • Max size: 2MB<br>
                • Formats: JPG, PNG, GIF<br>
                • Recommended: Square images (1:1 ratio)
              </div>
            </div>
            <input type="file" id="avatar-file-input" accept="image/*" />
            
            <div class="upload-preview" id="upload-preview">
              <img class="preview-image" id="preview-image" src="" alt="Preview" />
              <div class="upload-status" id="upload-status">Ready to upload</div>
            </div>
          </div>
          
          <div class="avatar-modal-actions">
            <button class="btn-secondary" id="avatar-cancel-btn">Cancel</button>
            <button class="btn-primary" id="avatar-save-btn">Save Avatar</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    this.avatarModal = document.getElementById('avatar-modal');
    this.populateAvatarGrid();
  }

  populateAvatarGrid() {
    const grid = document.getElementById('avatar-grid');
    if (!grid) return;
    
    const avatars = this.predefinedAvatars[this.currentCategory] || [];
    grid.innerHTML = avatars.map(avatar => `
      <div class="avatar-option" data-type="predefined" data-id="${avatar.id}" title="${avatar.name}">
        <div class="avatar-emoji">${avatar.emoji}</div>
      </div>
    `).join('');
  }

  bindEvents() {
    // Avatar icon click
    if (this.avatarIcon) {
      this.avatarIcon.addEventListener('click', () => this.openModal());
    }

    // Modal events
    if (this.avatarModal) {
      // Category buttons
      this.avatarModal.addEventListener('click', (e) => {
        if (e.target.classList.contains('avatar-category-btn')) {
          this.switchCategory(e.target.dataset.category);
        }
        
        // Avatar selection
        if (e.target.closest('.avatar-option')) {
          this.selectAvatar(e.target.closest('.avatar-option'));
        }
        
        // Modal actions
        if (e.target.id === 'avatar-cancel-btn') {
          this.closeModal();
        }
        
        if (e.target.id === 'avatar-save-btn') {
          this.saveAvatar();
        }
      });

      // Upload area events
      const uploadArea = document.getElementById('upload-area');
      const fileInput = document.getElementById('avatar-file-input');
      
      if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', () => fileInput.click());
        
        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
          e.preventDefault();
          uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', () => {
          uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
          e.preventDefault();
          uploadArea.classList.remove('dragover');
          const files = e.dataTransfer.files;
          if (files.length > 0) {
            this.handleFileUpload(files[0]);
          }
        });
        
        fileInput.addEventListener('change', (e) => {
          if (e.target.files.length > 0) {
            this.handleFileUpload(e.target.files[0]);
          }
        });
      }

      // Close modal on backdrop click
      this.avatarModal.addEventListener('click', (e) => {
        if (e.target === this.avatarModal) {
          this.closeModal();
        }
      });
    }

    // Keyboard events
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.avatarModal && this.avatarModal.classList.contains('active')) {
        this.closeModal();
      }
    });
  }

  switchCategory(category) {
    this.currentCategory = category;
    
    // Update active category button
    document.querySelectorAll('.avatar-category-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === category);
    });
    
    // Repopulate grid
    this.populateAvatarGrid();
    
    // Clear selection
    this.selectedAvatarData = null;
    document.querySelectorAll('.avatar-option').forEach(option => {
      option.classList.remove('selected');
    });
  }

  selectAvatar(avatarElement) {
    // Clear previous selection
    document.querySelectorAll('.avatar-option').forEach(option => {
      option.classList.remove('selected');
    });
    
    // Select new avatar
    avatarElement.classList.add('selected');
    
    const type = avatarElement.dataset.type;
    const id = avatarElement.dataset.id;
    
    if (type === 'predefined') {
      const avatar = this.predefinedAvatars[this.currentCategory].find(a => a.id === id);
      this.selectedAvatarData = {
        type: 'predefined',
        category: this.currentCategory,
        id: id,
        emoji: avatar.emoji,
        name: avatar.name
      };
    } else if (type === 'custom') {
      this.selectedAvatarData = {
        type: 'custom',
        url: avatarElement.dataset.url
      };
    }
    
    // Clear upload preview if predefined is selected
    if (type === 'predefined') {
      const uploadPreview = document.getElementById('upload-preview');
      if (uploadPreview) {
        uploadPreview.classList.remove('active');
      }
    }
  }

  handleFileUpload(file) {
    // Validate file
    if (!this.validateFile(file)) {
      return;
    }
    
    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const previewImage = document.getElementById('preview-image');
      const uploadPreview = document.getElementById('upload-preview');
      const uploadStatus = document.getElementById('upload-status');
      
      if (previewImage && uploadPreview && uploadStatus) {
        previewImage.src = e.target.result;
        uploadPreview.classList.add('active');
        uploadStatus.textContent = 'Ready to upload';
        uploadStatus.className = 'upload-status';
      }
      
      // Set selected avatar data
      this.selectedAvatarData = {
        type: 'custom',
        file: file,
        preview: e.target.result
      };
      
      // Clear predefined selection
      document.querySelectorAll('.avatar-option').forEach(option => {
        option.classList.remove('selected');
      });
    };
    
    reader.readAsDataURL(file);
  }

  validateFile(file) {
    const uploadStatus = document.getElementById('upload-status');
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      this.showUploadError('Please select an image file');
      return false;
    }
    
    // Check file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      this.showUploadError('File size must be less than 2MB');
      return false;
    }
    
    // Check file format
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      this.showUploadError('Only JPG, PNG, and GIF files are allowed');
      return false;
    }
    
    return true;
  }

  showUploadError(message) {
    const uploadStatus = document.getElementById('upload-status');
    if (uploadStatus) {
      uploadStatus.textContent = message;
      uploadStatus.className = 'upload-status error';
    }
  }

  async saveAvatar() {
    if (!this.selectedAvatarData) {
      alert('Please select an avatar first');
      return;
    }
    
    const saveBtn = document.getElementById('avatar-save-btn');
    if (saveBtn) {
      saveBtn.innerHTML = '<span class="avatar-loading"></span>Saving...';
      saveBtn.disabled = true;
    }
    
    try {
      if (this.selectedAvatarData.type === 'predefined') {
        // Save predefined avatar
        await this.savePredefinedAvatar();
      } else if (this.selectedAvatarData.type === 'custom') {
        // Upload and save custom avatar
        await this.uploadCustomAvatar();
      }
      
      this.closeModal();
    } catch (error) {
      console.error('Error saving avatar:', error);
      alert('Failed to save avatar. Please try again.');
    } finally {
      if (saveBtn) {
        saveBtn.innerHTML = 'Save Avatar';
        saveBtn.disabled = false;
      }
    }
  }

  async savePredefinedAvatar() {
    const avatarData = {
      type: 'predefined',
      category: this.selectedAvatarData.category,
      id: this.selectedAvatarData.id,
      emoji: this.selectedAvatarData.emoji,
      name: this.selectedAvatarData.name
    };
    
    // Save to localStorage
    localStorage.setItem('userAvatar', JSON.stringify(avatarData));
    
    // Update backend if available
    if (window.BackendAPI && window.BACKEND_CONFIG.USE_BACKEND) {
      try {
        await this.updateAvatarOnBackend(avatarData);
      } catch (error) {
        console.warn('Failed to update avatar on backend:', error);
      }
    }
    
    // Update UI
    this.updateAvatarDisplay(avatarData);
    this.currentAvatar = avatarData;
  }

  async uploadCustomAvatar() {
    if (!this.selectedAvatarData.file) {
      throw new Error('No file selected');
    }
    
    const uploadStatus = document.getElementById('upload-status');
    if (uploadStatus) {
      uploadStatus.textContent = 'Uploading...';
      uploadStatus.className = 'upload-status';
    }
    
    // Upload to backend/S3
    let avatarUrl = null;
    if (window.BackendAPI && window.BACKEND_CONFIG.USE_BACKEND) {
      try {
        avatarUrl = await this.uploadToS3(this.selectedAvatarData.file);
      } catch (error) {
        console.error('Failed to upload to S3:', error);
        throw new Error('Upload failed');
      }
    } else {
      // Fallback: use base64 data URL for local storage
      avatarUrl = this.selectedAvatarData.preview;
    }
    
    const avatarData = {
      type: 'custom',
      url: avatarUrl,
      uploadedAt: new Date().toISOString()
    };
    
    // Save to localStorage
    localStorage.setItem('userAvatar', JSON.stringify(avatarData));
    
    // Update backend if available
    if (window.BackendAPI && window.BACKEND_CONFIG.USE_BACKEND) {
      try {
        await this.updateAvatarOnBackend(avatarData);
      } catch (error) {
        console.warn('Failed to update avatar on backend:', error);
      }
    }
    
    // Update UI
    this.updateAvatarDisplay(avatarData);
    this.currentAvatar = avatarData;
    
    if (uploadStatus) {
      uploadStatus.textContent = 'Upload successful!';
      uploadStatus.className = 'upload-status success';
    }
  }

  async uploadToS3(file) {
    const apiBaseUrl = window.BackendAPI?.getApiBaseUrl();
    if (!apiBaseUrl) {
      throw new Error('Backend API not available');
    }

    // Convert file to base64
    const fileData = await this.fileToBase64(file);
    
    const response = await fetch(`${apiBaseUrl}/upload-avatar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: window.userIdentification?.getUserId(),
        fileData: fileData.split(',')[1], // Remove data:image/jpeg;base64, prefix
        fileName: file.name,
        fileType: file.type
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Upload failed');
    }
    
    const result = await response.json();
    return result.url;
  }

  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  async updateAvatarOnBackend(avatarData) {
    const apiBaseUrl = window.BackendAPI?.getApiBaseUrl();
    const userId = window.userIdentification?.getUserId();
    
    if (!apiBaseUrl || !userId) {
      console.warn('Backend API or user ID not available');
      return;
    }
    
    const response = await fetch(`${apiBaseUrl}/update-avatar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: userId,
        avatar: avatarData
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update avatar on backend');
    }
  }

  updateAvatarDisplay(avatarData) {
    if (!this.avatarIcon) return;
    
    if (avatarData.type === 'predefined') {
      this.avatarIcon.innerHTML = `<div class="default-avatar">${avatarData.emoji}</div>`;
    } else if (avatarData.type === 'custom' && avatarData.url) {
      this.avatarIcon.innerHTML = `<img src="${avatarData.url}" alt="Avatar" />`;
    }
  }

  loadSavedAvatar() {
    try {
      const savedAvatar = localStorage.getItem('userAvatar');
      if (savedAvatar) {
        const avatarData = JSON.parse(savedAvatar);
        this.currentAvatar = avatarData;
        this.updateAvatarDisplay(avatarData);
      }
    } catch (error) {
      console.error('Error loading saved avatar:', error);
    }
  }

  openModal() {
    if (this.avatarModal) {
      this.avatarModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  closeModal() {
    if (this.avatarModal) {
      this.avatarModal.classList.remove('active');
      document.body.style.overflow = '';
      
      // Reset upload preview
      const uploadPreview = document.getElementById('upload-preview');
      if (uploadPreview) {
        uploadPreview.classList.remove('active');
      }
      
      // Clear file input
      const fileInput = document.getElementById('avatar-file-input');
      if (fileInput) {
        fileInput.value = '';
      }
      
      // Reset selected avatar data
      this.selectedAvatarData = null;
      
      // Clear selections
      document.querySelectorAll('.avatar-option').forEach(option => {
        option.classList.remove('selected');
      });
    }
  }

  // Public methods for other parts of the game to use
  getCurrentAvatar() {
    return this.currentAvatar;
  }

  getAvatarForDisplay() {
    if (!this.currentAvatar) return null;
    
    if (this.currentAvatar.type === 'predefined') {
      return {
        type: 'emoji',
        content: this.currentAvatar.emoji
      };
    } else if (this.currentAvatar.type === 'custom') {
      return {
        type: 'image',
        content: this.currentAvatar.url
      };
    }
    
    return null;
  }

  // Method to render avatar in leaderboard entries
  renderAvatarForLeaderboard(avatarData) {
    if (!avatarData) {
      return '<div class="default-avatar-small">👤</div>';
    }
    
    if (avatarData.type === 'predefined') {
      return `<div class="default-avatar-small">${avatarData.emoji}</div>`;
    } else if (avatarData.type === 'custom' && avatarData.url) {
      return `<img class="avatar-small" src="${avatarData.url}" alt="Avatar" />`;
    }
    
    return '<div class="default-avatar-small">👤</div>';
  }
}

// Initialize avatar system when DOM is loaded
let avatarSystem = null;

function initializeAvatarSystem() {
  if (!avatarSystem) {
    avatarSystem = new AvatarSystem();
  }
  return avatarSystem;
}

// Make avatar system globally available
window.avatarSystem = null;
window.initializeAvatarSystem = initializeAvatarSystem;

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.avatarSystem = initializeAvatarSystem();
  });
} else {
  window.avatarSystem = initializeAvatarSystem();
}