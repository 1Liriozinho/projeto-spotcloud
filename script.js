let songs = [];
let currentSongIndex = 0;
const audio = document.getElementById('audio-player');
const playIcon = document.getElementById('play-icon');

// Se você for usar o npoint.io, coloque o link aqui. 
// Se for usar o arquivo local do GitHub, mantenha 'playlist.json'.
const PLAYLIST_SOURCE = 'playlist.json'; 

audio.crossOrigin = "anonymous";

window.onload = () => {
    fetch(PLAYLIST_SOURCE)
        .then(response => response.json())
        .then(data => {
            // Converte todos os links da lista para o formato direto do Dropbox
            songs = data.map(song => ({
                ...song,
                url: convertDropboxLink(song.url)
            }));
            renderPlaylist();
        })
        .catch(err => {
            console.error("Erro ao carregar playlist:", err);
        });
};

// Função Mestra: Transforma link de "página" em link de "arquivo bruto"
function convertDropboxLink(url) {
    if (url.includes("dropbox.com")) {
        return url
            .replace("www.dropbox.com", "dl.dropboxusercontent.com")
            .replace("?dl=0", "?raw=1")
            .replace("?dl=1", "?raw=1");
    }
    return url;
}

function renderPlaylist() {
    const container = document.getElementById('playlist');
    container.innerHTML = '';
    songs.forEach((song, index) => {
        container.innerHTML += `
            <div class="song-item" onclick="playSong(${index})">
                <div class="song-info-list">
                    <i class="fas fa-music"></i>
                    <span>${song.title}</span>
                </div>
                <i class="fas fa-play-circle play-item-icon"></i>
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
        console.error("Erro no Dropbox:", err);
        alert("O Dropbox bloqueou o acesso ou o link expirou. Verifique se o arquivo é público.");
    });
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
