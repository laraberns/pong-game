// Variáveis para as raquetes, bola e barras horizontais
let raqueteJogador, raqueteComputador, bola, barraSuperior, barraInferior;
let fundoImg, bolaImg, barra1Img, barra2Img;
let bounceSound, golSound;

let placarJogador = 0;
let placarComputador = 0;
const golsParaVencer = 3; // Número de gols necessário para vencer
// Variáveis para controle da mensagem de vitória e do botão de reinício
let jogoEncerrado = false;
let championsSound;
let neverSound
let jogoParado = false;
let somBounceAtivo = true; // Controla o som de colisão
let somGolAtivo = true; // Controla o som de gol

function preload() {
  fundoImg = loadImage('/sprites/fundo1.png');
  bolaImg = loadImage('/sprites/bola.png');
  barra1Img = loadImage('/sprites/barra01.png');
  barra2Img = loadImage('/sprites/barra02.png');
  bounceSound = loadSound('/sounds/bounce.wav');
  golSound = loadSound('/sounds/goal.wav');
  

  // Ajustar o volume dos sons aqui
  bounceSound.setVolume(0.1); // Define o volume para 30%
  golSound.setVolume(0.1); // Define o volume para 30%
}


function setup() {
  createCanvas(windowWidth, windowHeight);
  raqueteJogador = new Raquete(30, height / 2, 10, height / 6); // Ajuste a altura da raquete em proporção
  raqueteComputador = new Raquete(width - 40, height / 2, 10, height / 6); // Ajuste a altura da raquete em proporção
  bola = new Bola(height / 40); // Ajuste o tamanho da bola em proporção
  barraSuperior = new Barra(0, 0, width, height / 100); // Ajuste a altura da barra superior em proporção
  barraInferior = new Barra(0, height, width, height / 100); // Ajuste a altura da barra inferior em proporção

  // Crie um botão de reinício
  reiniciarBotao = createButton('Play again');
  reiniciarBotao.position(width / 2 - 50, height / 2);
  reiniciarBotao.class('botao-reinicio'); // Adicione uma classe ao botão
  reiniciarBotao.mousePressed(reiniciarJogo);
  reiniciarBotao.hide(); // Inicialmente, o botão de reinício deve estar oculto
  noCursor();

  championsSound = loadSound('/sounds/champions.mp3');
  championsSound.setVolume(0.5); // Ajuste o volume conforme necessário
  neverSound = loadSound('/sounds/never.mp3');
  neverSound.setVolume(0.5); // Ajuste o volume conforme necessário
}

function draw() {

  let escala = Math.max(width / fundoImg.width, height / fundoImg.height);
  let imgWidth = fundoImg.width * escala;
  let imgHeight = fundoImg.height * escala;
  let imgX = (width - imgWidth) / 2;
  let imgY = (height - imgHeight) / 2;
  image(fundoImg, imgX, imgY, imgWidth, imgHeight);


  // Atualiza as posições das raquetes, bola e barras horizontais
  raqueteJogador.atualizar();
  raqueteComputador.atualizar();
  bola.atualizar(barraSuperior, barraInferior);

  // Verifica colisões entre bola e raquetes
  bola.verificarColisaoRaquete(raqueteJogador);
  bola.verificarColisaoRaquete(raqueteComputador);

  // Desenha as raquetes, a bola e as barras horizontais
  raqueteJogador.exibir();
  raqueteComputador.exibir();
  bola.exibir();
  barraSuperior.exibir();
  barraInferior.exibir();

  // Configuração do texto do placar
  let tamanhoPlacar = height / 20;
  textSize(tamanhoPlacar);
  fill(255);
  textAlign(CENTER, TOP);

  // Placar do Jogador
  text(placarComputador.toString() + " x " + placarJogador.toString(), width / 2, 10);

  // Verifique se um dos jogadores venceu
  if (placarJogador >= golsParaVencer || placarComputador >= golsParaVencer) {
    jogoEncerrado = true;
    exibirMensagemVitoria();
    reiniciarBotao.show();
  }

  if (jogoEncerrado && !championsSound.isPlaying()) {
    jogoParado = true; // Pausa o jogo quando um jogador vence
  }

  if (jogoEncerrado && placarComputador >= golsParaVencer) {
    if (somBounceAtivo || somGolAtivo) {
      championsSound.play(); // Toca o som "champions.mp3" apenas uma vez
      somBounceAtivo = false; // Desativa o som de colisão
      somGolAtivo = false; // Desativa o som de gol
    }

    jogoParado = true; // Pausa o jogo quando um jogador vence
    bounceSound.stop(); // Pare o som de colisão
    golSound.stop(); // Pare o som de gol
  }

  if (jogoEncerrado && placarJogador >= golsParaVencer) {
    if (somBounceAtivo || somGolAtivo) {
      neverSound.play(); // Toca o som "champions.mp3" apenas uma vez
      somBounceAtivo = false; // Desativa o som de colisão
      somGolAtivo = false; // Desativa o som de gol
    }
  }

}

class Raquete {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  atualizar() {
    if (this === raqueteJogador) {
      this.y = mouseY;
    } else {
      if (bola.y > this.y + this.h / 2) {
        this.y += 3;
      } else if (bola.y < this.y - this.h / 2) {
        this.y -= 3;
      }
    }
    this.y = constrain(this.y, this.h / 2 + barraSuperior.h, height - this.h / 2 - barraInferior.h);
  }

  exibir() {
    let img;
    if (this === raqueteJogador) {
      img = barra1Img;
    } else {
      img = barra2Img;
    }
    push();
    imageMode(CENTER);
    translate(this.x, this.y);
    scale(this.h / 400.0); // Escala as imagens para metade do tamanho
    image(img, 0, 0, img.width, img.height);
    pop();
  }
}

class Bola {
  constructor(r) {
    this.r = r;
    this.reiniciar();
  }

  aumentarVelocidade() {
    const fatorAumento = 1.1;
    this.velocidadeX *= fatorAumento;
    this.velocidadeY *= fatorAumento;
  }

  reiniciar() {
    this.anguloRotacao = 0;
    this.x = width / 2;
    this.y = height / 2;
    this.velocidadeX = random([-6, -5, 5, 6]); // Ajuste os valores de velocidade X
    this.velocidadeY = random(-4, 4); // Ajuste os valores de velocidade Y
  }

  atualizar(barraSuperior, barraInferior) {
    this.x += this.velocidadeX;
    this.y += this.velocidadeY;

    if (
      this.y - this.r / 2 <= barraSuperior.y + barraSuperior.h ||
      this.y + this.r / 2 >= barraInferior.y - barraInferior.h
    ) {
      this.velocidadeY *= -1;
    }

    if (this.x + this.r / 2 >= width) {
      this.reiniciar();
      tocarSomDeGol();
      placarComputador++;
      narrarPlacar();
    } else if (this.x - this.r / 2 <= 0) {
      raqueteComputador.y = random(height - raqueteComputador.h);
      this.reiniciar();
      tocarSomDeGol();
      placarJogador++;
      narrarPlacar();
    }

    this.anguloRotacao += Math.atan2(this.velocidadeY, this.velocidadeX) / 5;

  }
  verificarColisaoRaquete(raquete) {
    if (
      this.x - this.r / 2 <= raquete.x + raquete.w / 2 &&
      this.x + this.r / 2 >= raquete.x - raquete.w / 2 &&
      this.y + this.r / 2 >= raquete.y - raquete.h / 2 &&
      this.y - this.r / 2 <= raquete.y + raquete.h / 2
    ) {
      // Inverte a direção horizontal da bola
      this.velocidadeX *= -1;

      // Calcula a posição relativa da bola na raquete (entre -0.5 e 0.5)
      let posicaoRelativa = (this.y - raquete.y) / raquete.h;

      // Define o ângulo da bola após a colisão
      let anguloBola = posicaoRelativa * PI / 3 * 2.3;

      // Atualiza a velocidade vertical da bola com base no ângulo
      this.velocidadeY = this.velocidadeX * Math.tan(anguloBola);

      // Aumenta a velocidade da bola
      this.aumentarVelocidade();

      tocarSomColisao();

    }
  }

  exibir() {
    push();
    imageMode(CENTER);
    translate(this.x, this.y);
    scale(2 * this.r / 318); // Escala a imagem para metade do tamanho
    rotate(this.anguloRotacao);
    image(bolaImg, 0, 0, bolaImg.width, bolaImg.height);
    pop();
  }
}

class Barra {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  exibir() {
    fill(color("#2B3FD6"));
    rectMode(CENTER);
    rect(this.x + this.w / 2, this.y, this.w, this.h);
  }
}


function tocarSomColisao() {
  bounceSound.play();
}

function tocarSomDeGol() {
  golSound.play();
}

function narrarPlacar() {

  if (jogoEncerrado) {
    // Não narra o placar se o jogo estiver encerrado
    return;
  }

  const mensagem = `${placarComputador} a ${placarJogador}`;

  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(mensagem);
  utterance.lang = 'en';
  synth.speak(utterance);
}

function exibirMensagemVitoria() {
  background(0); // Preencha o fundo com uma cor sólida
  textSize(32);
  fill(255);
  textAlign(CENTER);
  if (placarJogador >= golsParaVencer) {
    text("Computer wins! You lose ): Never let it down...", width / 2, height / 2 - 40);
  } else {
    text("Player 1 wins! You are the champion (:", width / 2, height / 2 - 40);
  }
}

function reiniciarJogo() {
  placarJogador = 0;
  placarComputador = 0;
  jogoEncerrado = false;
  jogoParado = false; // Define o jogo como não parado
  reiniciarBotao.hide();
  bola.reiniciar(); // Recrie a bola
  raqueteJogador = new Raquete(30, height / 2, 10, height / 6);
  raqueteComputador = new Raquete(width - 40, height / 2, 10, height / 6);
  championsSound.stop(); // Pare o som "champions.mp3"
  neverSound.stop()
  somBounceAtivo = true; // Ative o som de colisão
  somGolAtivo = true; // Ative o som de gol
}