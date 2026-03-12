let songs = JSON.parse(localStorage.getItem('spotCloudPlaylist')) || [];
let currentSongIndex = 0;
const audio = document.getElementById('audio-player');
const playIcon = document.getElementById('play-icon');


document.addEventListener('DOMContentLoaded', () => {
    renderPlaylist();
    
   
    const dbBtn = document.getElementById('db-chooser-btn');
    if (dbBtn) {
        dbBtn.onclick = function() {
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
                extensions: ['.mp3'],
            });
        };
    }


    const searchInput = document.getElementById('searchInput');
    if(searchInput) {
        searchInput.onkeypress = (e) => {
            if (e.key === 'Enter') searchMusic();
        };
    }
});


async function searchMusic() {
    const query = document.getElementById('searchInput').value.trim();
    const resultsContainer = document.getElementById('search-results');
    const clientId = '56d30cce'; // Client ID de teste estável

    if (!query) return;
    
    resultsContainer.innerHTML = '<p style="padding:15px; color: #b3b3b3;">Buscando no catálogo independente...</p>';
    resultsContainer.style.display = 'block';

    try {
       
        const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${clientId}&format=json&limit=15&search=${encodeURIComponent(query)}&audioformat=mp32&order=popularity_total`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        resultsContainer.innerHTML = '';

        if (!data.results || data.results.length === 0) {
            resultsContainer.innerHTML = '<p style="padding:15px; color: #b3b3b3;">Nada encontrado. Tente termos como "Rock", "Lofi" ou "Electronic".</p>';
            return;
        }

        data.results.forEach(track => {
            const div = document.createElement('div');
            div.className = 'search-result-item';
            div.innerHTML = `
                <img src="${track.image || 'https://via.placeholder.com/40'}" width="40" height="40" style="border-radius:4px; object-fit: cover;">
                <div class="search-info" style="flex:1; margin-left:10px;">
                    <strong style="font-size:14px; display:block; color:white;">${track.name}</strong>
                    <small style="color:#b3b3b3; font-size:12px;">${track.artist_name}</small>
                </div>
                <i class="fas fa-plus-circle" style="color:#8a2be2; font-size:20px;"></i>
            `;
            
            div.onclick = () => {
                songs.push({ 
                    title: `${track.name} - ${track.artist_name}`, 
                    url: track.audio 
                });
                saveAndRender();
                resultsContainer.style.display = 'none';
                document.getElementById('searchInput').value = '';
            };
            resultsContainer.appendChild(div);
        });

    } catch (e) {
        console.error("Erro na API:", e);
        resultsContainer.innerHTML = '<p style="padding:15px; color:red;">Erro na conexão com o servidor de música.</p>';
    }
}


function addMusic() {
    const title = document.getElementById('songTitle').value;
    let url = document.getElementById('songUrl').value;
    if (!title || !url) return alert("Preencha o nome e o link!");

    if (url.includes("drive.google.com")) {
        const fileId = url.match(/[-\w]{25,}/);
        if (fileId) url = `https://docs.google.com/uc?export=open&id=${fileId[0]}`;
    }

    if (url.includes("dropbox.com")) {
        url = url.replace("www.dropbox.com", "dl.dropboxusercontent.com").replace("?dl=0", "").replace("?dl=1", "");
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
    if(!container) return;
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
        console.error("Erro Play:", err);
    });
    renderPlaylist(); 
}

function togglePlay() {
    if (!audio.src && songs.length > 0) { playSong(0); return; }
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

document.addEventListener('click', (e) => {
    const results = document.getElementById('search-results');
    if (results && !e.target.closest('.search-container')) {
        results.style.display = 'none';
    }
});
