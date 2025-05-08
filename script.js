// Cek apakah user sudah login
const loggedInUser = localStorage.getItem("loggedInUser");
if (!loggedInUser) {
  alert("Anda harus login dulu.");
  window.location.href = "login.html";
}



// Dark mode toggle
const body = document.body;
const btn = document.querySelector('.toggle-btn');
const sunIcon = document.querySelector('.sun-svg');
const moonIcon = document.querySelector('.moon-svg');

function store(value) {
  localStorage.setItem('darkmode', value);
}

function load() {
  const darkmode = localStorage.getItem('darkmode');
  if (darkmode === 'true') {
    body.classList.add('darkmode');
  } else {
    body.classList.remove('darkmode');
  }
}
load();

btn.addEventListener('click', () => {
  body.classList.toggle('darkmode');
  store(body.classList.contains('darkmode'));

  if (body.classList.contains('darkmode')) {
    moonIcon.classList.add('rotate');
    setTimeout(() => moonIcon.classList.remove('rotate'), 0);
  } else {
    sunIcon.classList.add('rotate');
    setTimeout(() => sunIcon.classList.remove('rotate'), 0);
  }
});

// Search notes
const searchInput = document.getElementById("searchInput");
searchInput.addEventListener("keyup", function () {
  let filter = this.value.toLowerCase();
  showNotes(filter);
});

// Popup tambah note
const addBox = document.querySelector(".add-box"),
  popupBox =  document.getElementById("add-edit-popup"),
  popupTitle = popupBox.querySelector("header p"),
  closeIcon = popupBox.querySelector("header i"),
  titleTag = popupBox.querySelector("input"),
  descTag = popupBox.querySelector("textarea"),
  addBtn = popupBox.querySelector("button");

const months = ["January", "February", "March", "April", "May", "June", "July",
  "August", "September", "October", "November", "December"];
const notes = JSON.parse(localStorage.getItem("notes") || "[]");
let isUpdate = false, updateId;

addBox.addEventListener("click", () => {
  popupTitle.innerText = "Add a new Note";
  addBtn.innerText = "Add Note";
  popupBox.classList.add("show");
  document.querySelector("body").style.overflow = "hidden";
  if (window.innerWidth > 660) titleTag.focus();
});

closeIcon.addEventListener("click", () => {
  isUpdate = false;
  titleTag.value = descTag.value = "";
  popupBox.classList.remove("show");
  document.querySelector("body").style.overflow = "auto";
});

// Fungsi show menu
function showMenu(elem) {
  elem.parentElement.classList.add("show");
  document.addEventListener("click", e => {
    if (e.target.tagName != "I" || e.target != elem) {
      elem.parentElement.classList.remove("show");
    }
  });
}

// Hapus satu note
function deleteNote(noteId) {
  let confirmDel = confirm("Yakin hapus mau hapus ni notes?");
  if (!confirmDel) return;
  notes.splice(noteId, 1);
  localStorage.setItem("notes", JSON.stringify(notes));
  showNotes();
}

// Update note
function updateNote(noteId, title, filterDesc) {
  let description = filterDesc.replaceAll('<br/>', '\r\n');
  updateId = noteId;
  isUpdate = true;
  addBox.click();
  titleTag.value = title;
  descTag.value = description;
  popupTitle.innerText = "Update a Note";
  addBtn.innerText = "Update Note";
}

// Simpan note
addBtn.addEventListener("click", e => {
  e.preventDefault();
  let title = titleTag.value.trim(),
    description = descTag.value.trim(),
    background = document.getElementById("note-bg").value;

  const alertSound = document.getElementById("alert-sound");

  if (!title || !description) {
    if (alertSound) alertSound.play();
    alert("Title dan Description tidak boleh kosong!");
    return;
  }

  let currentDate = new Date(),
    month = months[currentDate.getMonth()],
    day = currentDate.getDate(),
    year = currentDate.getFullYear();

  let noteInfo = { title, description, background, date: `${month} ${day}, ${year}` };
  if (!isUpdate) {
    notes.push(noteInfo);
  } else {
    isUpdate = false;
    notes[updateId] = noteInfo;
  }
  localStorage.setItem("notes", JSON.stringify(notes));
  showNotes();
  closeIcon.click();
});


function applyPopupTheme(bgColor) {
  const content = document.querySelector(".popup .content");

  if (!content) return;

  const hex = bgColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

  const isDark = luminance < 150;

  content.style.setProperty("--popup-bg", bgColor);
  content.style.setProperty("--popup-text", isDark ? "#ffffff" : "#000000");
}

// Panggil saat background color berubah
document.getElementById("note-bg").addEventListener("input", (e) => {
  applyPopupTheme(e.target.value);
});

function toggleMenu() {
  const menu = document.querySelector('.menu1');
  menu.classList.toggle('show');
  document.addEventListener("click", function (e) {
    const menu = document.querySelector('.menu1');
    const barsIcon = document.querySelector('.uil-bars');
  
    if (!menu.contains(e.target) && !barsIcon.contains(e.target)) {
      menu.classList.remove('show');
    }
  });
  
}


// Hapus catatan yang dipilih
function deleteSelectedNotes() {
  let selectedCheckboxes = document.querySelectorAll(".note-checkbox:checked");
  if (selectedCheckboxes.length === 0) {
    alert("Tidak ada notes yang dipilih.");
    return;
  }

  let confirmDel = confirm("Yakin akan menghapus notes ini?");
  if (!confirmDel) return;

  let selectedIds = Array.from(selectedCheckboxes).map(cb => parseInt(cb.dataset.id));
  let noteElements = Array.from(selectedCheckboxes).map(cb => cb.closest(".note"));

  // Tambahkan animasi ke tiap elemen note
  noteElements.forEach(note => note.classList.add("fade-out"));

  // Setelah animasi selesai (misal 300ms), hapus dari localStorage dan DOM
  setTimeout(() => {
    // Update localStorage
    let newNotes = notes.filter((_, index) => !selectedIds.includes(index));
    localStorage.setItem("notes", JSON.stringify(newNotes));

    // Hapus elemen dari DOM
    noteElements.forEach(note => note.remove());
  }, 300); // Sama dengan durasi animasi
}


// Lihat full note
function openFullNote(title, description, id) {
  
  const bg = notes[id].background || "#ffffff";
  const fullNote = document.querySelector(".full-note-content");

  document.getElementById("full-note-title").innerText = title;
  document.getElementById("full-note-description").innerHTML = description.replace(/\n/g, "<br>");
  document.querySelector(".full-note-popup").style.display = "flex";

  fullNote.style.backgroundColor = bg;

  // Hapus class dulu
  fullNote.classList.remove("light-text", "dark-text");
  // Tambahkan class sesuai kecerahan
  if (isDarkColor(bg)) {
    fullNote.classList.add("light-text");
  } else {
    fullNote.classList.add("dark-text");
  }
  
}


document.querySelector(".close-full-note").addEventListener("click", function () {
  let popup = document.querySelector(".full-note-popup");
  popup.style.animation = "fadeOut 0.3s ease-in-out";
  setTimeout(() => {
    popup.style.display = "none";
    popup.style.animation = "fadeIn 0.3s ease-in-out";
  }, 300);
});

function isDarkColor(hexColor) {
  if (!hexColor || !hexColor.startsWith("#") || hexColor.length !== 7) {
    return false;
  }

  const color = hexColor.slice(1); 
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);

  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return false;
  }

  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance < 150; // true = warna gelap
}



// Tampilkan semua catatan
function showNotes(searchText = "") {
  if (!notes) return;
  document.querySelectorAll(".note").forEach(li => li.remove());

  notes.forEach((note, id) => {
    if (note.title.toLowerCase().includes(searchText.toLowerCase())) {
      let filterDesc = note.description.replaceAll("\n", "<br/>");
      let textColorClass = isDarkColor(note.background) ? "light-text" : "dark-text";

      let liTag = `
        <li class="note ${textColorClass}" onclick="openFullNote('${note.title.replace(/'/g, "\\'")}', \`${filterDesc.replace(/`/g, '\\`')}\`, ${id})"
            style="background: ${note.background};">
          <div class="details">
              <p>${note.title}</p>
              <span>${filterDesc}</span>
          </div>
          <div class="bottom-content ${textColorClass}">
              <span class="${textColorClass}" >${note.date}</span>
          
              <label class="cl-checkbox">
                  <input type="checkbox" class="note-checkbox" data-id="${id}" onclick="event.stopPropagation();">
                  <span></span>
              </label>
              <div class="settings">
                  <i onclick="showMenu(this); event.stopPropagation();" class="uil uil-ellipsis-h ${textColorClass}"></i>
                  <ul class="menu">
                      <li onclick="updateNote(${id}, '${note.title.replace(/'/g, "\\'")}', \`${filterDesc.replace(/`/g, '\\`')}\`); event.stopPropagation();">
                          <i class="uil uil-pen"></i>Edit
                      </li>
                      <li onclick="deleteNote(${id}); event.stopPropagation();">
                          <i class="uil uil-trash"></i>Delete
                      </li>
                  </ul>
              </div>
          </div>
        </li>`;

      document.querySelector(".wrapper").insertAdjacentHTML("beforeend", liTag);
    }
  });
}

showNotes();

// Warna background select
const select = document.getElementById('note-bg');
function updateSelectBg() {
  select.style.backgroundColor = select.value;
}
updateSelectBg();
select.addEventListener('change', updateSelectBg);

//delete slect
document.addEventListener("change", function () {
  const deleteBox = document.querySelector(".delete-box");
  const anyChecked = document.querySelectorAll(".note-checkbox:checked").length > 0;
  
  if (anyChecked) {
    deleteBox.classList.add("show-delete");
  } else {
    deleteBox.classList.remove("show-delete");
  }
});

function logout() {
  const confirmLogout = confirm("Yakin ingin logout?");
  if (confirmLogout) {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
  }
}
