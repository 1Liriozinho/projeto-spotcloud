let songs = [];
let currentSongIndex = 0;
const audio = document.getElementById('audio-player');
const playIcon = document.getElementById('play-icon');

// Configuração de segurança para tocar de servidores externos
audio.crossOrigin = "anonymous";

const PLAYLIST_SOURCE = 'playlist.json'; 

window.onload = () => {
    fetch(PLAYLIST_SOURCE)
        .then(response => response.json())
        .then(data => {
            songs = data.map(song => ({
                ...song,
                url: convertDropboxLink(song.url)
            }));
            renderPlaylist();
        })
        .catch(err => console.error("Erro ao carregar playlist:", err));
};

// FUNÇÃO ATUALIZADA PARA O NOVO FORMATO DO DROPBOX
function convertDropboxLink(url) {
    if (url.includes("dropbox.com")) {
        let directUrl = url
            .replace("www.dropbox.com", "dl.dropboxusercontent.com") // Servidor de conteúdo
            .replace(/\?dl=0|\?dl=1/, ""); // Remove o parâmetro de download padrão

        // Se o link já tiver outros parâmetros (como rlkey ou st), 
        // garantimos que o raw=1 seja adicionado corretamente
        if (directUrl.includes("?")) {
            directUrl = directUrl.replace(/\?/, "?raw=1&");
        } else {
            directUrl += "?raw=1";
        }
        return directUrl;
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
        console.error("Erro no link:", err);
        alert("O servidor bloqueou o acesso. Verifique se o link do Dropbox está configurado como 'Qualquer pessoa com o link pode visualizar'.");
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
