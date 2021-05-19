"use strict";

var canvas, gl, program;

var NumVertices = 36; //(6 faces)(2 triangles/face)(3 vertices/triangle)

var points = [];
var colors = [];

var vertices = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5, -0.5, -0.5, 1.0 )
];

// RGBA colors
var vertexColors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];


// Parameters controlling the size of the Robot's arm

var BASE_HEIGHT      = 2.0;
var BASE_WIDTH       = 5.0;
var LOWER_ARM_HEIGHT = 5.0;
var LOWER_ARM_WIDTH  = 0.5;
var UPPER_ARM_HEIGHT = 5.0;
var UPPER_ARM_WIDTH  = 0.5;

// Parameters for fingers

var FINGER_ONE_HEIGHT = 2.5;
var FINGER_ONE_WIDTH = 0.1;
var FINGER_TWO_HEIGHT = 2.5;
var FINGER_TWO_WIDTH = 0.1;
var FINGER_THREE_HEIGHT = 2.5;
var FINGER_THREE_WIDTH = 0.1;

// Shader transformation matrices

var modelViewMatrix, projectionMatrix;

// Array of rotation angles (in degrees) for each rotation axis

var Base = 0;
var LowerArm = 1;
var UpperArm = 2;
var FingerOne = 3;
var FingerTwo = 4;
var FingerThree = 5;


var theta= [ 0, 0, 0, 0, 0, 0];
var phi= [ 0, 0, 0, 0, 0, 0];
var zi= [ 0, 0, 0, 0, 0, 0];

var angle = 0;

var modelViewMatrixLoc;

var vBuffer, cBuffer;

//----------------------------------------------------------------------------

function quad(  a,  b,  c,  d ) {
    colors.push(vertexColors[a]);
    points.push(vertices[a]);
    colors.push(vertexColors[a]);
    points.push(vertices[b]);
    colors.push(vertexColors[a]);
    points.push(vertices[c]);
    colors.push(vertexColors[a]);
    points.push(vertices[a]);
    colors.push(vertexColors[a]);
    points.push(vertices[c]);
    colors.push(vertexColors[a]);
    points.push(vertices[d]);
}


function colorCube() {
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

//____________________________________________

// Remmove when scale in MV.js supports scale matrices

function scale4(a, b, c) {
   var result = mat4();
   result[0][0] = a;
   result[1][1] = b;
   result[2][2] = c;
   return result;
}


//--------------------------------------------------


window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );

    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    gl.enable( gl.DEPTH_TEST );

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );

    gl.useProgram( program );

    colorCube();

    // Load shaders and use the resulting shader program

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Create and initialize  buffer objects

    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    document.getElementById("slider1").onchange = function(event) {
        theta[0] = event.target.value;
    };
    document.getElementById("slider2").onchange = function(event) {
         theta[1] = event.target.value;
    };
    document.getElementById("slider3").onchange = function(event) {
         theta[2] =  event.target.value;
    };
    document.getElementById("slider4").onchange = function(event) {
        phi[0] = event.target.value;
    };
    document.getElementById("slider5").onchange = function(event) {
        zi[0] = event.target.value;
    };
    document.getElementById("slider6").onchange = function(event) {
        phi[1] = event.target.value;
    };
    document.getElementById("slider7").onchange = function(event) {
        zi[1] = event.target.value;
    };
    document.getElementById("slider8").onchange = function(event) {
        phi[2] = event.target.value;
    };
    document.getElementById("slider9").onchange = function(event) {
        zi[2] = event.target.value;
    };
    document.getElementById("slider10").onchange = function(event) {
        theta[3] = event.target.value;
    };
    document.getElementById("slider11").onchange = function(event) {
        phi[3] = event.target.value;
    };
    document.getElementById("slider12").onchange = function(event) {
        zi[3] = event.target.value;
    };
    document.getElementById("slider13").onchange = function(event) {
        theta[4] = event.target.value;
    };
    document.getElementById("slider14").onchange = function(event) {
        phi[4] = event.target.value;
    };
    document.getElementById("slider15").onchange = function(event) {
        zi[4] = event.target.value;
    };
    document.getElementById("slider16").onchange = function(event) {
        theta[5] = event.target.value;
    };
    document.getElementById("slider17").onchange = function(event) {
        phi[5] = event.target.value;
    };
    document.getElementById("slider18").onchange = function(event) {
        zi[5] = event.target.value;
    };

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

    projectionMatrix = ortho(-10, 10, -10, 10, -10, 10);
    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),  false, flatten(projectionMatrix) );

    render();
}

//----------------------------------------------------------------------------


function base() {
    var s = scale4(BASE_WIDTH, BASE_HEIGHT, BASE_WIDTH);
    var instanceMatrix = mult( translate( 0.0, 0.5 * BASE_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

//----------------------------------------------------------------------------


function upperArm() {
    var s = scale4(UPPER_ARM_WIDTH, UPPER_ARM_HEIGHT, UPPER_ARM_WIDTH);
    var instanceMatrix = mult(translate( 0.0, 0.5 * UPPER_ARM_HEIGHT, 0.0 ),s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

//----------------------------------------------------------------------------


function lowerArm()
{
    var s = scale4(LOWER_ARM_WIDTH, LOWER_ARM_HEIGHT, LOWER_ARM_WIDTH);
    var instanceMatrix = mult( translate( 0.0, 0.5 * LOWER_ARM_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

//----------------------------------------------------------------------------

function fingerOne()
{
    var s = scale4(FINGER_ONE_WIDTH, FINGER_ONE_HEIGHT, FINGER_ONE_WIDTH);
    var instanceMatrix = mult( translate( 0.0, 0.5 * FINGER_ONE_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

//----------------------------------------------------------------------------

function fingerTwo()
{
    var s = scale4(FINGER_TWO_WIDTH, FINGER_TWO_HEIGHT, FINGER_TWO_WIDTH);
    var instanceMatrix = mult( translate( 0.0, 0.5 * FINGER_TWO_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

//----------------------------------------------------------------------------

function fingerThree()
{
    var s = scale4(FINGER_THREE_WIDTH, FINGER_THREE_HEIGHT, FINGER_THREE_WIDTH);
    var instanceMatrix = mult( translate( 0.0, 0.5 * FINGER_THREE_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

//----------------------------------------------------------------------------

var render = function() {

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    modelViewMatrix = rotate(theta[Base], 0, 1, 0 );
    modelViewMatrix = mult(modelViewMatrix, rotate(phi[Base], 1, 0, 0 ));
    modelViewMatrix = mult(modelViewMatrix, rotate(zi[Base], 0, 0, 1));
    base();

    modelViewMatrix = mult(modelViewMatrix, translate(0.0, BASE_HEIGHT, 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[LowerArm], 0, 0, 1 ));
    modelViewMatrix = mult(modelViewMatrix, rotate(phi[LowerArm], 1, 0, 0));
    modelViewMatrix = mult(modelViewMatrix, rotate(zi[LowerArm], 0, 1, 0));
    lowerArm();

    modelViewMatrix  = mult(modelViewMatrix, translate(0.0, LOWER_ARM_HEIGHT, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(theta[UpperArm], 0, 0, 1) );
    modelViewMatrix = mult(modelViewMatrix, rotate(phi[UpperArm], 1, 0, 0));
    modelViewMatrix = mult(modelViewMatrix, rotate(zi[UpperArm], 0, 1, 0));
    upperArm();

    modelViewMatrix = mult(modelViewMatrix, translate(0.0, UPPER_ARM_HEIGHT, 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[FingerOne], 1, 0, 0));
    modelViewMatrix = mult(modelViewMatrix, rotate(phi[FingerOne], 0, 1, 0));
    modelViewMatrix = mult(modelViewMatrix, rotate(zi[FingerOne], 0, 0, 1));
    fingerOne();

    modelViewMatrix = mult(modelViewMatrix, translate(0.0, 0.0, 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[FingerTwo], 1, 0, 0));
    modelViewMatrix = mult(modelViewMatrix, rotate(phi[FingerTwo], 0, 1, 0));
    modelViewMatrix = mult(modelViewMatrix, rotate(zi[FingerTwo], 0, 0, 1));
    fingerTwo();

    modelViewMatrix = mult(modelViewMatrix, translate(0.0, 0.0, 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[FingerThree], 1, 0, 0));
    modelViewMatrix = mult(modelViewMatrix, rotate(phi[FingerThree], 0, 1, 0));
    modelViewMatrix = mult(modelViewMatrix, rotate(zi[FingerThree], 0, 0, 1));
    fingerThree();

    requestAnimFrame(render);
}
