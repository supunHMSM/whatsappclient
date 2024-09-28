const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

let io; 

const whatsappClient = new Client({
    authStrategy: new LocalAuth()
});

whatsappClient.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
    io.emit('qr',qr);
});

whatsappClient.on("ready", () => console.log("client is ready!"));

whatsappClient.on("message", async (msg) => {
    try {
        if (msg.from !== "status@broadcast") {
            const contact = await msg.getContact();
            console.log(contact, msg.body);

           
            if (msg.hasMedia) {
                const media = await msg.downloadMedia();
                const mediaPath = path.join(__dirname, '../../public/media');
                
           
                if (!fs.existsSync(mediaPath)) {
                    fs.mkdirSync(mediaPath, { recursive: true });
                }

              
                const filename = `${new Date().getTime()}.${media.mimetype.split('/')[1]}`;
                const filePath = path.join(mediaPath, filename);
                fs.writeFileSync(filePath, media.data, 'base64');

                // Emit the media data to the connected clients via Socket.io
                io.emit('whatsappMedia', {
                    contact: {
                        pushname: contact.pushname,
                        number: contact.number
                    },
                    message: msg.body,
                    mediaUrl: `/media/${filename}`
                });
            } else {
                // Emit the text message to the connected clients via Socket.io
                io.emit('whatsappMessage', {
                    contact: {
                        pushname: contact.pushname,
                        number: contact.number
                    },
                    message: msg.body
                });
            }
        }
    } catch (error) {
        console.log(error);
    }
});

const initialize = (socketIo) => {
    io = socketIo; // Store the `io` instance
    whatsappClient.initialize();
};

module.exports = {
    whatsappClient,
    initialize
};
