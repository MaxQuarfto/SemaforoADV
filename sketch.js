const verdeSalita=verdeDiscesa=5; //tempo di semaforo verdeDiscesa in secondi
const rosso=10; //tempo per percorrere il tratto in secondi

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
let datePreJson; let datePostJson; let dateAdj;

function preload(){
  logo=loadImage("LogoADVtrasp.png");
}
  
function setup() {
  console.log(getBrowser());
  parla = new p5.Speech('Google italiano'); // speech synthesis object
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER);
  ellipseMode(CENTER);
  datePreJson= new Date();
  loadJSON("https://worldtimeapi.org/api/ip", gotData, gotError);
  waitForServerTime();
  textSize(height/40);
  let button = createButton('Abilita Audio');
  button.position(width/16*9, height/10*6.4);
  button.style('background-color', "pink");
  button.style('font-size', height/40+'px');
  button.size(width/4, height/15);
 }

function draw() {
  background(150,150,200);  
  image(logo,0,0,width/4,width/4);
  disegnaSemaforo(width/16*9,height/10,colAltoSemSu,colCentroSemSu,colBassoSemSu,'MONTE');
  disegnaSemaforo(width/16*3,height/10*3,colAltoSemGiu,colCentroSemGiu,colBassoSemGiu,'VALLE');
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
  scriviMessaggio(scritta,coloreScritta,height/40);
  if(statoSem!=statoSemOld) {
    statoSemOld=statoSem;
    parla.setVoice(4);
    parla.speak(scritta);
  }
  if(errorMessage){
    scriviMessaggio(errorMessage,"red",height/40,40);
    console.log("error message: ",errorMessage);
  } 
  debug();
}

function scriviMessaggio(scritta,coloreScritta,size,deltaY=0){
  fill(100);
  rect(width/4, height/20*15, width/2, height/20,10);
  textSize(size);
  textStyle(BOLD);
  fill(coloreScritta);
  text(scritta, width/2, height/20*15.7+deltaY);
}

function heartBeat(){
  datePreJson= new Date();
  loadJSON("https://worldtimeapi.org/api/ip", gotData, gotError);
  waitForServerTime();
}

function gotData(data) {
  //console.log("GOTDATA");
  serverTime = data.unixtime;
  //datePostJson= new Date();
  //dateAdj=(datePostJson-datePreJson);
  
  //date=datePostJson-dateAdj;

  date = new Date();
  localTime = round(date.getTime() / 1000);
  
  //console.log(datePreJson,datePostJson,dateAdj);
  
  //if(abs(localTime-serverTime)>2) { //max di 3 secondi di discrepanza
  if(abs(localTime-serverTime)<130) { //max di 3 secondi di discrepanza
    dateAdj=localTime-serverTime;
    //console.log("date adj ",convertUnixTime(localTime),convertUnixTime(serverTime),dateAdj)
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
    console.log("Server time definito: ",convertUnixTime(serverTime));
  } else {
    console.log("waiting for ServerTime to be defined");
    errorMessage="waiting for ServerTime to be defined";
    setTimeout(waitForServerTime, 1000); // Adjust the time interval as needed
  }
}

function semaforo(){
  
  if(!gotServerTime)return;
    
  //let time = Date.now();
    
  time = Date.now()-dateAdj*1000;
  //textSize(height/50);
  //fill(130);
  //text("Loc: "+convertUnixTime(Date.now()/1000)+" Rem "+convertUnixTime(time/1000)+" "+dateAdj,width/2,height/20*17);
  
  
  finestra=(time%((verdeSalita+rosso+verdeDiscesa+rosso)*1000))/1000;
  if (Math.floor(finestra) < verdeSalita){messaggio="sali";}
  if (Math.floor(finestra) >= verdeSalita && Math.floor(finestra) < verdeSalita+rosso ){messaggio="aspetta";}
  if (Math.floor(finestra) >= verdeSalita+rosso && Math.floor(finestra) < verdeSalita+rosso+verdeDiscesa ){messaggio="scendi";}
  if (Math.floor(finestra) >= verdeSalita+rosso+verdeDiscesa ){messaggio="aspetta";}
  return messaggio;
}

function disegnaSemaforo(x,y,colAlto,colMezzo,colBasso,descrizione) {
  fill("darkbrown"); //grey color
  larghezza=width/4;
  altezza=height/2.5;
  rect(x, y, larghezza,altezza, 20);//traffic light base 
  fill(colAlto);
  ellipse(x+larghezza/2, y+altezza/4,larghezza/2.1,larghezza/2.1);//first light
  fill(colMezzo);
  ellipse(x+larghezza/2, y+altezza/4*2,larghezza/2.1,larghezza/2.1);//second light
  fill(colBasso);
  ellipse(x+larghezza/2, y+altezza/4*3,larghezza/2.1,larghezza/2.1);//third code
  textSize(height/40);
  fill("orange");
  text(descrizione,x+larghezza/2,y+altezza/10)
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

function getBrowser(){
  var nVer = navigator.appVersion;
  var nAgt = navigator.userAgent;
  var browserName  = navigator.appName;
  var fullVersion  = ''+parseFloat(navigator.appVersion); 
  var majorVersion = parseInt(navigator.appVersion,10);
  var nameOffset,verOffset,ix;

  // In Opera, the true version is after "OPR" or after "Version"
  if ((verOffset=nAgt.indexOf("OPR"))!=-1) {
    browserName = "Opera";
    fullVersion = nAgt.substring(verOffset+4);
  if ((verOffset=nAgt.indexOf("Version"))!=-1) 
    fullVersion = nAgt.substring(verOffset+8);
  }    
  // In MS Edge, the true version is after "Edg" in userAgent
  else if ((verOffset=nAgt.indexOf("Edg"))!=-1) {
    browserName = "Microsoft Edge";
    fullVersion = nAgt.substring(verOffset+4);
  }
  // In MSIE, the true version is after "MSIE" in userAgent
  else if ((verOffset=nAgt.indexOf("MSIE"))!=-1) {
    browserName = "Microsoft Internet Explorer";
    fullVersion = nAgt.substring(verOffset+5);
  }
  // In Chrome, the true version is after "Chrome" 
  else if ((verOffset=nAgt.indexOf("Chrome"))!=-1) {
    browserName = "Chrome";
    fullVersion = nAgt.substring(verOffset+7);
  }
  // In Safari, the true version is after "Safari" or after "Version" 
  else if ((verOffset=nAgt.indexOf("Safari"))!=-1) {
    browserName = "Safari";
    fullVersion = nAgt.substring(verOffset+7);
    if ((verOffset=nAgt.indexOf("Version"))!=-1) 
      fullVersion = nAgt.substring(verOffset+8);
  }
  // In Firefox, the true version is after "Firefox" 
  else if ((verOffset=nAgt.indexOf("Firefox"))!=-1) {
    browserName = "Firefox";
    fullVersion = nAgt.substring(verOffset+8);
  }
  // In most other browsers, "name/version" is at the end of userAgent 
  else if ( (nameOffset=nAgt.lastIndexOf(' ')+1) < (verOffset=nAgt.lastIndexOf('/')) ) {
    browserName = nAgt.substring(nameOffset,verOffset);
    fullVersion = nAgt.substring(verOffset+1);
    if (browserName.toLowerCase()==browserName.toUpperCase()) {
      browserName = navigator.appName;
    }
  }
  // trim the fullVersion string at semicolon/space if present
  if ((ix=fullVersion.indexOf(";"))!=-1)
    fullVersion=fullVersion.substring(0,ix);
  if ((ix=fullVersion.indexOf(" "))!=-1)
    fullVersion=fullVersion.substring(0,ix);
  majorVersion = parseInt(''+fullVersion,10);
  if (isNaN(majorVersion)) {
    fullVersion  = ''+parseFloat(navigator.appVersion); 
    majorVersion = parseInt(navigator.appVersion,10);
  }
  return('Browser '+browserName+'Ver.'+fullVersion+'Maj '+majorVersion+'Nav app '+
       navigator.appName+'Nav UA '+navigator.userAgent);
 //+'Browser name  = '+browserName+'<br>'
 //+'Full version  = '+fullVersion+'<br>'
 //+'Major version = '+majorVersion+'<br>'
 //+'navigator.appName = '+navigator.appName+'<br>'
 //+'navigator.userAgent = '+navigator.userAgent+'<br>'
//)

}  

function debug(){
  push();
  textSize(height/50);
  fill(130);
  text("Loc: "+convertUnixTime(Date.now()/1000)+" Rem "+convertUnixTime(time/1000)+" "+dateAdj,width/2,height/20*17);
  textSize(height/60);
  textAlign(LEFT);
  //console.log(info());
  text('v1.0 '+info(),5,height/30*28,width,height/3);
  //text('v1.0 '+getBrowserEX(),0,height/30*29,width,height/30);
  pop();
}  
