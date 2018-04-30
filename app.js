
var vertexShaderText = 
[
'precision mediump float;',
'attribute vec3 vertPosition;',
'attribute vec3 vertColor;',
'varying vec3 fragColor;',
'uniform mat4 mWorld;',
'uniform mat4 mView;',
'uniform mat4 mProj;',
'void main(){',
	'fragColor = vertColor;',
	'gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);',
	//primero va a multiplicar el ultimo termino por la mWorld, que se encargara de rotar
	//despues por la view que es la matriz que se crea al aplicar la camara
'}'
].join('\n');

var fragmentShaderText = [
	'precision mediump float;',
	'varying vec3 fragColor;',
	'void main(){',
		'gl_FragColor = vec4(fragColor, 1.0);',
	'}'
].join('\n');

var InitDemo = function(){
	console.log('this is motherfucking working');
	var canvas = document.getElementById('game-surface');
	var gl = canvas.getContext('webgl');

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
		console.error('ERROR compiling fragment shader! :(');
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
	var triangleVertices= 
	[	// X Y Z         R    G    B
		 0.0, 0.5,0.0,  1.0, 1.0, 0.0,
		-0.5,-0.5,0.0,  0.7, 0.0, 1.0,
		 0.5,-0.5,0.0,  0.1, 1.0, 0.6
	];
	// esto de abajo le esta diciendo que estos valores van a pasar a la tarjeta gráfica
	var triangleVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
	// 1, el tipo de buffer, 2 hay que pasar a float de 32 
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);

	// despues de esto tenemos que pasar las variables al vertex shader
	var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
	var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');
	gl.vertexAttribPointer(
		positionAttribLocation, // attribute location
		3, // numero de elementos por attribute 3 por que es 
		gl.FLOAT, // typo de elemetos
		gl.FALSE,
		5 * Float32Array.BYTES_PER_ELEMENT, // Size of a individual shader
		0 // Offset of the beggining of a single vertex to this attribute
	);

	gl.vertexAttribPointer(
		colorAttribLocation, // attribute location
		3, // numero de elementos por attribute
		gl.FLOAT, // typo de elemetos
		gl.FALSE,
		6 * Float32Array.BYTES_PER_ELEMENT, // Size of a individual shader
		3 * Float32Array.BYTES_PER_ELEMENT // Offset of the beggining of a single vertex to this attribute
	);
	gl.enableVertexAttribArray(positionAttribLocation);
	gl.enableVertexAttribArray(colorAttribLocation);

	var matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
	var matViewUniformLocation = gl.getUniformLocation(program, 'mView');
	var matProjUniformLocation = gl.getUniformLocation(program, 'mProj');

	var projMatrix = new Float32Array(16);
	var viewMatrix = new Float32Array(16);
	var worldMatrix = new Float32Array(16);

	mat4.identity(projMatrix);
	mat4.identity(viewMatrix);
	mat4.identity(worldMatrix);

	// seteamos todas a la identidad
	
	// var loop = function(){
	// 	updateWorld();
	// 	renderWorld();
	// 	if(running)
	// }
	gl.useProgram(program);
	// esta funcion necesita 3 parametros que le dicen como tiene que dibujar
	gl.drawArrays(gl.TRIANGLES, 0, 3);
};
