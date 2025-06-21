let playlistData = {
  all: [], // all songs
};
let currentPlaylist = 'all';
let currentTrackIndex = 0;

const fileUpload = document.getElementById("fileUpload");
const audio = document.getElementById("audio");
const playlistUI = document.getElementById("playlist");
const searchInput = document.getElementById("search");
const volumeSlider = document.getElementById("volume");
const playlistSelect = document.getElementById("playlistSelect");
const newPlaylistInput = document.getElementById("newPlaylistName");
const createPlaylistBtn = document.getElementById("createPlaylist");
const deletePlaylistBtn = document.getElementById("deletePlaylist");

fileUpload.addEventListener("change", (event) => {
  const files = Array.from(event.target.files);
  files.forEach(file => {
    const song = {
      name: file.name,
      file: URL.createObjectURL(file),
    };
    playlistData.all.push(song);
  });
  updatePlaylist();
  if (playlistData.all.length === files.length) {
    loadTrack(0);
  }
});

function updatePlaylist(filter = "") {
  playlistUI.innerHTML = "";
  const songs = playlistData[currentPlaylist] || [];

  songs.forEach((track, index) => {
    if (track.name.toLowerCase().includes(filter.toLowerCase())) {
      const li = document.createElement("li");
      li.innerHTML = `
        <span>${track.name}</span>
        <div>
          <button onclick="playFromList(${index})">▶</button>
          ${currentPlaylist !== 'all' ? `<button onclick="removeFromPlaylist(${index})">🗑️</button>` : ``}
          ${currentPlaylist === 'all' ? renderAddButton(track) : ''}
        </div>
      `;
      if (index === currentTrackIndex) li.classList.add("active");
      playlistUI.appendChild(li);
    }
  });
}

function renderAddButton(track) {
  let dropdown = `<select onchange="addToPlaylist(this.value, '${track.name}', '${track.file}')">
                    <option value="">➕ Add to Playlist</option>`;
  Object.keys(playlistData).forEach(name => {
    if (name !== 'all') {
      dropdown += `<option value="${name}">${name}</option>`;
    }
  });
  dropdown += '</select>';
  return dropdown;
}

function addToPlaylist(playlistName, songName, songFile) {
  if (!playlistName || playlistName === 'all') return;
  const song = { name: songName, file: songFile };
  playlistData[playlistName] = playlistData[playlistName] || [];
  // prevent duplicate
  if (!playlistData[playlistName].some(s => s.name === songName)) {
    playlistData[playlistName].push(song);
  }
}

function removeFromPlaylist(index) {
  playlistData[currentPlaylist].splice(index, 1);
  updatePlaylist(searchInput.value);
}

function playFromList(index) {
  currentTrackIndex = index;
  audio.src = playlistData[currentPlaylist][index].file;
  audio.play();
  updatePlaylist(searchInput.value);
}

function playPause() {
  if (audio.paused) {
    audio.play();
  } else {
    audio.pause();
  }
}

function nextTrack() {
  const songs = playlistData[currentPlaylist];
  currentTrackIndex = (currentTrackIndex + 1) % songs.length;
  playFromList(currentTrackIndex);
}

function prevTrack() {
  const songs = playlistData[currentPlaylist];
  currentTrackIndex = (currentTrackIndex - 1 + songs.length) % songs.length;
  playFromList(currentTrackIndex);
}

searchInput.addEventListener("input", () => {
  updatePlaylist(searchInput.value);
});

volumeSlider.addEventListener("input", () => {
  audio.volume = volumeSlider.value;
});

document.getElementById("toggleTheme").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

function refreshPlaylistDropdown() {
  playlistSelect.innerHTML = "";
  Object.keys(playlistData).forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name === "all" ? "All Songs" : name;
    playlistSelect.appendChild(opt);
  });
  playlistSelect.value = currentPlaylist;
}

playlistSelect.addEventListener("change", (e) => {
  currentPlaylist = e.target.value;
  currentTrackIndex = 0;
  updatePlaylist(searchInput.value);
});

createPlaylistBtn.addEventListener("click", () => {
  const name = newPlaylistInput.value.trim();
  if (!name || playlistData[name]) return;
  playlistData[name] = [];
  newPlaylistInput.value = "";
  refreshPlaylistDropdown();
});

deletePlaylistBtn.addEventListener("click", () => {
  if (currentPlaylist === "all") return;
  delete playlistData[currentPlaylist];
  currentPlaylist = "all";
  refreshPlaylistDropdown();
  updatePlaylist();
});

// Init
refreshPlaylistDropdown();
updatePlaylist();
