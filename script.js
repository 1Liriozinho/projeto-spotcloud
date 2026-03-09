let songs = [];
let currentSongIndex = 0;
const audio = document.getElementById('audio-player');
const playIcon = document.getElementById('play-icon');

function addMusic() {
    const title = document.getElementById('songTitle').value;
    let url = document.getElementById('songUrl').value;

    if (!title || !url) return alert("Preencha tudo!");

    // Converter link do Google Drive para link direto de stream
    if (url.includes("drive.google.com")) {
        url = url.replace("/view?usp=sharing", "");
        const fileId = url.split('/d/')[1].split('/')[0];
        url = `https://docs.google.com/uc?export=download&id=${fileId}`;
    }

    songs.push({ title, url });
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
                <span>${index + 1}. ${song.title}</span>
                <i class="fas fa-play"></i>
            </div>
        `;
    });
}

function playSong(index) {
    currentSongIndex = index;
    audio.src = songs[index].url;
    document.getElementById('current-title').innerText = songs[index].title;
    audio.play();
    playIcon.className = "fas fa-pause-circle";
}

function togglePlay() {
    if (audio.paused) {
        audio.play();
        playIcon.className = "fas fa-pause-circle";
    } else {
        audio.pause();
        playIcon.className = "fas fa-play-circle";
    }
}

// Atualizar barra de progresso
audio.ontimeupdate = () => {
    const progress = (audio.currentTime / audio.duration) * 100;
    document.getElementById('progress').value = progress || 0;
};

// Próxima música automaticamente
audio.onended = () => nextSong();

function nextSong() {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    playSong(currentSongIndex);
}

function prevSong() {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    playSong(currentSongIndex);
}
