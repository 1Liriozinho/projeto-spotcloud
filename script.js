let songs = JSON.parse(localStorage.getItem('spotCloudPlaylist')) || [];
let currentSongIndex = 0;
const audio = document.getElementById('audio-player');
const playIcon = document.getElementById('play-icon');

window.onload = () => {
    renderPlaylist();


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

function addMusic() {
    const title = document.getElementById('songTitle').value;
    let url = document.getElementById('songUrl').value;

    if (!title || !url) return alert("Preencha o nome e o link!");

 
    if (url.includes("drive.google.com")) {
        const fileId = url.match(/[-\w]{25,}/);
        if (fileId) {
            url = `https://docs.google.com/uc?export=open&id=${fileId[0]}`;
        }
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
        alert("O acesso foi negado. Se for Dropbox, use o botão azul.");
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
