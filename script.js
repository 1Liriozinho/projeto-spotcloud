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

    // Lógica aprimorada para conversão de Google Drive
    if (url.includes("drive.google.com")) {
        // Essa expressão regular captura o ID do arquivo de qualquer formato de link do Drive
        const fileId = url.match(/[-\w]{25,}/);
        if (fileId && fileId[0]) {
            // Formato de link direto para streaming que ignora a página de aviso do Google
            url = `https://docs.google.com/uc?export=open&id=${fileId[0]}`;
        }
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
    if (!songs[index]) return;
    currentSongIndex = index;
    audio.src = songs[index].url;
    document.getElementById('current-title').innerText = songs[index].title;
    
    // Tenta dar o play e trata possíveis erros de link quebrado
    audio.play().catch(error => {
        console.error("Erro ao tocar música:", error);
        alert("Não foi possível carregar esta música. Verifique se o link está correto e público.");
    });
    
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
    if (!audio.duration) return;
    const seekTo = audio.duration * (document.getElementById('progress').value / 100);
    audio.currentTime = seekTo;
}

function changeVolume() {
    audio.volume = document.getElementById('volume').value / 100;
}

audio.ontimeupdate = () => {
    if (audio.duration) {
        const progress = (audio.currentTime / audio.duration) * 100;
        document.getElementById('progress').value = progress || 0;
