document.addEventListener('DOMContentLoaded', () => {
    
    /* ==================== 1. SCROLL SPY & TRADINGVIEW INITIALIZATION ==================== */
    let tradingViewInitialized = false;

    function initTradingViewWidget() {
        if (tradingViewInitialized) return;
        if (typeof TradingView !== 'undefined' && document.getElementById('tradingview_chart')) {
            new TradingView.widget({
                "autosize": true,
                "symbol": "FX_IDC:XAUUSD",
                "interval": "D",
                "timezone": "Asia/Ho_Chi_Minh",
                "theme": "dark",
                "style": "1",
                "locale": "vi",
                "enable_publishing": false,
                "hide_side_toolbar": false,
                "allow_symbol_change": true,
                "container_id": "tradingview_chart"
            });
            tradingViewInitialized = true;

            // Hide skeleton loader once iframe loads
            let checks = 0;
            const checkIframe = setInterval(() => {
                const chartContainer = document.getElementById('tradingview_chart');
                checks++;
                if ((chartContainer && chartContainer.querySelector('iframe')) || checks > 50) {
                    clearInterval(checkIframe);
                    const skeleton = document.getElementById('tradingview-skeleton');
                    if (skeleton) {
                        skeleton.classList.add('opacity-0');
                        setTimeout(() => {
                            skeleton.classList.add('hidden');
                        }, 500);
                    }
                }
            }, 100);
        }
    }

    // Initialize TradingView directly on load, or wait if undefined
    if (typeof TradingView !== 'undefined') {
        initTradingViewWidget();
    } else {
        window.addEventListener('load', initTradingViewWidget);
    }

    // Scroll Spy active navigation state
    const sections = document.querySelectorAll('main > section');
    const navLinks = document.querySelectorAll('header nav a, #mobile-drawer nav a');

    let isAutoScrolling = false;
    let autoScrollTimeout = null;

    function updateActiveNavLink(activeHref) {
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            const isActive = (href === activeHref);
            const isMobile = link.closest('#mobile-drawer');
            if (isActive) {
                if (isMobile) {
                    link.classList.add('text-secondary');
                    link.classList.remove('text-on-surface-variant');
                } else {
                    link.className = "font-label-caps text-label-caps text-secondary border-b border-secondary pb-1 transition-colors duration-300";
                }
            } else {
                if (isMobile) {
                    link.classList.remove('text-secondary');
                    link.classList.add('text-on-surface-variant');
                } else {
                    link.className = "font-label-caps text-label-caps text-on-surface-variant hover:text-secondary transition-colors duration-300";
                }
            }
        });
    }

    const scrollSpyOptions = {
        root: null,
        rootMargin: '-30% 0px -60% 0px', // Triggers when section occupies the active middle portion
        threshold: 0
    };

    const scrollSpyObserver = new IntersectionObserver((entries) => {
        if (isAutoScrolling) return;
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                updateActiveNavLink(`#${id}`);
            }
        });
    }, scrollSpyOptions);

    sections.forEach(sec => scrollSpyObserver.observe(sec));

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                const targetSec = document.querySelector(href);
                if (targetSec) {
                    isAutoScrolling = true;
                    if (autoScrollTimeout) clearTimeout(autoScrollTimeout);
                    updateActiveNavLink(href);
                }
            }
        });
    });

    window.addEventListener('scroll', () => {
        if (isAutoScrolling) {
            if (autoScrollTimeout) clearTimeout(autoScrollTimeout);
            autoScrollTimeout = setTimeout(() => {
                isAutoScrolling = false;
            }, 150);
        }
    });


    /* ==================== 2. GLOBAL EFFECTS ==================== */
    // Sticky nav shadow on scroll
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        if (window.scrollY > 50) {
            header.classList.add('shadow-2xl', 'bg-surface/95');
            header.classList.remove('bg-surface/70');
        } else {
            header.classList.remove('shadow-2xl', 'bg-surface/95');
            header.classList.add('bg-surface/70');
        }
    });

    // Simple Intersection Observer for scroll animations
    const revealOptions = {
        threshold: 0.1
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, revealOptions);

    document.querySelectorAll('.reveal-on-scroll').forEach(el => revealObserver.observe(el));

    /* ==================== 2.5. MOBILE MENU DRAWER LOGIC ==================== */
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const closeDrawerBtn = document.getElementById('close-drawer-btn');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const mobileNavLinks = document.querySelectorAll('#mobile-drawer nav a');

    function openMobileMenu() {
        if (mobileDrawer) {
            mobileDrawer.classList.remove('translate-x-full');
            mobileDrawer.setAttribute('aria-hidden', 'false');
        }
    }

    function closeMobileMenu() {
        if (mobileDrawer) {
            mobileDrawer.classList.add('translate-x-full');
            mobileDrawer.setAttribute('aria-hidden', 'true');
        }
    }

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', openMobileMenu);
    }
    if (closeDrawerBtn) {
        closeDrawerBtn.addEventListener('click', closeMobileMenu);
    }
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });


    /* ==================== 3. FLIPBOOK MENU LOGIC ==================== */
    let currentPage = 0;
    const totalLeaves = 7;
    const leafs = document.querySelectorAll('.leaf');
    
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const resetBtn = document.getElementById('reset-book');
    const counter = document.getElementById('page-counter');
    const book = document.getElementById('main-book');
    const spine = document.getElementById('spine');

    function updateBook() {
        leafs.forEach((leaf, index) => {
            const isFlipped = index < currentPage;
            const wasFlipped = leaf.classList.contains('is-flipped');
            
            // Set rotation style
            leaf.style.transform = isFlipped ? 'rotateY(-180deg)' : 'rotateY(0deg)';
            
            if (wasFlipped !== isFlipped) {
                // Leaf is flipping! Set z-index high (50) to prevent clipping
                leaf.classList.add('flipping');
                leaf.style.zIndex = 50;
                
                if (isFlipped) {
                    leaf.classList.add('is-flipped');
                } else {
                    leaf.classList.remove('is-flipped');
                }
                
                // After transition ends, set standard resting z-index
                setTimeout(() => {
                    leaf.classList.remove('flipping');
                    const currentIsFlipped = index < currentPage;
                    leaf.style.zIndex = currentIsFlipped ? index + 1 : totalLeaves - index + 1;
                }, 700); // matches transition time
            } else {
                // Static page, set standard z-index immediately
                leaf.style.zIndex = isFlipped ? index + 1 : totalLeaves - index + 1;
            }
        });

        // Position book centered depending on open state
        if (currentPage === 0) {
            book.style.transform = 'translateX(-25%)';
            spine.style.left = 'calc(50% - 10px)';
            spine.style.opacity = '0';
        } else if (currentPage === totalLeaves) {
            book.style.transform = 'translateX(25%)';
            spine.style.left = 'calc(50% - 10px)';
            spine.style.opacity = '0';
        } else {
            book.style.transform = 'translateX(0)';
            spine.style.left = 'calc(50% - 10px)';
            spine.style.opacity = '1';
        }

        if (counter) { counter.textContent = `Trang ${currentPage} / ${totalLeaves}`; }
        leafs.forEach(leaf => leaf.classList.remove('lift-left', 'lift-right'));
    }

    function nextPage() {
        if (currentPage < totalLeaves) {
            currentPage++;
            updateBook();
        }
    }

    function prevPage() {
        if (currentPage > 0) {
            currentPage--;
            updateBook();
        }
    }

    nextBtn.addEventListener('click', nextPage);
    prevBtn.addEventListener('click', prevPage);
    resetBtn.addEventListener('click', () => {
        currentPage = 0;
        updateBook();
    });

    // Click on individual pages to flip
    leafs.forEach((leaf, index) => {
        const front = leaf.querySelector('.face.front');
        if (front) {
            front.addEventListener('click', (e) => {
                if (e.target.id === 'reset-book' || e.target.closest('#reset-book')) return;
                if (e.target.closest('.menu-item-clickable')) return;
                if (currentPage === index) nextPage();
            });
        }
        const back = leaf.querySelector('.face.back');
        if (back) {
            back.addEventListener('click', (e) => {
                if (e.target.closest('.menu-item-clickable')) return;
                if (currentPage === index + 1) prevPage();
            });
        }
    });

    // Lift page edge slightly on hover
    leafs.forEach((leaf, index) => {
        leaf.addEventListener('mouseenter', () => {
            if (currentPage === index) {
                leaf.classList.add('lift-right');
            } else if (currentPage === index + 1) {
                leaf.classList.add('lift-left');
            }
        });
        leaf.addEventListener('mouseleave', () => {
            leaf.classList.remove('lift-left', 'lift-right');
        });
    });

    // Keyboard arrow-key navigation for Flipbook when menu is in viewport
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top < (window.innerHeight || document.documentElement.clientHeight) &&
            rect.bottom > 0
        );
    }

    document.addEventListener('keydown', (e) => {
        const menuSection = document.getElementById('menu');
        if (menuSection && isElementInViewport(menuSection)) {
            if (e.key === 'ArrowRight') {
                nextPage();
            } else if (e.key === 'ArrowLeft') {
                prevPage();
            }
        }
    });


    /* ==================== 4. RESERVATIONS BOOKING FORM ==================== */
    // Default reservation date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    const dateInput = document.getElementById('booking-date');
    if (dateInput) {
        dateInput.value = `${yyyy}-${mm}-${dd}`;
        dateInput.min = `${yyyy}-${mm}-${dd}`;
    }

    // Load pre-filled data from localStorage on load
    const savedName = localStorage.getItem('client-name');
    const savedPhone = localStorage.getItem('client-phone');
    const savedEmail = localStorage.getItem('client-email');

    if (savedName && document.getElementById('client-name')) {
        document.getElementById('client-name').value = savedName;
    }
    if (savedPhone && document.getElementById('client-phone')) {
        document.getElementById('client-phone').value = savedPhone;
    }
    if (savedEmail && document.getElementById('client-email')) {
        document.getElementById('client-email').value = savedEmail;
    }

    // Toggle Duration view based on selection
    const radioButtons = document.querySelectorAll('input[name="station_type"]');
    const durationContainer = document.getElementById('duration-container');
    
    function handleStationChange() {
        const selectedRadio = document.querySelector('input[name="station_type"]:checked');
        if (!selectedRadio || !durationContainer) return;
        const selectedValue = selectedRadio.value;
        if (selectedValue === 'Standard Table') {
            durationContainer.style.opacity = '0.3';
            durationContainer.style.pointerEvents = 'none';
        } else {
            durationContainer.style.opacity = '1';
            durationContainer.style.pointerEvents = 'auto';
        }
    }
    
    radioButtons.forEach(btn => btn.addEventListener('change', handleStationChange));
    handleStationChange();

    // Form field label highlights and error clearing
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            const label = input.parentElement.querySelector('label');
            if (label) label.style.color = '#ffb77b';
        });
        input.addEventListener('blur', () => {
            const label = input.parentElement.querySelector('label');
            if (label) label.style.color = '';
        });
        input.addEventListener('input', () => {
            let errorEl = null;
            if (input.id === 'client-name') errorEl = document.getElementById('error-name');
            else if (input.id === 'client-phone') errorEl = document.getElementById('error-phone');
            else if (input.id === 'client-email') errorEl = document.getElementById('error-email');
            
            if (errorEl) {
                errorEl.textContent = '';
                errorEl.classList.add('hidden');
            }
        });
    });

    const form = document.getElementById('reservation-form');
    const modal = document.getElementById('receipt-modal');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const nameInput = document.getElementById('client-name');
        const phoneInput = document.getElementById('client-phone');
        const emailInput = document.getElementById('client-email');
        const name = nameInput.value.trim();
        const phone = phoneInput.value.trim();
        const email = emailInput.value.trim();

        const errorName = document.getElementById('error-name');
        const errorPhone = document.getElementById('error-phone');
        const errorEmail = document.getElementById('error-email');

        let isValid = true;

        if (errorName) {
            errorName.textContent = '';
            errorName.classList.add('hidden');
        }
        if (errorPhone) {
            errorPhone.textContent = '';
            errorPhone.classList.add('hidden');
        }
        if (errorEmail) {
            errorEmail.textContent = '';
            errorEmail.classList.add('hidden');
        }

        if (!name) {
            if (errorName) {
                errorName.textContent = 'Vui lòng nhập Họ và tên của bạn.';
                errorName.classList.remove('hidden');
            }
            isValid = false;
        }

        const phoneClean = phone.replace(/[\s.-]+/g, '');
        const phoneRegex = /^[0-9]{9,11}$/;
        if (!phone) {
            if (errorPhone) {
                errorPhone.textContent = 'Vui lòng nhập Số điện thoại của bạn.';
                errorPhone.classList.remove('hidden');
            }
            isValid = false;
        } else if (!phoneRegex.test(phoneClean)) {
            if (errorPhone) {
                errorPhone.textContent = 'Số điện thoại không hợp lệ. Vui lòng nhập từ 9 đến 11 chữ số.';
                errorPhone.classList.remove('hidden');
            }
            isValid = false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            if (errorEmail) {
                errorEmail.textContent = 'Vui lòng nhập Địa chỉ Email của bạn.';
                errorEmail.classList.remove('hidden');
            }
            isValid = false;
        } else if (!emailRegex.test(email)) {
            if (errorEmail) {
                errorEmail.textContent = 'Email không hợp lệ. Vui lòng nhập đúng định dạng (VD: nguyenvana@gmail.com).';
                errorEmail.classList.remove('hidden');
            }
            isValid = false;
        }

        if (!isValid) {
            if (!name) {
                nameInput.focus();
            } else if (!phone || !phoneRegex.test(phoneClean)) {
                phoneInput.focus();
            } else {
                emailInput.focus();
            }
            return;
        }

        // Save data to localStorage
        localStorage.setItem('client-name', name);
        localStorage.setItem('client-phone', phone);
        localStorage.setItem('client-email', email);

        const stationType = document.querySelector('input[name="station_type"]:checked').value;
        const dateStr = document.getElementById('booking-date').value;
        const timeVal = document.getElementById('booking-time').value;
        const duration = parseInt(document.getElementById('booking-duration').value);

        let costPerHour = 0;
        if (stationType === 'Trading Station') costPerHour = 50000;
        else if (stationType === 'VIP Boardroom') costPerHour = 200000;
        
        let totalCost = costPerHour * duration;
        if (stationType === 'Standard Table') {
            document.getElementById('receipt-cost').textContent = 'Miễn phí';
            document.getElementById('receipt-time').textContent = timeVal;
        } else {
            document.getElementById('receipt-cost').textContent = totalCost.toLocaleString('vi-VN') + 'đ';
            document.getElementById('receipt-time').textContent = `${timeVal} (${duration} Giờ)`;
        }

        document.getElementById('receipt-name').textContent = name;
        
        let stationDisplayName = stationType;
        if (stationType === 'Standard Table') stationDisplayName = 'Bàn Cà Phê Tiêu Chuẩn';
        else if (stationType === 'Trading Station') stationDisplayName = 'Trạm Giao Dịch Chuyên Dụng';
        else if (stationType === 'VIP Boardroom') stationDisplayName = 'Phòng Cách Âm VIP';

        document.getElementById('receipt-station').textContent = stationDisplayName;
        
        const dateParts = dateStr.split('-');
        const formattedDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : dateStr;
        document.getElementById('receipt-date').textContent = formattedDate;

        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.remove('opacity-0');
        }, 10);
    });

    
    // Back to Top Button Logic
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                backToTopBtn.classList.remove('opacity-0', 'pointer-events-none');
                backToTopBtn.classList.add('opacity-100', 'pointer-events-auto');
            } else {
                backToTopBtn.classList.add('opacity-0', 'pointer-events-none');
                backToTopBtn.classList.remove('opacity-100', 'pointer-events-auto');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    window.closeModal = function() {
        modal.classList.add('opacity-0');
        setTimeout(() => {
            modal.classList.add('hidden');
            form.reset();
            handleStationChange();
            window.location.hash = 'home';
        }, 300);
    };

    /* ==================== 5. PREMIUM INTERACTIONS & EFFECTS ==================== */
    initCursorGlow();
    initGlassSpotlights();
    initTradingNetwork();
    initScrollProgress();
    initMenuTabs();
    initMenuItemModal();

    function initCursorGlow() {
        if (window.matchMedia('(max-width: 768px)').matches) return;
        const glow = document.createElement('div');
        glow.className = 'cursor-glow';
        document.body.appendChild(glow);

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let glowX = mouseX;
        let glowY = mouseY;
        let active = false;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            if (!active) {
                glow.style.opacity = '1';
                active = true;
            }
        });

        document.addEventListener('mouseleave', () => {
            glow.style.opacity = '0';
            active = false;
        });

        function animate() {
            glowX += (mouseX - glowX) * 0.08;
            glowY += (mouseY - glowY) * 0.08;
            glow.style.left = `${glowX}px`;
            glow.style.top = `${glowY}px`;
            requestAnimationFrame(animate);
        }
        animate();
    }

    function initGlassSpotlights() {
        const cards = document.querySelectorAll('.glass-panel, .glass-card');
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            });
        });
    }

    function initTradingNetwork() {
        const canvas = document.getElementById('trading-network');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let width = canvas.offsetWidth;
        let height = canvas.offsetHeight;
        canvas.width = width;
        canvas.height = height;
        let active = false;

        window.addEventListener('resize', () => {
            if (!canvas) return;
            width = canvas.offsetWidth;
            height = canvas.offsetHeight;
            canvas.width = width;
            canvas.height = height;
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                active = entry.isIntersecting;
                if (active) tick();
            });
        }, { threshold: 0.05 });
        observer.observe(canvas.parentElement);

        const numParticles = 40;
        const particles = [];
        const connectionDist = 120;
        let mouse = { x: -999, y: -999 };

        canvas.parentElement.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });

        canvas.parentElement.addEventListener('mouseleave', () => {
            mouse.x = -999;
            mouse.y = -999;
        });

        for (let i = 0; i < numParticles; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                radius: Math.random() * 2 + 1
            });
        }

        function tick() {
            if (!active) return;
            ctx.clearRect(0, 0, width, height);

            particles.forEach((p, idx) => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > width) p.vx = -p.vx;
                if (p.y < 0 || p.y > height) p.vy = -p.vy;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 183, 123, 0.25)';
                ctx.fill();

                for (let j = idx + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.hypot(dx, dy);

                    if (dist < connectionDist) {
                        const alpha = (1 - dist / connectionDist) * 0.12;
                        ctx.strokeStyle = `rgba(255, 183, 123, ${alpha})`;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }

                if (mouse.x > 0 && mouse.y > 0) {
                    const dx = p.x - mouse.x;
                    const dy = p.y - mouse.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist < 150) {
                        const alpha = (1 - dist / 150) * 0.2;
                        ctx.strokeStyle = `rgba(255, 183, 123, ${alpha})`;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.stroke();
                    }
                }
            });

            requestAnimationFrame(tick);
        }
    }

    function initScrollProgress() {
        const progress = document.getElementById('scroll-progress');
        if (!progress) return;
        window.addEventListener('scroll', () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
            progress.style.width = scrolled + '%';
        });
    }

    function initMenuTabs() {
        const tabBtns = document.querySelectorAll('.menu-tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => {
                    b.classList.remove('border-secondary', 'text-secondary', 'active');
                    b.classList.add('border-outline-variant/30', 'text-on-surface-variant');
                });
                btn.classList.remove('border-outline-variant/30', 'text-on-surface-variant');
                btn.classList.add('border-secondary', 'text-secondary', 'active');
                
                const panels = document.querySelectorAll('.menu-category-panel');
                panels.forEach(p => {
                    p.classList.replace('block', 'hidden');
                });
                
                const cat = btn.getAttribute('data-category');
                const targetPanel = document.getElementById(`menu-cat-${cat}`);
                if (targetPanel) {
                    targetPanel.classList.replace('hidden', 'block');
                }
            });
        });
    }

    function initMenuItemModal() {
        const itemModal = document.getElementById('menu-item-modal');
        const closeModalBtn = document.getElementById('close-item-modal-btn');
        const modalImage = document.getElementById('modal-item-image');
        const modalTags = document.getElementById('modal-item-tags');
        const modalName = document.getElementById('modal-item-name');
        const modalPrice = document.getElementById('modal-item-price');
        const modalDesc = document.getElementById('modal-item-desc');
        const modalSensoryContainer = document.getElementById('modal-item-sensory-container');
        const modalSensory = document.getElementById('modal-item-sensory');
        const modalOriginContainer = document.getElementById('modal-item-origin-container');
        const modalOrigin = document.getElementById('modal-item-origin');

        if (!itemModal) return;

        function openItemModal(item) {
            const name = item.getAttribute('data-name') || '';
            const price = item.getAttribute('data-price') || '';
            const desc = item.getAttribute('data-desc') || '';
            const sensory = item.getAttribute('data-sensory') || '';
            const origin = item.getAttribute('data-origin') || '';
            const image = item.getAttribute('data-image') || '';
            const tagsString = item.getAttribute('data-tags') || '';

            if (modalName) modalName.textContent = name;
            if (modalPrice) modalPrice.textContent = price;
            if (modalDesc) modalDesc.textContent = desc;
            
            if (modalImage) {
                modalImage.src = image;
                modalImage.alt = name;
            }

            if (modalSensoryContainer && modalSensory) {
                if (sensory.trim()) {
                    modalSensory.textContent = sensory;
                    modalSensoryContainer.classList.remove('hidden');
                } else {
                    modalSensoryContainer.classList.add('hidden');
                }
            }

            if (modalOriginContainer && modalOrigin) {
                if (origin.trim()) {
                    modalOrigin.textContent = origin;
                    modalOriginContainer.classList.remove('hidden');
                } else {
                    modalOriginContainer.classList.add('hidden');
                }
            }

            if (modalTags) {
                modalTags.innerHTML = '';
                if (tagsString.trim()) {
                    const tags = tagsString.split(',').map(t => t.trim()).filter(Boolean);
                    tags.forEach(tag => {
                        const span = document.createElement('span');
                        span.className = 'px-2 py-0.5 bg-secondary text-on-secondary text-[9px] font-label-caps uppercase rounded-sm tracking-wider shadow-sm';
                        const formattedText = tag
                            .split('-')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(' ');
                        span.textContent = formattedText;
                        modalTags.appendChild(span);
                    });
                }
            }

            itemModal.classList.remove('opacity-0', 'pointer-events-none');
            itemModal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }

        function closeItemModal() {
            itemModal.classList.add('opacity-0', 'pointer-events-none');
            itemModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = ''; // Restore background scrolling
        }

        document.addEventListener('click', (e) => {
            const clickableItem = e.target.closest('.menu-item-clickable');
            if (clickableItem) {
                openItemModal(clickableItem);
            }
        });

        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', closeItemModal);
        }

        itemModal.addEventListener('click', (e) => {
            if (e.target === itemModal) {
                closeItemModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !itemModal.classList.contains('opacity-0')) {
                closeItemModal();
            }
        });
    }

    window.shareMenu = function() {
        if (navigator.share) {
            navigator.share({
                title: 'Thực đơn LAB COFFEE',
                text: 'Khám phá thực đơn độc quyền tại LAB COFFEE & Trading Lounge',
                url: window.location.href
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(window.location.href).then(() => {
                alert('Đã sao chép liên kết thực đơn vào bộ nhớ tạm!');
            }).catch(console.error);
        }
    };
});
