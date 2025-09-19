class PresentationApp {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = 10; // Updated for expanded presentation with all new features
        this.slides = document.querySelectorAll('.slide');
        this.currentSlideDisplay = document.getElementById('current-slide');
        this.totalSlidesDisplay = document.getElementById('total-slides');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.autoPlayInterval = null;
        this.isAutoPlaying = false;
        
        this.init();
    }
    
    init() {
        console.log('Initializing Enhanced Game Dev Presentation App...');
        console.log('Total slides:', this.totalSlides);
        
        // Set initial state
        this.updateSlideCounter();
        this.updateNavigationButtons();
        
        // Add event listeners with proper binding
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.previousSlide();
            });
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.nextSlide();
            });
        }
        
        // Enhanced keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
        
        // Touch/swipe support for mobile
        this.addTouchSupport();
        
        // Mouse wheel support for desktop
        this.addWheelSupport();
        
        // Initialize first slide
        this.showSlide(this.currentSlide);
        
        // Add progress indicator
        this.createProgressIndicator();
        
        // Add slide-specific enhancements
        this.enhanceSlides();
        
        console.log('Enhanced Game Dev PresentationApp initialized successfully');
    }
    
    handleKeydown(e) {
        // Prevent default for presentation control keys
        const presentationKeys = [
            'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 
            ' ', 'Home', 'End', 'Escape', 'f', 'F', 'a', 'A', 'p', 'P'
        ];
        
        if (presentationKeys.includes(e.key)) {
            e.preventDefault();
        }
        
        switch(e.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
            case 'PageUp':
                this.previousSlide();
                break;
            case 'ArrowRight':
            case 'ArrowDown':
            case 'PageDown':
            case ' ': // Spacebar
                this.nextSlide();
                break;
            case 'Home':
                this.goToSlide(1);
                break;
            case 'End':
                this.goToSlide(this.totalSlides);
                break;
            case 'Escape':
                this.goToSlide(1);
                this.stopAutoPlay();
                break;
            case 'f':
            case 'F':
                this.toggleFullscreen();
                break;
            case 'a':
            case 'A':
                this.toggleAutoPlay();
                break;
            case 'p':
            case 'P':
                this.togglePresenterMode();
                break;
            default:
                // Handle number keys for direct slide navigation
                if (e.key >= '1' && e.key <= '9') {
                    const slideNum = parseInt(e.key);
                    if (slideNum <= this.totalSlides) {
                        this.goToSlide(slideNum);
                    }
                }
                // Handle 0 key for slide 10
                if (e.key === '0' && this.totalSlides >= 10) {
                    this.goToSlide(10);
                }
                break;
        }
    }
    
    addTouchSupport() {
        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;
        let startTime = 0;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            startTime = Date.now();
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;
            const endTime = Date.now();
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const deltaTime = endTime - startTime;
            const minSwipeDistance = 50;
            const maxSwipeTime = 500;
            
            // Only process quick swipes
            if (deltaTime > maxSwipeTime) return;
            
            // Check if it's a horizontal swipe
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
                if (deltaX > 0) {
                    // Swipe right - go to previous slide
                    this.previousSlide();
                } else {
                    // Swipe left - go to next slide
                    this.nextSlide();
                }
            }
            // Check if it's a vertical swipe
            else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > minSwipeDistance) {
                if (deltaY > 0) {
                    // Swipe down - go to previous slide
                    this.previousSlide();
                } else {
                    // Swipe up - go to next slide
                    this.nextSlide();
                }
            }
        }, { passive: true });
    }
    
    addWheelSupport() {
        let wheelTimeout;
        
        document.addEventListener('wheel', (e) => {
            // Prevent default scroll behavior
            e.preventDefault();
            
            // Debounce wheel events
            clearTimeout(wheelTimeout);
            wheelTimeout = setTimeout(() => {
                if (e.deltaY > 0) {
                    this.nextSlide();
                } else if (e.deltaY < 0) {
                    this.previousSlide();
                }
            }, 100);
        }, { passive: false });
    }
    
    showSlide(slideNumber) {
        console.log('Showing slide:', slideNumber);
        
        // Validate slide number
        if (slideNumber < 1 || slideNumber > this.totalSlides) {
            console.warn('Invalid slide number:', slideNumber);
            return false;
        }
        
        const previousSlide = this.currentSlide;
        
        // Hide all slides
        this.slides.forEach((slide, index) => {
            slide.classList.remove('active', 'slide-in-left', 'slide-in-right');
        });
        
        // Show current slide with animation
        const currentSlideElement = document.getElementById(`slide-${slideNumber}`);
        if (currentSlideElement) {
            currentSlideElement.classList.add('active');
            
            // Add slide animation based on direction
            if (slideNumber > previousSlide) {
                currentSlideElement.classList.add('slide-in-right');
            } else if (slideNumber < previousSlide) {
                currentSlideElement.classList.add('slide-in-left');
            }
        } else {
            console.error('Slide element not found:', `slide-${slideNumber}`);
            return false;
        }
        
        this.currentSlide = slideNumber;
        this.updateSlideCounter();
        this.updateNavigationButtons();
        this.updateProgressIndicator();
        
        // Announce slide change for screen readers
        this.announceSlideChange();
        
        // Scroll to top of slide content for long slides
        const slideContent = currentSlideElement.querySelector('.slide-content');
        if (slideContent) {
            slideContent.scrollTop = 0;
        }
        
        // Trigger slide-specific enhancements
        this.triggerSlideEnhancements(slideNumber);
        
        // Trigger custom event for external listeners
        const slideChangeEvent = new CustomEvent('slideChange', {
            detail: { 
                currentSlide: this.currentSlide, 
                totalSlides: this.totalSlides,
                slideElement: currentSlideElement
            }
        });
        document.dispatchEvent(slideChangeEvent);
        
        return true;
    }
    
    nextSlide() {
        console.log('Next slide requested, current:', this.currentSlide);
        if (this.currentSlide < this.totalSlides) {
            this.showSlide(this.currentSlide + 1);
        } else {
            console.log('Already at last slide');
            this.showNotification('Ostatni slajd');
        }
    }
    
    previousSlide() {
        console.log('Previous slide requested, current:', this.currentSlide);
        if (this.currentSlide > 1) {
            this.showSlide(this.currentSlide - 1);
        } else {
            console.log('Already at first slide');
            this.showNotification('Pierwszy slajd');
        }
    }
    
    goToSlide(slideNumber) {
        if (slideNumber >= 1 && slideNumber <= this.totalSlides) {
            return this.showSlide(slideNumber);
        }
        return false;
    }
    
    updateSlideCounter() {
        if (this.currentSlideDisplay && this.totalSlidesDisplay) {
            this.currentSlideDisplay.textContent = this.currentSlide;
            this.totalSlidesDisplay.textContent = this.totalSlides;
        }
    }
    
    updateNavigationButtons() {
        // Update previous button
        if (this.prevBtn) {
            const isDisabled = this.currentSlide <= 1;
            this.prevBtn.disabled = isDisabled;
            this.prevBtn.setAttribute('aria-label', 
                isDisabled ? 'Pierwsza strona' : 'Poprzednia strona'
            );
            
            // Add visual feedback
            this.prevBtn.style.opacity = isDisabled ? '0.5' : '1';
            this.prevBtn.style.cursor = isDisabled ? 'not-allowed' : 'pointer';
        }
        
        // Update next button
        if (this.nextBtn) {
            const isDisabled = this.currentSlide >= this.totalSlides;
            this.nextBtn.disabled = isDisabled;
            this.nextBtn.setAttribute('aria-label', 
                isDisabled ? 'Ostatnia strona' : 'Następna strona'
            );
            
            // Add visual feedback
            this.nextBtn.style.opacity = isDisabled ? '0.5' : '1';
            this.nextBtn.style.cursor = isDisabled ? 'not-allowed' : 'pointer';
        }
    }
    
    createProgressIndicator() {
        // Create progress bar
        const progressContainer = document.createElement('div');
        progressContainer.id = 'progress-container';
        progressContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 4px;
            background: var(--color-secondary);
            z-index: 1001;
            transition: opacity var(--duration-normal);
        `;
        
        const progressBar = document.createElement('div');
        progressBar.id = 'progress-bar';
        progressBar.style.cssText = `
            height: 100%;
            background: var(--color-primary);
            transition: width var(--duration-normal) var(--ease-standard);
            width: 0%;
        `;
        
        progressContainer.appendChild(progressBar);
        document.body.appendChild(progressContainer);
        
        // Update progress
        this.updateProgressIndicator();
    }
    
    updateProgressIndicator() {
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) {
            const progress = (this.currentSlide / this.totalSlides) * 100;
            progressBar.style.width = `${progress}%`;
        }
    }
    
    enhanceSlides() {
        // Add hover effects to statistics
        this.addStatisticsAnimations();
        
        // Add image lazy loading and error handling
        this.addImageEnhancements();
        
        // Add interactive elements to community features
        this.addCommunityInteractions();
        
        // Add enhanced transitions for game mechanics
        this.addGameMechanicsAnimations();
    }
    
    addStatisticsAnimations() {
        const statBoxes = document.querySelectorAll('.stat-box, .stat-highlight, .community-item');
        
        statBoxes.forEach((box, index) => {
            // Add staggered entrance animation
            box.style.animation = `fadeInUp 0.6s ease-out ${index * 0.1}s both`;
            
            // Add hover interaction
            box.addEventListener('mouseenter', () => {
                box.style.transform = 'translateY(-3px) scale(1.02)';
                box.style.transition = 'all 0.3s ease';
            });
            
            box.addEventListener('mouseleave', () => {
                box.style.transform = 'translateY(0) scale(1)';
            });
        });
    }
    
    addImageEnhancements() {
        const gamePhotos = document.querySelectorAll('.game-photo');
        
        gamePhotos.forEach(img => {
            // Add loading placeholder
            img.style.backgroundColor = 'var(--color-bg-2)';
            
            // Handle image load success
            img.addEventListener('load', () => {
                img.style.opacity = '1';
                img.style.transition = 'opacity 0.5s ease';
            });
            
            // Handle image load error
            img.addEventListener('error', () => {
                img.style.display = 'none';
                const placeholder = document.createElement('div');
                placeholder.className = 'image-placeholder';
                placeholder.style.cssText = `
                    width: 100%;
                    height: 120px;
                    background: var(--color-bg-2);
                    border-radius: var(--radius-base);
                    border: 2px dashed var(--color-border);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: var(--font-size-xs);
                    color: var(--color-text-secondary);
                `;
                placeholder.textContent = `Ładowanie: ${img.alt}`;
                img.parentNode.insertBefore(placeholder, img);
            });
            
            // Add click to enlarge functionality
            img.addEventListener('click', () => {
                this.showImageModal(img);
            });
        });
    }
    
    showImageModal(img) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            cursor: pointer;
        `;
        
        const enlargedImg = img.cloneNode();
        enlargedImg.style.cssText = `
            max-width: 90%;
            max-height: 90%;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-lg);
        `;
        
        modal.appendChild(enlargedImg);
        document.body.appendChild(modal);
        
        // Close on click or escape
        modal.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        document.addEventListener('keydown', function escapeHandler(e) {
            if (e.key === 'Escape') {
                if (document.body.contains(modal)) {
                    document.body.removeChild(modal);
                }
                document.removeEventListener('keydown', escapeHandler);
            }
        });
    }
    
    addCommunityInteractions() {
        const communityItems = document.querySelectorAll('.community-item');
        
        communityItems.forEach((item, index) => {
            // Add click interaction for community features
            item.addEventListener('click', () => {
                this.showCommunityDetail(item, index);
            });
            
            // Add keyboard accessibility
            item.setAttribute('tabindex', '0');
            item.setAttribute('role', 'button');
            
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.showCommunityDetail(item, index);
                }
            });
        });
    }
    
    showCommunityDetail(item, index) {
        const communityFeatures = [
            {
                title: "Globalne Leaderboardy",
                details: "System rankingowy będzie aktualizowany w czasie rzeczywistym. Gracze będą mogli śledzić swoje postępy i porównywać się z najlepszymi na świecie.",
                benefits: ["Motywacja do doskonalenia", "Społeczna rywalizacja", "Przejrzysty system punktowy"]
            },
            {
                title: "Uczciwa Rywalizacja", 
                details: "Ranking będzie oparty wyłącznie na umiejętnościach - szybkości przejścia i efektywności strategii. Żadnych elementów płatnych.",
                benefits: ["Równe szanse dla wszystkich", "Nagroda za umiejętności", "Transparentne zasady"]
            },
            {
                title: "Transparentne Metryki",
                details: "Każdy gracz będzie mógł zobaczyć dokładne statystyki: czas, ruchy, wykorzystane combo, procent skuteczności.",
                benefits: ["Analiza własnej gry", "Uczenie się od najlepszych", "Precyzyjne śledzenie postępów"]
            },
            {
                title: "Społeczność Graczy",
                details: "Zintegrowane forum z możliwością dzielenia się strategiami, tworzenia przewodników i dyskusji o taktykach.",
                benefits: ["Wymiana doświadczeń", "Budowanie społeczności", "Wsparcie dla nowych graczy"]
            },
            {
                title: "Regularne Eventy",
                details: "Co tydzień nowe wyzwania tematyczne z unikalnymi nagrodami kosmetycznymi - nowe skórki, efekty, emotikony.",
                benefits: ["Świeża zawartość", "Dodatkowa motywacja", "Kolekcjonerski aspekt"]
            },
            {
                title: "Bez Pay-to-Win",
                details: "Wszystkie nagrody to wyłącznie elementy kosmetyczne. Sukces zależy tylko od umiejętności gracza, nie od portfela.",
                benefits: ["Uczciwa konkurencja", "Fokus na gameplay", "Równe szanse"]
            }
        ];
        
        const feature = communityFeatures[index % communityFeatures.length];
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            padding: var(--space-20);
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: var(--color-surface);
            padding: var(--space-24);
            border-radius: var(--radius-lg);
            max-width: 600px;
            width: 100%;
            box-shadow: var(--shadow-lg);
            border: 2px solid var(--color-primary);
        `;
        
        content.innerHTML = `
            <h3 style="color: var(--color-primary); margin-bottom: var(--space-16); display: flex; align-items: center; gap: var(--space-8);">
                🏆 ${feature.title}
            </h3>
            <p style="margin-bottom: var(--space-16); line-height: 1.5; font-size: var(--font-size-sm);">
                ${feature.details}
            </p>
            <div style="background: var(--color-bg-3); padding: var(--space-12); border-radius: var(--radius-base); border-left: 4px solid var(--color-success);">
                <h4 style="color: var(--color-success); margin-bottom: var(--space-8); font-size: var(--font-size-sm);">Korzyści:</h4>
                <ul style="list-style: none; padding: 0; margin: 0;">
                    ${feature.benefits.map(benefit => `
                        <li style="padding: var(--space-4) 0 var(--space-4) var(--space-16); position: relative; font-size: var(--font-size-sm);">
                            <span style="position: absolute; left: 0; color: var(--color-success);">✓</span>
                            ${benefit}
                        </li>
                    `).join('')}
                </ul>
            </div>
            <button id="close-community-modal" style="
                margin-top: var(--space-16);
                padding: var(--space-8) var(--space-16);
                background: var(--color-primary);
                color: var(--color-btn-primary-text);
                border: none;
                border-radius: var(--radius-base);
                cursor: pointer;
                width: 100%;
                font-size: var(--font-size-sm);
            ">Zamknij</button>
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        // Close handlers
        const closeBtn = content.querySelector('#close-community-modal');
        const closeModal = () => {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
        };
        
        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        
        document.addEventListener('keydown', function escapeHandler(e) {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escapeHandler);
            }
        });
    }
    
    addGameMechanicsAnimations() {
        const itemCards = document.querySelectorAll('.item-card');
        const synergyArrows = document.querySelectorAll('.synergy-arrow');
        
        // Add hover effects to item cards
        itemCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'scale(1.05) translateY(-2px)';
                card.style.boxShadow = 'var(--shadow-lg)';
                card.style.borderColor = 'var(--color-primary-hover)';
                card.style.transition = 'all 0.3s ease';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'scale(1) translateY(0)';
                card.style.boxShadow = '';
                card.style.borderColor = 'var(--color-primary)';
            });
        });
        
        // Animate synergy arrows
        synergyArrows.forEach((arrow, index) => {
            arrow.style.animation = `pulse 2s ease-in-out ${index * 0.5}s infinite`;
        });
    }
    
    triggerSlideEnhancements(slideNumber) {
        // Slide-specific enhancements
        switch(slideNumber) {
            case 3: // History with board games
                this.enhanceHistorySlide();
                break;
            case 4: // Vision with forecasts
                this.enhanceVisionSlide();
                break;
            case 5: // Market data with engine evolution
                this.enhanceMarketSlide();
                break;
            case 9: // The Dungeon with community
                this.enhanceGameSlide();
                break;
        }
    }
    
    enhanceHistorySlide() {
        // Add timeline animation for board game transition
        const transitionSection = document.querySelector('.board-to-digital-transition');
        if (transitionSection && !transitionSection.classList.contains('animated')) {
            transitionSection.classList.add('animated');
            transitionSection.style.animation = 'slideInUp 0.8s ease-out';
        }
    }
    
    enhanceVisionSlide() {
        // Animate forecast statistics
        const forecastSection = document.querySelector('.poland-forecast');
        if (forecastSection) {
            const statHighlights = forecastSection.querySelectorAll('.stat-highlight');
            statHighlights.forEach((stat, index) => {
                setTimeout(() => {
                    stat.style.animation = 'bounceIn 0.6s ease-out';
                }, index * 200);
            });
        }
    }
    
    enhanceMarketSlide() {
        // Animate engine evolution timeline
        const costTimeline = document.querySelector('.cost-timeline');
        if (costTimeline) {
            const timelineItems = costTimeline.querySelectorAll('.timeline-item');
            timelineItems.forEach((item, index) => {
                setTimeout(() => {
                    item.style.animation = 'slideInLeft 0.6s ease-out';
                }, index * 300);
            });
        }
    }
    
    enhanceGameSlide() {
        // Animate community features grid
        const communityGrid = document.querySelector('.community-grid');
        if (communityGrid && !communityGrid.classList.contains('animated')) {
            communityGrid.classList.add('animated');
            const communityItems = communityGrid.querySelectorAll('.community-item');
            communityItems.forEach((item, index) => {
                setTimeout(() => {
                    item.style.animation = 'fadeInUp 0.6s ease-out';
                }, index * 150);
            });
        }
    }
    
    announceSlideChange() {
        // Create or update aria-live region for screen readers
        let announcer = document.getElementById('slide-announcer');
        if (!announcer) {
            announcer = document.createElement('div');
            announcer.id = 'slide-announcer';
            announcer.setAttribute('aria-live', 'polite');
            announcer.setAttribute('aria-atomic', 'true');
            announcer.style.cssText = `
                position: absolute;
                left: -10000px;
                width: 1px;
                height: 1px;
                overflow: hidden;
            `;
            document.body.appendChild(announcer);
        }
        
        // Get slide title for announcement
        const currentSlideElement = document.getElementById(`slide-${this.currentSlide}`);
        const slideTitle = currentSlideElement ? 
            currentSlideElement.querySelector('h1, h2')?.textContent || `Slajd ${this.currentSlide}` :
            `Slajd ${this.currentSlide}`;
        
        announcer.textContent = `${slideTitle}. Slajd ${this.currentSlide} z ${this.totalSlides}`;
    }
    
    showNotification(message, duration = 2000) {
        // Remove existing notification
        const existingNotification = document.getElementById('slide-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create new notification
        const notification = document.createElement('div');
        notification.id = 'slide-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--color-surface);
            color: var(--color-text);
            padding: var(--space-16) var(--space-24);
            border-radius: var(--radius-base);
            border: 1px solid var(--color-border);
            box-shadow: var(--shadow-lg);
            z-index: 1002;
            font-size: var(--font-size-lg);
            font-weight: var(--font-weight-medium);
            opacity: 0;
            transition: opacity var(--duration-fast);
        `;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 10);
        
        // Hide and remove notification
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 250);
        }, duration);
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => {
                this.showNotification('Tryb pełnoekranowy włączony');
                console.log('Entered fullscreen mode');
            }).catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
                this.showNotification('Nie można włączyć trybu pełnoekranowego');
            });
        } else {
            document.exitFullscreen().then(() => {
                this.showNotification('Tryb pełnoekranowy wyłączony');
                console.log('Exited fullscreen mode');
            });
        }
    }
    
    toggleAutoPlay() {
        if (this.isAutoPlaying) {
            this.stopAutoPlay();
            this.showNotification('Auto-play wyłączony');
        } else {
            this.startAutoPlay(8000); // 8 seconds per slide
            this.showNotification('Auto-play włączony');
        }
    }
    
    startAutoPlay(intervalMs = 10000) {
        this.stopAutoPlay(); // Clear any existing interval
        this.isAutoPlaying = true;
        
        this.autoPlayInterval = setInterval(() => {
            if (this.currentSlide < this.totalSlides) {
                this.nextSlide();
            } else {
                this.goToSlide(1); // Loop back to beginning
            }
        }, intervalMs);
        
        console.log('Auto-play started with interval:', intervalMs);
    }
    
    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
            this.isAutoPlaying = false;
            console.log('Auto-play stopped');
        }
    }
    
    togglePresenterMode() {
        const body = document.body;
        const isPresenterMode = body.classList.contains('presenter-mode');
        
        if (!isPresenterMode) {
            body.classList.add('presenter-mode');
            this.showNotification('Tryb prezentera włączony');
            
            // Add presenter mode styles
            const presenterStyles = document.createElement('style');
            presenterStyles.id = 'presenter-styles';
            presenterStyles.textContent = `
                .presenter-mode .slide-counter {
                    font-size: var(--font-size-lg);
                    padding: var(--space-12) var(--space-20);
                }
                .presenter-mode .navigation-controls {
                    bottom: var(--space-32);
                }
                .presenter-mode .navigation-controls .btn {
                    padding: var(--space-12) var(--space-24);
                    font-size: var(--font-size-lg);
                }
            `;
            document.head.appendChild(presenterStyles);
        } else {
            body.classList.remove('presenter-mode');
            this.showNotification('Tryb prezentera wyłączony');
            
            // Remove presenter mode styles
            const presenterStyles = document.getElementById('presenter-styles');
            if (presenterStyles) {
                presenterStyles.remove();
            }
        }
    }
    
    // Export presentation data
    exportSlideData() {
        const slideData = [];
        
        this.slides.forEach((slide, index) => {
            const slideNumber = index + 1;
            const title = slide.querySelector('h1, h2')?.textContent || `Slide ${slideNumber}`;
            const content = slide.querySelector('.slide-content')?.textContent || '';
            
            slideData.push({
                slideNumber,
                title: title.trim(),
                content: content.trim().substring(0, 200) + '...' // First 200 chars
            });
        });
        
        return slideData;
    }
    
    // Get current presentation state
    getState() {
        return {
            currentSlide: this.currentSlide,
            totalSlides: this.totalSlides,
            isAutoPlaying: this.isAutoPlaying,
            isFullscreen: !!document.fullscreenElement,
            isPresenterMode: document.body.classList.contains('presenter-mode')
        };
    }
}

// Global functions for inline onclick handlers in HTML
function goToNextSlide() {
    console.log('Global goToNextSlide called');
    if (window.presentation) {
        window.presentation.nextSlide();
    } else {
        console.error('Presentation instance not available');
    }
}

function goToPreviousSlide() {
    console.log('Global goToPreviousSlide called');
    if (window.presentation) {
        window.presentation.previousSlide();
    } else {
        console.error('Presentation instance not available');
    }
}

function showSlide(slideNumber) {
    console.log('Global showSlide called with:', slideNumber);
    if (window.presentation) {
        return window.presentation.showSlide(slideNumber);
    } else {
        console.error('Presentation instance not available');
        return false;
    }
}

function updateSlideCounter() {
    console.log('Global updateSlideCounter called');
    if (window.presentation) {
        window.presentation.updateSlideCounter();
    }
}

function updateNavigationButtons() {
    console.log('Global updateNavigationButtons called');
    if (window.presentation) {
        window.presentation.updateNavigationButtons();
    }
}

// Initialize the presentation when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing enhanced game dev presentation...');
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes slideInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes slideInLeft {
            from {
                opacity: 0;
                transform: translateX(-30px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes bounceIn {
            0% {
                opacity: 0;
                transform: scale(0.3);
            }
            50% {
                opacity: 1;
                transform: scale(1.05);
            }
            70% {
                transform: scale(0.9);
            }
            100% {
                opacity: 1;
                transform: scale(1);
            }
        }
        
        @keyframes pulse {
            0%, 100% {
                opacity: 1;
                transform: scale(1);
            }
            50% {
                opacity: 0.7;
                transform: scale(1.1);
            }
        }
    `;
    document.head.appendChild(style);
    
    // Create main presentation instance
    const presentation = new PresentationApp();
    
    // Make presentation object globally available
    window.presentation = presentation;
    
    // Add enhanced help overlay
    const helpOverlay = document.createElement('div');
    helpOverlay.id = 'help-overlay';
    helpOverlay.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        background: var(--color-surface);
        padding: var(--space-16);
        border-radius: var(--radius-base);
        font-size: var(--font-size-sm);
        color: var(--color-text);
        border: 1px solid var(--color-border);
        z-index: 1001;
        opacity: 0.9;
        transition: opacity var(--duration-normal);
        max-width: 350px;
        box-shadow: var(--shadow-md);
    `;
    
    helpOverlay.innerHTML = `
        <div style="font-weight: var(--font-weight-semibold); margin-bottom: var(--space-8); color: var(--color-primary);">
            🎮 Prezentacja Game Dev Startup
        </div>
        <div style="display: grid; grid-template-columns: auto 1fr; gap: var(--space-4) var(--space-8); font-size: var(--font-size-xs); margin-bottom: var(--space-8);">
            <strong>← →</strong> <span>Nawigacja slajdów</span>
            <strong>1-9, 0</strong> <span>Bezpośredni przeskok</span>
            <strong>F</strong> <span>Pełny ekran</span>
            <strong>A</strong> <span>Auto-play</span>
            <strong>P</strong> <span>Tryb prezentera</span>
            <strong>ESC</strong> <span>Powrót na początek</span>
        </div>
        <div style="font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-bottom: var(--space-8);">
            Obsługuje: mysz, dotyk, swipe, kółko myszy
        </div>
        <div style="background: var(--color-bg-3); padding: var(--space-8); border-radius: var(--radius-sm); border-left: 3px solid var(--color-success);">
            <div style="font-size: var(--font-size-xs); color: var(--color-success); font-weight: var(--font-weight-semibold);">
                ✨ NOWE FUNKCJE:
            </div>
            <div style="font-size: var(--font-size-xs); margin-top: var(--space-4);">
                • Prawdziwe zdjęcia gier planszowych<br>
                • Prognozy polskiego rynku<br>
                • Ewolucja silników gier<br>
                • Funkcje społecznościowe w grze<br>
                • Interaktywne elementy community
            </div>
        </div>
    `;
    
    document.body.appendChild(helpOverlay);
    
    // Hide help after 8 seconds
    setTimeout(() => {
        helpOverlay.style.opacity = '0';
        setTimeout(() => {
            if (helpOverlay.parentNode) {
                helpOverlay.parentNode.removeChild(helpOverlay);
            }
        }, 500);
    }, 8000);
    
    // Add click to show help again
    const helpButton = document.createElement('button');
    helpButton.innerHTML = '🎮';
    helpButton.title = 'Pokaż pomoc - Game Dev Presentation';
    helpButton.style.cssText = `
        position: fixed;
        top: var(--space-16);
        left: var(--space-16);
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: var(--color-primary);
        color: var(--color-btn-primary-text);
        border: none;
        cursor: pointer;
        z-index: 1000;
        opacity: 0.8;
        transition: all var(--duration-normal);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--font-size-lg);
        box-shadow: var(--shadow-sm);
    `;
    
    helpButton.addEventListener('mouseenter', () => {
        helpButton.style.opacity = '1';
        helpButton.style.transform = 'scale(1.1)';
    });
    
    helpButton.addEventListener('mouseleave', () => {
        helpButton.style.opacity = '0.8';
        helpButton.style.transform = 'scale(1)';
    });
    
    helpButton.addEventListener('click', () => {
        // Recreate and show help overlay
        if (document.getElementById('help-overlay')) return;
        
        const newHelpOverlay = helpOverlay.cloneNode(true);
        newHelpOverlay.style.opacity = '0.9';
        document.body.appendChild(newHelpOverlay);
        
        setTimeout(() => {
            newHelpOverlay.style.opacity = '0';
            setTimeout(() => {
                if (newHelpOverlay.parentNode) {
                    newHelpOverlay.parentNode.removeChild(newHelpOverlay);
                }
            }, 500);
        }, 6000);
    });
    
    // Show help button after help overlay disappears
    setTimeout(() => {
        document.body.appendChild(helpButton);
    }, 9000);
    
    console.log('Enhanced Game Dev presentation initialized successfully');
    console.log('Features: Real game images, Polish market forecasts, game engine evolution, community features');
    console.log('Available shortcuts: ←→ (navigate), F (fullscreen), A (autoplay), P (presenter), 1-9,0 (direct), ESC (reset)');
});

// Enhanced utility functions for presentation control
window.presentationControls = {
    goToSlide: (n) => {
        console.log('Going to slide:', n);
        return window.presentation?.goToSlide(n);
    },
    next: () => {
        console.log('Next slide control');
        return window.presentation?.nextSlide();
    },
    prev: () => {
        console.log('Previous slide control');
        return window.presentation?.previousSlide();
    },
    first: () => {
        console.log('First slide control');
        return window.presentation?.goToSlide(1);
    },
    last: () => {
        console.log('Last slide control');
        return window.presentation?.goToSlide(window.presentation?.totalSlides);
    },
    fullscreen: () => window.presentation?.toggleFullscreen(),
    autoPlay: () => window.presentation?.toggleAutoPlay(),
    presenter: () => window.presentation?.togglePresenterMode(),
    getState: () => window.presentation?.getState(),
    exportData: () => window.presentation?.exportSlideData()
};

// Add error handling for presentation
window.addEventListener('error', (event) => {
    console.error('Game Dev Presentation error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection in game dev presentation:', event.reason);
});

// Add performance monitoring
if ('performance' in window && 'mark' in window.performance) {
    window.performance.mark('game-dev-presentation-script-loaded');
}