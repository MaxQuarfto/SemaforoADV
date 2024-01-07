const verdeSalita = (verdeDiscesa = 10); //tempo di semaforo verdeDiscesa in secondi
const rosso = 50; //tempo per percorrere il tratto in secondi
let buttonAudio;
let buttonW;

let statoSem = "arancione";
let statoSemOld = "arancione";
let coloreScritta = "orange";
let scritta = "Attesa connessione";
let colAltoSemSu = "orange";
let colCentroSemSu = "orange";
let colBassoSemSu = "orange";
let colAltoSemGiu = "orange";
let colCentroSemGiu = "orange";
let colBassoSemGiu = "orange";
let gotServerTime = 0;
let serverTime;
let time;
let errorMessage;
let parla;
let logo;
let datePreJson;
let datePostJson;
let dateAdj;
let timeLoadJson;
let blink = 0;
let attesaSalita;
let attesaDiscesa;
let finestra;
let largh;
let alt;
let orient = "portrait";
let larghOrig;
let altOrig;

let gotMqtt = false; //lo stato della connessione mqtt
let gotMqttPrev = false;

let nome = "";
let bottCambiaNome;
//let nomeAllGhiaccio;
let etichettaGhiaccio = "Ghiaccio";
let etichettaTrattore = "Trattore";

//var client = mqtt.connect("wss://test.mosquitto.org:8081/mqtts", {connectTimeout: 3000,keepalive: 10});
var client = mqtt.connect("wss://test.mosquitto.org:8081/mqtts", {keepalive: 10,});

function preload() {
  logo = loadImage("LogoADVtrasp.png");
}

function setup() {
  window
    .matchMedia("(orientation: portrait)")
    .addEventListener("change", changeOrien);
  parla = new p5.Speech(); // speech synthesis object
  parla.setLang("it-IT");
  createCanvas(windowWidth, windowHeight);
  largh = windowWidth;
  alt = windowHeight;
  larghOrig = windowWidth;
  altOrig = windowHeight;

  heartBeat();
  textSize(alt / 40);

  buttonAudio = createButton("Abilita Audio");
  buttonAudio.position((largh / 16) * 9, (alt / 12) * 6.5);
  buttonAudio.style("background-color", "pink");
  buttonAudio.style("font-size", alt / 40 + "px");
  buttonAudio.size(largh / 4, alt / 15);

  buttonW = createButton(
    "Salite e scendete con attenzione. Potreste incontrare qualcuno senza applicazione!!"
  );
  buttonW.position(5, (alt / 11) * 2);
  buttonW.style("background-color", "red");
  buttonW.style("font-size", alt / 50 + "px");
  buttonW.size(largh / 2, alt / 10);

  bottCambiaNome = createButton("Cambia Nome");
  bottCambiaNome.position(largh/4, alt/7.5);
  bottCambiaNome.style("background-color", "darkorange");
  bottCambiaNome.style("font-size", alt / 60 + "px");
  bottCambiaNome.size(largh/4,alt/30);
  bottCambiaNome.mousePressed(cambiaNome);
  
  client.on("connect", mqttConnect);
  client.on("message", mqttMessaggio);
  client.on("error", mqttError);
  client.on("connect_failed", mqttConnectFailed);

  bottGhiaccio = new Bottone(largh/10, alt-alt/5.5, "");
  bottGhiaccio.box.changed(allGhiaccioCambiato);

  bottTrattore = new Bottone(largh/10, alt-alt/7, "");
  bottTrattore.box.changed(allTrattoreCambiato);
  
  nome = getItem("Nome");
  console.log(nome);
  if (nome == null) {
    nome = prompt("Come ti chiami?");
    storeItem("Nome", nome);
  }

  textAlign(CENTER);
  ellipseMode(CENTER);
}

function draw() {
  if (blink > 1) {
    blink = blink - 1;
    if (blink % 2 == 1) {
      background(0);
    } else {
      background(255);
    }
  } else {
    background(150, 150, 200);
  }
  image(logo, 0, 0, largh / 4, largh / 4);
  disegnaSemaforo(
    (largh / 16) * 9,
    alt / 10,
    colAltoSemSu,
    colCentroSemSu,
    colBassoSemSu,
    "MONTE",
    attesaDiscesa
  );
  disegnaSemaforo(
    (largh / 16) * 4,
    (alt / 10) * 3,
    colAltoSemGiu,
    colCentroSemGiu,
    colBassoSemGiu,
    "VALLE",
    attesaSalita
  );
  statoSem = semaforo();
  if (statoSem == "arancione" || gotServerTime == 0) {
    coloreScritta = "red";
    scritta = "Attesa connessione";
    colAltoSemSu = "orange";
    colCentroSemSu = "orange";
    colBassoSemSu = "orange";
    colAltoSemGiu = "orange";
    colCentroSemGiu = "orange";
    colBassoSemGiu = "orange";
  } else {
    if (statoSem == "aspetta") {
      coloreScritta = "red";
      scritta = "ASPETTA";
      colAltoSemSu = "red";
      colCentroSemSu = "black";
      colBassoSemSu = "black";
      colAltoSemGiu = "red";
      colCentroSemGiu = "black";
      colBassoSemGiu = "black";
    }
    if (statoSem == "sali") {
      coloreScritta = "lightgreen";
      scritta = "PUOI SALIRE";
      colAltoSemSu = "red";
      colCentroSemSu = "black";
      colBassoSemSu = "black";
      colAltoSemGiu = "black";
      colCentroSemGiu = "black";
      colBassoSemGiu = "lightgreen";
    }
    if (statoSem == "scendi") {
      coloreScritta = "lightgreen";
      scritta = "PUOI SCENDERE";
      colAltoSemSu = "black";
      colCentroSemSu = "black";
      colBassoSemSu = "lightgreen";
      colAltoSemGiu = "red";
      colCentroSemGiu = "black";
      colBassoSemGiu = "black";
    }
    MqttStatus();
//    text("Stato MQTT " + gotMqtt, 100, 190);
    push();
    fill("yellow");
    textAlign(CENTER,CENTER);
    rect(largh/4,alt/15,largh/4,alt/15);
    fill("black");
    text("Benvenuto \n" + nome, largh/4+largh/4/2,alt/15+alt/15/2);
    pop();
    bottGhiaccio.etichetta(etichettaGhiaccio);
    bottTrattore.etichetta(etichettaTrattore);
  }
  scriviMessaggio(scritta, coloreScritta, alt / 40);
  if (statoSem != statoSemOld) {
    statoSemOld = statoSem;
    parla.setVoice(4);
    parla.speak(scritta);
    blink = 30;
  }
  if (errorMessage) {
    scriviMessaggio(errorMessage, "red", alt / 40, alt / 10);
    //console.log("error message: ",errorMessage);
  }
  debug();
}

function scriviMessaggio(scritta, coloreScritta, size, deltaY = 0) {
  fill(100);
  rect(largh / 4, (alt / 20) * 15, largh / 2, alt / 20, 10);
  textSize(size);
  textStyle(BOLD);
  fill(coloreScritta);
  text(scritta, largh / 2, (alt / 20) * 15.7 + deltaY);
}

function heartBeat() {
  datePreJson = new Date();
  loadJSON("https://worldtimeapi.org/api/ip", gotData, gotError);
  waitForServerTime();
}

function gotData(data) {
  serverTime = data.unixtime;
  datePostJson = new Date();
  timeLoadJson = datePostJson - datePreJson;
  //console.log("Server time definito: ",convertUnixTime(serverTime), "tempo loadJSON: ",timeLoadJson);
  if (timeLoadJson > 1000) {
    //più di 1 secondo nel caricare il JSON
    gotServerTime = 0;
    errorMessage =
      "Eccesso di tempo nel caricare Json :" + timeLoadJson + " ms";
  }

  date = new Date();
  localTime = round(date.getTime() / 1000);
  if (abs(localTime - serverTime) < 120) {
    //max di 2 minuti di discrepanza
    dateAdj = localTime - serverTime;
    gotServerTime = 1;
    errorMessage = "";
  } else {
    gotServerTime = 0;
    errorMessage =
      "Controlla sincronia orologio." +
      "\n" +
      "Locale: " +
      convertUnixTime(localTime) +
      " Server: " +
      convertUnixTime(serverTime);
    //throw new Error('Controlla sincronia orologio.' + '\n'+"Locale: "+ convertUnixTime(localTime)+
    //" Server: "+ convertUnixTime(serverTime));
  }
  setTimeout(heartBeat, 10000); // Adjust the time interval as needed
}

function gotError() {
  //throw new Error("Error caricando microservizio tempo");
  gotServerTime = 0;
  errorMessage = "Error caricando microservizio tempo";
  loadJSON("https://worldtimeapi.org/api/ip", gotData, gotError);

  //thisFunctionDoesNotExistAndWasCreatedWithTheOnlyPurposeOfStopJavascriptExecution
}

function waitForServerTime() {
  if (typeof serverTime !== "undefined") {
    //   console.log("Server time definito: ",convertUnixTime(serverTime));
  } else {
    //console.log("waiting for ServerTime to be defined");
    errorMessage = "waiting for ServerTime to be defined";
    setTimeout(waitForServerTime, 1000); // Adjust the time interval as needed
  }
}

function semaforo() {
  if (!gotServerTime) return;
  time = Date.now() - dateAdj * 1000;
  finestra =
    (time % ((verdeSalita + rosso + verdeDiscesa + rosso) * 1000)) / 1000;
  if (Math.floor(finestra) < verdeSalita) {
    messaggio = "sali";
  }
  if (
    Math.floor(finestra) >= verdeSalita &&
    Math.floor(finestra) < verdeSalita + rosso
  ) {
    messaggio = "aspetta";
  }
  if (
    Math.floor(finestra) >= verdeSalita + rosso &&
    Math.floor(finestra) < verdeSalita + rosso + verdeDiscesa
  ) {
    messaggio = "scendi";
  }
  if (Math.floor(finestra) >= verdeSalita + rosso + verdeDiscesa) {
    messaggio = "aspetta";
  }
  if (Math.floor(finestra) < verdeSalita + rosso) {
    attesaDiscesa = verdeSalita + rosso - Math.floor(finestra);
  } else {
    attesaDiscesa =
      verdeSalita +
      rosso +
      (verdeSalita + rosso + verdeDiscesa + rosso - Math.floor(finestra));
  }
  attesaSalita =
    verdeSalita + rosso + verdeDiscesa + rosso - Math.floor(finestra);
  return messaggio;
}

function disegnaSemaforo(x,y,colAlto,colMezzo,colBasso,descrizione,tempoAttesa) {
  fill("darkGreen"); //grey color
  larghezza = largh / 4;
  altezza = alt / 2.5;
  rect(x, y, larghezza, altezza, 20); //traffic light base
  fill(colAlto);
  ellipse(x + larghezza / 2, y + altezza / 4, larghezza / 1.2, altezza / 4.2); //first light
  fill(colMezzo);
  ellipse(x + larghezza / 2,y + (altezza / 4) * 2,larghezza / 1.2,altezza / 4.2 ); //second light
  fill(colBasso);
  ellipse(
    x + larghezza / 2,y + (altezza / 4) * 3,larghezza / 1.2,altezza / 4.2  ); //third code
  textSize(alt / 40);
  fill("orange");
  text(descrizione + " " + tempoAttesa, x + larghezza / 2, y + altezza / 10);
}

function convertUnixTime(uTime) {
  // Create a new JavaScript Date object based on the timestamp
  // multiplied by 1000 so that the argument is in milliseconds, not seconds
  var date = new Date(uTime * 1000);
  var hours = date.getHours();
  var minutes = "0" + date.getMinutes();
  var seconds = "0" + date.getSeconds();
  var formattedTime =
    hours + ":" + minutes.substr(-2) + ":" + seconds.substr(-2);
  return formattedTime;
}

function debug() {
  push();
  textSize(alt / 60);
  fill(130);
  text("Loc: " +convertUnixTime(Date.now() / 1000) +" Rem " +convertUnixTime(time / 1000) +" adj " +dateAdj +
    " loadJson " +timeLoadJson+
    "\n v 6.0 larg " +largh +" alt " +alt +" " +screen.orientation.type +" " +info()+" MQTT "+gotMqtt,5,(alt / 30) * 28,largh,alt / 3);
  pop();
}

function cambiaNome() {
  nome = prompt("Come ti chiami?");
  storeItem("Nome", nome);
}

function MqttStatus() {
  gotMqtt = client.connected;
  if (gotMqtt) {
//    coloreSfondo = "lightgreen";
    
  } else {
    bottGhiaccio.colore("black");
    bottTrattore.colore("black");
//    bottGhiaccio.etichetta("Sistema allarmi non disponibile");
//    bottTrattore.etichetta("Sistema allarmi non disponibile");
  }
  //console.log("matt ", gotMqtt);
  if (gotMqtt != gotMqttPrev) {
    gotMqttPrev = gotMqtt;
    //console.log("Stato MQTT: gotMqtt);
  }
}

function mqttConnect() {
  client.subscribe("ADV/#", function (err) {
    if (!err) {
      //client.publish("ADV/Trattore", "ON",{ qos: 0, retain: true });
      //client.publish("ADV/Trattore", "ON", { retain: true });
      //allGhiaccio.checked(true);
    } else {
      console.log("Error in MQTT subscribe");
    }
  });
}

function allGhiaccioCambiato() {
  if (bottGhiaccio.box.checked()) {
    //client.publish("ADV/Ghiaccio", "ON," + nome, { qos: 2, retain: true });
    bottGhiaccio.colore("red");
    scriviMqtt("ADV/Ghiaccio", "ON," + nome);
  } else {
    scriviMqtt("ADV/Ghiaccio", "OFF," + nome);
    bottGhiaccio.colore("green");
    
  }
}
function allTrattoreCambiato() {
  if (bottTrattore.box.checked()) {
    scriviMqtt("ADV/Trattore", "ON," + nome);
    bottTrattore.colore("red");
    //client.publish("ADV/Trattore", "ON," + nome, { qos: 2, retain: true });
  } else {
    //    client.publish("ADV/Trattore", "OFF," + nome, { qos: 2, retain: true });
    scriviMqtt("ADV/Trattore", "OFF," + nome);
    bottTrattore.colore("green");
  }
}

function scriviMqtt(topic, payload) {
  if (client.connected) {
//    client.publish(topic, payload+" "+hour()+":"+minute(),{ qos: 2, retain: true },
    client.publish(topic, payload+" "+hour()+":"+ minute().toString().padStart(2, '0'),{ qos: 2, retain: true },
           function (complete) {console.log("publish complete with code: " + complete);},
      function (error) {
        console.log("error on publish: " + (error.reason || "unknown"));
      }
    );
  }
}

function mqttMessaggio(topic, message) {
  let splitString = split(message.toString(), ",");
  console.log(topic + " " + message.toString());
  if (topic == "ADV/Trattore") {
    if (splitString[0] == "ON") {
      etichettaTrattore = "Trattore " + splitString[1];
      bottTrattore.box.checked(true);
      bottTrattore.colore("red");
    } else {
      bottTrattore.box.checked(false);
      bottTrattore.colore("green");
      etichettaTrattore = "Trattore ";
    }
  }
  if (topic == "ADV/Ghiaccio") {
    if (splitString[0] == "ON") {
      bottGhiaccio.box.checked(true);
      bottGhiaccio.colore("red");
      etichettaGhiaccio = "Ghiaccio " + splitString[1];
    } else {
      bottGhiaccio.box.checked(false);
      bottGhiaccio.colore("green");
      etichettaGhiaccio = "Ghiaccio ";
    }
  }
}

function mqttConnectFailed(message) {
  console.log("mqtt error ", message);
}

function mqttError(message) {
  console.log("mqtt error ", message);
}

class Bottone {
  constructor(x, y, etichetta,colore='green') {
    this.x = x;
    this.y = y;
    this.box = createCheckbox();
    this.box.position(this.x, this.y);
    this.color=colore;
  }
  posizione(x,y) {
    this.x=x;
    this.y=y;
    this.box.position(this.x, this.y);
  }
  etichetta(nuovoNome) {
    this.nome = nuovoNome;
    push();
    fill(this.color);
    rect(0, this.y,largh,alt/30,alt/50);
    textAlign(LEFT,TOP);
    fill("black");
    text(this.nome, this.x+largh/20, this.y);
    pop(); 
  }
  colore(colore){
    this.color=colore;
  }
}

function changeOrien(e) {
  const portrait = e.matches;
  if (portrait) {
    largh = larghOrig;
    alt = altOrig;
    console.log("port");
  } else {
    //largh=larghOrig*larghOrig/altOrig*0.7;
    //alt=larghOrig*0.7;
    largh = (windowHeight * altOrig) / larghOrig;
    alt = windowHeight;
    console.log("land");
  }
  resizeCanvas(largh, alt);
  buttonW.position(5, (alt / 11) * 2);
  buttonW.style("background-color", "red");
  buttonW.style("font-size", alt / 50 + "px");
  buttonW.size(largh / 2, alt / 10);
  
  buttonAudio.position((largh / 16) * 9, (alt / 10) * 6.4);
  buttonAudio.style("background-color", "pink");
  buttonAudio.style("font-size", alt / 40 + "px");
  buttonAudio.size(largh / 4, alt / 15);

  bottCambiaNome.position(largh/4, alt/7.5);
  bottCambiaNome.style("background-color", "darkorange");
  bottCambiaNome.style("font-size", alt / 60 + "px");
  bottCambiaNome.size(largh/4,alt/30);

  bottGhiaccio.posizione(largh/10, alt-alt/5.5);
  bottTrattore.posizione(largh/10, alt-alt/7);
  
  
  console.log(largh, alt, windowWidth, windowHeight, larghOrig, altOrig);
}