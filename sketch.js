const verdeSalita=verdeDiscesa=8; //tempo di semaforo verdeDiscesa in secondi
const rosso=60; //tempo per percorrere il tratto in secondi

let statoSem="arancione";
let statoSemOld="arancione";
let coloreScritta="orange"
let scritta="Attesa connessione";
let colAltoSemSu="orange"; let colCentroSemSu="orange";let colBassoSemSu="orange";
let colAltoSemGiu="orange"; let colCentroSemGiu="orange";let colBassoSemGiu="orange";
let gotServerTime=0;
let serverTime;
let time;
let errorMessage;
let parla;
let logo;
let datePreJson; let datePostJson; let dateAdj; let timeLoadJson;
let blink=0;
let attesaSalita; let attesaDiscesa; let finestra;
let largh; let alt; let orient="portrait";
let larghOrig; let altOrig;

function preload(){
  logo=loadImage("LogoADVtrasp.png");
}

function changeOrien(e){
  const portrait = e.matches;
  if (portrait) {
    largh=larghOrig;
    alt=altOrig;
    console.log("port");
  } else {
    alt=larghOrig*0.8;
    largh=larghOrig*larghOrig/altOrig*0.8;
    console.log("land");
  }
  //createCanvas(largh,alt);
  console.log(largh,alt,windowWidth,windowHeight,larghOrig,altOrig);
}

function setup() {
  window.matchMedia("(orientation: portrait)").addEventListener("change", changeOrien);
  parla = new p5.Speech(); // speech synthesis object
  parla.setLang("it-IT");
  createCanvas(windowWidth, windowHeight);
  largh=windowWidth;
  alt=windowHeight;
  larghOrig=windowWidth;
  altOrig=windowHeight;

  heartBeat();
  //datePreJson= new Date();
  //loadJSON("https://worldtimeapi.org/api/ip", gotData, gotError);
  //waitForServerTime();
  textSize(alt/40);
  let button = createButton('Abilita Audio');
  button.position(largh/16*9, alt/10*6.4);
  button.style('background-color', "pink");
  button.style('font-size', alt/40+'px');
  button.size(largh/4, alt/15);

  let buttonW = createButton('Salite e scendete con attenzione. Potreste incontrare qualcuno senza applicazione!!');
  buttonW.position(5, alt/11*2);
  buttonW.style('background-color', "red");
  buttonW.style('font-size', alt/50+'px');
  buttonW.size(largh/2, alt/10);
  textAlign(CENTER);
  ellipseMode(CENTER);
}

function draw() {
  if(blink >1){
    blink=blink-1;
    if(blink % 2 ==1 ){
      background(0);  
    }else {
      background(255);  
    }
  }else {
    background(150,150,200);  
  }
  image(logo,0,0,largh/4,largh/4);
  disegnaSemaforo(largh/16*9,alt/10,colAltoSemSu,colCentroSemSu,colBassoSemSu,'MONTE',attesaDiscesa);
  disegnaSemaforo(largh/16*4,alt/10*3,colAltoSemGiu,colCentroSemGiu,colBassoSemGiu,'VALLE',attesaSalita);
  statoSem=semaforo();
  if (statoSem =="arancione"||gotServerTime==0 ) {
    coloreScritta="red";
    scritta="Attesa connessione";
    colAltoSemSu="orange"; colCentroSemSu="orange"; colBassoSemSu="orange";
    colAltoSemGiu="orange"; colCentroSemGiu="orange"; colBassoSemGiu="orange";
  }else{
    if (statoSem =="aspetta") {
      coloreScritta="red";
      scritta="ASPETTA";
      colAltoSemSu="red"; colCentroSemSu="black"; colBassoSemSu="black";
      colAltoSemGiu="red"; colCentroSemGiu="black"; colBassoSemGiu="black";
    }
    if (statoSem == "sali") {
      coloreScritta="lightgreen";
      scritta="PUOI SALIRE";
      colAltoSemSu="red"; colCentroSemSu="black"; colBassoSemSu="black";
      colAltoSemGiu="black"; colCentroSemGiu="black"; colBassoSemGiu="lightgreen";
    }
    if (statoSem == "scendi") {
      coloreScritta="lightgreen";
      scritta="PUOI SCENDERE";
      colAltoSemSu="black"; colCentroSemSu="black"; colBassoSemSu="lightgreen";
      colAltoSemGiu="red"; colCentroSemGiu="black"; colBassoSemGiu="black";
    }
  }
  scriviMessaggio(scritta,coloreScritta,alt/40);
  if(statoSem!=statoSemOld) {
    statoSemOld=statoSem;
    parla.setVoice(4);
    parla.speak(scritta);
    blink=30;
  }
  if(errorMessage){
    scriviMessaggio(errorMessage,"red",alt/40,alt/10);
    //console.log("error message: ",errorMessage);
  } 
  debug();
}

function scriviMessaggio(scritta,coloreScritta,size,deltaY=0){
  fill(100);
  rect(largh/4, alt/20*15, largh/2, alt/20,10);
  textSize(size);
  textStyle(BOLD);
  fill(coloreScritta);
  text(scritta, largh/2, alt/20*15.7+deltaY);
}

function heartBeat(){
  datePreJson= new Date();
  loadJSON("https://worldtimeapi.org/api/ip", gotData, gotError);
  waitForServerTime();
}

function gotData(data) {
  serverTime = data.unixtime;
  datePostJson= new Date();
  timeLoadJson=(datePostJson-datePreJson);
  //console.log("Server time definito: ",convertUnixTime(serverTime), "tempo loadJSON: ",timeLoadJson);
  if(timeLoadJson > 1000){ //più di 1 secondo nel caricare il JSON
    gotServerTime=0;
    errorMessage='Eccesso di tempo nel caricare Json :'+timeLoadJson+' ms';
  }

  date = new Date();
  localTime = round(date.getTime() / 1000);
  if(abs(localTime-serverTime)<120) { //max di 2 minuti di discrepanza
    dateAdj=localTime-serverTime;
    gotServerTime=1;
    errorMessage="";
  }else{
    gotServerTime=0;
    errorMessage='Controlla sincronia orologio.' + '\n'+"Locale: "+ convertUnixTime(localTime)+
    " Server: "+ convertUnixTime( serverTime);
    //throw new Error('Controlla sincronia orologio.' + '\n'+"Locale: "+ convertUnixTime(localTime)+
    //" Server: "+ convertUnixTime(serverTime));  
   }
  setTimeout(heartBeat, 10000); // Adjust the time interval as needed
}

function gotError() {
  //throw new Error("Error caricando microservizio tempo");
  gotServerTime=0;
  errorMessage="Error caricando microservizio tempo";
  //thisFunctionDoesNotExistAndWasCreatedWithTheOnlyPurposeOfStopJavascriptExecution
}

function waitForServerTime() {
  if (typeof serverTime !== 'undefined') {
 //   console.log("Server time definito: ",convertUnixTime(serverTime));
  } else {
    //console.log("waiting for ServerTime to be defined");
    errorMessage="waiting for ServerTime to be defined";
    setTimeout(waitForServerTime, 1000); // Adjust the time interval as needed
  }
}

function semaforo(){  
  if(!gotServerTime)return;
  time = Date.now()-dateAdj*1000;
  finestra=(time%((verdeSalita+rosso+verdeDiscesa+rosso)*1000))/1000;
  if (Math.floor(finestra) < verdeSalita){messaggio="sali";}
  if (Math.floor(finestra) >= verdeSalita && Math.floor(finestra) < verdeSalita+rosso ){
    messaggio="aspetta";
  }
  if (Math.floor(finestra) >= verdeSalita+rosso && Math.floor(finestra) < verdeSalita+rosso+verdeDiscesa ){messaggio="scendi";}
  if (Math.floor(finestra) >= verdeSalita+rosso+verdeDiscesa ){messaggio="aspetta";}
  if(Math.floor(finestra)<verdeSalita+rosso){
    attesaDiscesa=verdeSalita+rosso-Math.floor(finestra);
  }else{
    attesaDiscesa=verdeSalita+rosso+(verdeSalita+rosso+verdeDiscesa+rosso-Math.floor(finestra));
  }
  attesaSalita=((verdeSalita+rosso+verdeDiscesa+rosso)) - Math.floor(finestra);
  return messaggio;
}

function disegnaSemaforo(x,y,colAlto,colMezzo,colBasso,descrizione,tempoAttesa) {
  fill("darkGreen"); //grey color
  larghezza=largh/4;
  altezza=alt/2.5;
  rect(x, y, larghezza,altezza, 20);//traffic light base 
  fill(colAlto);
  ellipse(x+larghezza/2, y+altezza/4,larghezza/2.1,larghezza/2.1);//first light
  fill(colMezzo);
  ellipse(x+larghezza/2, y+altezza/4*2,larghezza/2.1,larghezza/2.1);//second light
  fill(colBasso);
  ellipse(x+larghezza/2, y+altezza/4*3,larghezza/2.1,larghezza/2.1);//third code
  textSize(alt/40);
  fill("orange");
  text(descrizione+" "+ tempoAttesa,x+larghezza/2,y+altezza/10)
}

function convertUnixTime(uTime) {
// Create a new JavaScript Date object based on the timestamp
// multiplied by 1000 so that the argument is in milliseconds, not seconds
var date = new Date(uTime * 1000);
var hours = date.getHours();
var minutes = "0" + date.getMinutes();
var seconds = "0" + date.getSeconds();
var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
return(formattedTime);
}

function debug(){
  push();
  textSize(alt/50);
  fill(130);
  text("Loc: "+convertUnixTime(Date.now()/1000)+" Rem "+convertUnixTime(time/1000)+" adj "+dateAdj+" loadJson "+timeLoadJson,largh/2,alt/20*17);
  textSize(alt/60);
  textAlign(LEFT);
  text('v 4.0  '+screen.orientation.type+" "+info(),5,alt/30*28,largh,alt/3);
  pop();
}  



