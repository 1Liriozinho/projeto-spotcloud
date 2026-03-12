let songs = JSON.parse(localStorage.getItem('spotCloudPlaylist')) || [];
let currentSongIndex = 0;
const audio = document.getElementById('audio-player');
const playIcon = document.getElementById('play-icon');

// Renderiza ao abrir a página
document.addEventListener('DOMContentLoaded', () => {
    renderPlaylist();
    
    // Configura o botão do Dropbox de forma mais segura
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

    // Configura o Enter na busca
    const searchInput = document.getElementById('searchInput');
    if(searchInput) {
        searchInput.onkeypress = (e) => {
            if (e.key === 'Enter') searchMusic();
        };
    }
});

// FUNÇÃO DE BUSCA ATUALIZADA (JAMENDO)
async function searchMusic() {
    const query = document.getElementById('searchInput').value;
    const resultsContainer = document.getElementById('search-results');
    // ID de cliente reserva caso o outro tenha atingido limite
    const clientId = '56d30cce'; 

    if (!query) return;
    
    resultsContainer.innerHTML = '<p style="padding:15px; color: #b3b3b3;">Procurando...</p>';
    resultsContainer.style.display = 'block';

    try {
        // Adicionamos filtros para garantir que só venham MP3 válidos
        const response = await fetch(`https://api.jamendo.com/v3.0/tracks/?client_id=${clientId}&format=json&limit=10&namesearch=${encodeURIComponent(query)}&audioformat=mp32&hasimage=true`);
        const data = await response.json();
        
        resultsContainer.innerHTML = '';

        if (!data.results || data.results.length === 0) {
            resultsContainer.innerHTML = '<p style="padding:15px;">Nada encontrado. Tente nomes simples como "Rock".</p>';
            return;
        }

        data.results.forEach(track => {
            const div = document.createElement('div');
            div.className = 'search-result-item';
            div.innerHTML = `
                <img src="${track.image}" width="40" height="40" style="border-radius:4px">
                <div class="search-info">
                    <strong>${track.name}</strong><br>
                    <small>${track.artist_name}</small>
                </div>
                <i class="fas fa-plus-circle" style="color:#8a2be2"></i>
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
        console.error("Erro na API:", e);
        resultsContainer.innerHTML = '<p style="padding:15px; color:red;">Erro ao buscar. Verifique sua conexão.</p>';
    }
}

function addMusic() {
    const title = document.getElementById('songTitle').value;
    let url = document.getElementById('songUrl').value;
    if (!title || !url) return alert("Preencha o nome e o link!");

    // Correção automática de links Dropbox colados manualmente
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
        console.log("Erro Play:", err);
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

// Fechar resultados ao clicar fora
document.addEventListener('click', (e) => {
    const results = document.getElementById('search-results');
    if (results && !e.target.closest('.search-container')) {
        results.style.display = 'none';
    }
});
