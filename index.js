let device;
let server;
let serviceUUID = '000000fa-0000-1000-8000-00805f9b34fb';
let charUUID = '0000fa02-0000-1000-8000-00805f9b34fb';

let options = {

    filters: [
        {namePrefix: "LED_BLE_"}
    ],

    optionalServices: ['battery_service', '000000fa-0000-1000-8000-00805f9b34fb','0000fa02-0000-1000-8000-00805f9b34fb']
}

let clock_mode = 0;

document.getElementById("connect").addEventListener("click", () =>  {
    connect();
});

document.getElementById("on").addEventListener("click", () =>  {
    on();
});

document.getElementById("off").addEventListener("click", () =>  {
    off();
});

document.getElementById("disconnect").addEventListener("click", () =>  {
    disconnect();
});

document.getElementById("brightness").addEventListener("change", () =>  {
    set_brightness(event.target.value)
    
});

document.getElementById("increase").addEventListener("click", () =>  {
    clock_mode = Math.min(clock_mode+1,9);
    clock(clock_mode);
    set_time();
});

document.getElementById("decrease").addEventListener("click", () =>  {
    clock_mode = Math.max(clock_mode-1,0);
    clock(clock_mode);

    setTimeout(() => set_time(), 1000)
});

function intToHex(value) {
  return value.toString(16).padStart(2, "0");
}

/**
 * Check, if bluetooth is available.
 */
async function getAvailibiltiy()
{
    navigator.bluetooth.getAvailability().then((available) => {
        if (available) {
            console.log("This device supports Bluetooth!");
        } else {
            console.log("Doh! Bluetooth is not supported");
        }
    });

}

/**
 * Connect Device
 */
async function connect()
{

    device = await navigator.bluetooth.requestDevice(options);
    console.log(`Gefundenes Devicce: ${device.name}`);
    
    server = await device.gatt.connect();

    console.log(device.uuid);
    
    console.log("Verbindung erfolgreich hergestellt.")
}

/**
 * Disconnect Device
 */
async function disconnect(){
    
    await device.gatt.disconnect();
    console.log(`Gerät: ${device.name} disconnected.`);
}

/**
 * LED off
 */
async function off()
{
    service = await server.getPrimaryService(serviceUUID);
    char = await service.getCharacteristic(charUUID);

    const data = new Uint8Array([0x05, 0x00, 0x07, 0x01, 0x00]);
    await char.writeValue(data);
    console.log("LED aus.");
}

/**
 * LED on
 */
async function on()
{
    service = await server.getPrimaryService(serviceUUID);
    char = await service.getCharacteristic(charUUID);

    const data = new Uint8Array([0x05, 0x00, 0x07, 0x01, 0x01]);
    console.log(data);
    await char.writeValue(data);
    console.log("LED an.");
}

/**
 * Set Brightness - Value from 1 to 100 expected
 */
async function set_brightness(value)
{
    service = await server.getPrimaryService(serviceUUID);
    char = await service.getCharacteristic(charUUID);

    const data = new Uint8Array([0x05, 0x00, 0x04, 0x80, value]);
    console.log(data);
    await char.writeValue(data);
}

async function clock(style)
{
    service = await server.getPrimaryService(serviceUUID);
    char = await service.getCharacteristic(charUUID);

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDay();

    console.log(hours, minutes, seconds);

    header = new Uint8Array([0x0b, 0x00, 0x06, 0x01]);
    console.log(header);
    params = new Uint8Array([intToHex(style),intToHex("01"),intToHex("00")]);
    console.log(params);
    data = new Uint8Array([intToHex(year),intToHex(month),intToHex(day),intToHex("00")]);
    console.log(data);

    const full = new Uint8Array([...header, ...params, ...data]);
    console.log(full);
    await char.writeValue(full);
}

async function set_time()
{
    service = await server.getPrimaryService(serviceUUID);
    char = await service.getCharacteristic(charUUID);

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    const time = new Uint8Array([hours,minutes,seconds,0x00]);
    const data = new Uint8Array([0x08,0x00,0x01,0x80]);
    const full = new Uint8Array([...data,...time]);

    await char.writeValue(full);
}