let songs = JSON.parse(localStorage.getItem('spotCloudPlaylist')) || [];
let currentSongIndex = 0;
const audio = document.getElementById('audio-player');
const playIcon = document.getElementById('play-icon');

window.onload = () => {
    renderPlaylist();
    const dbBtn = document.getElementById('db-chooser-btn');
    if (dbBtn) {
        dbBtn.addEventListener('click', () => {
            Dropbox.choose({
                success: (files) => {
                    files.forEach(file => {
                        const url = file.link.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
                        songs.push({ title: file.name.replace('.mp3', ''), url: url });
                    });
                    saveAndRender();
                },
                linkType: "direct", multiselect: true, extensions: ['.mp3']
            });
        });
    }
};

async function searchMusic() {
    const query = document.getElementById('searchInput').value;
    const resultsContainer = document.getElementById('search-results');
    if (!query) return;
    resultsContainer.innerHTML = '<p style="padding:10px">Buscando...</p>';
    resultsContainer.style.display = 'block';

    try {
        const response = await fetch(`https://api.jamendo.com/v3.0/tracks/?client_id=56d30cce&format=jsonpost&limit=5&search=${encodeURIComponent(query)}&audioformat=mp32`);
        const data = await response.json();
        resultsContainer.innerHTML = '';
        data.results.forEach(track => {
            const div = document.createElement('div');
            div.className = 'search-result-item';
            div.innerHTML = `<img src="${track.image}"><div><strong>${track.name}</strong><br><small>${track.artist_name}</small></div>`;
            div.onclick = () => {
                songs.push({ title: track.name, url: track.audio });
                saveAndRender();
                resultsContainer.style.display = 'none';
            };
            resultsContainer.appendChild(div);
        });
    } catch (e) { resultsContainer.innerHTML = '<p>Erro na busca.</p>'; }
}

function addMusic() {
    const title = document.getElementById('songTitle').value;
    let url = document.getElementById('songUrl').value;
    if (!title || !url) return alert("Preencha tudo!");
    if (url.includes("dropbox.com")) url = url.replace("www.dropbox.com", "dl.dropboxusercontent.com").replace("?dl=0", "?raw=1");
    songs.push({ title, url });
    saveAndRender();
}

function saveAndRender() {
    localStorage.setItem('spotCloudPlaylist', JSON.stringify(songs));
    renderPlaylist();
}

function renderPlaylist() {
    const container = document.getElementById('playlist');
    container.innerHTML = '';
    songs.forEach((song, index) => {
        const active = index === currentSongIndex ? 'active-song' : '';
        container.innerHTML += `
            <div class="song-item ${active}" onclick="playSong(${index})">
                <span><i class="fas fa-music"></i> ${song.title}</span>
                <button onclick="removeSong(event, ${index})" style="background:none; border:none; color:gray;"><i class="fas fa-trash"></i></button>
            </div>`;
    });
}

function playSong(index) {
    if (!songs[index]) return;
    currentSongIndex = index;
    audio.src = songs[index].url;
    document.getElementById('current-title').innerText = songs[index].title;
    audio.play();
    playIcon.className = "fas fa-pause-circle";
    renderPlaylist();
}

function togglePlay() {
    if (audio.paused) { audio.play(); playIcon.className = "fas fa-pause-circle"; }
    else { audio.pause(); playIcon.className = "fas fa-play-circle"; }
}

function removeSong(e, i) { e.stopPropagation(); songs.splice(i, 1); saveAndRender(); }
function nextSong() { currentSongIndex = (currentSongIndex + 1) % songs.length; playSong(currentSongIndex); }
function prevSong() { currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length; playSong(currentSongIndex); }
function seek() { audio.currentTime = audio.duration * (document.getElementById('progress').value / 100); }
function changeVolume() { audio.volume = document.getElementById('volume').value / 100; }
audio.ontimeupdate = () => { if (audio.duration) document.getElementById('progress').value = (audio.currentTime / audio.duration) * 100; };
audio.onended = () => nextSong();
