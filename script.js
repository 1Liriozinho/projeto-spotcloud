let songs = JSON.parse(localStorage.getItem('myPlaylist')) || [];
let currentSongIndex = 0;
const audio = document.getElementById('audio-player');
const playIcon = document.getElementById('play-icon');

// Carregar playlist ao iniciar
window.onload = () => renderPlaylist();

function addMusic() {
    const title = document.getElementById('songTitle').value;
    let url = document.getElementById('songUrl').value;

    if (!title || !url) return alert("Preencha o nome e o link!");

    if (url.includes("drive.google.com")) {
        const fileId = url.match(/[-\w]{25,}/);
        if (fileId) url = `https://docs.google.com/uc?export=download&id=${fileId[0]}`;
    }

    songs.push({ title, url });
    localStorage.setItem('myPlaylist', JSON.stringify(songs)); // Salva no navegador
    renderPlaylist();
    
    document.getElementById('songTitle').value = '';
    document.getElementById('songUrl').value = '';
}

function renderPlaylist() {
    const container = document.getElementById('playlist');
    container.innerHTML = '';
    songs.forEach((song, index) => {
        container.innerHTML += `
            <div class="song-item" onclick="playSong(${index})">
                <span><i class="fas fa-music" style="margin-right:10px"></i> ${song.title}</span>
                <button onclick="removeSong(event, ${index})" style="background:none; border:none; color:gray; cursor:pointer"><i class="fas fa-trash"></i></button>
            </div>
        `;
    });
}

function removeSong(event, index) {
    event.stopPropagation();
    songs.splice(index, 1);
    localStorage.setItem('myPlaylist', JSON.stringify(songs));
    renderPlaylist();
}

function playSong(index) {
    currentSongIndex = index;
    audio.src = songs[index].url;
    document.getElementById('current-title').innerText = songs[index].title;
    audio.play();
    playIcon.className = "fas fa-pause-circle";
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
    const seekTo = audio.duration * (document.getElementById('progress').value / 100);
    audio.currentTime = seekTo;
}

function changeVolume() {
    audio.volume = document.getElementById('volume').value / 100;
}

audio.ontimeupdate = () => {
    const progress = (audio.currentTime / audio.duration) * 100;
    document.getElementById('progress').value = progress || 0;
};

audio.onended = () => nextSong();

function addMusic() {
    const title = document.getElementById('songTitle').value;
    let url = document.getElementById('songUrl').value;

    if (!title || !url) return alert("Preencha o nome e o link!");

    // Nova lógica de conversão para Google Drive
    if (url.includes("drive.google.com")) {
        // Extrai o ID do arquivo do link
        const fileId = url.match(/[-\w]{25,}/);
        if (fileId) {
            // Usamos o link de 'preview' que o navegador aceita melhor para streaming
            url = `https://drive.google.com/uc?id=${fileId[0]}&export=open`;
        }
    }

    songs.push({ title, url });
    localStorage.setItem('myPlaylist', JSON.stringify(songs));
    renderPlaylist();
    
    document.getElementById('songTitle').value = '';
    document.getElementById('songUrl').value = '';
}
