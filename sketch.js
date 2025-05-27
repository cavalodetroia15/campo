let gotas = [];
let solo;
let tipoSolo = "vegetacao";
let nuvens = [];

function setup() {
    let canvas = createCanvas(600, 400);
    canvas.parent("canvas-holder");
    solo = new Solo(tipoSolo);
    // Inicializa algumas nuvens
    for (let i = 0; i < 5; i++) {
        nuvens.push(new Nuvem());
    }
}

function draw() {
    background(200, 220, 255);

    // Atualiza e mostra nuvens
    for (let nuvem of nuvens) {
        nuvem.mover();
        nuvem.mostrar();
    }

    // Atualiza e mostra gotas de chuva
    for (let i = gotas.length - 1; i >= 0; i--) {
        gotas[i].cair();
        gotas[i].mostrar();

        if (gotas[i].atingeSolo(solo.altura)) {
            solo.aumentarErosao();
            if (tipoSolo === "urbanizado") {
                solo.adicionarDetritos(gotas[i].x, solo.altura);
            }
            gotas.splice(i, 1);
        }
    }

    solo.mostrar();
    solo.mostrarElementos();
    solo.mostrarDetritos();

    if (frameCount % 5 === 0) {
        gotas.push(new Gota());
    }
}

function setSoilType(tipo) {
    tipoSolo = tipo;
    solo = new Solo(tipoSolo);
    gotas = [];
}

class Gota {
    constructor() {
        this.x = random(width);
        this.y = 0;
        this.vel = random(4, 6);
    }

    cair() {
        this.y += this.vel;
    }

    mostrar() {
        stroke(0, 0, 200);
        line(this.x, this.y, this.x, this.y + 10);
    }

    atingeSolo(ySolo) {
        return this.y > ySolo;
    }
}

class Nuvem {
    constructor() {
        this.x = random(width);
        this.y = random(20, 80);
        this.largura = random(50, 150);
        this.altura = random(30, 60);
        this.velocidade = random(0.1, 0.5);
        this.transparencia = random(150, 220);
    }

    mover() {
        this.x += this.velocidade;
        if (this.x > width + this.largura / 2) {
            this.x = -this.largura / 2;
        }
    }

    mostrar() {
        noStroke();
        fill(255, this.transparencia);
        ellipse(this.x, this.y + this.altura / 4, this.largura * 0.8, this.altura * 0.6);
        ellipse(this.x - this.largura * 0.3, this.y, this.largura * 0.5, this.altura * 0.8);
        ellipse(this.x + this.largura * 0.3, this.y, this.largura * 0.5, this.altura * 0.7);
    }
}

class Solo {
    constructor(tipo) {
        this.tipo = tipo;
        this.altura = height - 80;
        this.erosao = 0;
        this.elementos = [];
        this.detritos = [];
        this.inicializarElementos();
    }

    inicializarElementos() {
        this.elementos = [];
        if (this.tipo === "vegetacao") {
            for (let i = 0; i < 10; i++) {
                this.elementos.push({
                    tipo: "arvore",
                    x: random(width),
                    y: this.altura,
                    tamanho: random(30, 60)
                });
            }
            for (let i = 0; i < 8; i++) {
                this.elementos.push({
                    tipo: "passaro",
                    x: random(width),
                    y: random(this.altura - 180, this.altura - 80),
                    direcao: random([-1, 1]),
                    tempo: random(100)
                });
            }
        } else if (this.tipo === "urbanizado") {
            for (let i = 0; i < 12; i++) {
                let h = random(50, 180);
                let w = random(25, 70);
                this.elementos.push({
                    tipo: "predio",
                    x: random(width),
                    y: this.altura,
                    largura: w,
                    altura: h,
                    cor: color(random(100, 255), random(100, 255), random(100, 255)),
                    telhadoTipo: random(["plano", "inclinado"]),
                    antena: random() < 0.3
                });
            }
            for (let i = 0; i < 3; i++) {
                this.elementos.push({
                    tipo: "aviao",
                    x: random(width),
                    y: random(50, 150),
                    tamanho: random(20, 30),
                    velocidade: random(1.2, 1.8),
                    direcao: random([-1, 1]),
                    rastro: []
                });
            }
            for (let i = 0; i < 2; i++) {
                this.elementos.push({
                    tipo: "helicoptero",
                    x: random(width),
                    y: random(80, 180),
                    tamanho: random(18, 28),
                    tempo: random(100),
                    velY: random(-0.2, 0.2) * 0.5,
                    rotorAngle: 0
                });
            }
        }
    }

    aumentarErosao() {
        let taxa;
        if (this.tipo === "vegetacao") taxa = 0.05;
        else if (this.tipo === "exposto") taxa = 0.3;
        else if (this.tipo === "urbanizado") taxa = 0.15;

        this.erosao += taxa;
        this.altura += taxa;

        for (let elem of this.elementos) {
            if (elem.tipo === "arvore" || elem.tipo === "predio") {
                elem.y = this.altura;
            }
        }
    }

    adicionarDetritos(x, y) {
        for (let i = 0; i < 3; i++) {
            this.detritos.push({
                x: x + random(-5, 5),
                y: y,
                velY: random(-1, -3),
                alpha: 255
            });
        }
    }

    mostrarDetritos() {
        for (let i = this.detritos.length - 1; i >= 0; i--) {
            let d = this.detritos[i];
            fill(50, d.alpha);
            ellipse(d.x, d.y, 2, 2);
            d.y += d.velY;
            d.velY += 0.1;
            d.alpha -= 5;
            if (d.alpha <= 0) {
                this.detritos.splice(i, 1);
            }
        }
    }

    mostrar() {
        noStroke();
        if (this.tipo === "vegetacao") fill(60, 150, 60);
        else if (this.tipo === "exposto") fill(139, 69, 19);
        else if (this.tipo === "urbanizado") fill(120);

        rect(0, this.altura, width, height - this.altura);

        fill(0);
        textSize(14);
        text(`Erosão: ${this.erosao.toFixed(1)}`, 10, 20);
        text(`Tipo de solo: ${this.tipo}`, 10, 40);
    }

    mostrarElementos() {
        for (let elem of this.elementos) {
            if (elem.tipo === "arvore") {
                fill(100, 70, 40);
                rect(elem.x - 5, elem.y - elem.tamanho * 0.6, 10, elem.tamanho * 0.6);
                fill(50, 150, 50);
                ellipse(elem.x, elem.y - elem.tamanho * 0.6, elem.tamanho, elem.tamanho);
            } else if (elem.tipo === "passaro") {
                fill(0);
                noStroke();
                let angle = millis() * 0.05 + elem.tempo * 2;
                let size = 5;
                for (let i = 0; i < 3; i++) {
                    let offsetX = cos(angle + i * 0.5) * 5;
                    let offsetY = sin(angle + i * 0.5) * 3;
                    ellipse(elem.x + offsetX, elem.y + offsetY, size, size * 0.8);
                }
                elem.x += elem.direcao * 1.5;
                if (elem.x < -20 || elem.x > width + 20) {
                    elem.direcao *= -1;
                }
            } else if (elem.tipo === "predio") {
                fill(elem.cor);
                rect(elem.x - elem.largura / 2, elem.y - elem.altura, elem.largura, elem.altura);
                fill(255, 255, 150, 180);
                for (let j = elem.y - elem.altura + 15; j < elem.y - 10; j += 20) {
                    for (let i = elem.x - elem.largura / 2 + 10; i < elem.x + elem.largura / 2 - 10; i += 15) {
                        if (random() > 0.5) {
                            rect(i, j, 10, 12);
                        }
                    }
                }
                fill(100);
                if (elem.telhadoTipo === "inclinado") {
                    triangle(elem.x - elem.largura / 2 - 5, elem.y - elem.altura, elem.x + elem.largura / 2 + 5, elem.y - elem.altura, elem.x, elem.y - elem.altura - 15);
                } else {
                    rect(elem.x - elem.largura / 2 - 5, elem.y - elem.altura - 5, elem.largura + 10, 5);
                }
                if (elem.antena) {
                    stroke(0);
                    line(elem.x, elem.y - elem.altura - 5, elem.x, elem.y - elem.altura - 25);
                    noStroke();
                }
            } else if (elem.tipo === "aviao") {
                fill(200);
                stroke(0);
                strokeWeight(1);
                ellipse(elem.x, elem.y, elem.tamanho * 1.5, elem.tamanho * 0.5);
                line(elem.x - elem.tamanho * 0.75, elem.y, elem.x - elem.tamanho * 1.5, elem.y - elem.tamanho * 0.3);
                line(elem.x - elem.tamanho * 0.75, elem.y, elem.x - elem.tamanho * 1.5, elem.y + elem.tamanho * 0.3);
                line(elem.x + elem.tamanho * 0.75, elem.y, elem.x + elem.tamanho * 1.5, elem.y - elem.tamanho * 0.3);
                line(elem.x + elem.tamanho * 0.75, elem.y, elem.x + elem.tamanho * 1.5, elem.y + elem.tamanho * 0.3);
                noStroke();
                elem.x += elem.velocidade * elem.direcao;
                if (elem.x < -50 || elem.x > width + 50) {
                    elem.direcao *= -1;
                }
                // Rastro
                stroke(200, 50);
                strokeWeight(0.5);
                elem.rastro.push({ x: elem.x, y: elem.y });
                for (let i = elem.rastro.length - 1; i >= 0; i--) {
                    let r = elem.rastro[i];
                    point(r.x, r.y);
                    if (elem.rastro.length > 50) {
                        elem.rastro.splice(0, 1);
                    }
                }
                noStroke();
            } else if (elem.tipo === "helicoptero") {
                fill(150);
                stroke(0);
                strokeWeight(1);
                ellipse(elem.x, elem.y, elem.tamanho, elem.tamanho * 0.8);
                // Rotor principal
                let rotorRadius = elem.tamanho * 0.7;
                let numBlades = 3;
                for (let i = 0; i < numBlades; i++) {
                    let angle = elem.rotorAngle + TWO_PI / numBlades * i;
                    let x1 = elem.x + cos(angle) * 0;
                    let y1 = elem.y - elem.tamanho * 0.2 + sin(angle) * 0;
                    let x2 = elem.x + cos(angle) * rotorRadius;
                    let y2 = elem.y - elem.tamanho * 0.2 + sin(angle) * rotorRadius;
                    line(x1, y1, x2, y2);
                }
                // Rotor de cauda
                ellipse(elem.x + elem.tamanho * 0.6, elem.y + elem.tamanho * 0.3, elem.tamanho * 0.3, elem.tamanho * 0.3);
                noStroke();
                elem.tempo += 0.05;
                elem.y += sin(elem.tempo * 0.5) * 0.2 + elem.velY;
                if (elem.y < 60 || elem.y > 190) {
                    elem.velY *= -1;
                }
                elem.rotorAngle += 0.2;
            }
        }
    }
}
