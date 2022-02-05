var canvas;
var gl;
let right = true;
let jump = 0;
let xmove, ymove;
let height = 20;
var vertices;
let colorLoc;

function coin() {
    let cX = Math.random()*1.95 - 1;
    let cY;
    if(Math.random()>0.5) cY = -0.05;
    else cY = -1;
    vertices.push(vec2(cX, cY+0.1));
    vertices.push(vec2(cX, cY));
    vertices.push(vec2(cX+0.05, cY));
    vertices.push(vec2(cX+0.05, cY+0.1));
}

function collision(offset) {
    const mY = vertices[0][1];
    const cX = vertices[offset][0];
    const cY = vertices[offset][1];
    if (right) {
    const mX = vertices[0][0];
    if(mX <= cX+0.05 && mX+0.15 >= cX && mY <= cY-0.1 && mY+0.3 >= cY)
        for (i = 0; i < 4; i++) vertices[offset+i] = 0;
    }
    else {
        const mX = vertices[2][0];
        if(mX <= cX+0.05 && mX+0.15 >= cX && mY <= cY-0.1 && mY+0.3 >= cY)
        for (i = 0; i < 4; i++) vertices[offset+i] = 0;
    }
}

window.onload = function init() {

    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.5, 1, 1, 1.0);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    vertices = [
        vec2(-0.8, -1),
        vec2(-0.8, -0.9),
        vec2(-0.65, -0.9),
        vec2(-0.8, -0.7)
        
    ];
    coin();
    xmove = 0;
    ymove = 0;
    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.DYNAMIC_DRAW);

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    colorLoc = gl.getUniformLocation(program, "fColor");

    // Event listener for keyboard
    window.addEventListener("keydown", function (e) {
        switch (e.keyCode) {
            case 37:	// vinstri �r
                if (jump) break;
                if (right) {
                    right = false;
                    vertices[2][0] -= 0.3;
                    xmove = 0;
                }
                else if (vertices[0][0] <= -0.95) {
                    for (i = 0; i < 4; i++) {
                     if(i == 2) vertices[i][0] = 0.85;
                     else vertices[i][0] = 1;
                    }
                }
                else xmove = -0.04;
                break;
            case 39:	// h�gri �r
                if (jump) break;
                if (!right) {
                    right = true;
                    vertices[2][0] += 0.3;
                    xmove = 0.0;
                }
                else if (vertices[0][0] >= 0.95) {
                    for (i = 0; i < 4; i++) {
                        if(i == 2) vertices[i][0] = -0.85;
                        else vertices[i][0] = -1;
                    }
                }
                else xmove = 0.04;
                break;
            case 32:
                if (jump) break;
                jump = height;
                if (right && xmove != 0) xmove = 0.01;
                else if (xmove != 0) xmove = -0.01;
                break;
            default:
                xmove = 0.0;
        }
        if (jump == 0)
            for (i = 0; i < 4; i++) {
                vertices[i][0] += xmove;
            }

        gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));
    });

    render();
}


function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    if (jump > 0) {
        if (jump > height/2) ymove = 0.1;
        else ymove = -0.1;
        if(xmove!=0 && jump%2==1) {
            if(right) xmove = 0.05;
            else xmove = -0.05;
        }
        else if(xmove!=0) xmove = 0.01;
        for (i = 0; i < 4; i++) {
            vertices[i][1] += ymove;
            vertices[i][0] += xmove;
        }
        jump--;
    }
    collision(4);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));

    // Teikna buxurnar á Marius
    gl.uniform4fv(colorLoc, vec4( 0.0, 0.0, 1.0, 1.0 ));
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // Teikna búkinn á Marius (so no head?)
    gl.uniform4fv(colorLoc, vec4( 1.0, 0.0, 0.0, 1.0 ));
    gl.drawArrays(gl.TRIANGLES, 1, 3);

    // Teikna einn gullmola
    gl.uniform4fv(colorLoc, vec4( 1.0, 1.0, 0.0, 1.0 ));
    gl.drawArrays(gl.TRIANGLE_FAN, 4, 4);

    window.requestAnimFrame(render);
}