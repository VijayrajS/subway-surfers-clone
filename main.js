var cubeRotation = 0.0;
var cubePosition = -21;
var cubeUpPosition = 0;
var moveFlag = 0;
var playerSpeed = 1;

var jumpVelocity = 0;
var jumpFlag = 0;

var duckVelocity = 0;
var duckFlag = 0;

var policeIn = 0;
var policeInTime = 0;

var isShoes = 0;
var shoeStart = 0;
var isJet = 0;
var jetStart = 0;

var score = 0;
var coins = 0;
var isGrey = 0;

var lastColl = new Date();
var stopColl = [];
var boardColl = [];
var pDead = 0;
// Start here

var c;
var policeman = []; // Head + body

var rail_array = [];
var lwall_array = [];
var rwall_array = [];
var crate_array = [];

var board_array = [];
var rod_array = [];
var stop_sign = [];
var stop_rod = [];

var train_f = [];
var train_l = [];
var train_r = [];
var train_top = [];

var coin_arr = [];
var jet_arr = [];
var shoe_array = [];

var flashTime = new Date();

vsSourceFlash = `
    attribute vec4 aVertexPosition;
    attribute vec3 aVertexNormal;
    attribute vec2 aTextureCoord;

    uniform mat4 uNormalMatrix;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    uniform int flag;

    varying highp vec2 vTextureCoord;
    varying highp vec3 vLighting;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vTextureCoord = aTextureCoord;

      // Apply lighting effect

      highp vec3 ambientLight;
      highp vec3 directionalLightColor = vec3(1, 1, 1);
      highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

      highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

      highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
       if (flag == 1)
           ambientLight = vec3(3, 3, 3);
       else
           ambientLight = vec3(0.3, 0.3, 0.3);
      vLighting = ambientLight + (directionalLightColor * directional);
    }
  `;

fsSourceFlash = `
    varying highp vec2 vTextureCoord;
    varying highp vec3 vLighting;
    uniform sampler2D uSampler;

    void main(void) {
      highp vec4 texelColor = texture2D(uSampler, vTextureCoord);
       gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
    }
  `;
  
  const canvas = document.querySelector('#glcanvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  shaderProgramFlash1 = initShaderProgram(gl, vsSourceFlash, fsSourceFlash);

  programInfoFlash = {
      program: shaderProgramFlash1,
      attribLocations: {
          vertexPosition: gl.getAttribLocation(shaderProgramFlash1, 'aVertexPosition'),
          vertexNormal: gl.getAttribLocation(shaderProgramFlash1, 'aVertexNormal'),
          textureCoord: gl.getAttribLocation(shaderProgramFlash1, 'aTextureCoord'),
      },
      uniformLocations: {
          projectionMatrix: gl.getUniformLocation(shaderProgramFlash1, 'uProjectionMatrix'),
          modelViewMatrix: gl.getUniformLocation(shaderProgramFlash1, 'uModelViewMatrix'),
          normalMatrix: gl.getUniformLocation(shaderProgramFlash1, 'uNormalMatrix'),
          uSampler: gl.getUniformLocation(shaderProgramFlash1, 'uSampler'),
          flag: gl.getUniformLocation(shaderProgramFlash1, 'flag'),
    },
  };

main();

function main() {


  c = new cube_w(gl, [-21, 26.0, 0.0], 8, 'player.jpg');
  
  policeman[0] = new cube_w(gl, [-21, 15, -50], 3, 'hair.jpeg');
  policeman[1] = new cube_w(gl, [-21, 0.0, -50], 12, 'police.png');
  policeman[2] = new cube_w(gl, [-21, 0.0, -50], 3, 'fur.jpg');

  for (let index = 0; index < 300; index++) {
      rail_array[index] = new cube_w(gl, [0, -60, index*50], 50, 'Rail.jpg')
  }

    for (let index = 0; index < 300; index++) {
        lwall_array[index] = new wall(gl, [100, 0, index * 100], 50, 'wall.jpg')
    }

    for (let index = 0; index < 300; index++) {
        rwall_array[index] = new wall(gl, [-100, 0, index * 100], 50, 'wall.jpg')
    }

    j = -1;
    
    for (let index = 0; index < 50; index++) {
        j *= -1;
        crate_array[index] = new cube_w(gl, [21*j, 0, (index+1)*1000], 10, 'crate.jpg');
    }

    rod_index = 0;

    for (let index = 0; index < 30; index++) {
        j *= -1;
        board_array[index] = new rock(gl, [21 * j, 0, (index + 1) * 510], 'Warn.jpg');
        rod_array[rod_index++] = new rod(gl, [21 * j - 11, 0, (index + 1) * 510], 0.5, 13, 1, 'wood.jpg');
        rod_array[rod_index++] = new rod(gl, [21 * j + 11, 0, (index + 1) * 510], 0.5, 13, 1, 'wood.jpg');
    }

    for (let index = 0; index < 30; index++) {
        stop_sign[index] = new rod(gl, [0, 17, (index + 1) * 510 + 100], 7, 7, 1, 'stop.png');
        stop_rod[index] = new rod(gl, [0, 0, (index + 1) * 510 + 100], 0.5, 10, 1, 'rust.jpg');
    }

    for (let index = 0; index < 30; index++) {
        // j = Math.pow(-1, Math.floor(Math.random())*20);
        j *= -1;
        train_f[index] = new rod(gl, [21*j, 0, (index + 1) * 1024], 13, 13, 1, 'tf1.png');
        train_l[index] = new rod(gl, [21*j-13, 0, (index + 1) * 1024 + 72], 1, 13, 72, 'ts1.png');
        train_r[index] = new rod(gl, [21*j+13, 0, (index + 1) * 1024 + 72], 1, 13, 72, 'ts2.png');
        train_top[index] = new rod(gl, [21*j, 13, (index + 1) * 1024 + 72], 13, 1, 72, 'tt.png');
    }

    for (let index = 0; index < 100; index+=6) {
        j = Math.pow(-1, Math.floor(Math.random() * 1.5));

        coin_arr[index] = new coin(gl, [21 * j, 1, (index + 1) * 215], 3, 3, 0.5, 'coin.png');
        coin_arr[index + 1] = new coin(gl, [21 * j, 1, (index + 1) * 215 + 30], 3, 3, 0.5, 'coin.png');
        coin_arr[index + 2] = new coin(gl, [21 * j, 1, (index + 1) * 215 + 60], 3, 3, 0.5, 'coin.png');
        coin_arr[index + 3] = new coin(gl, [21 * j, 1, (index + 1) * 215 + 90], 3, 3, 0.5, 'coin.png');
        coin_arr[index + 4] = new coin(gl, [21 * j, 1, (index + 1) * 215 + 120], 3, 3, 0.5, 'coin.png');
        coin_arr[index + 5] = new coin(gl, [21 * j, 1, (index + 1) * 215 + 150], 3, 3, 0.5, 'coin.png');

    }

    for (let index = 0; index < 10; index ++) {
        j = Math.pow(-1, Math.floor(Math.random() * 1.5));

        shoe_array[index] = new cube_w(gl, [21 * j, 1, (10*index + 1) * 279], 5, 'shoe.png');
    }

    for (let index = 0; index < 5; index++) {
        j = Math.pow(-1, Math.floor(Math.random() * 1.5));

        jet_arr[index] = new cube_w(gl, [21 * j, 1, (10 * index + 1) * 479], 5, 'jetpack.jpg');
    }

    // If we don't have a GL context, give up now

  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  // Vertex shader program

  const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec2 aTextureCoord;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying highp vec2 vTextureCoord;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vTextureCoord = aTextureCoord;
    }
  `;

  // Fragment shader program
 const fsSource = `
 precision mediump float;
    varying highp vec2 vTextureCoord;

    uniform sampler2D uSampler;

    void main(void) {
      gl_FragColor = texture2D(uSampler, vTextureCoord);
    }
  `;

 const fsSource1 = `
 precision mediump float;
   varying highp vec2 vTextureCoord;

   uniform sampler2D uSampler;
    
    void main(void) {
        vec4 color = texture2D(uSampler, vTextureCoord);
        float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
        gl_FragColor = vec4(vec3(gray), 1.0);
    }
  `;

  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
  const shaderProgramGrey = initShaderProgram(gl, vsSource, fsSource1);



  // Collect all the info needed to use the shader program.

   const programInfo = {
       program: shaderProgram,
       attribLocations: {
           vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
           textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
       },
       uniformLocations: {
           projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
           modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
           uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
       },
   };

   const programInfoGrey = {
       program: shaderProgramGrey,
       attribLocations: {
           vertexPosition: gl.getAttribLocation(shaderProgramGrey, 'aVertexPosition'),
           vertexNormal: gl.getAttribLocation(shaderProgramGrey, 'aVertexNormal'),
           textureCoord: gl.getAttribLocation(shaderProgramGrey, 'aTextureCoord'),
       },
       uniformLocations: {
           projectionMatrix: gl.getUniformLocation(shaderProgramGrey, 'uProjectionMatrix'),
           modelViewMatrix: gl.getUniformLocation(shaderProgramGrey, 'uModelViewMatrix'),
           normalMatrix: gl.getUniformLocation(shaderProgramGrey, 'uNormalMatrix'),
           uSampler: gl.getUniformLocation(shaderProgramGrey, 'uSampler'),
       },
   };

  // Here's where we call the routine that builds all the
  // objects we'll be drawing.
  //const buffers

  var then = 0;

  // Draw the scene repeatedly
  function render(now) {
    now *= 0.001;  // convert to seconds
    const deltaTime = now - then;
    then = now;

    if(!isGrey)
        drawScene(gl, programInfo, deltaTime);
    else
        drawScene(gl, programInfoGrey, deltaTime);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

// Even listener
document.addEventListener("keydown", function (e) {
    if(e.keyCode == 39)
    {
        moveFlag = 1;
    }
    else if(e.keyCode == 37)
    {
        moveFlag = -1;
    }

    else if(e.keyCode == 32)
    {
        if(jumpFlag == 0)
        {
            jumpFlag = 1;
            jumpVelocity = 1.5;
        }
    }

    else if (e.keyCode == 40 && !isJet) {
        if (duckFlag == 0) {
            jumpFlag = 0;
            duckFlag = 1;
            duckVelocity = -2;
        }
    }

    else if (e.keyCode == 71)
    {
        if(isGrey == 0)
            isGrey = 1;
        else
            isGrey = 0;
    }
});

// Draw the scene.
//

function drawScene(gl, programInfo, deltaTime) {
  gl.clearColor(135/255, 206/255, 235/255, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.
  
  const fieldOfView = 45 * Math.PI / 180;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 1000.0;
  const projectionMatrix = mat4.create();
  
  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  mat4.perspective(projectionMatrix,
    fieldOfView,
    aspect,
    zNear,
    zFar);
    
    // Set the drawing position to the "identity" point, which is
    // the center of the scene.
    var cameraMatrix = mat4.create();
    mat4.translate(cameraMatrix, cameraMatrix, [0, 50, -100]);
    var cameraPosition = [
        cameraMatrix[12],
        cameraMatrix[13],
        cameraMatrix[14],
    ];
    
    var up = [0, 1, 0];
    
    mat4.lookAt(cameraMatrix, cameraPosition, [0, 0, 0], up);
    
    var viewMatrix = cameraMatrix;

    //mat4.invert(viewMatrix, cameraMatrix);
    c.pos = [cubePosition, cubeUpPosition, 0]
    var viewProjectionMatrix = mat4.create();
    
    mat4.multiply(viewProjectionMatrix, projectionMatrix, viewMatrix);
    
    if(!pDead)
        collision();
    else
        playerSpeed = 0;
    score += playerSpeed;
    score = Math.round(score);
    
    win_time = 180;
    if(new Date() - flashTime >= win_time*1000)
    {
        delete c;
        window.alert("YOU WON\nScore: " + score + "\nCoins: " + coins);
        playerSpeed = 0;
    }

    if(moveFlag != 0)
    {
        if(moveFlag == 1 && cubePosition > -21)
        {
            cubePosition -= 2;
        }

        if(moveFlag == -1 && cubePosition < 20)
        {
            cubePosition += 2;
        }

        if(cubePosition > 20)
        {
            cubePosition = 20;
            moveFlag = 0;
        }

        if(cubePosition < -21)
        {
            cubePosition = -21;
            moveFlag = 0;
        }
    }

    if(jumpFlag)
    {
        cubeUpPosition += jumpVelocity;
        if(!isShoes)
        {
            if(cubeUpPosition >= 30)
            {
                cubeUpPosition = 30;
                jumpVelocity = -1.5;
            }

            if (cubeUpPosition <= 0)
            {
                cubeUpPosition = 0;
                jumpVelocity = 0;
                jumpFlag = 0;
            }
        }

        else
        {
            let elapsed = new Date() - shoeStart;

            if(elapsed >= 10000)
            {
                isShoes = 0;
                c.texture = loadTexture(gl, 'player.jpg')
                console.log("Shoes off");
            }

            if (cubeUpPosition >= 50) {
                cubeUpPosition = 50;
                jumpVelocity = -0.5;
            }

            if (cubeUpPosition <= 0) {
                cubeUpPosition = 0;
                jumpVelocity = 0;
                jumpFlag = 0;
            }
        }
    }

    if (isJet) {
        let elapsed = new Date() - jetStart;
        
        if(elapsed < 6000) {
        
            if (cubeUpPosition <= 35)
                cubeUpPosition += 1;

            else cubeUpPosition = 35;
        }

        else
        {
            if (cubeUpPosition >= 0)
                cubeUpPosition -= 1;
            else{
                cubeUpPosition = 0;
                isJet = 0;
            }
        }
    }

    if (duckFlag) {
        cubeUpPosition += duckVelocity;

        if (cubeUpPosition <= -20) {
            cubeUpPosition = -20;
            duckVelocity = 2;
        }

        if (cubeUpPosition >= 0) {
            cubeUpPosition = 0;
            duckVelocity = 0;
            duckFlag = 0;
        }
    }
    
    policeman[0].pos[0] = cubePosition;
    policeman[1].pos[0] = cubePosition;
    policeman[2].pos[0] = cubePosition;


    policeman[0].pos[1] = cubeUpPosition + 15;
    policeman[1].pos[1] = cubeUpPosition;
    
    if(cubeUpPosition > 0 && cubeUpPosition <= 32 && !isJet)
        policeman[2].pos[1] = cubeUpPosition;
    
    else 
        policeman[2].pos[1] = 0;

        if(policeIn == 0)
    {
        if(policeman[0].pos[2] >= -150)
        {
            policeman[0].pos[2] -= 1;
            policeman[1].pos[2] -= 1;
        }
    }

    if(policeIn == 1)
    {
        let elapsed = new Date() - policeInTime;
        if(elapsed >= 10000 && playerSpeed > 0)
            policeIn = 0;

        if (policeman[0].pos[2] <= -50 && playerSpeed > 0) {
            policeman[0].pos[2] += 1;
            policeman[1].pos[2] += 1;
        }

        if(playerSpeed == 0)
        {
            // write code to catch dat niBBa
            if (policeman[0].pos[2] <= cubePosition) {
                policeman[0].pos[2] += 1;
                policeman[1].pos[2] += 1;
            }

            else {
                window.alert("YOU LOST\nScore: " + score + "\nCoins: " + coins);
            }
        }
    }
    
    if(playerSpeed < 5 && playerSpeed > 0)
        playerSpeed += 0.025;

    c.drawCube(gl, viewProjectionMatrix, programInfo, deltaTime);

    policeman[0].drawCube(gl, viewProjectionMatrix, programInfo, deltaTime);
    policeman[1].drawCube(gl, viewProjectionMatrix, programInfo, deltaTime);
    policeman[2].drawCube(gl, viewProjectionMatrix, programInfo, deltaTime);



      for (let index = 0; index < rail_array.length; index++) {
          rail_array[index].pos[2] -= playerSpeed;
          rwall_array[index].pos[2] -= playerSpeed;
          lwall_array[index].pos[2] -= playerSpeed;

          if(rail_array[index].pos[2] <= 700){
              v = new Date();
              
              gl.uniform1i(programInfoFlash.uniformLocations.flag,((v - flashTime)/1000) % 2);
            
            rail_array[index].drawCube(gl, viewProjectionMatrix, programInfo, deltaTime);
            if(!isGrey){
                lwall_array[index].drawCube(gl, viewProjectionMatrix, programInfoFlash, deltaTime);
                rwall_array[index].drawCube(gl, viewProjectionMatrix, programInfoFlash, deltaTime);
            }
            else
            {
                lwall_array[index].drawCube(gl, viewProjectionMatrix, programInfo, deltaTime);
                rwall_array[index].drawCube(gl, viewProjectionMatrix, programInfo, deltaTime);
            }
          }
      }

        for (let index = 0; index < crate_array.length; index++) {
        {
            if (crate_array[index].pos[2] < -150) {
                crate_array.splice(index, 1);
            }
                crate_array[index].pos[2] -= playerSpeed;

            if (crate_array[index].pos[2] <= 700) {
                crate_array[index].drawCube(gl, viewProjectionMatrix, programInfo, deltaTime);
            }
        }
    }

    for (let index = 0; index < rod_array.length; index++) {
        {
            // if (rod_array[index].pos[2] < -150) {
            //     rod_array.splice(index, 1);
            // }
            rod_array[index].pos[2] -= playerSpeed;

            if (rod_array[index].pos[2] <= 700) {
                rod_array[index].drawCube(gl, viewProjectionMatrix, programInfo, deltaTime);
            }
        }
    }

    for (let index = 0; index < shoe_array.length; index++) {
        {
            if (shoe_array[index].pos[2] < -150) {
                shoe_array.splice(index, 1);
            }
            shoe_array[index].pos[2] -= playerSpeed;

            if (shoe_array[index].pos[2] <= 700) {
                shoe_array[index].drawCube(gl, viewProjectionMatrix, programInfo, deltaTime);
            }
        }
    }

    for (let index = 0; index < jet_arr.length; index++) {
        {
            if (jet_arr[index].pos[2] < -150) {
                jet_arr.splice(index, 1);
            }
            jet_arr[index].pos[2] -= playerSpeed;

            if (jet_arr[index].pos[2] <= 700) {
                jet_arr[index].drawCube(gl, viewProjectionMatrix, programInfo, deltaTime);
            }
        }
    }

    for (let index = 0; index < board_array.length; index++) {
        {
            // if (board_array[index].pos[2] < -150) {
            //     board_array.splice(index, 1);
            // }
            board_array[index].pos[2] -= playerSpeed;

            if (board_array[index].pos[2] <= 700) {
                board_array[index].drawCube(gl, viewProjectionMatrix, programInfo, deltaTime);
            }
        }
    }

     for (let index = 0; index < stop_sign.length; index++) {
         {
            //  if (stop_sign[index].pos[2] < -150) {
            //      stop_sign.splice(index, 1);
            //  }

             stop_sign[index].pos[2] -= playerSpeed;

             if (stop_sign[index].pos[2] <= 700) {
                 stop_sign[index].drawCube(gl, viewProjectionMatrix, programInfo, deltaTime);
             }
         }
     }

      for (let index = 0; index < stop_rod.length; index++) {
          {
        //       if (stop_rod[index].pos[2] < -150) {
        //           stop_rod.splice(index, 1);
        //       }
              stop_rod[index].pos[2] -= playerSpeed;

              if (stop_rod[index].pos[2] <= 700) {
                  stop_rod[index].drawCube(gl, viewProjectionMatrix, programInfo, deltaTime);
              }
          }

      }

      for (let index = 0; index < train_f.length; index++) {
          {
              if (train_f[index].pos[2] < -500) {
                  train_f.splice(index, 1);
                  train_l.splice(index, 1);
                  train_r.splice(index, 1);
                  train_top.splice(index, 1);
              }
              train_f[index].pos[2] -= playerSpeed + 2;
              train_l[index].pos[2] -= playerSpeed + 2;
              train_r[index].pos[2] -= playerSpeed + 2;
              train_top[index].pos[2] -= playerSpeed + 2;

              if (train_f[index].pos[2] <= 700) {
                  train_f[index].drawCube(gl, viewProjectionMatrix, programInfo, deltaTime);
                  train_l[index].drawCube(gl, viewProjectionMatrix, programInfo, deltaTime);
                  train_r[index].drawCube(gl, viewProjectionMatrix, programInfo, deltaTime);
                  train_top[index].drawCube(gl, viewProjectionMatrix, programInfo, deltaTime);
              }
          }
      }

      for (let index = 0; index < coin_arr.length; index++) {
          {
              if (coin_arr[index].pos[2] < -200) {
                  coin_arr.splice(index, 1);
              }
              coin_arr[index].pos[2] -= playerSpeed;
              coin_arr[index].rotation += Math.PI/360;

              if (coin_arr[index].pos[2] <= 700) {
                  coin_arr[index].drawCube(gl, viewProjectionMatrix, programInfo, deltaTime);
              }
          }
      }

    if (playerSpeed <= 0){
        playerSpeed == 0;
    }

    console.log(policeIn);

}

// Initialize a shader program, so WebGL knows how to draw our data
//

function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

// creates a shader of the given type, uploads the source and
// compiles it.
//

function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function loadTexture(gl, url) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
        width, height, border, srcFormat, srcType,
        pixel);

    const image = new Image();
    image.onload = function () {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
            srcFormat, srcType, image);

        // WebGL1 has different requirements for power of 2 images
        // vs non power of 2 images so check if the image is a
        // power of 2 in both dimensions.
        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            // Yes, it's a power of 2. Generate mips.
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            // No, it's not a power of 2. Turn off mips and set
            // wrapping to clamp to edge
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
    };
    image.src = url;

    return texture;
}

function isPowerOf2(value) {
    return (value & (value - 1)) == 0;
}

function distance(x1, y1, z1, x2, y2, z2){

    let x = Math.pow(x1 - x2, 2);
    let y = Math.pow(y1 - y2, 2);
    let z = Math.pow(z1 - z2, 2);

    return Math.sqrt(x + y + z);
}

function collision(){

    if(!isJet){
    // Player with crate
    for (let index = 0; index < crate_array.length; index++) {
        u = crate_array[index];
        if (distance(c.pos[0], c.pos[1], c.pos[2], u.pos[0], u.pos[1], u.pos[2]) < 18){
            delete c;
            playerSpeed = 0;
            window.alert("YOU LOST\nScore: "+score+"\nCoins: "+coins);
        }
    }

    // Player with stop signs
    for (let index = 0; index < stop_rod.length; index++) {
        u = stop_rod[index];
        if (distance(c.pos[0], 0, c.pos[2], u.pos[0], 0, u.pos[2]) < 8) {
            u = new Date();            
            if(!stopColl.includes(index))
            {
                playerSpeed = 2;
            }

            if(u - lastColl < 5000 && !stopColl.includes(index)){
                playerSpeed = 0;
                pDead = 1;
            }
            
            if (u - lastColl >= 4000) {
                playerSpeed = 2;
                lastColl = u;
            }

            stopColl.push(index);
            policeIn = 1;
            policeInTime = new Date();
        }
    }

    // Player with barricade
     for (let index = 0; index < board_array.length; index++) {

            u = board_array[index];
            if (distance(c.pos[0], 0, c.pos[2], u.pos[0], 0, u.pos[2]) < 8 && c.pos[1] >= 0) {
                u = new Date();
                if (!boardColl.includes(index)) {
                    playerSpeed = 2;
                }
                if (u - lastColl < 5000 && !boardColl.includes(index)) {
                    playerSpeed = 0;
                    pDead = 1;
                }
                console.log(u-lastColl);
                if (u - lastColl >= 5000) {
                    playerSpeed = 2;
                    lastColl = u;
                }
                
                boardColl.push(index);
                policeIn = 1;
                policeInTime = new Date();

             break;
         }
     }

    // Player with coins
    for (let index = 0; index < coin_arr.length; index++) {
        u = coin_arr[index];
        if (distance(c.pos[0], 0, c.pos[2], u.pos[0], 0, u.pos[2]) < 8) {
            coins++;
            coin_arr.splice(index, 1);            
        }
    }

    // Player with train
    for (let index = 0; index < train_f.length; index++) {
       
        condTop = c.pos[1] < 26;
        // left
        let condLeft = (Math.abs(c.pos[2] - train_l[index].pos[2]) <= 68 && Math.abs(c.pos[0] - train_l[index].pos[0]) <= 8);
       // right
        let condRight = (Math.abs(c.pos[2] - train_r[index].pos[2]) <= 68 && Math.abs(c.pos[0] - train_r[index].pos[0]) <= 8);
       //front
        let condFront = (Math.abs(c.pos[2] - train_f[index].pos[2]) <= 8 && Math.abs(c.pos[0]-train_f[index].pos[0]) <= 13);

        if(condTop){
            if(condLeft || condRight || condFront){
                delete c;
                playerSpeed = 0;
                window.alert("YOU LOST\nScore: " + score + "\nCoins: " + coins);
            }
        }
    }

    //Player with train roof:

    for (let index = 0; index < train_top.length; index++) {
        if(Math.abs(c.pos[1]-train_top[index]) <= 2)
            if (c.pos[0] >= train_top[index].pos[0] - 13 && c.pos[0] <= train_top[index].pos[0] + 13){
                if (c.pos[1] >= train_top[index].pos[0] - 72 && c.pos[1] <= train_top[index].pos[1] + 72){
                    c.pos[1] = 27;
                }

                else{
                    if(!jumpFlag)
                        c.pos[1] = 0;
                }
    }

    // Player with powerups:
    // Shoes
    for (let index = 0; index < shoe_array.length; index++) {
        u = shoe_array[index];
        if (distance(c.pos[0], 0, c.pos[2], u.pos[0], 0, u.pos[2]) < 8) {
            isShoes = 1;
            c.texture = loadTexture(gl, 'copper.jpg')

            shoeStart = new Date();
            shoe_array.splice(index, 1);
            break;
        }
    }

    // Jetpack
    for (let index = 0; index < jet_arr.length; index++) {
        u = jet_arr[index];
        if (distance(c.pos[0], 0, c.pos[2], u.pos[0], 0, u.pos[2]) < 8) {
            isJet = 1;

            jetStart = new Date();
            jet_arr.splice(index, 1);
            break;
        }
    }
    }
}
}
