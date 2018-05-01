
var vertexShaderText = 
[
'precision mediump float;',
'attribute vec3 vertPosition;',
'attribute vec2 vertTextCoord;',
'varying vec2 fragTextCoord;',
'uniform mat4 mWorld;',
'uniform mat4 mView;',
'uniform mat4 mProj;',
'void main(){',
	'fragTextCoord = vertTextCoord;',
	'gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);',
	//primero va a multiplicar el ultimo termino por la mWorld, que se encargara de rotar
	//despues por la view que es la matriz que se crea al aplicar la camara
'}'
].join('\n');

var fragmentShaderText = [
	'precision mediump float;',
	'varying vec2 fragTextCoord;',
	'uniform sampler2D sampler;', // esto es para especificar sobre la textura
	'void main(){',
		'gl_FragColor = texture2D(sampler, fragTextCoord);',
	'}'
].join('\n');

//para ahorrar cpu
var gl;

var InitDemo = function(){
	console.log('this is motherfucking working');
	var canvas = document.getElementById('game-surface');
	gl = canvas.getContext('webgl');

	if(!gl){
		console.log('WebGL not supported, downgraded to a experimental version of it.');
		gl = canvas.getContext('experimental-webgl');
	}
	if(!gl){
		alert('Your browser cant support WebGL');
	}
	// esto es para que se reescale a el tamaño de la ventana
	// canvas.width = window.innerWidth;
	// canvas.height = window.innerHeight;
	// gl.viewport(0,0,window.innerWidth,window.innerHeight);
	gl.clearColor(0.75,0.85,0.8,1.0);
	// el color buffer dice el color de los puntos que tienes que pintar
	// el depth buffer es una forma de ordenar en profundidad los objetos que vamos a pintar
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	gl.frontFace(gl.CCW);
	gl.cullFace(gl.BACK);



	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

	// cargamos los shaders.
	gl.shaderSource(vertexShader, vertexShaderText);
	gl.shaderSource(fragmentShader, fragmentShaderText);

	gl.compileShader(vertexShader);
	if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
		console.error('ERROR compiling vertex shader! :(', gl.getShaderInfoLog(vertexShader));
		return;
	}
	gl.compileShader(fragmentShader);
	if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
		console.error('ERROR compiling fragment shader! :(', gl.getShaderInfoLog(fragmentShader));
		return;
	}

	// aqui atacheamos los shaders al programa despues de haberlos compilado
	var program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
		console.error('ERROR linking program! :(', gl.getProgramInfoLog(program));
		return;
	}
	gl.validateProgram(program);
	if(!gl.getProgramParameter(program, gl.VALIDATE_STATUS)){
		console.error('ERROR validating program! :(', gl.getProgramInfoLog(program));
		return;
	}

	// ahora tenemos que decirle a la tarjeta gráfica cuales son los 
	// vertices que vamos a querer dibujar, con los colores que queremos en cada vertice
	var boxVertices= 
	[	// X Y Z            U , V esto define las esquinas
		// Top
		-1.0, 1.0, -1.0,   0, 0,
		-1.0, 1.0, 1.0,    0, 1,
		1.0, 1.0, 1.0,     1, 1,
		1.0, 1.0, -1.0,    1, 0,

		// Left
		-1.0, 1.0, 1.0,    0, 0,
		-1.0, -1.0, 1.0,   0, 1,
		-1.0, -1.0, -1.0,  1, 1,
		-1.0, 1.0, -1.0,   1, 0,

		// Right
		1.0, 1.0, 1.0,     0, 0,
		1.0, -1.0, 1.0,    0, 1,
		1.0, -1.0, -1.0,   1, 1,
		1.0, 1.0, -1.0,    1, 0,

		// Front
		1.0, 1.0, 1.0,     0, 0,
		1.0, -1.0, 1.0,    0, 1,
		-1.0, -1.0, 1.0,   1, 1,
		-1.0, 1.0, 1.0,    1, 0,

		// Back
		1.0, 1.0, -1.0,    0, 0,
		1.0, -1.0, -1.0,    0, 1,
		-1.0, -1.0, -1.0,    1, 1,
		-1.0, 1.0, -1.0,    1, 0,

		// Bottom
		-1.0, -1.0, -1.0,   0, 0,
		-1.0, -1.0, 1.0,    0, 1,
		1.0, -1.0, 1.0,     1, 1,
		1.0, -1.0, -1.0,    1, 0,
	];
	var boxIndices =
	[
		// Top
		0, 1, 2,
		0, 2, 3,

		// Left
		5, 4, 6,
		6, 4, 7,

		// Right
		8, 9, 10,
		8, 10, 11,

		// Front
		13, 12, 14,
		15, 14, 12,

		// Back
		16, 17, 18,
		16, 18, 19,

		// Bottom
		21, 20, 22,
		22, 20, 23
	];
	// esto de abajo le esta diciendo que estos valores van a pasar a la tarjeta gráfica
	var boxVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
	// 1, el tipo de buffer, 2 hay que pasar a float de 32 
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);

	var boxIndexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);

	// despues de esto tenemos que pasar las variables al vertex shader
	var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
	var textCoordAttribLocation = gl.getAttribLocation(program, 'vertTextCoord');
	gl.vertexAttribPointer(
		positionAttribLocation, // attribute location
		3, // numero de elementos por attribute 3 por que es 
		gl.FLOAT, // typo de elemetos
		gl.FALSE,
		5 * Float32Array.BYTES_PER_ELEMENT, // Size of a individual shader
		0 // Offset of the beggining of a single vertex to this attribute
	);

	gl.vertexAttribPointer(
		textCoordAttribLocation, // attribute location
		2, // numero de elementos por attribute
		gl.FLOAT, // typo de elemetos
		gl.FALSE,
		5 * Float32Array.BYTES_PER_ELEMENT, // Size of a individual shader
		3 * Float32Array.BYTES_PER_ELEMENT // Offset of the beggining of a single vertex to this attribute
	);
	gl.enableVertexAttribArray(positionAttribLocation);
	gl.enableVertexAttribArray(textCoordAttribLocation);

	// CREANDO BUFFER DE TEXTURA
	var boxTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, boxTexture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); // PARA CUANDO SE SALE
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); // PARA CUANDO SOBRA ESPACIO

	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, document.getElementById('crate-image'));// esto especifica la informacion que va a usar la textura
	// los parametros son, la textura, el nivel de detalle, el modo de renderizado, si tiene borde, 

	gl.bindTexture(gl.TEXTURE_2D, null);

	// le decimos a webgl que queremos usar ese programa(que se guarda en una variable)
	gl.useProgram(program);


	var matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
	var matViewUniformLocation = gl.getUniformLocation(program, 'mView');
	var matProjUniformLocation = gl.getUniformLocation(program, 'mProj');

	var worldMatrix = new Float32Array(16);
	var viewMatrix = new Float32Array(16);
	var projMatrix = new Float32Array(16);
	mat4.identity(worldMatrix);
	mat4.lookAt(viewMatrix, [0,0,-8], [0,0,0], [0,1,0]); 
	// 1- donde esta el que mira (ORIGEN)
	// 2- a donde mira (VECTOR DESINO)
	// 3- vector unitario ¿? (ni idea...)
	mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 1000.0);
	// 1 la salida por callback
	// 2- el campo de vision vertical
	// 3- Aspect ratio ¿?
	// extremo de cercania
	// extremo de lejania ¿? creoç

	// seteamos todas a la identidad
	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
	gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
	gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

	var xRotationMatrix = new Float32Array(16);
	var yRotationMatrix = new Float32Array(16);

	//Main render loop
	// esto se encarga de mover la escena y actualizarla para formar los fotogramas
	var identityMatrix = new Float32Array(16);
	mat4.identity(identityMatrix);
	var angle = 0;
	var loop = function(){
		angle = performance.now() / 1000 / 6 * 2 * Math.PI;
		mat4.rotate(yRotationMatrix, identityMatrix, angle, [0,1,0]); // el ultimo parametro quiere decir que será en el eje de la Y
		mat4.rotate(xRotationMatrix, identityMatrix, angle / 4, [1,0,0]); // el ultimo parametro quiere decir que será en el eje de la Y
		mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix); //multiplicamos las rotaciones y se las asignamos a la WorldMatrix
		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
		// esto es necesario siempre que queramos actualizar variables de los shaders

		gl.clearColor(0.75,0.85,0.8,1.0);
		gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

		gl.bindTexture(gl.TEXTURE_2D, boxTexture);
		gl.activeTexture(gl.TEXTURE0);

		gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
		requestAnimationFrame(loop);
	};
	requestAnimationFrame(loop);
	// esta funcion necesita 3 parametros que le dicen como tiene que dibujar
};
