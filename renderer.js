const { ipcRenderer } = require('electron');
const FV = require('fivem-stats');
const server_ip = 'extinction5.gtaliferp.fr';
const server = new FV.Stats(server_ip);

// 'program-status' mesajını aldığınızda çalışacak işlem
ipcRenderer.on('program-status', (event, data) => {
  const statusList = document.getElementById('status-list');
  statusList.innerHTML = ''; // Eski içeriği temizle

  // Her program için bir liste elemanı oluştur
  data.forEach(program => {
    const listItem = document.createElement('li');
    listItem.classList.add('program-item');  // CSS sınıfı ekleyin

    // Programın ikonunu ekle
    const img = document.createElement('img');
    img.src = program.icon; // Programın ikonunun yolu
    img.alt = 'Program Icon';
    img.classList.add('program-icon');  // CSS sınıfı ekleyin

    // Programın durumunu ekle
    const statusText = document.createElement('span');
    statusText.textContent = program.status;
    statusText.classList.add('program-status');  // CSS sınıfı ekleyin

    // Görseli ve durumu liste elemanına ekle
    listItem.appendChild(img);
    listItem.appendChild(statusText);

    // Listeye ekle
    statusList.appendChild(listItem);
  });
});

// 'check-button' butonuna tıklanma olayını ekle
document.getElementById('check-button').addEventListener('click', () => {
  ipcRenderer.send('check-programs'); // 'check-programs' mesajını main işleme gönder
});

// Sayfa yüklendiğinde temayı ayarlama işlemi
document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const themeToggle = document.getElementById('theme-toggle');

  // Tema değişim düğmesi bulunamazsa hata mesajı
  if (!themeToggle) {
    console.error('theme-toggle elementi bulunamadı!');
    return;
  }

  // Kullanıcının tercihini kontrol et
  const currentTheme = localStorage.getItem('theme');
  if (currentTheme === 'dark') {
    body.classList.add('dark-mode'); // Koyu tema
    themeToggle.textContent = '☀️'; // Koyu tema simgesi
  } else {
    themeToggle.textContent = '🌙'; // Açık tema simgesi
  }

  // Tema değişim düğmesine olay dinleyici ekle
  themeToggle.addEventListener('click', () => {
    const isDarkMode = body.classList.toggle('dark-mode');

    // Kullanıcı tercihine göre düğme metnini değiştir
    themeToggle.textContent = isDarkMode ? '☀️' : '🌙';

    // Tercihi localStorage'a kaydet
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  });
});

// Sunuculara bağlanma işlemleri için olay dinleyiciler
document.getElementById('sunucuya_baglan').addEventListener('click', () => {
  ipcRenderer.send('open-edge-browser'); // FiveM sunucusuna bağlan
});

document.getElementById('discord_baglan').addEventListener('click', () => {
  ipcRenderer.send('discord-edge'); // Discord sunucusuna bağlan
});

document.getElementById('ts_baglan').addEventListener('click', () => {
  ipcRenderer.send('ts-edge'); // TeamSpeak sunucusuna bağlan
});

document.getElementById('settings').addEventListener('click', () => {
  ipcRenderer.send('open-modal');
});

server.getServerStatus().then(data => {
  // HTML'deki <span> etiketini bul
  const statusSpan = document.getElementById('server-status-fivem');

  // Sunucu durumu "online" mı?
  if (data.online) {
      statusSpan.textContent = 'Online'; // Sunucu açıksa "Online" yaz
      statusSpan.style.color = 'green'; // Durum rengini yeşil yap
  } else {
      statusSpan.textContent = 'Kapalı'; // Sunucu kapalıysa "Kapalı" yaz
      statusSpan.style.color = 'red'; // Durum rengini kırmızı yap
  }
});

// Sayfa yüklendiğinde, main sürece istek gönderiyoruz
window.onload = async () => {
  try {
    const result = await ipcRenderer.invoke('get-user-info'); // main'den veriyi al
    document.getElementById('userInfo').textContent = result; // <span> içine sonucu yazdır
  } catch (error) {
    console.error('User info alınamadı:', error); // Hata durumunda mesaj göster
  }
};
