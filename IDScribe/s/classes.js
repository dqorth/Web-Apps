// Screen
	class screen{
		constructor(element,x,y,z,width,height,open){
			this.element = element
			this.x = x
			this.y = y
			this.z = z
			this.width = width
			this.height = height
			this.open = open
		}

		openClose(){
			if (this.open == true){
				this.open = false
				this.element.style.display = "none"
			}else{
				this.open = true
				this.element.style.display = ""
			}
		}
	}

	let landing = new screen(document.querySelector("#landing"),0,0,1,"100vw","100vh",false)
	let general = new screen(document.querySelector("#generalScreen"),0,"52px",0,"100vw","100vh",true)
	let instructions = new screen(document.querySelector("#instructionsBack"),0,0,0,"100vw","100vw",true)

	landing.openClose()
	general.openClose()
	instructions.openClose()


// Pixel

	class pixel{
		constructor(x,y){
			this.x = x
			this.y = y
		}
	}

	let currentCoord = new pixel(0,0);

	let thisDownMark = new pixel(0,0);
	let thisUpMark   = new pixel(0,0);

	let thisMark = new pixel(0,0);

	let horzMark = new pixel(0,0);
	let vertMark = new pixel(0,0);

	let bothMark = new pixel(0,0);

	let thisMarkOther = new pixel(0,0);

	let horzMarkOther = new pixel(0,0);
	let vertMarkOther = new pixel(0,0);

	let bothMarkOther = new pixel(0,0);

	let horzUpMark = new pixel(0,0);
	let vertUpMark = new pixel(0,0);
	let bothUpMark = new pixel(0,0);

	let horzDownMark = new pixel(0,0);
	let vertDownMark = new pixel(0,0);
	let bothDownMark = new pixel(0,0);

	let coord = new pixel(0,0);