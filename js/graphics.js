// ----- GRAPHICS
/*
TBD
- add mesh via stl
- update mesh positions -> or more likely, set up well to do all of that manipulation in vrobot
- add agnostic points, change their colour
*/
function Graphix(){

	if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

	var container;
	var camera, controls, scene, renderer;

	var width = window.innerWidth-715;
	var height = window.innerHeight-25;

	this.init = function(){
	
		// camera

		camera = new THREE.PerspectiveCamera(75, width/height, 0.1, 1000);
		camera.position.x = -5;
		camera.position.y = -5;
		camera.position.z = 5;
		camera.lookAt(0,0,0);
		camera.up.set(0,0,1);

		controls = new THREE.TrackballControls(camera, container);

		controls.rotateSpeed = 2.0;
		controls.zoomSpeed = 2.0;
		controls.panSpeed = 1.2;

		controls.noZoom = false;
		controls.noPan = false;	

		controls.staticMoving = true;
		controls.dynamicDampingFactor = 0.3;

		controls.keys = [65, 83, 68];

		controls.addEventListener('change', render);

		// werld

		scene = new THREE.Scene();
		scene.background = new THREE.Color( 0xf5f5f5 );

		var origin = new THREE.AxisHelper( 1 ); 
		origin.position.set(0,0,0);
		scene.add( origin );

		// renderer

		renderer = new THREE.WebGLRenderer({antialias: false});
		renderer.setSize(width, height);

		container = document.getElementById('container');
		container.appendChild(renderer.domElement);

		window.addEventListener('resize', onWindowResize, false);

		render();

		animate();

	}	

	function onWindowResize(){

		camera.aspect = width / height;
		camera.updateProjectionMatrix();

		renderer.setSize(width, height);

		controls.handleResize();

		render();
	}

	function animate(){
		requestAnimationFrame(animate);
		controls.update();	
	}

	function render(){
		renderer.render(scene, camera);
	}

	this.addSMARTPoint = function (dataPoint){

		var pointGeometry = new THREE.Geometry();

		var pos = new THREE.Vector3();

		pos.x = dataPoint.pos.x;
		pos.y = dataPoint.pos.y;
		pos.z = dataPoint.pos.z;

		pointGeometry.vertices.push(pos);

		var pointColor = new THREE.Color();
		pointColor.setRGB(dataPoint.tc.r, dataPoint.tc.g, dataPoint.tc.b);

		var pointMaterial = new THREE.PointsMaterial({color: pointColor, size: 0.5})

		var pointField = new THREE.Points( pointGeometry, pointMaterial );

		scene.add( pointField );

		render();
	}

}