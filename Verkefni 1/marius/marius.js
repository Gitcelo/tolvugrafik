var canvas;
var gl;
let right = true;
let jump = 0;
let xmove, ymove;
var vertices;


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
        vec2(-0.8, -0.7),
        vec2(-0.65, -0.9)
    ];
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
                    for (i = 0; i < 3; i++) vertices[i][0] = (1 - 0.15 * Math.floor(i / 2));
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
                    for (i = 0; i < 3; i++) vertices[i][0] = (-1 + 0.15 * Math.floor(i / 2));
                }
                else xmove = 0.04;
                break;
            case 32:
                if (jump) break;
                jump = 20;
                if (right && xmove != 0) xmove = 0.01;
                else if (xmove != 0) xmove = -0.01;
                break;
            default:
                xmove = 0.0;
        }
        if (jump == 0)
            for (i = 0; i < 3; i++) {
                vertices[i][0] += xmove;
            }

        gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));
    });

    render();
}


function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (jump > 0) {
        if (jump > 10) ymove = 0.1;
        else ymove = -0.1;
        if(xmove!=0 && jump%2==1) {
            if(right) xmove = 0.05;
            else xmove = -0.05;
        }
        else if(xmove!=0) xmove = 0.01;
        for (i = 0; i < 3; i++) {
            vertices[i][1] += ymove;
            vertices[i][0] += xmove;
        }
        jump--;
    }
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    window.requestAnimFrame(render);
}