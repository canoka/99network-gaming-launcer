const { app, BrowserWindow, ipcMain, nativeImage } = require('electron');
const fs = require('fs');
const fivem = require('fivem-server-info');
const FV = require('fivem-stats');
const { exec } = require('child_process');
const path = require('path');
const server_ip = 'extinction5.gtaliferp.fr';

let mainWindow;
let modalWindow;

// Yeni pencere oluşturma
function createWindow() {
  setOverlayIcon = nativeImage.createFromPath('assets/fivem.svg');

  mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    resizable: false,
    frame: false,
    webPreferences: {
      icon: path.join(__dirname, 'assets/fivem.svg'),
      devTools: true,
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: false
    },
  });

  mainWindow.loadFile('index.html');  // HTML dosyasını yükle

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createModal() {
  modalWindow = new BrowserWindow({
      parent: mainWindow,  // Ana pencereye bağlı modal pencere
      modal: true,          // Pencereyi modal yapar
      show: false,          // İlk başta gizli
      width: 800,
      height: 650,
      resizable: false,
      frame: false,
      webPreferences: {
          nodeIntegration: true
      }
  });

  modalWindow.loadURL('file://' + __dirname + '/modal.html');
  modalWindow.once('ready-to-show', () => {
      modalWindow.show();
  });
}

ipcMain.on('open-modal', () => {
  console.log('Ayarlar Sekmesine Erisim Gerceklesti');
  createModal();
});

// Programların durumlarını kontrol eden IPC işlemi
ipcMain.on('check-programs', async (event) => {
  console.log('Program Kontrolu Yapildi');
  
  const programsToCheck = [
    { icon: "assets/fivem.svg", path: "C:\\Users\\muham\\AppData\\Local\\FiveM\\FiveM.exe" },
    { icon: "assets/cs.svg", path: "C:\\Program Files (x86)\\Steam\\steamapps\\common\\Half-Life\\hl.exe" },
    { icon: "assets/gtav.svg", path: "C:\\Program Files\\Epic Games\\GTAV\\GTA5.exe" },
    { icon: "assets/minecraft.svg", path: "C:\\Users\\muham\\AppData\\Roaming\\.minecraft\\minecraft.exe" },
  ];

  // Programların durumlarını kontrol et
  const results = await Promise.all(
    programsToCheck.map(program => checkProgramStatus(program.icon, program.path))
  );

  event.reply('program-status', results);  // Renderer'a program durumlarını gönder
});

// Programın mevcut olup olmadığını kontrol eden fonksiyon
async function checkProgramStatus(iconPath, programPath) {
  return new Promise((resolve) => {
    fs.access(programPath, fs.constants.F_OK, (err) => {
      if (err) {
        resolve({ icon: iconPath, status: "🔴" });  // Program mevcut değilse
      } else {
        resolve({ icon: iconPath, status: "🟢" });  // Program mevcutsa
      }
    });
  });
}

// FiveM sunucu bilgilerini almak için kullanılan fonksiyon
async function example() {
  const connect = await fivem.connected_users(server_ip);
  const max = await fivem.max_users(server_ip);
  const result = `${connect}/${max}`;
  console.log("FiveM Oyuncu Bilgileri = " + result);
  return result; // Sonucu döndürüyoruz
}

// Kullanıcı bilgilerini almak için IPC işlemi
ipcMain.handle('get-user-info', async () => {
  const result = await example();  // Fonksiyonu çağırıyoruz
  return result;  // Sonucu renderer'a gönderiyoruz
});

// FiveM sunucu durumunu almak
const server = new FV.Stats(server_ip);

server.getServerStatus().then(data => {
    if (data.online) {
        console.log('FiveM Server Online');  // Eğer server online konsola yazdir
    } else {
        console.log('FiveM Server Offline');  // Eğer server kapalıysa, başka bir mesaj yazdırabilirsiniz
    }
});

// Uygulama hazır olduğunda pencereyi oluştur
app.whenReady().then(() => {
  createWindow();

  // Sunuculara bağlanma işlemleri
  ipcMain.on('open-edge-browser', () => {
    exec(`start fivem://${server_ip}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      console.log(`FiveM Sunucu Butonu 1/2: ${stdout}`);
      console.error(`FiveM Sunucu Butonu 2/2: ${stderr}`);
    });
  });

  ipcMain.on('discord-edge', () => {
    exec('start msedge https://discord.gg/BH94JjF9Qg', (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      console.log(`Discord Butonu 1/2: ${stdout}`);
      console.error(`Discord Butonu 2/2: ${stderr}`);
    });
  });

  ipcMain.on('ts-edge', () => {
    exec('start msedge https://discord.gg/BH94JjF9Qg', (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      console.log(`TeamSpeak Butonu 1/2: ${stdout}`);
      console.error(`TeamSpeak Butonu 2/2: ${stderr}`);
    });
  });

  // Uygulama tekrar açıldığında pencereyi oluştur
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Tüm pencereler kapatıldığında uygulamayı sonlandır
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
  console.log('Cikis Yapildi')
});

console.log('Main.JS Loaded')
console.log('AppLauncher Started')
console.log('Check the logs for any errors')
console.log('Application Created By github.com/canoka')
