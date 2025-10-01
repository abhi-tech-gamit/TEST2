document.addEventListener('DOMContentLoaded', function() {
    // Initialize transposer
    const transposer = new Transposer();
    
    // DOM elements
    const hamburger = document.getElementById('hamburger');
    const sidebar = document.getElementById('sidebar');
    const main = document.getElementById('main');
    const songList = document.getElementById('songList');
    const songContent = document.getElementById('songContent');
    const songContainer = document.getElementById('songContainer');
    const searchInput = document.getElementById('searchInput');
    const categoryLinks = document.querySelectorAll('.categories ul li a');
    const themeToggle = document.getElementById('themeToggle');
    const addSongBtn = document.getElementById('addSongBtn');
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const adminLoginModal = document.getElementById('adminLoginModal');
    const songModal = document.getElementById('songModal');
    const deleteModal = document.getElementById('deleteModal');
    const closeModal = document.querySelectorAll('.close');
    const adminLoginForm = document.getElementById('adminLoginForm');
    const songForm = document.getElementById('songForm');
    const cancelDelete = document.getElementById('cancelDelete');
    const confirmDelete = document.getElementById('confirmDelete');
    const transposeUp = document.getElementById('transposeUp');
    const transposeDown = document.getElementById('transposeDown');
    const resetKey = document.getElementById('resetKey');
    const currentKeyDisplay = document.getElementById('currentKey');
    const downloadPDF = document.getElementById('downloadPDF');
    const notification = document.getElementById('notification');
    
    // PWA Install Button elements
    const installBtn = document.getElementById('installBtn');
    const installPrompt = document.getElementById('installPrompt');
    
    // State
    let songs = [];
    let currentSong = null;
    let originalKey = 'C';
    let currentKey = 'C';
    let transposeValue = 0;
    let isAdminLoggedIn = false;
    let songToDelete = null;
    let currentSongIndex = -1;
    
    // Touch state for swipe gestures
    let touchStartX = 0;
    let touchEndX = 0;
    
    // Hardcoded admin credentials
    const ADMIN_USERNAME = "Abhi";
    const ADMIN_PASSWORD = "Gamitn@1975";
    
    // Show notification
    function showNotification(message, type = 'success') {
        notification.textContent = message;
        notification.className = `notification ${type} show`;
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    // Toggle sidebar
    function toggleSidebar() {
        sidebar.classList.toggle('sidebar-open');
        main.classList.toggle('main-shifted');
    }
    
    // Close sidebar when clicking outside on mobile
    function closeSidebarOnOutsideClick(e) {
        if (window.innerWidth <= 768 && 
            !sidebar.contains(e.target) && 
            !hamburger.contains(e.target) &&
            sidebar.classList.contains('sidebar-open')) {
            toggleSidebar();
        }
    }
    
    // Admin login
    function adminLogin(username, password) {
        // Check against hardcoded credentials
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            isAdminLoggedIn = true;
            localStorage.setItem('isAdminLoggedIn', 'true');
            updateAdminUI();
            adminLoginModal.style.display = 'none';
            showNotification('Login successful!');
            return true;
        }
        
        showNotification('Invalid username or password', 'error');
        return false;
    }
    
    // Admin logout
    function adminLogout() {
        isAdminLoggedIn = false;
        localStorage.setItem('isAdminLoggedIn', 'false');
        updateAdminUI();
        showNotification('Logged out successfully');
    }
    
    // Update admin UI
    function updateAdminUI() {
        if (isAdminLoggedIn) {
            addSongBtn.style.display = 'flex';
            adminLoginBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
            adminLoginBtn.onclick = adminLogout;
            
            // Add admin badge to logo
            const logo = document.querySelector('.logo h1');
            if (!logo.querySelector('.admin-badge')) {
                const badge = document.createElement('span');
                badge.className = 'admin-badge';
                badge.textContent = 'ADMIN';
                logo.appendChild(badge);
            }
        } else {
            addSongBtn.style.display = 'none';
            adminLoginBtn.innerHTML = '<i class="fas fa-user-shield"></i> Admin Login';
            adminLoginBtn.onclick = () => {
                adminLoginModal.style.display = 'block';
            };
            
            // Remove admin badge
            const badge = document.querySelector('.admin-badge');
            if (badge) {
                badge.remove();
            }
        }
        
        // Update song list to show/hide delete buttons
        renderSongList();
    }
    
    // Check admin login status on load
    if (localStorage.getItem('isAdminLoggedIn') === 'true') {
        isAdminLoggedIn = true;
        updateAdminUI();
    }
    
    // Load songs from JSON file
    function loadSongs() {
        // For development, we'll use fetch to get the songs
        // In production, this will work when hosted on a server
        fetch('data/songs.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                songs = data;
                renderSongList();
            })
            .catch(error => {
                console.error('Error loading songs:', error);
                // Fallback to default songs if fetch fails
                songs = [
                    {
                        "id": "1",
                        "title": "Amazing Grace",
                        "artist": "John Newton",
                        "category": "worship",
                        "key": "C",
                        "lyrics": "[C]Amazing grace, how [G]sweet the sound\n[A7]That saved a wretch like [F]me\n[C]I once was lost, but [G]now am found\n[C]Was blind, but [F]now I [C]see"
                    }
                ];
                renderSongList();
                showNotification('Using fallback songs. Please check data/songs.json', 'error');
            });
    }
    
    // Save songs to JSON file (simulated)
    function saveSongs() {
        // In a real application, this would save to a backend
        // For this demo, we'll just show a notification
        showNotification('Songs updated! In a real app, this would save to the server.');
        
        // For demonstration, we'll log the songs to console
        console.log('Updated songs:', songs);
        
        // In a real implementation, you would:
        // 1. Send the songs to a backend API
        // 2. The backend would update the songs.json file
        // 3. The site would be rebuilt or reloaded
    }
    
    // Render song list
    function renderSongList(filteredSongs = songs) {
        songList.innerHTML = '';
        
        if (filteredSongs.length === 0) {
            songList.innerHTML = '<li class="no-songs">No songs found</li>';
            return;
        }
        
        filteredSongs.forEach((song, index) => {
            const li = document.createElement('li');
            
            if (isAdminLoggedIn) {
                // Show delete button for admin
                li.innerHTML = `
                    <div class="song-item">
                        <a href="#" data-id="${song.id}" data-index="${index}">${song.title}</a>
                        <button class="delete-btn" data-id="${song.id}" title="Delete song">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
            } else {
                // Regular users see just the song title
                li.innerHTML = `<a href="#" data-id="${song.id}" data-index="${index}">${song.title}</a>`;
            }
            
            songList.appendChild(li);
        });
        
        // Add click event to song links
        document.querySelectorAll('#songList a').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const songId = this.getAttribute('data-id');
                const songIndex = parseInt(this.getAttribute('data-index'));
                loadSong(songId, songIndex);
                
                // Close sidebar on mobile after selection
                if (window.innerWidth <= 768) {
                    toggleSidebar();
                }
            });
        });
        
        // Add click event to delete buttons (only for admin)
        if (isAdminLoggedIn) {
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    const songId = this.getAttribute('data-id');
                    showDeleteConfirmation(songId);
                });
            });
        }
    }
    
    // Show delete confirmation modal
    function showDeleteConfirmation(songId) {
        songToDelete = songId;
        deleteModal.style.display = 'block';
    }
    
    // Delete song
    function deleteSong(songId) {
        const songIndex = songs.findIndex(song => song.id === songId);
        if (songIndex !== -1) {
            const songTitle = songs[songIndex].title;
            songs.splice(songIndex, 1);
            saveSongs();
            renderSongList();
            
            // Clear song content if deleted song is currently being viewed
            if (currentSong && currentSong.id === songId) {
                currentSong = null;
                currentSongIndex = -1;
                songContent.innerHTML = `
                    <div class="welcome-message">
                        <h2>Welcome to Lyrics Collection</h2>
                        <p>Select a song from the list to view lyrics and chords</p>
                    </div>
                `;
            }
            
            showNotification(`"${songTitle}" has been deleted`);
        }
    }
    
    // Process lyrics to display chords above lyrics - FIXED VERSION
    function processLyrics(lyrics) {
        const lines = lyrics.split('\n');
        let processedHTML = '';
        
        lines.forEach(line => {
            if (line.trim() === '') {
                processedHTML += '<div class="lyric-line empty-line"></div>';
                return;
            }
            
            // We'll remove all chord markers to get the pure lyric line
            const lyricLine = line.replace(/\[([^\]]+)\]/g, '');
            
            // Create an array for the chord line, initially filled with spaces
            const chordLineArray = new Array(lyricLine.length).fill(' ');
            
            let currentChord = '';
            let inChord = false;
            let lyricPos = 0; // Position in the lyric line (without chord markers)
            
            // Process each character in the original line
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                
                if (char === '[') {
                    // Start of a chord
                    inChord = true;
                    currentChord = '';
                } else if (char === ']' && inChord) {
                    // End of a chord
                    inChord = false;
                    
                    // Place the chord at the current lyric position
                    // If the chord is longer than available space, extend the array
                    if (lyricPos + currentChord.length > chordLineArray.length) {
                        for (let j = chordLineArray.length; j < lyricPos + currentChord.length; j++) {
                            chordLineArray.push(' ');
                        }
                    }
                    
                    // Place each character of the chord in the chordLineArray
                    for (let j = 0; j < currentChord.length; j++) {
                        if (lyricPos + j < chordLineArray.length) {
                            chordLineArray[lyricPos + j] = currentChord[j];
                        }
                    }
                } else if (inChord) {
                    // Collect chord characters
                    currentChord += char;
                } else {
                    // Regular lyric character
                    lyricPos++;
                }
            }
            
            // Convert the chord line array to a string
            const chordLine = chordLineArray.join('');
            
            processedHTML += `<div class="chord-line">${chordLine}</div>`;
            processedHTML += `<div class="lyric-line">${lyricLine}</div>`;
        });
        
        return processedHTML;
    }
    
    // Load a song
    function loadSong(songId, songIndex) {
        const song = songs.find(s => s.id === songId);
        if (!song) return;
        
        currentSong = song;
        currentSongIndex = songIndex;
        originalKey = song.key;
        currentKey = song.key;
        transposeValue = 0;
        currentKeyDisplay.textContent = currentKey;
        
        // Render song content with chords above lyrics
        renderSongContent(song.lyrics);
        
        // Highlight active song in the list
        document.querySelectorAll('#songList a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-id') === songId) {
                link.classList.add('active');
            }
        });
    }
    
    // Navigate to next song
    function nextSong() {
        if (songs.length === 0 || currentSongIndex === -1) return;
        
        const nextIndex = (currentSongIndex + 1) % songs.length;
        const nextSong = songs[nextIndex];
        loadSong(nextSong.id, nextIndex);
    }
    
    // Navigate to previous song
    function prevSong() {
        if (songs.length === 0 || currentSongIndex === -1) return;
        
        const prevIndex = (currentSongIndex - 1 + songs.length) % songs.length;
        const prevSong = songs[prevIndex];
        loadSong(prevSong.id, prevIndex);
    }
    
    // Render song content with chords above lyrics
    function renderSongContent(lyrics) {
        if (!currentSong) return;
        
        // Process lyrics to display chords above lyrics
        const processedLyrics = processLyrics(lyrics);
        
        songContent.innerHTML = `
            <div class="lyrics-container">
                <h2>${currentSong.title}</h2>
                <div class="artist">${currentSong.artist}</div>
                <div class="lyrics-content">${processedLyrics}</div>
            </div>
        `;
    }
    
    // Search functionality
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const filteredSongs = songs.filter(song => 
            song.title.toLowerCase().includes(searchTerm) || 
            song.artist.toLowerCase().includes(searchTerm)
        );
        renderSongList(filteredSongs);
    });
    
    // Category filter
    categoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active category
            categoryLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Filter songs by category
            const category = this.getAttribute('data-category');
            if (category === 'all') {
                renderSongList();
            } else {
                const filteredSongs = songs.filter(song => song.category === category);
                renderSongList(filteredSongs);
            }
        });
    });
    
    // Theme toggle
    themeToggle.addEventListener('click', function() {
        const body = document.body;
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Update icon
        const icon = this.querySelector('i');
        icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    });
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    if (savedTheme === 'dark') {
        themeToggle.querySelector('i').className = 'fas fa-sun';
    }
    
    // Hamburger menu toggle
    hamburger.addEventListener('click', toggleSidebar);
    
    // Close sidebar when clicking outside
    document.addEventListener('click', closeSidebarOnOutsideClick);
    
    // Admin login button click
    adminLoginBtn.addEventListener('click', function() {
        if (!isAdminLoggedIn) {
            adminLoginModal.style.display = 'block';
        }
    });
    
    // Admin login form
    adminLoginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('adminUsername').value;
        const password = document.getElementById('adminPassword').value;
        
        adminLogin(username, password);
        this.reset();
    });
    
    // Add song modal
    addSongBtn.addEventListener('click', function() {
        document.getElementById('modalTitle').textContent = 'Add New Song';
        songForm.reset();
        songModal.style.display = 'block';
    });
    
    // Close modals
    closeModal.forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            adminLoginModal.style.display = 'none';
            songModal.style.display = 'none';
            deleteModal.style.display = 'none';
        });
    });
    
    window.addEventListener('click', function(e) {
        if (e.target === adminLoginModal) {
            adminLoginModal.style.display = 'none';
        }
        if (e.target === songModal) {
            songModal.style.display = 'none';
        }
        if (e.target === deleteModal) {
            deleteModal.style.display = 'none';
        }
    });
    
    // Delete confirmation buttons
    cancelDelete.addEventListener('click', function() {
        deleteModal.style.display = 'none';
        songToDelete = null;
    });
    
    confirmDelete.addEventListener('click', function() {
        if (songToDelete) {
            deleteSong(songToDelete);
            deleteModal.style.display = 'none';
            songToDelete = null;
        }
    });
    
    // Save song
    songForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = document.getElementById('songTitle').value;
        const artist = document.getElementById('songArtist').value;
        const category = document.getElementById('songCategory').value;
        const key = document.getElementById('songKey').value;
        const lyrics = document.getElementById('songLyrics').value;
        
        const newSong = {
            id: Date.now().toString(),
            title,
            artist,
            category,
            key,
            lyrics
        };
        
        songs.push(newSong);
        saveSongs();
        renderSongList();
        songModal.style.display = 'none';
        
        // Load the newly added song
        loadSong(newSong.id, songs.length - 1);
        showNotification('Song added successfully!');
    });
    
    // Transpose functionality
    transposeUp.addEventListener('click', function() {
        if (!currentSong) return;
        
        transposeValue++;
        currentKey = transposer.transposeChord(originalKey, transposeValue);
        currentKeyDisplay.textContent = currentKey;
        
        const transposedLyrics = transposer.transpose(currentSong.lyrics, transposeValue);
        renderSongContent(transposedLyrics);
    });
    
    transposeDown.addEventListener('click', function() {
        if (!currentSong) return;
        
        transposeValue--;
        currentKey = transposer.transposeChord(originalKey, transposeValue);
        currentKeyDisplay.textContent = currentKey;
        
        const transposedLyrics = transposer.transpose(currentSong.lyrics, transposeValue);
        renderSongContent(transposedLyrics);
    });
    
    resetKey.addEventListener('click', function() {
        if (!currentSong) return;
        
        transposeValue = 0;
        currentKey = originalKey;
        currentKeyDisplay.textContent = currentKey;
        
        renderSongContent(currentSong.lyrics);
    });
    
    // Download PDF with chords above lyrics
    downloadPDF.addEventListener('click', function() {
        if (!currentSong) return;
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Add title
        doc.setFontSize(20);
        doc.text(currentSong.title, 105, 20, { align: 'center' });
        
        // Add artist
        doc.setFontSize(14);
        doc.text(currentSong.artist, 105, 30, { align: 'center' });
        
        // Add key
        doc.setFontSize(12);
        doc.text(`Key: ${currentKey}`, 105, 40, { align: 'center' });
        
        // Process lyrics for PDF
        let lyricsText = currentSong.lyrics;
        if (transposeValue !== 0) {
            lyricsText = transposer.transpose(currentSong.lyrics, transposeValue);
        }
        
        // Split lyrics into lines
        const lines = lyricsText.split('\n');
        let yPosition = 50;
        
        lines.forEach(line => {
            if (yPosition > 270) {
                doc.addPage();
                yPosition = 20;
            }
            
            if (line.trim() === '') {
                yPosition += 5;
            } else {
                // Process the line to extract chords and lyrics for PDF
                const lyricLine = line.replace(/\[([^\]]+)\]/g, '');
                const chordLineArray = new Array(lyricLine.length).fill(' ');
                
                let currentChord = '';
                let inChord = false;
                let lyricPos = 0;
                
                // Process each character in the original line
                for (let i = 0; i < line.length; i++) {
                    const char = line[i];
                    
                    if (char === '[') {
                        // Start of a chord
                        inChord = true;
                        currentChord = '';
                    } else if (char === ']' && inChord) {
                        // End of a chord
                        inChord = false;
                        
                        // Place the chord at the current lyric position
                        if (lyricPos + currentChord.length > chordLineArray.length) {
                            for (let j = chordLineArray.length; j < lyricPos + currentChord.length; j++) {
                                chordLineArray.push(' ');
                            }
                        }
                        
                        for (let j = 0; j < currentChord.length; j++) {
                            if (lyricPos + j < chordLineArray.length) {
                                chordLineArray[lyricPos + j] = currentChord[j];
                            }
                        }
                    } else if (inChord) {
                        // Collect chord characters
                        currentChord += char;
                    } else {
                        // Regular lyric character
                        lyricPos++;
                    }
                }
                
                const chordLine = chordLineArray.join('');
                
                // Add chord line to PDF
                doc.setFontSize(10);
                doc.text(chordLine, 15, yPosition);
                yPosition += 5;
                
                // Add lyric line to PDF
                doc.setFontSize(12);
                doc.text(lyricLine, 15, yPosition);
                yPosition += 10;
            }
        });
        
        // Save the PDF
        doc.save(`${currentSong.title} - ${currentSong.artist}.pdf`);
        showNotification('PDF downloaded successfully!');
    });
    
    // Touch event handlers for swipe gestures
    songContainer.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, false);
    
    songContainer.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, false);
    
    // Handle swipe gesture
    function handleSwipe() {
        const swipeThreshold = 50; // Minimum distance for swipe
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next song
                nextSong();
            } else {
                // Swipe right - previous song
                prevSong();
            }
        }
    }
    
    // PWA Install Button functionality
    let deferredPrompt;
    
    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        // Stash the event so it can be triggered later
        deferredPrompt = e;
        // Show the install button
        if (installBtn) {
            installBtn.style.display = 'flex';
        }
        if (installPrompt) {
            installPrompt.style.display = 'block';
        }
    });
    
    // Install button click event
    if (installBtn) {
        installBtn.addEventListener('click', () => {
            // Show the install prompt
            deferredPrompt.prompt();
            // Wait for the user to respond to the prompt
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                    showNotification('App installed successfully!');
                } else {
                    console.log('User dismissed the install prompt');
                }
                // Hide the install button
                installBtn.style.display = 'none';
                if (installPrompt) {
                    installPrompt.style.display = 'none';
                }
                deferredPrompt = null;
            });
        });
    }
    
    // Hide the install button if the PWA is already installed
    window.addEventListener('appinstalled', () => {
        if (installBtn) {
            installBtn.style.display = 'none';
        }
        if (installPrompt) {
            installPrompt.style.display = 'none';
        }
        showNotification('Thank you for installing our app!');
    });
    
    // Check if the app is running in standalone mode (already installed)
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.navigator.standalone === true) {
        // App is running in standalone mode
        if (installBtn) {
            installBtn.style.display = 'none';
        }
        if (installPrompt) {
            installPrompt.style.display = 'none';
        }
    }
    
    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                })
                .catch(error => {
                    console.log('ServiceWorker registration failed: ', error);
                });
        });
    }
    
    // Initialize the app
    loadSongs();
});
