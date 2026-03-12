let songs = JSON.parse(localStorage.getItem('spotCloudPlaylist')) || [];
let currentSongIndex = 0;
const audio = document.getElementById('audio-player');
const playIcon = document.getElementById('play-icon');

window.onload = () => {
    renderPlaylist();

    // Permitir busca ao apertar Enter
    const searchInput = document.getElementById('searchInput');
    if(searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchMusic();
        });
    }

    const dbBtn = document.getElementById('db-chooser-btn');
    if (dbBtn) {
        dbBtn.addEventListener('click', function() {
            Dropbox.choose({
                success: function(files) {
                    files.forEach(function(file) {
                        const directUrl = file.link.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
                        songs.push({ 
                            title: file.name.replace('.mp3', ''), 
                            url: directUrl 
                        });
                    });
                    saveAndRender();
                },
                linkType: "direct",
                multiselect: true,
                extensions: ['.mp3', '.wav'],
            });
        });
    }
};

// NOVA FUNÇÃO: BUSCAR NO JAMENDO
async function searchMusic() {
    const query = document.getElementById('searchInput').value;
    const resultsContainer = document.getElementById('search-results');
    const clientId = '56d30cce'; // Client ID público

    if (!query) return;
    
    resultsContainer.innerHTML = '<p style="padding:15px; color: #b3b3b3;">Buscando...</p>';
    resultsContainer.style.display = 'block';

    try {
        const response = await fetch(`https://api.jamendo.com/v3.0/tracks/?client_id=${clientId}&format=jsonpost&limit=10&namesearch=${encodeURIComponent(query)}&audioformat=mp32`);
        const data = await response.json();
        
        resultsContainer.innerHTML = '';

        if (!data.results || data.results.length === 0) {
            resultsContainer.innerHTML = '<p style="padding:15px; color: #b3b3b3;">Nada encontrado.</p>';
            return;
        }

        data.results.forEach(track => {
            const div = document.createElement('div');
            div.className = 'search-result-item';
            div.innerHTML = `
                <img src="${track.image}" onerror="this.src='https://via.placeholder.com/40'">
                <div class="search-info">
                    <strong>${track.name}</strong><br>
                    <small>${track.artist_name}</small>
                </div>
                <i class="fas fa-plus-circle"></i>
            `;
            div.onclick = () => {
                songs.push({ title: `${track.name} - ${track.artist_name}`, url: track.audio });
                saveAndRender();
                resultsContainer.style.display = 'none';
                document.getElementById('searchInput').value = '';
            };
            resultsContainer.appendChild(div);
        });
    } catch (e) {
        resultsContainer.innerHTML = '<p style="padding:15px; color: red;">Erro na conexão.</p>';
    }
}

// Fecha resultados se clicar fora
document.addEventListener('click', (e) => {
    const container = document.querySelector('.search-container');
    if (container && !container.contains(e.target)) {
        document.getElementById('search-results').style.display = 'none';
    }
});

function addMusic() {
    const title = document.getElementById('songTitle').value;
    let url = document.getElementById('songUrl').value;
    if (!title || !url) return alert("Preencha o nome e o link!");

    if (url.includes("drive.google.com")) {
        const fileId = url.match(/[-\w]{25,}/);
        if (fileId) url = `https://docs.google.com/uc?export=open&id=${fileId[0]}`;
    }

    if (url.includes("dropbox.com")) {
        url = url.replace("www.dropbox.com", "dl.dropboxusercontent.com")
                 .replace("?dl=0", "?raw=1")
                 .replace("?dl=1", "?raw=1");
    }

    songs.push({ title, url });
    saveAndRender();
    document.getElementById('songTitle').value = '';
    document.getElementById('songUrl').value = '';
}

function saveAndRender() {
    localStorage.setItem('spotCloudPlaylist', JSON.stringify(songs));
    renderPlaylist();
}

function renderPlaylist() {
    const container = document.getElementById('playlist');
    container.innerHTML = '';
    songs.forEach((song, index) => {
        const isActive = index === currentSongIndex ? 'active-song' : '';
        container.innerHTML += `
            <div class="song-item ${isActive}" onclick="playSong(${index})">
                <span><i class="fas fa-music" style="margin-right:10px"></i> ${song.title}</span>
                <button onclick="removeSong(event, ${index})" style="background:none; border:none; color:gray; cursor:pointer">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    });
}

function playSong(index) {
    if (songs.length === 0) return;
    currentSongIndex = index;
    const song = songs[index];
    
    audio.src = song.url;
    document.getElementById('current-title').innerText = song.title;
    
    audio.play().then(() => {
        playIcon.className = "fas fa-pause-circle";
    }).catch(err => {
        console.error("Erro ao tocar:", err);
    });

    renderPlaylist(); 
}

function togglePlay() {
    if (!audio.src) return;
    if (audio.paused) {
        audio.play();
        playIcon.className = "fas fa-pause-circle";
    } else {
        audio.pause();
        playIcon.className = "fas fa-play-circle";
    }
}

function removeSong(event, index) {
    event.stopPropagation();
    songs.splice(index, 1);
    saveAndRender();
}

function nextSong() {
    if (songs.length === 0) return;
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    playSong(currentSongIndex);
}

function prevSong() {
    if (songs.length === 0) return;
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    playSong(currentSongIndex);
}

function seek() {
    if (!audio.duration) return;
    audio.currentTime = audio.duration * (document.getElementById('progress').value / 100);
}

function changeVolume() {
    audio.volume = document.getElementById('volume').value / 100;
}

audio.ontimeupdate = () => {
    if (audio.duration) {
        document.getElementById('progress').value = (audio.currentTime / audio.duration) * 100;
    }
};

audio.onended = () => nextSong();
