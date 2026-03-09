let songs = JSON.parse(localStorage.getItem('spotCloudPlaylist')) || [];
let currentSongIndex = 0;
const audio = document.getElementById('audio-player');
const playIcon = document.getElementById('play-icon');


audio.crossOrigin = "anonymous";

window.onload = () => renderPlaylist();

function addMusic() {
    const title = document.getElementById('songTitle').value;
    let url = document.getElementById('songUrl').value;

    if (!title || !url) return alert("Preencha o nome e o link!");

 
    if (url.includes("dropbox.com")) {
       
        url = url.replace("www.dropbox.com", "dl.dropboxusercontent.com").replace("?dl=0", "?raw=1");
    }
    
  
    if (url.includes("drive.google.com")) {
        const fileId = url.match(/[-\w]{25,}/);
        if (fileId && fileId[0]) {
            url = `https://docs.google.com/uc?export=open&id=${fileId[0]}`;
        }
    }

    songs.push({ title, url });
    localStorage.setItem('spotCloudPlaylist', JSON.stringify(songs));
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
                <button onclick="removeSong(event, ${index})" style="background:none; border:none; color:gray; cursor:pointer">
