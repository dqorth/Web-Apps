// Author : David Q Orth
// © David Q Orth Designs and Crafts
// Build  2.997

function loadScript(url) {
  var head = document.getElementsByTagName('head')[0];
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = url;
  head.appendChild(script);
}
// Constants

loadScript("s/var.js");

const changingColor = () => hueChange();

// Color Sliders
class colorSlider{
	constructor(elem, value, background) {
		this.elem = elem;
		this.value = value;
		this.background = background;
	}
	
	changeListener(type=String, action=String) {
		if (action == "add") {
			if (type == "wait") {
				this.elem.addEventListener("mouseup", changingColor, { passive: true });
			} else if (type = "instant") {
				this.elem.addEventListener("input", changingColor, { passive: true });
			}
		} else if (action == "remove") {
			if (type == "wait") {
				this.elem.removeEventListener("mouseup", changingColor, { passive: true });
			} else if (type = "instant") {
				this.elem.removeEventListener("input", changingColor, { passive: true });
			}
		}
		return
	}
}
	
let hueSlider = new colorSlider(document.getElementById("hueSlider"), document.getElementById("hueSlider").value)
let satSlider = new colorSlider(document.getElementById("saturationSlider"), document.getElementById("saturationSlider").value)
let lightSlider = new colorSlider(document.getElementById("lightnessSlider"), document.getElementById("lightnessSlider").value)

hueSlider.changeListener("instant","add");
satSlider.changeListener("instant", "add");
lightSlider.changeListener("instant", "add");



// Setting Header Option Toggle Colors

document.getElementById("stitchedView").style.backgroundColor = "#ff7fff";
document.getElementById("stitchedViewPreview").style.backgroundColor = "#ff7fff";

document.getElementById("gridView").style.backgroundColor = "#5fc66d";
document.getElementById("gridViewPreview").style.backgroundColor = "#5fc66d";

document.getElementById("previewGraphButton").style.backgroundColor = "#ff7fff";

document.getElementById("symButton").style.backgroundColor = "#ff7fff";
document.getElementById("symButtonNone").style.backgroundColor = "#5fc66d";
document.getElementById("symButtonHorz").style.backgroundColor = "#ff7fff";
document.getElementById("symButtonVert").style.backgroundColor = "#ff7fff";
document.getElementById("symButtonBoth").style.backgroundColor = "#ff7fff";

function fuckSquarespace() {
  if (window.outerWidth <= 850) {
    smallScreen = true
  } else {
    smallScreen = false
  }

  unitChange();
  footerChange();
  instructionsChange()

  try {
    document.querySelector("#siteWrapper").remove();
    document.querySelector("#yui3-css-stamp").remove();
  } catch {
    return
  }

}

// Setting Events

// Graph Clicking/Touching
document.getElementById("cells").addEventListener("mousedown", function (event) { overFrontGraph = true; startMarking(event) }, { passive: true });
document.getElementById("cells").addEventListener("mouseup", stopMarking, { passive: true });
document.getElementById("cells").addEventListener("mousemove", graphMark, { passive: true });

document.getElementById("cellsBack").addEventListener("mousedown", function (event) { overFrontGraph = false; startMarking(event) }, { passive: true });
document.getElementById("cellsBack").addEventListener("mouseup", stopMarking, { passive: true });
document.getElementById("cellsBack").addEventListener("mousemove", graphMark, { passive: true });

document.getElementById("cells").addEventListener("touchstart", function (event) { overFrontGraph = true; startMarking(event) }, { passive: true });
document.getElementById("cells").addEventListener("touchend", stopMarking, { passive: true });
document.getElementById("cells").addEventListener("touchcancel", stopMarking, { passive: true });
document.getElementById("cells").addEventListener("touchmove", graphMark, { passive: true });

document.getElementById("cellsBack").addEventListener("touchstart", function (event) { overFrontGraph = false; startMarking(event) }, { passive: true });
document.getElementById("cellsBack").addEventListener("touchend", stopMarking, { passive: true });
document.getElementById("cellsBack").addEventListener("touchcancel", stopMarking, { passive: true });
document.getElementById("cellsBack").addEventListener("touchmove", graphMark, { passive: true });


// Color Sliders

// document.getElementById("hueSlider").addEventListener("input", () => hueChange(), { passive: true });
// document.getElementById("saturationSlider").addEventListener("input", () => hueChange(), { passive: true });
// document.getElementById("lightnessSlider").addEventListener("input", () => hueChange(), { passive: true });

// Browser Check and alert
function bugAlert() {
  choice = confirm("This feature is known to still have bugs.\nWould you like to continue?")
  if (choice == true) {
    return true
  } else {
    return false
  }
}

function browserAlert() {
  if ((navigator.userAgent.indexOf("MSIE") != -1) || (navigator.userAgent.indexOf("Edg") != -1)) {
    alert('ID Scribe is best with Opera or Google Chrome.\nYou may experience issues if you use this browser for ID Scribe.');

  } else if ((navigator.userAgent.indexOf("Opera") || navigator.userAgent.indexOf("OPR")) != -1) {

  } else if (navigator.userAgent.indexOf("Chrome") != -1) {

  } else if (navigator.userAgent.indexOf("Safari") != -1) {
    alert('ID Scribe is best with Opera or Google Chrome.\nYou may experience issues if you use this browser for ID Scribe.');
  } else if (navigator.userAgent.indexOf("Firefox") != -1) {
    alert('ID Scribe is best with Opera or Google Chrome.\nYou may experience issues if you use this browser for ID Scribe.');
  } else {
    alert('Unknown Browser\nID Scribe is best with Opera or Google Chrome.');
  }
}

function nameElem() {
  ///////////////////////////////////////////////////
  graph = document.getElementById("cells");
  gridLines = document.getElementById("gridLines");
  stitchesOverlay = document.getElementById("stitchesOverlay");

  ///////////////////////////////////////////////////
  previewGraph = document.getElementById("previewGraph");
  previewGridLines = document.getElementById("previewGridLines");
  previewStitchesOverlay = document.getElementById("previewStitches");
  previewTicking = document.getElementById("previewTicking");

  ///////////////////////////////////////////////////
  container = document.getElementById("canvasContainer");
  gridContainer = document.getElementById("gridLinesContainer");
  stitchContainer = document.getElementById("stitchesOverlayContainer");

  ///////////////////////////////////////////////////
  previewGraphContainer = document.getElementById("previewGraphContainer");
  previewGridContainer = document.getElementById("previewGridLinesContainer");
  previewStitchContainer = document.getElementById("previewStitchesContainer");
  previewTickingContainer = document.getElementById("previewTickingContainer");

  ////////////////////////////////////////////////////
  ctx = graph.getContext("2d", { willReadFrequently: true });
  gridCtx = gridLines.getContext("2d", { willReadFrequently: true });
  stitchCtx = stitchesOverlay.getContext("2d", { willReadFrequently: true });

  //////////////////////////////////////////////////
  previewGraphCtx = previewGraph.getContext("2d", { willReadFrequently: true });
  previewGridCtx = previewGridLines.getContext("2d", { willReadFrequently: true });
  previewStitchCtx = previewStitches.getContext("2d", { willReadFrequently: true });
  previewTickingCtx = previewTicking.getContext("2d", { willReadFrequently: true });

  if (selectedStyle == 1) {
    document.getElementById('leftArrowGraph').style.visibility = "visible"
    document.getElementById('rightArrowGraph').style.visibility = "visible"
    graphBack = document.getElementById("cellsBack");
    gridLinesBack = document.getElementById("gridLinesBack");
    stitchesOverlayBack = document.getElementById("stitchesOverlayBack");

    containerBack = document.getElementById("canvasBackContainer");
    gridContainerBack = document.getElementById("gridLinesBackContainer");
    stitchContainerBack = document.getElementById("stitchesOverlayBackContainer");

    ctxOther = graphBack.getContext("2d", { willReadFrequently: true });
    gridCtxBack = gridLinesBack.getContext("2d", { willReadFrequently: true });
    stitchCtxBack = stitchesOverlayBack.getContext("2d", { willReadFrequently: true });
  };
}


function setElem() {
  ///////////////////////////////////////////////////
  container.style.width = (graphWidth + "px")
  container.style.height = (graphHeight + "px")

  gridContainer.style.width = (graphWidth + "px")
  gridContainer.style.height = (graphHeight + "px")

  stitchContainer.style.width = (graphWidth + "px")
  stitchContainer.style.height = (graphHeight + "px")

  //////////////////////////////////////////////////
  previewGraphContainer.style.width = (graphWidth + "px")
  previewGraphContainer.style.height = (graphHeight + "px")

  previewGridContainer.style.width = (graphWidth + "px")
  previewGridContainer.style.height = (graphHeight + "px")

  previewStitchContainer.style.width = (graphWidth + "px")
  previewStitchContainer.style.height = (graphHeight + "px")

  previewTickingContainer.style.width = (graphWidth + "px")
  previewTickingContainer.style.height = (graphHeight + "px")

  ///////////////////////////////////////////////////
  graph.width = graphWidth
  graph.height = graphHeight

  gridLines.width = graphWidth
  gridLines.height = graphHeight

  stitchesOverlay.width = graphWidth
  stitchesOverlay.height = graphHeight

  ///////////////////////////////////////////////////
  previewGraph.width = graphWidth
  previewGraph.height = graphHeight

  previewGridLines.width = graphWidth
  previewGridLines.height = graphHeight

  previewStitchesOverlay.width = graphWidth
  previewStitchesOverlay.height = graphHeight

  previewTicking.width = graphWidth
  previewTicking.height = graphHeight

  switch (selectedStyle) {
    case 1:

      containerBack.style.width = (graphWidth + "px")
      containerBack.style.height = (graphHeight + "px")

      gridContainerBack.style.width = (graphWidth + "px")
      gridContainerBack.style.height = (graphHeight + "px")

      stitchContainerBack.style.width = (graphWidth + "px")
      stitchContainerBack.style.height = (graphHeight + "px")

      graphBack.width = graphWidth
      graphBack.height = graphHeight

      gridLinesBack.width = graphWidth
      gridLinesBack.height = graphHeight

      stitchesOverlayBack.width = graphWidth
      stitchesOverlayBack.height = graphHeight
      break;

    case 2:
      // document.getElementById("graphBack").innerHTML = ''
      document.getElementById('leftArrowGraph').style.visibility = "hidden"
      document.getElementById('rightArrowGraph').style.visibility = "hidden"
      document.getElementById("graph").style.width = "100%"
      document.getElementById("leftArrowGraph").style.right = "60px"
      document.getElementById("graphBack").style.width = "0%"
      document.getElementById("rightArrowGraph").style.left = "100%"
      graphGraphPosition = 2
      break;
  };
};

window.onresize = function () {

  if (window.outerWidth <= 850) {
    smallScreen = true
  } else {
    smallScreen = false
  }

  unitChange();
  footerChange();
  instructionsChange()
};

const saveAs = (content, filename, contentType) => {
  const a = document.createElement('a');
  const file = new Blob([content], { type: contentType });

  a.href = URL.createObjectURL(file);
  a.download = filename;
  a.click();

  URL.revokeObjectURL(a.href);
};



const hslToRGB = (h, s, l) => {
  var r, g, b;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    var hue2rgb = function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1.0 / 3.0);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1.0 / 3.0);
  }

  let rgb = "rgb(" + Math.round(r * 255) + ", " + Math.round(g * 255) + ", " + Math.round(b * 255) + ")"

  return rgb;
}

const hexToRGB = hex => {
  let alpha = false,
    h = hex.slice(hex.startsWith('#') ? 1 : 0);
  if (h.length === 3) h = [...h].map(x => x + x).join('');
  else if (h.length === 8) alpha = true;
  h = parseInt(h, 16);
  return (
    (alpha ? 'a' : '') +
    (h >>> (alpha ? 24 : 16)) +
    ',' +
    ((h & (alpha ? 0x00ff0000 : 0x00ff00)) >>> (alpha ? 16 : 8)) +
    ',' +
    ((h & (alpha ? 0x0000ff00 : 0x0000ff)) >>> (alpha ? 8 : 0)) +
    (alpha ? `, ${h & 0x000000ff}` : '')
  );
};

const RGBToHex = (r, g, b) =>
  '#' + ((r << 16) + (g << 8) + b).toString(16).padStart(6, '0');

function rgb2hsv (r, g, b) {
    let rabs, gabs, babs, rr, gg, bb, h, s, v, diff, diffc, percentRoundFn;
    rabs = r / 255;
    gabs = g / 255;
    babs = b / 255;
    v = Math.max(rabs, gabs, babs),
    diff = v - Math.min(rabs, gabs, babs);
    diffc = c => (v - c) / 6 / diff + 1 / 2;
    percentRoundFn = num => Math.round(num * 100) / 100;
    if (diff == 0) {
        h = s = 0;
    } else {
        s = diff / v;
        rr = diffc(rabs);
        gg = diffc(gabs);
        bb = diffc(babs);

        if (rabs === v) {
            h = bb - gg;
        } else if (gabs === v) {
            h = (1 / 3) + rr - bb;
        } else if (babs === v) {
            h = (2 / 3) + gg - rr;
        }
        if (h < 0) {
            h += 1;
        }else if (h > 1) {
            h -= 1;
        }
    }
    return {
        h: Math.round(h * 360),
        s: percentRoundFn(s * 100),
        v: percentRoundFn(v * 100)
    };
}

function changeScroll() {
  switch (overFrontGraph) {
    case true:
      document.getElementById('graphBack').scrollTop = document.getElementById('graph').scrollTop
      document.getElementById('graphBack').scrollLeft = (document.getElementById('graph').scrollLeft) * (-1)
      break;

    case false:
      document.getElementById('graph').scrollTop = document.getElementById('graphBack').scrollTop
      document.getElementById('graph').scrollLeft = (document.getElementById('graphBack').scrollLeft) * (-1)
      break;
  }
};

function shortcuts(event) {
  if (event.ctrlKey && event.key == "z") {
    loadUndoState()
  }
  if (event.ctrlKey && event.key == "y") {
    loadRedoState()
  }
};

// New Pattern Side Panel

function uiClick() {
  if (newPatternOpen == true) {
    document.getElementById('newPatternContainer').style.display = 'none'
    document.getElementById('newPattern').style.display = 'none'
    newPatternOpen = false
  } else {
    document.getElementById('newPatternContainer').style.display = ''
    document.getElementById('newPattern').style.display = ''
    newPatternOpen = true
  }
};

function unitChangeNew() {
  switch (unit) {
    case 0:
      getInchesNew()
      break;
    case 1:
      getCentimetresNew()
      break;
  }
};

function setWidth(w) {
  innerWidthNew = w;
  graphWidthNew = innerWidthNew * 8;
  getInches()
};

function setHeight(h) {
  innerHeightNew = h;
  graphHeightNew = innerHeightNew * 8;
  getInches()
};

function getStyle() {
  selectedStyleNew = document.getElementById("stSelect").selectedIndex;
  document.getElementById("stSelect").style = 'animation: none;'
};

function detectSizeNew() {

  var wInch
  var hInch

  var gaugeNew = document.getElementById('gaugeDropDown').selectedIndex;

  if (gaugeNew == 1) {
    wInch = innerWidthNew / 4;
    hInch = innerHeightNew / 4;
  } else if (gaugeNew == 2) {
    wInch = innerWidthNew / 5;
    hInch = innerHeightNew / 5;
  };


  if (wInch >= 36 && wInch <= 45 && hInch >= 36 && hInch <= 45) {
    document.getElementById('sizeDropDown').selectedIndex = 1;
    return;
  } else if (wInch >= 45 && wInch <= 65 && hInch >= 45 && hInch <= 65) {
    document.getElementById('sizeDropDown').selectedIndex = 2;
    return;
  } else if (wInch >= 36 && wInch <= 54 && hInch >= 75 && hInch <= 80) {
    document.getElementById('sizeDropDown').selectedIndex = 3;
    return;
  } else if (wInch >= 54 && wInch <= 60 && hInch >= 75 && hInch <= 80) {
    document.getElementById('sizeDropDown').selectedIndex = 4;
    return;
  } else if (wInch >= 60 && wInch <= 80 && hInch >= 80 && hInch <= 90) {
    document.getElementById('sizeDropDown').selectedIndex = 5;
    return;
  } else if (wInch >= 72 && wInch <= 92 && hInch >= 80 && hInch <= 100) {
    document.getElementById('sizeDropDown').selectedIndex = 6;
    return;
  } else {
    document.getElementById('sizeDropDown').selectedIndex = 7;
    return;
  }
};

function detectStitches() {

  document.getElementById('innerWidth').style.animation = "none";
  document.getElementById('innerHeight').style.animation = "none";
  if (document.getElementById('sizeDropDown').selectedIndex == 1) {
    if (document.getElementById('gaugeDropDown').selectedIndex == 1) {
      document.getElementById('innerWidth').value = 161
      document.getElementById('innerHeight').value = 161
      innerWidthNew = 161
      innerHeightNew = 161
    } else if (document.getElementById('gaugeDropDown').selectedIndex == 2) {
      document.getElementById('innerWidth').value = 201
      document.getElementById('innerHeight').value = 201
      innerWidthNew = 201
      innerHeightNew = 201
    }
  } else if (document.getElementById('sizeDropDown').selectedIndex == 2) {
    if (document.getElementById('gaugeDropDown').selectedIndex == 1) {
      document.getElementById('innerWidth').value = 221
      document.getElementById('innerHeight').value = 221
      innerWidthNew = 221
      innerHeightNew = 221
    } else if (document.getElementById('gaugeDropDown').selectedIndex == 2) {
      document.getElementById('innerWidth').value = 275
      document.getElementById('innerHeight').value = 275
      innerWidthNew = 275
      innerHeightNew = 275
    }
  } else if (document.getElementById('sizeDropDown').selectedIndex == 3) {
    if (document.getElementById('gaugeDropDown').selectedIndex == 1) {
      document.getElementById('innerWidth').value = 181
      document.getElementById('innerHeight').value = 311
      innerWidthNew = 181
      innerHeightNew = 311
    } else if (document.getElementById('gaugeDropDown').selectedIndex == 2) {
      document.getElementById('innerWidth').value = 225
      document.getElementById('innerHeight').value = 387
      innerWidthNew = 225
      innerHeightNew = 387
    }
  } else if (document.getElementById('sizeDropDown').selectedIndex == 4) {
    if (document.getElementById('gaugeDropDown').selectedIndex == 1) {
      document.getElementById('innerWidth').value = 229
      document.getElementById('innerHeight').value = 311
      innerWidthNew = 229
      innerHeightNew = 311
    } else if (document.getElementById('gaugeDropDown').selectedIndex == 2) {
      document.getElementById('innerWidth').value = 285
      document.getElementById('innerHeight').value = 387
      innerWidthNew = 285
      innerHeightNew = 387
    }
  } else if (document.getElementById('sizeDropDown').selectedIndex == 5) {
    if (document.getElementById('gaugeDropDown').selectedIndex == 1) {
      document.getElementById('innerWidth').value = 281
      document.getElementById('innerHeight').value = 341
      innerWidthNew = 281
      innerHeightNew = 341
    } else if (document.getElementById('gaugeDropDown').selectedIndex == 2) {
      document.getElementById('innerWidth').value = 351
      document.getElementById('innerHeight').value = 425
      innerWidthNew = 351
      innerHeightNew = 425
    }
  } else if (document.getElementById('sizeDropDown').selectedIndex == 6) {
    if (document.getElementById('gaugeDropDown').selectedIndex == 1) {
      document.getElementById('innerWidth').value = 329
      document.getElementById('innerHeight').value = 361
      innerWidthNew = 329
      innerHeightNew = 361
    } else if (document.getElementById('gaugeDropDown').selectedIndex == 2) {
      document.getElementById('innerWidth').value = 411
      document.getElementById('innerHeight').value = 451
      innerWidthNew = 411
      innerHeightNew = 451
    }
  }
};

function getInchesNew() {

  var innerWidthNum = document.getElementById('innerWidthNum');
  var innerHeightNum = document.getElementById('innerHeightNum');

  var pxSizeFooter = document.getElementById('pxSizeFooter');
  var inchSizeFooter = document.getElementById('inchSizeFooter');

  var gaugeNew = document.getElementById('gaugeDropDown').selectedIndex;
  var size = document.getElementById('sizeDropDown').selectedIndex;

  if (innerHeightNew % 2 == 0 && innerHeightNew != 0) {
    document.getElementById('innerHeight').value++
    innerHeightNew++
  }
  if (innerWidthNew % 2 == 0 && innerWidthNew != 0) {
    document.getElementById('innerWidth').value++
    innerWidthNew++
  }

  if (gaugeNew == 1) {
    wInch = Math.round(innerWidthNew / 4);
    hInch = Math.round(innerHeightNew / 4);
  } else if (gaugeNew == 2) {
    wInch = Math.round(innerWidthNew / 5);
    hInch = Math.round(innerHeightNew / 5);
  };


  if (smallScreen != true) {
    if (innerWidthNew != 0) {
      innerWidthNum.innerHTML = "Inches: " + wInch;
    };
    if (innerHeightNew != 0) {
      innerHeightNum.innerHTML = "Inches: " + hInch;
    };

    if (innerWidthNew != 0 && innerHeightNew != 0) {
      pxSizeFooter.innerHTML = "Stitches: " + innerWidthNew + " x " + innerHeightNew;
      inchSizeFooter.innerHTML = "Inches: " + wInch + " x " + hInch
    }
  } else {
    if (innerWidthNew != 0) {
      innerWidthNum.innerHTML = "In: " + wInch;
    };
    if (innerHeightNew != 0) {
      innerHeightNum.innerHTML = "In: " + hInch;
    };

    if (innerWidthNew != 0 && innerHeightNew != 0) {
      pxSizeFooter.innerHTML = "STs: " + innerWidthNew + " x " + innerHeightNew;
      inchSizeFooter.innerHTML = "In: " + wInch + " x " + hInch
    }
  }
};

function getCentimetresNew() {

  var innerWidthNum = document.getElementById('innerWidthNum');
  var innerHeightNum = document.getElementById('innerHeightNum');

  var pxSizeFooter = document.getElementById('pxSizeFooter');
  var inchSizeFooter = document.getElementById('inchSizeFooter');

  var gaugeNew = document.getElementById('gaugeDropDown').selectedIndex;
  var sizeNew = document.getElementById('sizeDropDown').selectedIndex;


  if (innerHeightNew % 2 == 0 && innerHeightNew != 0) {
    document.getElementById('innerHeight').value = Number(innerHeightNew) + 1
    innerHeightNew = Number(innerHeightNew) + 1
  }
  if (innerWidth % 2 == 0 && innerWidth != 0) {
    document.getElementById('innerWidth').value = Number(innerWidthNew) + 1
    innerWidthNew = Number(innerWidthNew) + 1
  }

  if (gaugeNew == 1) {
    wInch = (innerWidthNew / 4);
    hInch = (innerHeightNew / 4);
  } else if (gaugeNew == 2) {
    wInch = (innerWidthNew / 5);
    hInch = (innerHeightNew / 5);
  };

  wCM = Math.round(wInch * 2.54)
  hCM = Math.round(hInch * 2.54)

  if (smallScreen != true) {
    if (innerWidthNew != 0) {
      innerWidthNum.innerHTML = "CM: " + wCM;
    };
    if (innerHeightNew != 0) {
      innerHeightNum.innerHTML = "CM: " + hCM;
    };

    if (innerWidthNew != 0 && innerHeightNew != 0) {
      pxSizeFooter.innerHTML = "Stitches: " + innerWidthNew + " x " + innerHeight;
      inchSizeFooter.innerHTML = "CM: " + wCM + " x " + hCM
    }
  } else {
    if (innerWidthNew != 0) {
      innerWidthNum.innerHTML = "Cm: " + wCM;
    };
    if (innerHeightNew != 0) {
      innerHeightNum.innerHTML = "Cm: " + hCM;
    };

    if (innerWidthNew != 0 && innerHeightNew != 0) {
      pxSizeFooter.innerHTML = "STs: " + innerWidthNew + " x " + innerHeightNew;
      inchSizeFooter.innerHTML = "Cm: " + wCM + " x " + hCM
    }
  }
};

// Graph OK Check
function graphOk() {

  if (patternLoaded == true) {
    if (confirm("Delete current progress and make a new graph?") != true) {
      uiClick()
      return
    }
  }
  alertMsg = "You need to enter the following info to make your graph:\n\n"

  if ((document.getElementById('innerWidth').value == "") ||
    (document.getElementById('innerHeight').value == "") ||
    (document.getElementById("firstColorDropDown").selectedIndex == "0") ||
    (document.getElementById("interiorColorDropDown").selectedIndex == "0") ||
    (document.getElementById("stSelect").selectedIndex == "0") ||
    (document.getElementById('gaugeDropDown').selectedIndex == "0")) {

    if (document.getElementById("stSelect").selectedIndex == "0") {
      alertMsg += "Crochet Style\n"
    }
    if (document.getElementById('gaugeDropDown').selectedIndex == "0") {
      alertMsg += "Gauge\n"
    }
    if (document.getElementById('innerWidth').value == "") {
      alertMsg += "Stitches Wide\n"
    }
    if (document.getElementById('innerHeight').value == "") {
      alertMsg += "Stitches Tall\n"
    }
    if (document.getElementById("firstColorDropDown").selectedIndex == "0") {
      alertMsg += "First Color\n"
    }
    if (document.getElementById("interiorColorDropDown").selectedIndex == "0") {
      alertMsg += "Interior Color\n"
    }

    alert(alertMsg)
    return

  } else {
    selectedStyle = document.getElementById("stSelect").selectedIndex
    gauge = document.getElementById('gaugeDropDown').selectedIndex
    size = document.getElementById("sizeDropDown").value;
    innerWidth = document.getElementById('innerWidth').value
    innerHeight = document.getElementById('innerHeight').value
    firstColor = document.getElementById("firstColorDropDown").selectedIndex;
    interiorColor = document.getElementById("interiorColorDropDown").selectedIndex;
    drawNewGraph()
    // uiClick()
  }
  if (patternLoaded == true) {
    if (stitchesLoaded) {
      if (stitchesVisible) {
        stitchesChange();
      }
      stitchesLoaded = false
    }
    if (gridLinesVisible) {
      gridLineChange();
    }
  }
};

//// Graph Marking ////
async function startMarking(event) {
  saveUndoState()

  document.getElementById("cells").addEventListener("mousemove", graphMark, { passive: true });
  document.getElementById("cells").addEventListener("touchmove", graphMark, { passive: true });

  document.getElementById("cellsBack").addEventListener("mousemove", graphMark, { passive: true });

  graphMark(event)
};

function reposition(event) {

  try {
    pixel = ctx.getImageData(((event.clientX - graph.getBoundingClientRect().left) / frontZoom) * 10, ((event.clientY - graph.getBoundingClientRect().top) / frontZoom) * 10, 1, 1).data;
    touched = false
  } catch {
    pixel = ctx.getImageData(((event.touches[0].clientX - graph.getBoundingClientRect().left) / frontZoom) * 10, ((event.touches[0].clientY - graph.getBoundingClientRect().top) / frontZoom) * 10, 1, 1).data;
    touched = true
  }

  if (overFrontGraph) {
    if (!touched) {
      coord.x = ((event.clientX - graph.getBoundingClientRect().left) / frontZoom) * 10;
      coord.y = ((event.clientY - graph.getBoundingClientRect().top) / frontZoom) * 10;
    } else {
      coord.x = ((event.touches[0].clientX - graph.getBoundingClientRect().left) / frontZoom) * 10;
      coord.y = ((event.touches[0].clientY - graph.getBoundingClientRect().top) / frontZoom) * 10;
    }

    currentCoord.x = ((coord.x - coord.x % 8) / 8)
    currentCoord.y = ((coord.y - coord.y % 8) / 8)

    switch (selectedStyle) {
      case 1:
        ctx = graph.getContext("2d", { willReadFrequently: true });
        ctxOther = graphBack.getContext("2d", { willReadFrequently: true });
      case 2:
        ctx = graph.getContext("2d", { willReadFrequently: true });
    }

  } else {
    if (!touched) {
      coord.x = ((event.clientX - graphBack.getBoundingClientRect().left) / frontZoom) * 10;
      coord.y = ((event.clientY - graphBack.getBoundingClientRect().top) / frontZoom) * 10;
    } else {
      coord.x = ((event.touches[0].clientX - graphBack.getBoundingClientRect().left) / frontZoom) * 10;
      coord.y = ((event.touches[0].clientY - graphBack.getBoundingClientRect().top) / frontZoom) * 10;
    }

    currentCoord.x = ((coord.x - coord.x % 8) / 8)
    currentCoord.y = ((coord.y - coord.y % 8) / 8)



    ctx = graphBack.getContext("2d", { willReadFrequently: true });
    ctxOther = graph.getContext("2d", { willReadFrequently: true });
  }
  if (selectedStyle == 1) {
    overBorder =
      ((currentCoord.x == 0) ||
        (currentCoord.x == 1) ||
        (currentCoord.x == 2) ||
        (currentCoord.y == 0) ||
        (currentCoord.y == 1) ||
        (currentCoord.y == 2) ||
        (currentCoord.x == (innerWidth - 1)) ||
        (currentCoord.x == (innerWidth - 2)) ||
        (currentCoord.x == (innerWidth - 3)) ||
        (currentCoord.y == (innerHeight - 1)) ||
        (currentCoord.y == (innerHeight - 2)) ||
        (currentCoord.y == (innerHeight - 3)));
  } else {
    overBorder =
      ((currentCoord.y == 0) ||
        (currentCoord.y == innerHeight - 1));
  }
};

markOK = (event) => {
  // return true
  reposition(event)
  if (!touched) {
    let pixelColor = "rgb(" + pixel[0] + ', ' + pixel[1] + ', ' + pixel[2] + ")"
    if (ink1Selected && (pixelColor == ink1) && (event.buttons == 1)) {
      return false;

    } else if (ink1Selected && (pixelColor == ink2) && (event.buttons == 2)) {
      return false;

    } else if (!ink1Selected && (pixelColor == ink1) && (event.buttons == 2)) {
      return false;

    } else if (!ink1Selected && (pixelColor == ink2) && (event.buttons == 1)) {
      return false;

    } else if (overBorder) {
      return false;

    } else {
      return true;

    }

  } else {
    let pixelColor = "rgb(" + pixel[0] + ', ' + pixel[1] + ', ' + pixel[2] + ")"
    if (ink1Selected && (pixelColor == ink1)) {
      return false;

    } else if (!ink1Selected && (pixelColor == ink2)) {
      return false;

    } else if ((selectedStyle == 1) && ink1Selected && (currentCoord.x % 2 == 1 && currentCoord.y % 2 == 1)) {
      return false;

    } else if ((selectedStyle == 1) && !ink1Selected && (currentCoord.x % 2 == 0 && currentCoord.y % 2 == 0)) {
      return false;

    } else if (overBorder) {
      return false;

    } else {
      return true;

    }
  }


}
async function stopMarking() {


  document.getElementById("cells").removeEventListener("mousemove", graphMark, { passive: true });
  document.getElementById("cells").removeEventListener("touchmove", graphMark, { passive: true });

  document.getElementById("cellsBack").removeEventListener("mousemove", graphMark, { passive: true });
  document.getElementById("cellsBack").removeEventListener("touchmove", graphMark, { passive: true });
};

function graphMark(event) {

  if (markOK(event)) {

    bothCoordZero = (((currentCoord.x % 2) == 0) && ((currentCoord.y % 2) == 0))
    bothCoordOne = (((currentCoord.x % 2) == 1) && ((currentCoord.y % 2) == 1))

    if (selectedStyle == 1) {

      //////// Main ///////// 
      thisMark.x = (coord.x - (coord.x % 8));
      thisMark.y = (coord.y - (coord.y % 8));

      horzMark.x = graphWidth - (coord.x - (coord.x % 8)) - 8;
      horzMark.y = coord.y - (coord.y % 8);

      vertMark.x = coord.x - (coord.x % 8);
      vertMark.y = graphHeight - (coord.y - (coord.y % 8)) - 8;

      bothMark.x = graphWidth - (coord.x - (coord.x % 8)) - 8;
      bothMark.y = graphHeight - (coord.y - (coord.y % 8)) - 8;

      //////// Other /////////

      thisMarkOther.x = graphWidth - (coord.x - coord.x % 8);
      thisMarkOther.y = (coord.y - (coord.y % 8)) + 8;

      horzMarkOther.x = (coord.x - (coord.x % 8));
      horzMarkOther.y = (coord.y - (coord.y % 8));

      vertMarkOther.x = graphWidth - (coord.x - (coord.x % 8)) - 8;
      vertMarkOther.y = graphHeight - (coord.y - (coord.y % 8)) - 8;

      bothMarkOther.x = coord.x - (coord.x % 8);
      bothMarkOther.y = graphHeight - (coord.y - (coord.y % 8)) - 8;

      markable = !bothCoordZero && !bothCoordOne
      coordHasZero = ((currentCoord.x % 2 == 0) || (currentCoord.y % 2 == 0));
      coordHasOne = ((currentCoord.x % 2 == 1) || (currentCoord.y % 2 == 1));

    } else {

      //////// Direct /////////

      thisMark.x = (coord.x - (coord.x % 8))
      thisMark.y = (coord.y - (coord.y % 8))

      horzMark.x = graphWidth - (coord.x - (coord.x % 8)) - 8;
      horzMark.y = coord.y - (coord.y % 8)

      vertMark.x = coord.x - (coord.x % 8)
      vertMark.y = graphHeight - (coord.y - (coord.y % 8)) - 8;

      bothMark.x = graphWidth - (coord.x - (coord.x % 8)) - 8;
      bothMark.y = graphHeight - (coord.y - (coord.y % 8)) - 8;

      //////// Upper /////////

      thisUpMark.x = (coord.x - (coord.x % 8))
      thisUpMark.y = (coord.y - (coord.y % 8)) - 8

      horzUpMark.x = graphWidth - (coord.x - (coord.x % 8) + 8)
      horzUpMark.y = coord.y - (coord.y % 8) - 8

      vertUpMark.x = coord.x - (coord.x % 8)
      vertUpMark.y = graphHeight - (coord.y - (coord.y % 8)) - 16

      bothUpMark.x = graphWidth - (coord.x - (coord.x % 8)) - 8
      bothUpMark.y = graphHeight - (coord.y - (coord.y % 8)) - 16

      //////// Lower /////////

      thisDownMark.x = (coord.x - (coord.x % 8))
      thisDownMark.y = (coord.y - (coord.y % 8)) + 8

      horzDownMark.x = graphWidth - (coord.x - (coord.x % 8) + 8)
      horzDownMark.y = coord.y - (coord.y % 8) + 8

      vertDownMark.x = coord.x - (coord.x % 8)
      vertDownMark.y = graphHeight - (coord.y - (coord.y % 8))

      bothDownMark.x = graphWidth - (coord.x - (coord.x % 8) + 8)
      bothDownMark.y = graphHeight - (coord.y - (coord.y % 8))
    }


    switch (selectedStyle) {
      case 1:
        switch (markable) {
          case true:

            interlockingYesMark(event);
            break;

          case false:

            interlockingNoMark(event);
            break;
        }
        break;

      case 2:
        mosaicMark(event);
        break;
    }
  }
};

//// Interlocking Mark Stuff ////

function interlockingYesMark(event) {

  switch (overBorder) {
    case false:
      // alert(firstColor)
      switch (firstColor) {
        case 1:

          switch (ink1Selected) {
            case true:

              switch (touched) {
                case false:

                  switch (event.buttons) {
                    case 1:

                      interlockingDarkMark(event)
                      break;

                    case 2:
                      interlockingLightMark(event)
                      break;
                  }
                  break;

                case true:
                  interlockingDarkMark(event)
                  break;
              }
              break;

            case false:

              switch (touched) {

                case false:

                  switch (event.buttons) {
                    case 2:
                      interlockingDarkMark(event)
                      break;
                    case 1:
                      interlockingLightMark(event)
                      break;
                  }
                  break;

                case true:
                  interlockingLightMark(event)
                  break;
              }
              break;

          }
          break;

        case 2:

          switch (ink1Selected) {
            case true:

              switch (touched) {
                case false:

                  switch (event.buttons) {
                    case 1:
                      interlockingDarkMark(event)
                      break;

                    case 2:
                      interlockingLightMark(event)
                      break;
                  }
                  break;

                case true:
                  interlockingDarkMark(event)
                  break;
              }
              break;

            case false:

              switch (touched) {
                case false:

                  switch (event.buttons) {
                    case 2:
                      interlockingDarkMark(event)
                      break;

                    case 1:
                      interlockingLightMark(event)
                      break;

                  }
                  break;

                case true:
                  interlockingLightMark(event)
                  break;

              }

          }
          break;

      }
      break;
    case true:
      switch (firstColor) {
        case 1:
          ctx.fillStyle = ink1
          ctx.fillRect(0, 0, 1, 1);
          reposition(event);
          break;
        case 2:
          ctx.fillStyle = ink2
          ctx.fillRect(0, 0, 1, 1);
          reposition(event);
          break;
      }
      break;
  }
};

function interlockingNoMark(event) {
  switch (overBorder) {
    case false:

      switch (firstColor) {
        case 1:

          switch (bothCoordZero) {
            case true:

              thisDarkMark(event);
              break;

            case false:

              thisLightMark(event);
              break;

          }
          break;

        case 2:

          switch (bothCoordZero) {
            case true:
              thisLightMark(event);
              break;

            case false:
              thisDarkMark(event);
              break;

          }
          break;
      }
      break;
    case true:
      switch (firstColor) {
        case 1:
          ctx.fillStyle = ink1
          ctx.fillRect(0, 0, 1, 1);
          reposition(event);
          break;
        case 2:
          ctx.fillStyle = ink2
          ctx.fillRect(0, 0, 1, 1);
          reposition(event);
          break;
      }
      break;
  }
};

function interlockingDarkMark(event) {

  switch (toolPicked) {

    case 0:

      thisDarkMark(event)
      thisLightMarkOther(event)

      switch (symmetry) {
        case 0:

          break;

        case 1:

          horzDarkMark(event)

          if (markable) {
            horzLightMarkOther(event)

          } else if (bothCoordZero) {
            horzDarkMarkOther(event)

          } else if (bothCoordOne) {
            horzLightMarkOther(event)
          }
          break;

        case 2:

          vertDarkMark(event)

          if (markable) {
            vertLightMarkOther(event)

          } else if (bothCoordZero) {
            vertDarkMarkOther(event)

          } else if (bothCoordOne) {
            vertLightMarkOther(event)
          }
          break;

        case 3:

          horzDarkMark(event)
          vertDarkMark(event)
          bothDarkMark(event)

          if (markable) {
            horzLightMarkOther(event)
            vertLightMarkOther(event)
            bothLightMarkOther(event)

          } else if (bothCoordZero) {
            horzDarkMarkOther(event)
            vertDarkMarkOther(event)
            bothDarkMarkOther(event)

          } else if (bothCoordOne) {
            horzLightMarkOther(event)
            vertLightMarkOther(event)
            bothLightMarkOther(event)
          }
          break;

      }
      break;

    case 1:

      switch (firstColor) {
        case 1:
          switch (shadeType) {
            case 1:
              switch (currentCoord.y % 2 == 0) {
                case true:
                  if ((bothShadePref == true) || ((ink1Selected == true) && (event.buttons == 1)) || ((ink1Selected == false) && (event.buttons == 2))) {
                    thisDarkMark(event)
                    thisLightMarkOther(event)

                    switch (symmetry) {
                      case 0:

                        break;

                      case 1:
                        horzDarkMark(event)

                        horzLightMarkOther(event)
                        break;

                      case 2:
                        vertDarkMark(event)

                        vertLightMarkOther(event)
                        break;

                      case 3:
                        horzDarkMark(event)
                        vertDarkMark(event)
                        bothDarkMark(event)

                        horzLightMarkOther(event)
                        vertLightMarkOther(event)
                        bothLightMarkOther(event)

                        break;
                    }
                  } else {
                    dudMark(event)
                  }
                  break;

                case false:
                  if ((bothShadePref == true) || ((ink1Selected == false) && (event.buttons == 1)) || ((ink1Selected == true) && (event.buttons == 2))) {
                    thisLightMark(event)
                    thisDarkMarkOther(event)

                    switch (symmetry) {
                      case 0:

                        break;

                      case 1:
                        horzLightMark(event)

                        horzDarkMarkOther(event)
                        break;

                      case 2:
                        vertLightMark(event)

                        vertDarkMarkOther(event)
                        break;

                      case 3:
                        horzLightMark(event)
                        vertLightMark(event)
                        bothLightMark(event)

                        horzDarkMarkOther(event)
                        vertDarkMarkOther(event)
                        bothDarkMarkOther(event)

                        break;
                    }
                  } else {
                    dudMark(event)
                  }
                  break;
              }
              break;

            case 2:
              switch (currentCoord.x % 2 == 0) {
                case true:
                  if ((bothShadePref == true) || ((ink1Selected == true) && (event.buttons == 1)) || ((ink1Selected == false) && (event.buttons == 2))) {
                    thisDarkMark(event)
                    thisLightMarkOther(event)

                    switch (symmetry) {
                      case 0:

                        break;

                      case 1:
                        horzDarkMark(event)

                        horzLightMarkOther(event)

                        break;

                      case 2:
                        vertDarkMark(event)

                        vertLightMarkOther(event)
                        break;

                      case 3:
                        horzDarkMark(event)
                        vertDarkMark(event)
                        bothDarkMark(event)

                        horzLightMarkOther(event)
                        vertLightMarkOther(event)
                        bothLightMarkOther(event)

                        break;
                    }

                  } else {
                    dudMark(event)
                  }
                  break;

                case false:
                  if ((bothShadePref == true) || ((ink1Selected == false) && (event.buttons == 1)) || ((ink1Selected == true) && (event.buttons == 2))) {
                    thisLightMark(event)
                    thisDarkMarkOther(event)

                    switch (symmetry) {
                      case 0:

                        break;

                      case 1:
                        horzLightMark(event)

                        horzCarkMarkOther(event)

                        break;

                      case 2:
                        vertLightMark(event)

                        vertDarkMarkOther(event)
                        break;

                      case 3:
                        horzLightMark(event)
                        vertLightMark(event)
                        bothLightMark(event)

                        horzDarkMarkOther(event)
                        vertDarkMarkOther(event)
                        bothDarkMarkOther(event)

                        break;
                    }
                  } else {
                    dudMark(event)
                  }
                  break;
              }
              break;
          }
          break;
        case 2:
          switch (shadeType) {
            case 1:
              switch (currentCoord.y % 2 == 1) {
                case true:
                  if ((bothShadePref == true) || ((ink1Selected == true) && (event.buttons == 1)) || ((ink1Selected == false) && (event.buttons == 2))) {
                    thisDarkMark(event)
                    thisLightMarkOther(event)

                    switch (symmetry) {
                      case 0:

                        break;

                      case 1:
                        horzDarkMark(event)

                        horzLightMarkOther(event)
                        break;

                      case 2:
                        vertDarkMark(event)

                        vertLightMarkOther(event)
                        break;

                      case 3:
                        horzDarkMark(event)
                        vertDarkMark(event)
                        bothDarkMark(event)

                        horzLightMarkOther(event)
                        vertLightMarkOther(event)
                        bothLightMarkOther(event)

                        break;
                    }
                  } else {
                    dudMark(event)
                  }
                  break;

                case false:
                  if ((bothShadePref == true) || ((ink1Selected == false) && (event.buttons == 1)) || ((ink1Selected == true) && (event.buttons == 2))) {
                    thisLightMark(event)
                    thisDarkMarkOther(event)

                    switch (symmetry) {
                      case 0:

                        break;

                      case 1:
                        horzLightMark(event)

                        horzDarkMarkOther(event)
                        break;

                      case 2:
                        vertLightMark(event)

                        vertDarkMarkOther(event)
                        break;

                      case 3:
                        horzLightMark(event)
                        vertLightMark(event)
                        bothLightMark(event)

                        horzDarkMarkOther(event)
                        vertDarkMarkOther(event)
                        bothDarkMarkOther(event)

                        break;
                    }
                  } else {
                    dudMark(event)
                  }
                  break;
              }
              break;

            case 2:
              switch (currentCoord.x % 2 == 1) {
                case true:
                  if ((bothShadePref == true) || ((ink1Selected == true) && (event.buttons == 1)) || ((ink1Selected == false) && (event.buttons == 2))) {
                    thisDarkMark(event)
                    thisLightMarkOther(event)

                    switch (symmetry) {
                      case 0:

                        break;

                      case 1:
                        horzDarkMark(event)

                        horzLightMarkOther(event)

                        break;

                      case 2:
                        vertDarkMark(event)

                        vertLightMarkOther(event)
                        break;

                      case 3:
                        horzDarkMark(event)
                        vertDarkMark(event)
                        bothDarkMark(event)

                        horzLightMarkOther(event)
                        vertLightMarkOther(event)
                        bothLightMarkOther(event)

                        break;
                    }
                  } else {
                    dudMark(event)
                  }
                  break;

                case false:
                  if ((bothShadePref == true) || ((ink1Selected == false) && (event.buttons == 1)) || ((ink1Selected == true) && (event.buttons == 2))) {
                    thisLightMark(event)
                    thisDarkMarkOther(event)

                    switch (symmetry) {
                      case 0:

                        break;

                      case 1:
                        horzLightMark(event)

                        horzCarkMarkOther(event)

                        break;

                      case 2:
                        vertLightMark(event)

                        vertDarkMarkOther(event)
                        break;

                      case 3:
                        horzLightMark(event)
                        vertLightMark(event)
                        bothLightMark(event)

                        horzDarkMarkOther(event)
                        vertDarkMarkOther(event)
                        bothDarkMarkOther(event)

                        break;
                    }
                  } else {
                    dudMark(event)
                  }
                  break;
              }
              break;
          }
          break;
      }
      break;
  }
};

function interlockingLightMark(event) {
  switch (toolPicked) {
    case 0:

      thisLightMark(event)
      thisDarkMarkOther(event)

      switch (symmetry) {
        case 0:

          break;

        case 1:

          horzLightMark(event)

          if (markable) {
            horzDarkMarkOther(event)

          } else if (bothCoordZero) {
            horzLightMarkOther(event)

          } else if (bothCoordOne) {
            horzDarkMarkOther(event)
          }
          break;

        case 2:

          vertLightMark(event)

          if (markable) {
            vertDarkMarkOther(event)

          } else if (bothCoordZero) {
            vertLightMarkOther(event)

          } else if (bothCoordOne) {
            vertDarkMarkOther(event)
          }
          break;

        case 3:

          horzLightMark(event)
          vertLightMark(event)
          bothLightMark(event)

          if (markable) {
            horzDarkMarkOther(event)
            vertDarkMarkOther(event)
            bothDarkMarkOther(event)

          } else if (bothCoordZero) {
            horzLightMarkOther(event)
            vertLightMarkOther(event)
            bothLightMarkOther(event)

          } else if (bothCoordOne) {
            horzDarkMarkOther(event)
            vertDarkMarkOther(event)
            bothDarkMarkOther(event)
          }
          break;

      }
      break;

    case 1:
      switch (firstColor) {
        case 1:
          switch (shadeType) {
            case 1:
              switch (currentCoord.y % 2 == 0) {
                case true:
                  if ((bothShadePref == true) || ((ink1Selected == true) && (event.buttons == 1)) || ((ink1Selected == false) && (event.buttons == 2))) {
                    thisDarkMark(event)
                    thisLightMarkOther(event)

                    switch (symmetry) {
                      case 0:

                        break;

                      case 1:
                        horzDarkMark(event)

                        horzLightMarkOther(event)
                        break;

                      case 2:
                        vertDarkMark(event)

                        vertLightMarkOther(event)
                        break;

                      case 3:
                        horzDarkMark(event)
                        vertDarkMark(event)
                        bothDarkMark(event)

                        horzLightMarkOther(event)
                        vertLightMarkOther(event)
                        bothLightMarkOther(event)

                        break;
                    }
                  } else {
                    dudMark(event)
                  }
                  break;

                case false:
                  if ((bothShadePref == true) || ((ink1Selected == false) && (event.buttons == 1)) || ((ink1Selected == true) && (event.buttons == 2))) {
                    thisLightMark(event)
                    thisDarkMarkOther(event)

                    switch (symmetry) {
                      case 0:

                        break;

                      case 1:
                        horzLightMark(event)

                        horzDarkMarkOther(event)
                        break;

                      case 2:
                        vertLightMark(event)

                        vertDarkMarkOther(event)
                        break;

                      case 3:
                        horzLightMark(event)
                        vertLightMark(event)
                        bothLightMark(event)

                        horzDarkMarkOther(event)
                        vertDarkMarkOther(event)
                        bothDarkMarkOther(event)

                        break;
                    }
                  } else {
                    dudMark(event)
                  }
                  break;
              }
              break;

            case 2:
              switch (currentCoord.x % 2 == 0) {
                case true:
                  if ((bothShadePref == true) || ((ink1Selected == true) && (event.buttons == 1)) || ((ink1Selected == false) && (event.buttons == 2))) {
                    thisDarkMark(event)
                    thisLightMarkOther(event)

                    switch (symmetry) {
                      case 0:

                        break;

                      case 1:

                        horzDarkMark(event)
                        horzLightMarkOther(event)

                        break;

                      case 2:

                        vertDarkMark(event)
                        vertLightMarkOther(event)

                        break;

                      case 3:

                        horzDarkMark(event)
                        vertDarkMark(event)
                        bothDarkMark(event)

                        horzLightMarkOther(event)
                        vertLightMarkOther(event)
                        bothLightMarkOther(event)

                        break;

                    }
                  } else {
                    dudMark(event)
                  }
                  break;

                case false:
                  if ((bothShadePref == true) || ((ink1Selected == false) && (event.buttons == 1)) || ((ink1Selected == true) && (event.buttons == 2))) {
                    thisLightMark(event)
                    thisDarkMarkOther(event)

                    switch (symmetry) {
                      case 0:

                        break;

                      case 1:

                        horzLightMark(event)
                        horzCarkMarkOther(event)

                        break;

                      case 2:

                        vertLightMark(event)
                        vertDarkMarkOther(event)

                        break;

                      case 3:

                        horzLightMark(event)
                        vertLightMark(event)
                        bothLightMark(event)

                        horzDarkMarkOther(event)
                        vertDarkMarkOther(event)
                        bothDarkMarkOther(event)

                        break;
                    }
                  } else {
                    dudMark(event)
                  }
                  break;
              }
              break;
          }
          break;
        case 2:
          switch (shadeType) {
            case 1:
              switch (currentCoord.y % 2 == 1) {
                case true:
                  if ((bothShadePref == true) || ((ink1Selected == true) && (event.buttons == 1)) || ((ink1Selected == false) && (event.buttons == 2))) {
                    thisDarkMark(event)
                    thisLightMarkOther(event)
                    switch (symmetry) {
                      case 0:

                        break;

                      case 1:
                        horzDarkMark(event)

                        horzLightMarkOther(event)
                        break;

                      case 2:
                        vertDarkMark(event)

                        vertLightMarkOther(event)
                        break;

                      case 3:
                        horzDarkMark(event)
                        vertDarkMark(event)
                        bothDarkMark(event)

                        horzLightMarkOther(event)
                        vertLightMarkOther(event)
                        bothLightMarkOther(event)

                        break;
                    }
                  } else {
                    dudMark(event)
                  }
                  break;

                case false:
                  if ((bothShadePref == true) || ((ink1Selected == false) && (event.buttons == 1)) || ((ink1Selected == true) && (event.buttons == 2))) {
                    thisLightMark(event)
                    thisDarkMarkOther(event)

                    switch (symmetry) {
                      case 0:

                        break;

                      case 1:
                        horzLightMark(event)

                        horzDarkMarkOther(event)
                        break;

                      case 2:
                        vertLightMark(event)

                        vertDarkMarkOther(event)
                        break;

                      case 3:
                        horzLightMark(event)
                        vertLightMark(event)
                        bothLightMark(event)

                        horzDarkMarkOther(event)
                        vertDarkMarkOther(event)
                        bothDarkMarkOther(event)

                        break;
                    }
                  } else {
                    dudMark(event)
                  }
                  break;
              }
              break;

            case 2:
              switch (currentCoord.x % 2 == 1) {
                case true:
                  if ((bothShadePref == true) || ((ink1Selected == true) && (event.buttons == 1)) || ((ink1Selected == false) && (event.buttons == 2))) {
                    thisDarkMark(event)
                    thisLightMarkOther(event)

                    switch (symmetry) {
                      case 0:

                        break;

                      case 1:

                        horzDarkMark(event)
                        horzLightMarkOther(event)

                        break;

                      case 2:

                        vertDarkMark(event)
                        vertLightMarkOther(event)

                        break;

                      case 3:

                        horzDarkMark(event)
                        vertDarkMark(event)
                        bothDarkMark(event)

                        horzLightMarkOther(event)
                        vertLightMarkOther(event)
                        bothLightMarkOther(event)

                        break;
                    }
                  } else {
                    dudMark(event)
                  }
                  break;

                case false:
                  if ((bothShadePref == true) || ((ink1Selected == false) && (event.buttons == 1)) || ((ink1Selected == true) && (event.buttons == 2))) {
                    thisLightMark(event)
                    thisDarkMarkOther(event)

                    switch (symmetry) {
                      case 0:

                        break;

                      case 1:

                        horzLightMark(event)
                        horzCarkMarkOther(event)

                        break;

                      case 2:

                        vertLightMark(event)
                        vertDarkMarkOther(event)

                        break;

                      case 3:

                        horzLightMark(event)
                        vertLightMark(event)
                        bothLightMark(event)

                        horzDarkMarkOther(event)
                        vertDarkMarkOther(event)
                        bothDarkMarkOther(event)

                        break;
                    }
                  } else {
                    dudMark(event)
                  }
                  break;
              }
              break;
          }
          break;

      }
      break;
  }
};

//// Mosaic Mark Stuff ////

function mosaicMark(event) {

  switch (overBorder) {
    case false:

      thisUpMarkData = ctx.getImageData(thisUpMark.x, thisUpMark.y, 1, 1).data;
      thisDownMarkData = ctx.getImageData(thisDownMark.x, thisDownMark.y, 1, 1).data;

      thisUpMarkColor = "rgb(" + thisUpMarkData[0] + ', ' + thisUpMarkData[1] + ', ' + thisUpMarkData[2] + ")";
      thisDownMarkColor = "rgb(" + thisDownMarkData[0] + ', ' + thisDownMarkData[1] + ', ' + thisDownMarkData[2] + ")";

      switch (toolPicked) {
        case 0:

          switch (firstColor) {

            // First Color Dark
            case 1:
              mosaicSolidDarkFirst(event)
              break;

            // First Color Light
            case 2:
              mosaicSolidLightFirst(event)
              break;
          }

          break;

        case 1:
          switch (ink1Selected) {
            case true:
              switch (touched) {
                case false:
                  switch (event.buttons) {
                    case 1:
                      mosaicDarkMark(event)
                      break;

                    case 2:
                      mosaicLightMark(event)
                      break;
                  };
                  break;

                case true:
                  mosaicDarkMark(event)
                  break;
              }
              break;

            case false:
              switch (touched) {
                case false:
                  switch (event.buttons) {
                    case 1:
                      mosaicLightMark(event)
                      break;

                    case 2:
                      mosaicDarkMark(event)
                      break;
                  };
                  break;

                case true:
                  mosaicLightMark(event)
                  break;
              }
              break;
          }
          break;
      }
      break;
    case true:
      dudMark(event);
      break;
  }
};

function mosaicSolidDarkFirst(event) {

  switch (ink1Selected) {
    case true:

      switch (currentCoord.y % 2 == 0) {
        case true:

          switch (touched) {
            case true:
              mosaicDarkMark(event)
              break;

            case false:
              switch (event.buttons) {

                case 1:
                  mosaicDarkMark(event)
                  break;

                case 2:
                  mosaicLightMark(event)
                  mosaicUpLightMark(event)
                  mosaicDownLightMark(event)
                  break;

              };
              break;

          };
          break;

        case false:
          switch (touched) {

            case true:
              mosaicDarkMark(event)
              mosaicUpDarkMark(event)
              mosaicDownDarkMark(event)
              break;

            case false:
              switch (event.buttons) {

                case 1:
                  mosaicDarkMark(event)
                  mosaicUpDarkMark(event)
                  mosaicDownDarkMark(event)
                  break;

                case 2:
                  mosaicLightMark(event)
                  break;

              };
              break;

          };
          break;

      };
      break;

    case false:
      switch (currentCoord.y % 2 == 0) {

        case false:
          switch (touched) {

            case true:
              mosaicLightMark(event)
              break;

            case false:
              switch (event.buttons) {

                case 1:
                  mosaicLightMark(event)
                  break;

                case 2:
                  mosaicDarkMark(event)
                  mosaicUpDarkMark(event)
                  mosaicDownDarkMark(event)
                  break;

              };
              break;

          };
          break;

        case true:
          switch (touched) {

            case true:
              mosaicLightMark(event)
              mosaicUpLightMark(event)
              mosaicDownLightMark(event)
              break;

            case false:
              switch (event.buttons) {

                case 1:
                  mosaicLightMark(event)
                  mosaicUpLightMark(event)
                  mosaicDownLightMark(event)
                  break;

                case 2:
                  mosaicDarkMark(event)
                  break;
              };
              break;

          };
          break;

      };
      break;

  }
};

function mosaicSolidLightFirst(event) {
  switch (ink1Selected) {
    case true:

      switch (currentCoord.y % 2 == 1) {
        case true:
          switch (touched) {
            case false:
              switch (event.buttons) {
                case 1:
                  mosaicDarkMark(event);
                  break;

                // Right Click
                case 2:
                  mosaicLightMark(event);
                  mosaicUpLightMark(event);
                  mosaicDownLightMark(event);
                  break;
              };
              break;

            // Touched True
            case true:
              mosaicDarkMark(event);
              break;
          };
          break;

        case false:
          switch (touched) {
            case false:
              switch (event.buttons) {
                case 1:
                  mosaicDarkMark(event);
                  mosaicUpDarkMark(event);
                  mosaicDownDarkMark(event);
                  break;

                // Right Click
                case 2:
                  mosaicLightMark(event);
                  break;
              }
              break;

            case true:
              mosaicDarkMark(event);
              mosaicUpDarkMark(event);
              mosaicDownDarkMark(event);
              break;
          };
          break;
      };

      break;

    case false:

      switch (currentCoord.y % 2 == 0) {
        case true:
          switch (touched) {
            case false:
              switch (event.buttons) {
                case 1:
                  mosaicLightMark(event)
                  break;

                case 2:
                  mosaicDarkMark(event)
                  mosaicUpDarkMark(event)
                  mosaicDownDarkMark(event)
                  break;
              };
              break;

            case true:
              mosaicLightMark(event)
              break;
          }
          break;

        case false:
          switch (touched) {
            case false:
              switch (event.buttons) {
                case 1:
                  mosaicLightMark(event)
                  mosaicUpLightMark(event)
                  mosaicDownLightMark(event)
                  break;

                case 2:
                  mosaicDarkMark(event)
                  break;
              }
              break;

            case true:
              mosaicLightMark(event)
              mosaicUpLightMark(event)
              mosaicDownLightMark(event)
              break;
          }
          break;
      }
      break;
  }
};

// Horz Dark Marks
function mosaicHorzDarkFirstDM(event) {
  switch (currentCoord.y % 2 == 0) {
    case true:
      if ((bothShadePref == true) || ((ink1Selected == true) && (event.buttons == 1)) || ((ink1Selected == false) && (event.buttons == 2))) {
        thisDarkMark(event)
        mosaicDarkSym(event)
      } else {
        dudMark(event)
      }
      break;

    case false:
      if ((bothShadePref == true) || ((ink1Selected == false) && (event.buttons == 1)) || ((ink1Selected == true) && (event.buttons == 2))) {
        thisLightMark(event)
        mosaicLightSym(event)
      } else {
        dudMark(event)
      }
      break;
  }
};

function mosaicHorzLightFirstDM(event) {
  switch (currentCoord.y % 2 == 1) {
    case true:
      if ((bothShadePref == true) || ((ink1Selected == true) && (event.buttons == 1)) || ((ink1Selected == false) && (event.buttons == 2))) {
        thisDarkMark(event)
        mosaicDarkSym(event)
      } else {
        dudMark(event)
      }
      break;

    case false:
      if ((bothShadePref == true) || ((ink1Selected == false) && (event.buttons == 1)) || ((ink1Selected == true) && (event.buttons == 2))) {
        thisLightMark(event)
        mosaicLightSym(event)
      } else {
        dudMark(event)
      }
      break;
  }
};

// Vert Dark Marks
function mosaicVertDarkFirstDM(event) {
  switch (currentCoord.x % 2 == 0) {
    case true:
      if ((bothShadePref == true) || ((ink1Selected == true) && (event.buttons == 1)) || ((ink1Selected == false) && (event.buttons == 2))) {
        switch (currentCoord.y % 2 == 0) {
          case true:
            thisDarkMark(event)
            mosaicDarkSym(event)
            break;

          case false:
            thisDarkMark(event)
            mosaicDarkSym(event)
            mosaicUpDarkMark(event)
            mosaicDownDarkMark(event)
            break;
        }
      } else {
        dudMark(event)
      }
      break;

    case false:
      mosaicVertDarkFirstLM(event)
      break;
  }
};

function mosaicVertLightFirstDM(event) {
  switch (currentCoord.x % 2 == 1) {
    case true:
      if ((bothShadePref == true) || ((ink1Selected == true) && (event.buttons == 1)) || ((ink1Selected == false) && (event.buttons == 2))) {
        switch (currentCoord.y % 2 == 1) {
          case true:
            thisDarkMark(event)
            mosaicDarkSym(event)
            break;

          case false:
            thisDarkMark(event)
            mosaicDarkSym(event)
            mosaicUpDarkMark(event)
            mosaicDownDarkMark(event)
            break;
        }
      } else {
        dudMark(event)
      }
      break;

    case false:
      mosaicVertLightFirstLM(event)
      break;
  }
};

// Dark Hatch Dark Marks
function mosaicDarkHatchDarkFirstDM(event) {
  switch ((currentCoord.y % 2 == 0) || (currentCoord.x % 2 == 0)) {
    case true:
      if ((bothShadePref == true) || ((ink1Selected == true) && (event.buttons == 1)) || ((ink1Selected == false) && (event.buttons == 2))) {
        switch (currentCoord.y % 2 == 0) {
          case true:
            thisDarkMark(event)
            mosaicDarkSym(event)
            break;
          case false:
            thisDarkMark(event)
            mosaicDarkSym(event)
            mosaicUpDarkMark(event)
            mosaicDownDarkMark(event)
            break;
        }
      } else {
        dudMark(event)
      }
      break;

    case false:
      if ((bothShadePref == true) || ((ink1Selected == false) && (event.buttons == 1)) || ((ink1Selected == true) && (event.buttons == 2))) {
        thisLightMark(event)
        mosaicLightSym(event)
      } else {
        dudMark(event)
      }
      break;
  }
};

function mosaicDarkHatchLightFirstDM(event) {
  switch ((currentCoord.y % 2 == 1) && (currentCoord.x % 2 == 1)) {
    case true:
      if ((bothShadePref == true) || ((ink1Selected == true) && (event.buttons == 1)) || ((ink1Selected == false) && (event.buttons == 2))) {
        thisDarkMark(event)
        mosaicDarkSym(event)
      } else {
        dudMark(event)
      }
      break;

    case false:
      if ((bothShadePref == true) || ((ink1Selected == false) && (event.buttons == 1)) || ((ink1Selected == true) && (event.buttons == 2))) {
        thisLightMark(event)
        mosaicLightSym(event)
      } else {
        dudMark(event)
      }
      break;
  }
};

// Light Hatch Dark Marks
function mosaicLightHatchDarkFirstDM(event) {
  switch ((currentCoord.y % 2 == 0) && (currentCoord.x % 2 == 0)) {
    case true:
      if ((bothShadePref == true) || ((ink1Selected == true) && (event.buttons == 1)) || ((ink1Selected == false) && (event.buttons == 2))) {
        thisDarkMark(event)
        mosaicDarkSym(event)
      } else {
        dudMark(event)
      }
      break;

    case false:
      if ((bothShadePref == true) || ((ink1Selected == false) && (event.buttons == 1)) || ((ink1Selected == true) && (event.buttons == 2))) {
        thisLightMark(event)
        mosaicLightSym(event)
      } else {
        dudMark(event)
      }
      break;
  }
};

function mosaicLightHatchLightFirstDM(event) {
  switch ((currentCoord.y % 2 == 1) || (currentCoord.x % 2 == 1)) {
    case true:
      if ((bothShadePref == true) || ((ink1Selected == true) && (event.buttons == 1)) || ((ink1Selected == false) && (event.buttons == 2))) {
        if (currentCoord.y % 2 == 1) {
          thisDarkMark(event)
          mosaicDarkSym(event)
        } else {
          thisDarkMark(event)
          mosaicDarkSym(event)
          mosaicUpDarkMark(event)
          mosaicDownDarkMark(event)
        }
      } else {
        dudMark(event)
      }
      break;

    case false:
      if ((bothShadePref == true) || ((ink1Selected == false) && (event.buttons == 1)) || ((ink1Selected == true) && (event.buttons == 2))) {
        thisLightMark(event)
        mosaicLightSym(event)
      } else {
        dudMark(event)
      }
      break;
  }
};

/// Shading Light Marks ///

// Horz Light Marks
function mosaicHorzDarkFirstLM(event) {
  switch (currentCoord.y % 2 == 1) {
    case true:
      if ((bothShadePref == true) || ((ink1Selected == false) && (event.buttons == 1)) || ((ink1Selected == true) && (event.buttons == 2))) {
        thisLightMark(event);
        mosaicLightSym(event);
      } else {
        dudMark(event)
      }
      break;

    case false:
      if ((bothShadePref == true) || ((ink1Selected == true) && (event.buttons == 1)) || ((ink1Selected == false) && (event.buttons == 2))) {
        thisDarkMark(event);
        mosaicDarkSym(event);
      } else {
        dudMark(event)
      }
      break;
  }
};;

function mosaicHorzLightFirstLM(event) {
  switch (currentCoord.y % 2 == 0) {
    case true:
      if ((bothShadePref == true) || ((ink1Selected == false) && (event.buttons == 1)) || ((ink1Selected == true) && (event.buttons == 2))) {
        thisLightMark(event);
        mosaicLightSym(event);
      } else {
        dudMark(event)
      }
      break;

    case false:
      if ((bothShadePref == true) || ((ink1Selected == true) && (event.buttons == 1)) || ((ink1Selected == false) && (event.buttons == 2))) {
        thisDarkMark(event);
        mosaicDarkSym(event);
      } else {
        dudMark(event)
      }
      break;
  }
};;

// Vert Light Marks
function mosaicVertDarkFirstLM(event) {
  switch (currentCoord.x % 2 == 1) {
    case true:
      if ((bothShadePref == true) || ((ink1Selected == true) && (event.buttons == 2)) || ((ink1Selected == false) && (event.buttons == 1))) {
        switch (currentCoord.y % 2 == 1) {
          case true:
            thisLightMark(event)
            mosaicLightSym(event)
            break;

          case false:
            thisLightMark(event)
            mosaicLightSym(event)
            mosaicUpLightMark(event)
            mosaicDownLightMark(event)
            break;
        }
      } else {
        dudMark(event)
      }
      break;

    case false:
      mosaicVertDarkFirstDM(event)
      break;
  }
};

function mosaicVertLightFirstLM(event) {
  switch (currentCoord.x % 2 == 0) {
    case true:
      if ((bothShadePref == true) || ((ink1Selected == true) && (event.buttons == 2)) || ((ink1Selected == false) && (event.buttons == 1))) {
        switch (currentCoord.y % 2 == 0) {
          case true:
            thisLightMark(event)
            mosaicLightSym(event)
            break;

          case false:
            thisLightMark(event)
            mosaicLightSym(event)
            mosaicUpLightMark(event)
            mosaicDownLightMark(event)
            break;
        }
      } else {
        dudMark(event)
      }
      break;

    case false:
      mosaicVertLightFirstDM(event)
      break;
  }
};

// Dark Hatch Light Marks
function mosaicDarkHatchDarkFirstLM(event) {
  switch ((currentCoord.y % 2 == 1) || (currentCoord.x % 2 == 1)) {
    case true:
      switch (currentCoord.y % 2 == 1) {
        case true:
          if ((bothShadePref == true) || ((ink1Selected == false) && (event.buttons == 1)) || ((ink1Selected == true) && (event.buttons == 2))) {
            thisLightMark(event);
            mosaicLightSym(event);
          } else {
            dudMark(event)
          }
          break;

        case false:
          if ((bothShadePref == true) || ((ink1Selected == false) && (event.buttons == 1)) || ((ink1Selected == true) && (event.buttons == 2))) {
            thisLightMark(event);
            mosaicLightSym(event);
            mosaicUpLightMark(event);
            mosaicDownLightMark(event);
          } else {
            dudMark(event)
          }
          break;
      }
      break;

    case false:
      if ((bothShadePref == true) || ((ink1Selected == true) && (event.buttons == 1)) || ((ink1Selected == false) && (event.buttons == 2))) {
        thisDarkMark(event);
        mosaicDarkSym(event);
      } else {
        dudMark(event)
      }
      break;
  }
};

function mosaicDarkHatchLightFirstLM(event) {
  switch ((currentCoord.y % 2 == 0) && (currentCoord.x % 2 == 0)) {
    case true:
      if ((bothShadePref == true) || ((ink1Selected == false) && (event.buttons == 1)) || ((ink1Selected == true) && (event.buttons == 2))) {
        thisLightMark(event);
        mosaicLightSym(event);
      } else {
        dudMark(event)
      }
      break;

    case false:
      if ((bothShadePref == true) || ((ink1Selected == true) && (event.buttons == 1)) || ((ink1Selected == false) && (event.buttons == 2))) {
        thisDarkMark(event);
        mosaicDarkSym(event);
      } else {
        dudMark(event)
      }
      break;
  }
};

// Light Hatch Light Marks
function mosaicLightHatchDarkFirstLM(event) {
  switch ((currentCoord.y % 2 == 1) && (currentCoord.x % 2 == 1)) {
    case true:
      if ((bothShadePref == true) || ((ink1Selected == false) && (event.buttons == 1)) || ((ink1Selected == true) && (event.buttons == 2))) {
        thisLightMark(event);
        mosaicLightSym(event);
      } else {
        dudMark(event)
      }
      break;

    case false:
      if ((bothShadePref == true) || ((ink1Selected == true) && (event.buttons == 1)) || ((ink1Selected == false) && (event.buttons == 2))) {
        thisDarkMark(event);
        mosaicDarkSym(event);
      } else {
        dudMark()
      }
      break;
  }
};

function mosaicLightHatchLightFirstLM(event) {
  switch ((currentCoord.y % 2 == 0) || (currentCoord.x % 2 == 0)) {
    case true:

      switch (currentCoord.y % 2 == 0) {
        case true:
          if ((bothShadePref == true) || ((ink1Selected == false) && (event.buttons == 1)) || ((ink1Selected == true) && (event.buttons == 2))) {
            thisLightMark(event);
            mosaicLightSym(event);
          } else {
            dudMark()
          }
          break;
        case false:
          if ((bothShadePref == true) || ((ink1Selected == false) && (event.buttons == 1)) || ((ink1Selected == true) && (event.buttons == 2))) {
            thisLightMark(event);
            mosaicLightSym(event);
            mosaicUpLightMark(event);
            mosaicDownLightMark(event);
          } else {
            dudMark()
          }
          break;
      }
      break;

    case false:
      if ((bothShadePref == true) || ((ink1Selected == true) && (event.buttons == 1)) || ((ink1Selected == false) && (event.buttons == 2))) {
        thisDarkMark(event);
        mosaicDarkSym(event);
      } else {
        dudMark()
      }
      break;
  }
};

///

function mosaicDarkMark(event) {

  switch (toolPicked) {
    case 0:
      thisDarkMark(event)
      mosaicDarkSym(event)
      break;
    case 1:
      switch (firstColor) {
        case 1:
          switch (shadeType) {
            case 2:
              mosaicVertDarkFirstDM(event);
              break;

            case 1:
              mosaicHorzDarkFirstDM(event);
              break;

            case 0:
              mosaicDarkHatchDarkFirstDM(event);
              break;

          }

          break;

        case 2:
          switch (shadeType) {
            case 2:
              mosaicVertLightFirstDM(event);
              break;

            case 1:
              mosaicHorzLightFirst(DMevent);
              break;

            case 0:
              mosaicLightHatchLightFirstDM(event);
              break;
          }
          break;
      }
      break;
  }
};

function mosaicLightMark(event) {

  switch (toolPicked) {
    case 0:
      thisLightMark(event)
      mosaicLightSym(event)
      break;
    case 1:
      switch (firstColor) {
        case 1:

          switch (shadeType) {
            case 2:
              mosaicVertDarkFirstLM(event);
              break;

            case 1:
              mosaicHorzDarkFirstLM(event);
              break;

            case 0:
              mosaicDarkHatchDarkFirstLM(event);
              break;

          }

          break;

        case 2:
          switch (shadeType) {
            case 2:
              mosaicVertLightFirstLM(event);
              break;

            case 1:
              mosaicHorzLightFirstLM(event);
              break;

            case 0:
              mosaicLightHatchLightFirstLM(event);
              break;
          }
          break;
      }
      break;
  }
};

function mosaicDarkSym(event) {
  switch (symmetry) {
    case 1:
      horzDarkMark(event);
      break;

    case 2:
      vertDarkMark(event);
      break;

    case 3:
      horzDarkMark(event);
      vertDarkMark(event);
      bothDarkMark(event);
      break;
  }
};

function mosaicLightSym(event) {
  switch (symmetry) {
    case 1:
      horzLightMark(event);
      break;

    case 2:
      vertLightMark(event);
      break;

    case 3:
      horzLightMark(event);
      vertLightMark(event);
      bothLightMark(event);
      break;
  }
};

function mosaicUpLightMark(event) {
  thisUpLightMark(event)
  switch (symmetry) {
    case 1:
      horzUpLightMark(event);
      horzLightMark(event);
      break;

    case 2:
      vertUpLightMark(event);
      vertLightMark(event);
      break;

    case 3:
      horzUpLightMark(event);
      vertUpLightMark(event);
      bothUpLightMark(event);

      horzLightMark(event);
      vertLightMark(event);
      bothLightMark(event);
      break;
  };
};

function mosaicDownLightMark(event) {
  thisDownLightMark(event)
  switch (symmetry) {
    case 1:
      horzDownLightMark(event);
      horzLightMark(event);
      break;

    case 2:
      vertDownLightMark(event);
      vertLightMark(event);
      break;

    case 3:
      horzDownLightMark(event);
      vertDownLightMark(event);
      bothDownLightMark(event);

      horzLightMark(event);
      vertLightMark(event);
      bothLightMark(event);
      break;
  };
};

function mosaicUpDarkMark(event) {
  thisUpDarkMark(event)
  switch (symmetry) {
    case 1:
      horzUpDarkMark(event);
      horzDarkMark(event);
      break;

    case 2:
      vertUpDarkMark(event);
      vertDarkMark(event);
      break;

    case 3:
      horzUpDarkMark(event);
      vertUpDarkMark(event);
      bothUpDarkMark(event);

      horzDarkMark(event);
      vertDarkMark(event);
      bothDarkMark(event);
      break;
  };
};

function mosaicDownDarkMark(event) {
  thisDownDarkMark(event)
  switch (symmetry) {
    case 1:
      horzDownDarkMark(event);
      horzDarkMark(event);
      break;

    case 2:
      vertDownDarkMark(event);
      vertDarkMark(event);
      break;

    case 3:
      horzDownDarkMark(event);
      vertDownDarkMark(event);
      bothDownDarkMark(event);

      horzDarkMark(event);
      vertDarkMark(event);
      bothDarkMark(event);
      break;
  };
};

//// Graph Marks ////

//// Dud ////
function dudMark(event) {
  ctx.fillStyle = 'rgba(0,0,0,0)'
  ctx.fillRect(0, 0, 1, 1);
  reposition(event);
};

//// This Graph Marks ////
// This
function thisDarkMark(event) {
  ctx.fillStyle = ink1
  ctx.fillRect(thisMark.x, thisMark.y, 8, 8);
  reposition(event);

  if (overFrontGraph == true) {
    ctxThumb.fillStyle = ink1
    ctxThumb.fillRect(thisMark.x / 8, thisMark.y / 8, 1, 1);
    reposition(event);
  }
};

function thisLightMark(event) {
  ctx.fillStyle = ink2
  ctx.fillRect(thisMark.x, thisMark.y, 8, 8);
  reposition(event);

  if (overFrontGraph == true) {
    ctxThumb.fillStyle = ink2
    ctxThumb.fillRect(thisMark.x / 8, thisMark.y / 8, 1, 1);
    reposition(event);
  }
};

// Horz
function horzDarkMark(event) {
  ctx.fillStyle = ink1
  ctx.fillRect(horzMark.x, horzMark.y, 8, 8);
  reposition(event);

  if (overFrontGraph == true) {
    ctxThumb.fillStyle = ink1
    ctxThumb.fillRect(horzMark.x / 8, horzMark.y / 8, 1, 1);
    reposition(event);
  }
};

function horzLightMark(event) {
  ctx.fillStyle = ink2
  ctx.fillRect(horzMark.x, horzMark.y, 8, 8);
  reposition(event);

  if (overFrontGraph == true) {
    ctxThumb.fillStyle = ink2
    ctxThumb.fillRect(horzMark.x / 8, horzMark.y / 8, 1, 1);
    reposition(event);
  }
};

// Vert
function vertDarkMark(event) {
  ctx.fillStyle = ink1
  ctx.fillRect(vertMark.x, vertMark.y, 8, 8);
  reposition(event);

  if (overFrontGraph == true) {
    ctxThumb.fillStyle = ink1
    ctxThumb.fillRect(vertMark.x / 8, vertMark.y / 8, 1, 1);
    reposition(event);
  }
};

function vertLightMark(event) {
  ctx.fillStyle = ink2
  ctx.fillRect(vertMark.x, vertMark.y, 8, 8);
  reposition(event);

  if (overFrontGraph == true) {
    ctxThumb.fillStyle = ink2
    ctxThumb.fillRect(vertMark.x / 8, vertMark.y / 8, 1, 1);
    reposition(event);
  }
};

// Horz + Vert
function bothDarkMark(event) {
  ctx.fillStyle = ink1
  ctx.fillRect(bothMark.x, bothMark.y, 8, 8);
  reposition(event);

  if (overFrontGraph == true) {
    ctxThumb.fillStyle = ink1
    ctxThumb.fillRect(bothMark.x / 8, bothMark.y / 8, 1, 1);
    reposition(event);
  }
};

function bothLightMark(event) {
  ctx.fillStyle = ink2
  ctx.fillRect(bothMark.x, bothMark.y, 8, 8);
  reposition(event);

  if (overFrontGraph == true) {
    ctxThumb.fillStyle = ink2
    ctxThumb.fillRect(bothMark.x / 8, bothMark.y / 8, 1, 1);
    reposition(event);
  }
};

//// Other Graph Graph Marks ////

// This
function thisDarkMarkOther(event) {
  ctxOther.fillStyle = ink1
  ctxOther.fillRect(thisMarkOther.x, thisMarkOther.y, -8, -8);
  reposition(event);

  if (overFrontGraph == false) {
    ctxThumb.fillStyle = ink1
    ctxThumb.fillRect(thisMarkOther.x / 8, thisMarkOther.y / 8, -1, -1);
    reposition(event);
  }
};

function thisLightMarkOther(event) {
  ctxOther.fillStyle = ink2
  ctxOther.fillRect(thisMarkOther.x, thisMarkOther.y, -8, -8);
  reposition(event);

  if (overFrontGraph == false) {
    ctxThumb.fillStyle = ink2
    ctxThumb.fillRect(thisMarkOther.x / 8, thisMarkOther.y / 8, -1, -1);
    reposition(event);
  }
};

// Horz
function horzDarkMarkOther(event) {
  ctxOther.fillStyle = ink1
  ctxOther.fillRect(horzMarkOther.x, horzMarkOther.y, 8, 8);
  reposition(event);

  if (overFrontGraph == false) {
    ctxThumb.fillStyle = ink1
    ctxThumb.fillRect(horzMarkOther.x / 8, horzMarkOther.y / 8, 1, 1);
    reposition(event);
  }
};

function horzLightMarkOther(event) {
  ctxOther.fillStyle = ink2
  ctxOther.fillRect(horzMarkOther.x, horzMarkOther.y, 8, 8);
  reposition(event);

  if (overFrontGraph == false) {
    ctxThumb.fillStyle = ink2
    ctxThumb.fillRect(horzMarkOther.x / 8, horzMarkOther.y / 8, 1, 1);
    reposition(event);
  }
};

// Vert
function vertDarkMarkOther(event) {
  ctxOther.fillStyle = ink1
  ctxOther.fillRect(vertMarkOther.x, vertMarkOther.y, 8, 8);
  reposition(event);

  if (overFrontGraph == false) {
    ctxThumb.fillStyle = ink1
    ctxThumb.fillRect(vertMarkOther.x / 8, vertMarkOther.y / 8, 1, 1);
    reposition(event);
  }
};

function vertLightMarkOther(event) {
  ctxOther.fillStyle = ink2
  ctxOther.fillRect(vertMarkOther.x, vertMarkOther.y, 8, 8);
  reposition(event);

  if (overFrontGraph == false) {
    ctxThumb.fillStyle = ink2
    ctxThumb.fillRect(vertMarkOther.x / 8, vertMarkOther.y / 8, 1, 1);
    reposition(event);
  }
};

// Horz + Vert
function bothDarkMarkOther(event) {
  ctxOther.fillStyle = ink1
  ctxOther.fillRect(bothMarkOther.x, bothMarkOther.y, 8, 8);
  reposition(event);

  if (overFrontGraph == false) {
    ctxThumb.fillStyle = ink1
    ctxThumb.fillRect(bothMarkOther.x / 8, bothMarkOther.y / 8, 1, 1);
    reposition(event);
  }
};

function bothLightMarkOther(event) {
  ctxOther.fillStyle = ink2
  ctxOther.fillRect(bothMarkOther.x, bothMarkOther.y, 8, 8);
  reposition(event);

  if (overFrontGraph == false) {
    ctxThumb.fillStyle = ink2
    ctxThumb.fillRect(bothMarkOther.x / 8, bothMarkOther.y / 8, 1, 1);
    reposition(event);
  }
};

//// Mosaic Specific Graph Marks ////

//// UP MARKS ////

// This

function thisUpDarkMark(event) {
  ctx.fillStyle = ink1
  ctx.fillRect(thisUpMark.x, thisUpMark.y, 8, 8);
  reposition(event);
};

function thisUpLightMark(event) {
  ctx.fillStyle = ink2
  ctx.fillRect(thisUpMark.x, thisUpMark.y, 8, 8);
  reposition(event);
};

// Horz;

function horzUpDarkMark(event) {
  ctx.fillStyle = ink1
  ctx.fillRect(horzUpMark.x, horzUpMark.y, 8, 8);
  reposition(event);
};

function horzUpLightMark(event) {
  ctx.fillStyle = ink2
  ctx.fillRect(horzUpMark.x, horzUpMark.y, 8, 8);
  reposition(event);
};

// Vert

function vertUpDarkMark(event) {
  ctx.fillStyle = ink1
  ctx.fillRect(vertUpMark.x, vertUpMark.y, 8, 8);
  reposition(event);
};

function vertUpLightMark(event) {
  ctx.fillStyle = ink2
  ctx.fillRect(vertUpMark.x, vertUpMark.y, 8, 8);
  reposition(event);
};

// Horz + Vert

function bothUpDarkMark(event) {
  ctx.fillStyle = ink1
  ctx.fillRect(bothUpMark.x, bothUpMark.y, 8, 8);
  reposition(event);
};

function bothUpLightMark(event) {
  ctx.fillStyle = ink2
  ctx.fillRect(bothUpMark.x, bothUpMark.y, 8, 8);
  reposition(event);
};

//// DOWN MARKS ////

// This

function thisDownDarkMark(event) {
  ctx.fillStyle = ink1
  ctx.fillRect(thisDownMark.x, thisDownMark.y, 8, 8);
  reposition(event);
};

function thisDownLightMark(event) {
  ctx.fillStyle = ink2
  ctx.fillRect(thisDownMark.x, thisDownMark.y, 8, 8);
  reposition(event);
};

// Horz

function horzDownDarkMark(event) {
  ctx.fillStyle = ink1
  ctx.fillRect(horzDownMark.x, horzDownMark.y, 8, 8);
  reposition(event);
};

function horzDownLightMark(event) {
  ctx.fillStyle = ink2
  ctx.fillRect(horzDownMark.x, horzDownMark.y, 8, 8);
  reposition(event);
};

// Vert

function vertDownDarkMark(event) {
  ctx.fillStyle = ink1
  ctx.fillRect(vertDownMark.x, vertDownMark.y, 8, 8);
  reposition(event);
};

function vertDownLightMark(event) {
  ctx.fillStyle = ink2
  ctx.fillRect(vertDownMark.x, vertDownMark.y, 8, 8);
  reposition(event);
};

// Horz + Vert

function bothDownDarkMark(event) {
  ctx.fillStyle = ink1
  ctx.fillRect(bothDownMark.x, bothDownMark.y, 8, 8);
  reposition(event);
};

function bothDownLightMark(event) {
  ctx.fillStyle = ink2
  ctx.fillRect(bothDownMark.x, bothDownMark.y, 8, 8);
  reposition(event);
};

// Undo Functions
function saveUndoState() {

  // Remove redo states
  redoState = []

  // Get and Save Pattern Array
  getPatternArray()
  drawThumbnailGraph()
  undoState.push(patternArray)
};

function loadUndoState() {

  if (undoState.length > 0) {

    // Add Redo State
    getPatternArray()
    redoState.push(patternArray)

    //Load undo state
    thisArray = []
    thisArray = undoState[undoState.length - 1]
    for (let x = 0, row = 0; x <= thisArray.length - 1; x++, row++) {
      for (let y = 0; y <= innerHeight - 1; y++, x++) {
        cCell = Number(thisArray[x])
        switch (cCell) {
          case 1:
            ctx.fillStyle = ink1
            ctx.fillRect(row * 8, y * 8, 8, 8)
            break;
          case 0:
            ctx.fillStyle = ink2
            ctx.fillRect(row * 8, y * 8, 8, 8)
            break;
        }
      }
    }

    // BoW
    if (selectedStyle == 1) {
      drawReverseGraph()
    }

    // Unload Used State
    undoState.pop()

    getPatternArray()
    drawThumbnailGraph()
  }
};

// Redo Functions
function loadRedoState() {
  if (redoState.length > 0) {

    // Add undo state
    getPatternArray()
    undoState.push(patternArray)

    // Load redo state
    thisArray = []
    thisArray = redoState[redoState.length - 1]
    for (let x = 0, row = 0; x <= thisArray.length - 1; x++, row++) {
      for (let y = 0; y <= innerHeight - 1; y++, x++) {
        cCell = Number(thisArray[x])
        switch (cCell) {
          case 1:
            ctx.fillStyle = ink1
            ctx.fillRect(row * 8, y * 8, 8, 8)
            break;
          case 0:
            ctx.fillStyle = ink2
            ctx.fillRect(row * 8, y * 8, 8, 8)
            break;
        }
      }
    }

    // BoW
    if (selectedStyle == 1) {
      drawReverseGraph()
    }

    redoState.pop()
    getPatternArray()
    drawThumbnailGraph()

  }
};

// Front or Back of pattern detection

function setToFront() {
  overFrontGraph = true
  // 
};

function setToBack() {
  overFrontGraph = false
  // 
};

// Landing Functions
function landingToggle() {
  switch (landingOpen) {
    case true:
      landing = document.getElementById('landing').style;
      landing.display = 'none';
      uiOpen = false
      landingOpen = true
      break;
    case false:
      landing = document.getElementById('landing').style;
      landing.display = '';
      uiOpen = false
      landingOpen = true
      break;
  }

};

// Options Functions

function openMenu() {
  if (toolOptionOpen == true) {
    toolOption()
  }
  document.getElementById('toolOptionDown').style.zIndex = '2';
  document.getElementById('landing').style.zIndex = '20';
  document.getElementById('landing').style.display = ''
  uiOpen = true
};

// Save Graph
function saveGraph() {
  if (patternName == "") {
    toggleSaveAsMenu();
    
    return;
  }
  color1 = ink1;
  color2 = "";
  color3 = ink2;

  // gauge = document.getElementById('gaugeDropDown').selectedIndex

  // interiorColor = document.getElementById('interiorColorDropDown').selectedIndex

  hueDark = hueDarkSliderVal
  satDark = satDarkSliderVal
  lightDark = lightDarkSliderVal

  hueLight = hueLightSliderVal
  satLight = satLightSliderVal
  lightLight = lightLightSliderVal

  version = document.getElementById('versionLabel').innerHTML

  getPatternArray()

  graphSave = selectedStyle + "/" +
    gauge + "/" +
    innerWidth + "/" +
    innerHeight + "/" +
    firstColor + "/" +
    interiorColor + "/" +
    ink1 + "/" +
    color2 + "/" +
    ink2 + "/" +
    patternArray + "/" +
    unit + "/" +
    hueDark + "/" +
    satDark + "/" +
    lightDark + "/" +
    hueLight + "/" +
    satLight + "/" +
    lightLight + "/" +
    version

  saveAs(graphSave, patternName + ".idpat")
};

function saveAsIdpat() {

}

// Load Graph
async function setVarFromLoad(lines) {
  selectedStyle = Number(lines[0])

  gauge = lines[1]

  innerWidth = Number(lines[2])
  innerHeight = Number(lines[3])

  firstColor = Number(lines[4]);
  interiorColor = Number(lines[5]);

  document.getElementById('ink1PickHeader').style.backgroundColor = lines[6];
  ink1 = lines[6];
  document.getElementById('ink2PickHeader').style.backgroundColor = lines[8];
  ink2 = lines[8];

  unit = Number(lines[10]);
  hueDarkSliderVal = Number(lines[11])
  HTMLMenuElement
  satDarkSliderVal = Number(lines[12])
  lightDarkSliderVal = Number(lines[13])
  hueLightSliderVal = Number(lines[14])
  satLightSliderVal = Number(lines[15])
  lightLightSliderVal = Number(lines[16])

  document.getElementById('hueSlider').value = hueDarkSliderVal
  document.getElementById('saturationSlider').value = satDarkSliderVal
  document.getElementById('lightnessSlider').value = lightDarkSliderVal

  patternArray = lines[9].split(",")

  drawToolButtons()
  changeToolDropdown()
}

async function loadPattern() {

  var [fileInput] = document.querySelector('#patternUpload').files;
  var text
  var old

  txtReader.addEventListener("load", async () => {
    text = txtReader.result;

    if (text.search("-") >= 0) {

      old = true

      newS = text.replace(/-/g, "");
      // text2 = text2.replace(/||•/g, "");
      newS = newS.replace(/\|/g, ",");
      newS = newS.replace(/\u2022/g, "/");
      newS = newS.replace(/\/,/g, "/");
      newS = newS.replace(/,\//g, "/");

      const lines = newS.split("/");

      // Set Values From IDPAT
      await setVarFromLoad(lines)

    } else {

      old = false
      const lines = text.split("/");

      // Set Values From IDPAT
      await setVarFromLoad(lines)
    }

    document.getElementById('saveLanding').style.display = "";
    document.getElementById('continueLanding').style.display = "";

    if (patternLoaded == true) {
      switch (stitchesLoaded) {
        case true:
          switch (stitchesVisible) {
            case true:
              await stitchesChange();
              break;
          }
          stitchesLoaded = false
          break;
      }
      switch (gridLinesVisible) {
        case true:
          await gridLineChange();
          break;
      }
    }

    graphWidth = innerWidth * 8
    graphHeight = innerHeight * 8

    newPatternOpen = false

    await nameElem()
    await setElem()

    let row = 0

    if (!old) {
      for (let x = 0; x <= patternArray.length - 1; x++) {
        for (let y = 0; y <= innerHeight - 1; y++, x++) {
          cCell = Number(patternArray[x])
          switch (cCell) {
            case 1:
              ctx.fillStyle = ink1
              ctx.fillRect(row * 8, y * 8, 8, 8)
              break;
            case 2:
              ctx.fillStyle = greyColor
              ctx.fillRect(row * 8, y * 8, 8, 8)
              break;
            case 0:
              ctx.fillStyle = ink2
              ctx.fillRect(row * 8, y * 8, 8, 8)
              break;

          }
        }
        row++
      }
    } else {
      for (let y = 0; y <= patternArray.length - 1; y++) {
        for (let x = 0; x <= innerWidth - 1; y++, x++) {
          cCell = Number(patternArray[y])
          switch (cCell) {
            case 1:
              ctx.fillStyle = ink1
              ctx.fillRect(x * 8, row * 8, 8, 8)
              break;
            case 2:
              ctx.fillStyle = greyColor
              ctx.fillRect(x * 8, row * 8, 8, 8)
              break;
            case 0:
              ctx.fillStyle = ink2
              ctx.fillRect(x * 8, row * 8, 8, 8)
              break;

          }
        }
        row++
      }
    }

    await redrawResizeBorders()

    await drawGrids();
    await drawSymmetry();
    await landingToggle()
    await unitChange();
    await detectSize();
    await detectStitches();
    await footerChange();
    await drawReverseGraph();

    if (toolOptionOpen == true) {
      await toolOption()
    }

    document.getElementById('continueLanding').disabled = false;

  }, false);

  if (fileInput) {
    txtReader.readAsText(fileInput);
  }

  patternLoaded = true;
  newPatternOpen = false
  await footerChange();
  await uiClick()
  await uiClick()
  await getPatternArray()
  await drawThumbnailGraph()
  await hueChange()
  await drawToolButtons()
  await changeToolDropdown()

  document.getElementById("solidTool").style.backgroundColor = ink1
  if (ink1Selected) {
    toolOption()
    return
  } else {
    ink1Selected = true;

    if (document.getElementById("solidTool").style.border != "") {
      document.getElementById("solidTool").style.border = "medium dashed " + ink2;
    }
    document.getElementById("ink1PickHeader").style.border = "medium dashed " + ink2;
    document.getElementById("ink2PickHeader").style.border = "";
    
    
    document.getElementById('hueSlider').value = hueDarkSliderVal
    document.getElementById('saturationSlider').value = satDarkSliderVal
    document.getElementById('lightnessSlider').value = lightDarkSliderVal
    
    document.getElementById("solidTool").style.backgroundColor = ink1
    document.getElementById("shadeTool").style.backgroundImage = "linear-gradient(180deg, " + ink1 + " 0%, " + ink2 + "100%)"
    
    await hueChange()
    await drawToolButtons()
    await changeToolDropdown()
  }

  zoomGraph(5)
  document.getElementById("saveLanding").disabled = false
  document.getElementById("continueLanding").disabled = false

  // await console.log("Style: "+ selectedStyle +"\nGauge: "+ gauge +"\nSize: "+ size +"\nWidth: "+ innerWidth +"\nHeight: "+ innerHeight +"\nFirst Color: "+ firstColor +"\nInterior Color Color: "+ interiorColor)
};

function unitChange() {
  switch (unit) {
    case 0:
      getInches()
      break;
    case 1:
      getCentimetres()
      break;
  }
};
function detectSize() {

  var wInch
  var hInch

  if (gauge == 1) {
    wInch = innerWidth / 4;
    hInch = innerHeight / 4;
  } else if (gauge == 2) {
    wInch = innerWidth / 5;
    hInch = innerHeight / 5;
  };


  if (wInch >= 36 && wInch <= 45 && hInch >= 36 && hInch <= 45) {
    size = "Toddler";
    return;
  } else if (wInch >= 45 && wInch <= 65 && hInch >= 45 && hInch <= 65) {
    size = "Throw";
    return;
  } else if (wInch >= 36 && wInch <= 54 && hInch >= 75 && hInch <= 80) {
    size = "Twin";
    return;
  } else if (wInch >= 54 && wInch <= 60 && hInch >= 75 && hInch <= 80) {
    size = "Full";
    return;
  } else if (wInch >= 60 && wInch <= 80 && hInch >= 80 && hInch <= 90) {
    size = "Queen";
    return;
  } else if (wInch >= 72 && wInch <= 92 && hInch >= 80 && hInch <= 100) {
    size = "King";
    return;
  } else {
    size = "Custom";
    return;
  }
};
function getInches() {

  var pxSizeFooter = document.getElementById('pxSizeFooter');
  var inchSizeFooter = document.getElementById('inchSizeFooter');


  if (gauge == 1) {
    wInch = Math.round(innerWidth / 4);
    hInch = Math.round(innerHeight / 4);
  } else if (gauge == 2) {
    wInch = Math.round(innerWidth / 5);
    hInch = Math.round(innerHeight / 5);
  };


  if (smallScreen != true) {

    if (innerWidth != 0 && innerHeight != 0) {
      pxSizeFooter.innerHTML = "Stitches: " + innerWidth + " x " + innerHeight;
      inchSizeFooter.innerHTML = "Inches: " + wInch + " x " + hInch
    }
  } else {

    if (innerWidth != 0 && innerHeight != 0) {
      pxSizeFooter.innerHTML = "STs: " + innerWidth + " x " + innerHeight;
      inchSizeFooter.innerHTML = "In: " + wInch + " x " + hInch
    }
  }
};

function getCentimetres() {

  var pxSizeFooter = document.getElementById('pxSizeFooter');
  var inchSizeFooter = document.getElementById('inchSizeFooter');

  if (gauge == 1) {
    wInch = (innerWidth / 4);
    hInch = (innerHeight / 4);
  } else if (gauge == 2) {
    wInch = (innerWidth / 5);
    hInch = (innerHeight / 5);
  };

  wCM = Math.round(wInch * 2.54)
  hCM = Math.round(hInch * 2.54)

  if (smallScreen != true) {

    if (innerWidth != 0 && innerHeight != 0) {
      pxSizeFooter.innerHTML = "Stitches: " + innerWidth + " x " + innerHeight;
      inchSizeFooter.innerHTML = "CM: " + wCM + " x " + hCM
    }
  } else {

    if (innerWidth != 0 && innerHeight != 0) {
      pxSizeFooter.innerHTML = "STs: " + innerWidth + " x " + innerHeight;
      inchSizeFooter.innerHTML = "Cm: " + wCM + " x " + hCM
    }
  }
};

async function loadImage() {
  const imageInput = document.querySelector('#imageUpload');

  await imageInput.addEventListener("change", async function () {
    const imgReader = new FileReader()

    imgReader.addEventListener("load", async () => {
      const uploadedImage = imgReader.result;
      const imageImport = document.getElementById('importImageHolder')
      imageImport.src = `${uploadedImage}`

      importCanvas = document.getElementById("importHolder")

      importCanvas.width = imageImport.naturalWidth
      importCanvas.height = imageImport.naturalHeight

      document.getElementById('gaugeDropDown').selectedIndex = 1
      gauge = document.getElementById('gaugeDropDown').selectedIndex

      if (document.getElementById("impWidth").value % 2 == 0) {
        document.getElementById("impWidth").value++
      }

      if (document.getElementById("impHeight").value % 2 == 0) {
        document.getElementById("impHeight").value++
      }

      oldHeight = imageImport.naturalHeight
      oldWidth = imageImport.naturalWidth

      impRatio = oldWidth / oldHeight
      await impVariableSet(1);
      await importColorDetection();

      await getInches();

      document.getElementById('imageReuploadLabel').innerHTML = "New Image"

    });
    imgReader.readAsDataURL(this.files[0]);
  });
  await firstImportSizeChange()
}

function firstImportSizeChange() {
  document.getElementById("impWidth").value = 301
  getPxImp()
}

function loadImpLvl1() {
  document.querySelector("#impLvl1").style.display = "block"
}

function loadImpLvl2() {
  document.querySelector("#impLvl2").style.display = "block"
}

// Imported Image Functions
function importColorDetection() {
  imageImport = document.getElementById('importImageHolder')
  importCanvas = document.getElementById("importHolder")

  ctxImport = importCanvas.getContext("2d", { willReadFrequently: true })

  for (let x = 0; x <= innerHeight - 1; x++) {
    for (let y = 0; y <= innerWidth - 1; y++) {
      imPixel = ctxImport.getImageData(y, x, 1, 1).data;
      imPixelColor = "rgb(" + imPixel[0] + ', ' + imPixel[1] + ', ' + imPixel[2] + ")"

      if (!impColorArray.includes(imPixelColor)) {
        impColorArray.push(imPixelColor);
      }
      if (impColorArray.length >= 3) break;
    }
    if (impColorArray.length >= 3) break;
  }

  nameElem()
  setElem()
  if (impColorArray.length >= 3) {
    impImageStandin()
  }
  importToCanvas()
};

function fixImpInput() {
  if (document.getElementById("impWidth").value % 2 != 1) {
    document.getElementById("impWidth").value++
  }

  if (document.getElementById("impHeight").value % 2 != 1) {
    document.getElementById("impHeight").value++
  }
};

function impVariableSet(x) {
  if (x != 0) {
    document.getElementById("impWidth").value = 301
    setWidthImp(document.getElementById("impWidth").value)
  }
  innerWidth = document.getElementById("impWidth").value
  innerHeight = document.getElementById("impHeight").value

  graphWidth = innerWidth * 8
  graphHeight = innerHeight * 8

  previewGraph = document.getElementById("previewGraph");
  previewTicking = document.getElementById("previewTicking");
  previewGraphContainer = document.getElementById("previewGraphContainer");
  previewTickingContainer = document.getElementById("previewTickingContainer");
  previewGraphCtx = previewGraph.getContext("2d", { willReadFrequently: true });

  correctImpUI()

  document.querySelector("#impUploadCanvas").style.paddingTop = "15px"
  document.querySelector("#impUploadCanvas").style.marginTop = "85px"

  document.querySelector("#importHolder").style.marginTop = "0px"
  document.querySelector(".uploadImageButton").style.display = "none"
  document.querySelector("#imageReuploadLabel").innerHTML = "New Image"

  resetGraphSizeValues()
};

function impRatioFunc(_this) {
  if (_this.checked) {
    impRatioKeep = true
  } else {
    impRatioKeep = false
  }
};

function setFirstColorImp() {
  if (impDarkFirst.checked) {
    firstColor = 1
  } else if (impLightFirst.checked) {
    firstColor = 2
  }
};

function setWidthImp(w) {
  if (impRatioKeep) {
    document.getElementById("impHeight").value = Math.round(w / impRatio)
    innerHeight = document.getElementById("impHeight").value;
    innerWidth = document.getElementById("impWidth").value;
  }
  fixImpInput()

  innerHeight = document.getElementById("impHeight").value;
  innerWidth = document.getElementById("impWidth").value;
  graphWidth = innerWidth * 8;
  impRatioWidth = innerWidth / oldWidth
  impRatioHeight = innerHeight / oldHeight

  impImageStandin()
  impChangeUnits()
  correctImpUI()
};

function setHeightImp(h) {
  if (impRatioKeep) {
    document.getElementById("impWidth").value = Math.round(h * impRatio)
    innerWidth = document.getElementById("impWidth").value;
    innerHeight = document.getElementById("impHeight").value;
  }
  fixImpInput()

  innerHeight = document.getElementById("impHeight").value;
  innerWidth = document.getElementById("impWidth").value;
  graphHeight = innerHeight * 8;
  impRatioWidth = innerWidth / oldWidth
  impRatioHeight = innerHeight / oldHeight
  impImageStandin()
  impChangeUnits()
  correctImpUI()
};

function getPxImp() {
  switch (gauge) {
    case 1:

      switch (unit) {
        case 0:
          document.getElementById("impInchWidth").value = innerWidth / 4
          document.getElementById("impInchHeight").value = innerHeight / 4
          document.getElementById("impInchCm").innerHTML = "Inches"
          document.getElementById("impStitch").style.right = "-5px"
          getInches()
          break;
        case 1:
          document.getElementById("impInchWidth").value = Math.round((innerWidth / 4) * 2.54, 2)
          document.getElementById("impInchHeight").value = Math.round((innerHeight / 4) * 2.54, 2)
          document.getElementById("impInchCm").innerHTML = "CM"
          document.getElementById("impStitch").style.right = "12px"
          getCentimetres()
          break;
      }
      break;
    case 2:
      switch (unit) {
        case 0:
          document.getElementById("impInchWidth").value = innerWidth / 5
          document.getElementById("impInchHeight").value = innerHeight / 5
          document.getElementById("impInchCm").innerHTML = "Inches"
          document.getElementById("impStitch").style.right = "-5px"
          getInches()
          break;
        case 1:
          document.getElementById("impInchWidth").value = Math.round((innerWidth / 5) * 2.54, 2)
          document.getElementById("impInchHeight").value = Math.round((innerHeight / 5) * 2.54, 2)
          document.getElementById("impInchCm").innerHTML = "CM"
          document.getElementById("impStitch").style.right = "12px"
          getCentimetres()
          break;
      }
      break;
  }
}

function newImpUnit() {
  setInchWidthImp(document.getElementById("impWidth").value)
}

function setInchWidthImp(w) {
  if (impRatioKeep) {
    document.getElementById("impInchHeight").value = Math.round(w / impRatio)
  }
  switch (gauge) {
    case 1:
      document.getElementById("impHeight").value = Math.round(document.getElementById("impInchHeight").value * 4);
      document.getElementById("impWidth").value = Math.round(document.getElementById("impInchWidth").value * 4);
      break;
    case 2:
      document.getElementById("impHeight").value = Math.round(document.getElementById("impInchHeight").value * 5);
      document.getElementById("impWidth").value = Math.round(document.getElementById("impInchWidth").value * 5);
      break;
  }

  innerHeight = Math.round(document.getElementById("impHeight").value);
  innerWidth = Math.round(document.getElementById("impWidth").value);

  fixImpInput()

  innerHeight = Math.round(document.getElementById("impHeight").value);
  innerWidth = Math.round(document.getElementById("impWidth").value);
  graphWidth = innerWidth * 8;
  impRatioWidth = innerWidth / oldWidth
  impRatioHeight = innerHeight / oldHeight

  impImageStandin()
  impChangeUnits()
  correctImpUI()
};

function setInchHeightImp(h) {
  if (impRatioKeep) {
    document.getElementById("impInchWidth").value = Math.round(h * impRatio)
  }
  switch (gauge) {
    case 1:
      document.getElementById("impHeight").value = Math.round(document.getElementById("impInchHeight").value * 4)
      document.getElementById("impWidth").value = Math.round(document.getElementById("impInchWidth").value * 4)
      break;
    case 2:
      document.getElementById("impHeight").value = Math.round(document.getElementById("impInchHeight").value * 5)
      document.getElementById("impWidth").value = Math.round(document.getElementById("impInchWidth").value * 5)
      break;

  }

  innerHeight = Math.round(document.getElementById("impHeight").value);
  innerWidth = Math.round(document.getElementById("impWidth").value);

  fixImpInput();

  innerHeight = document.getElementById("impHeight").value;
  innerWidth = document.getElementById("impWidth").value;
  graphHeight = innerHeight * 8;
  impRatioWidth = innerWidth / oldWidth;
  impRatioHeight = innerHeight / oldHeight;

  impImageStandin();
  impChangeUnits();
  correctImpUI();
};

function getInchImp() {

  switch (unit) {
    case 0:
      document.getElementById("impInchCm").innerHTML = "Inches"
      document.getElementById("impStitch").style.right = "7px"
      getInches()
      break;
    case 1:
      document.getElementById("impInchCm").innerHTML = "CM"
      document.getElementById("impStitch").style.right = "25px"
      getCentimetres()
      break;
  }

}

function setColorFromImp() {
  if ((255 - impColorArray[0]) > (255 - impColorArray[1])) {
    ink1 = impColorArray[1]
    ink2 = impColorArray[0]
  } else {
    ink1 = impColorArray[0]
    ink2 = impColorArray[1]
  }
  document.getElementById("ink1PickHeader").style.backgroundColor = ink1
  document.getElementById("ink2PickHeader").style.backgroundColor = ink2
};

function impStyleSelect() {
  if (document.getElementById("impInterlocking").checked) {
    selectedStyle = 1
  } else {
    selectedStyle = 2
  }
};

function impShade() {
  if (importShade == false) {
    document.getElementById("impShadeOptionContainer").style.display = "block"
    importShade = true

  } else {
    document.getElementById("impShadeOptionContainer").style.display = "none"
    importShade = false
  }
};

function impShadeSelect() {
  if (document.getElementById("impHorz").checked) {
    importShadeOption = 1
  } else {
    importShadeOption = 2
  }
};

function impGaugeSelect() {
  if (document.getElementById("imp4x4").checked) {
    gauge = 1
  } else {
    gauge = 2
  }
  impChangeUnits()
};

function impChangeUnits() {
  if (gauge == 1) {
    wInch = Math.round(innerWidth / 4);
    hInch = Math.round(innerHeight / 4);
  } else if (gauge == 2) {
    wInch = Math.round(innerWidth / 5);
    hInch = Math.round(innerHeight / 5);
  };

  if (smallScreen != true) {
    if (innerWidth != 0) {
      innerWidthNum.innerHTML = "Inches: " + wInch;
    };
    if (innerHeight != 0) {
      innerHeightNum.innerHTML = "Inches: " + hInch;
    };

    if (innerWidth != 0 && innerHeight != 0) {
      pxSizeFooter.innerHTML = "Stitches: " + innerWidth + " x " + innerHeight;
      inchSizeFooter.innerHTML = "Inches: " + wInch + " x " + hInch
    }
  } else {
    if (innerWidth != 0) {
      innerWidthNum.innerHTML = "In: " + wInch;
    };
    if (innerHeight != 0) {
      innerHeightNum.innerHTML = "In: " + hInch;
    };

    if (innerWidth != 0 && innerHeight != 0) {
      pxSizeFooter.innerHTML = "STs: " + innerWidth + " x " + innerHeight;
      inchSizeFooter.innerHTML = "In: " + wInch + " x " + hInch
    }
  }
}

function impOpenClose() {
  if (importOpen == false) {

    document.getElementById("importMenu").style.visibility = "visible"
    document.getElementById("importMenu").style.width = "390px"
    document.getElementById("importMenu").style.opacity = "100%"
    importOpen = true

  } else {
    document.getElementById("importMenu").style.visibility = "hidden"
    document.getElementById("importMenu").style.width = "0px"
    document.getElementById("importMenu").style.opacity = "0%"
    importOpen = false
  }
};

function importToCanvas() {
  ctxImport.drawImage(imageImport, 0, 0)
  if (impColorArray.length == 2) {
    setColorFromImp()
  } else {
    importToGreys()
    
  }
  impColorArray = []
};

function impCanvasToGraph() {

  for (let x = 0; x <= innerHeight - 1; x++) {
    for (let y = 0; y <= innerWidth - 1; y++) {
      imPixel = ctxImport.getImageData(y, x, 1, 1).data;
      imPixelColor = "rgb(" + imPixel[0] + ', ' + imPixel[1] + ', ' + imPixel[2] + ")"
      ctx.fillStyle = imPixelColor
      ctx.fillRect(y * 8, x * 8, 8, 8)
    }
  }

  switch (selectedStyle) {
    case 1:

      impInterlocking()
      redrawResizeBorders()
      drawReverseGraph()

      document.getElementById('leftArrowGraph').style.visibility = "visible"
      document.getElementById('rightArrowGraph').style.visibility = "visible"
      break;

    case 2:
      impMosaic()
      redrawResizeBorders()

      document.getElementById('leftArrowGraph').style.visibility = "hidden"
      document.getElementById('rightArrowGraph').style.visibility = "hidden"
      document.getElementById("graph").style.width = "100%"
      document.getElementById("leftArrowGraph").style.right = "1%"
      document.getElementById("graphBack").style.width = "0%"
      document.getElementById("rightArrowGraph").style.left = "100%"
      graphGraphPosition = 2
      break;
  }

  drawGrids()
  drawSymmetry()
  getPatternArray()
  drawThumbnailGraph()
  drawStitchOverlay()
  changeToolDropdown()

  document.getElementById("saveLanding").disabled = false
  document.getElementById("continueLanding").disabled = false

  document.getElementById("cells").addEventListener("mousedown", function () { overFrontGraph = true; startMarking(event) });
  document.getElementById("cells").addEventListener("mouseup", stopMarking);
  patternLoaded = true
  document.getElementById('saveLanding').style.display = "";
  document.getElementById('continueLanding').style.display = "";
};

function impInterlocking() {
  for (let x = 0; x <= innerWidth - 1; x++) {
    for (let y = 0; y <= innerHeight - 1; y++) {
      imPixel = ctx.getImageData(x * 8, y * 8, 1, 1).data
      imPixelColor = "rgb(" + imPixel[0] + ', ' + imPixel[1] + ', ' + imPixel[2] + ")"

      switch (firstColor) {
        case 1:
          if (importShade == true) {
            if (imPixelColor == "rgb(127, 127, 127)") {
              switch (importShadeOption) {
                case 2:
                  if (x % 2 == 0) {
                    ctx.fillStyle = ink1;
                    ctx.fillRect(x * 8, y * 8, 8, 8);
                  } else if (x % 2 != 0) {
                    ctx.fillStyle = ink2;
                    ctx.fillRect(x * 8, y * 8, 8, 8);
                  }
                  break;
                case 1:
                  if (y % 2 == 0) {
                    ctx.fillStyle = ink1;
                    ctx.fillRect(x * 8, y * 8, 8, 8);
                  } else if (y % 2 != 0) {
                    ctx.fillStyle = ink2;
                    ctx.fillRect(x * 8, y * 8, 8, 8);
                  }
                  break;
              }
            }
          }
          if ((x % 2 == 0) && (y % 2 == 0)) {
            ctx.fillStyle = ink1;
            ctx.fillRect(x * 8, y * 8, 8, 8);

          } else if ((x % 2 == 1) && (y % 2 == 1)) {
            ctx.fillStyle = ink2;
            ctx.fillRect(x * 8, y * 8, 8, 8);
          }
          break;

        case 2:
          if (importShade == true) {
            if (imPixelColor == "rgb(127, 127, 127)") {
              switch (importShadeOption) {
                case 2:
                  if (x % 2 != 0) {
                    ctx.fillStyle = ink1;
                    ctx.fillRect(x * 8, y * 8, 8, 8);
                  } else if (x % 2 == 0) {
                    ctx.fillStyle = ink2;
                    ctx.fillRect(x * 8, y * 8, 8, 8);
                  }
                  break;
                case 1:
                  if (y % 2 != 0) {
                    ctx.fillStyle = ink1;
                    ctx.fillRect(x * 8, y * 8, 8, 8);
                  } else if (y % 2 == 0) {
                    ctx.fillStyle = ink2;
                    ctx.fillRect(x * 8, y * 8, 8, 8);
                  }
                  break;
              }
            }
          }
          if ((x % 2 == 1) && (y % 2 == 1)) {
            ctx.fillStyle = ink1;
            ctx.fillRect(x * 8, y * 8, 8, 8);

          } else if ((x % 2 == 0) && (y % 2 == 0)) {
            ctx.fillStyle = ink2;
            ctx.fillRect(x * 8, y * 8, 8, 8);
          }
          break;
      };
    };
  };
};

function impMosaic() {
  for (let x = 1; x <= innerWidth - 2; x++) {
    for (let y = 1; y <= innerHeight - 2; y++) {
      imPixel = ctx.getImageData(x * 8, y * 8, 1, 1).data
      imPixelColor = "rgb(" + imPixel[0] + ', ' + imPixel[1] + ', ' + imPixel[2] + ")"

      imPixelUp = ctx.getImageData(x * 8, (y - 1) * 8, 1, 1).data
      imPixelUpColor = "rgb(" + imPixelUp[0] + ', ' + imPixelUp[1] + ', ' + imPixelUp[2] + ")"

      imPixelDown = ctx.getImageData(x * 8, (y + 1) * 8, 1, 1).data
      imPixelDownColor = "rgb(" + imPixelDown[0] + ', ' + imPixelDown[1] + ', ' + imPixelDown[2] + ")"

      if (importShade == true) {
        if (imPixelColor == "rgb(127, 127, 127)") {
          switch (importShadeOption) {
            case 2:
              if (x % 2 == 0) {
                ctx.fillStyle = ink1;
                ctx.fillRect(x * 8, y * 8, 8, 8);
              } else if (x % 2 != 0) {
                ctx.fillStyle = ink2;
                ctx.fillRect(x * 8, y * 8, 8, 8);
              }
              break;
            case 1:
              if (y % 2 == 0) {
                ctx.fillStyle = ink1;
                ctx.fillRect(x * 8, y * 8, 8, 8);
              } else if (y % 2 != 0) {
                ctx.fillStyle = ink2;
                ctx.fillRect(x * 8, y * 8, 8, 8);
              }
              break;
          }
        }

      }

      if (imPixelColor == "rgb(191, 191, 191)") {
        if ((x % 2 == 0) && (y % 2 == 0)) {
          ctx.fillStyle = ink1;
          ctx.fillRect(x * 8, y * 8, 8, 8);

        } else {
          ctx.fillStyle = ink2;
          ctx.fillRect(x * 8, y * 8, 8, 8);
        }
      } else if (imPixelColor == "rgb(63, 63, 63)") {
        if ((x % 2 == 1) && (y % 2 == 1)) {
          ctx.fillStyle = ink2;
          ctx.fillRect(x * 8, y * 8, 8, 8);

        } else {
          ctx.fillStyle = ink1;
          ctx.fillRect(x * 8, y * 8, 8, 8);
        }
      }

      if ((y % 2 == 1) && (imPixelColor == ink1)) {
        if ((imPixelUpColor == ink1) || (imPixelDownColor == ink1)) {
          if (imPixelUpColor == ink1) {
            ctx.fillStyle = ink1;
            ctx.fillRect(x * 8, (y + 1) * 8, 8, 8)
          } else if (imPixelDownColor == ink1) {
            ctx.fillStyle = ink1;
            ctx.fillRect(x * 8, (y - 1) * 8, 8, 8)
          }
        } else {
          ctx.fillStyle = ink2;
          ctx.fillRect(x * 8, y * 8, 8, 8);
        }
      }
      if ((y % 2 == 0) && (imPixelColor == ink2)) {
        if ((imPixelUpColor == ink2) || (imPixelDownColor == ink2)) {
          if (imPixelUpColor == ink2) {
            ctx.fillStyle = ink2;
            ctx.fillRect(x * 8, (y + 1) * 8, 8, 8)
          } else if (imPixelDownColor == ink2) {
            ctx.fillStyle = ink2;
            ctx.fillRect(x * 8, (y - 1) * 8, 8, 8)
          }
        } else {
          ctx.fillStyle = ink1;
          ctx.fillRect(x * 8, y * 8, 8, 8);
        }
      }
    }
  }
};

function impImageStandin() {
  impStandin = new Image()
  impStandin.src = document.getElementById('importImageHolder').src
  importCanvas = document.getElementById("importHolder")
  ctxImport = importCanvas.getContext("2d", { willReadFrequently: true })

  ctxImport.clearRect(0, 0, ctxImport.width, ctxImport.height)

  importCanvas.width = innerWidth
  importCanvas.height = innerHeight

  ctxImport.scale(impRatioWidth, impRatioHeight)
  ctxImport.drawImage(impStandin, 0, 0)

  importToGreys()

  impColorArray = []

  correctImpUI()

  document.getElementById("greyLevelPercent").innerHTML = "" + Math.round(((document.getElementById("greyRange").value - 20) / 130) * 100) + "%"

};

function correctImpUI() {
  document.querySelector("#impUploadDiv").style.height = 135 + (innerWidth / (innerWidth / innerHeight)) + "px"

  document.querySelector("#impFixedDivider").style.marginTop = 135 + (innerWidth / (innerWidth / innerHeight)) + "px"
  let s = document.querySelector("#impFixedDivider").style.marginTop
  s.replace('px', '')
  if (parseInt(s) > 585) {
    document.querySelector("#impFixedDivider").style.marginTop = "585px"
  }
}

function importToGreys() {
  var impGrey
  var greyLvl = parseInt(document.getElementById("greyRange").value)
  for (let x = 0; x <= innerHeight - 1; x++) {
    for (let y = 0; y <= innerWidth - 1; y++) {
      imPixel = ctxImport.getImageData(y, x, 1, 1).data;
      imPixelColor = "rgb(" + imPixel[0] + ', ' + imPixel[1] + ', ' + imPixel[2] + ")"
      impGrey = (Math.round((0.299 * imPixel[0]) + (0.587 * imPixel[1]) + (0.114 * imPixel[2])))

      switch (selectedStyle) {

        case 1:
          var blackThresh = greyLvl
          var whiteThresh = 255 - greyLvl

          if (impGrey < blackThresh) {
            imPixelColor = "rgb(0, 0, 0)"

          } else if ((impGrey >= blackThresh) && (impGrey < whiteThresh)) {
            imPixelColor = "rgb(127, 127, 127)"

          } else if (impGrey >= whiteThresh) {
            imPixelColor = "rgb(255, 255, 255)"
          }

          break;

        case 2:
          var blackThresh = greyLvl
          var whiteThresh = 255 - greyLvl

          if (impGrey < blackThresh) {
            imPixelColor = "rgb(0, 0, 0)"

          } else if ((impGrey >= blackThresh) && (impGrey < 95)) {
            imPixelColor = "rgb(63, 63, 63)"

          } else if ((impGrey >= 95) && (impGrey < 159)) {
            imPixelColor = "rgb(127, 127, 127)"

          } else if ((impGrey >= 159) && (impGrey < whiteThresh)) {
            imPixelColor = "rgb(191, 191, 191)"

          } else if (impGrey >= whiteThresh) {
            imPixelColor = "rgb(255, 255, 255)"
          }

          break;
      }
      ctxImport.setTransform(1, 0, 0, 1, 0, 0);
      ctxImport.fillStyle = imPixelColor
      ctxImport.fillRect(y, x, 1, 1)

    }
  }
  ink1 = "rgb(0, 0, 0)"
  ink2 = "rgb(255, 255, 255)"
};

// New Pattern Function
function newPattern() {
  if (patternLoaded == true) {
    var reload = confirm("Delete current progress and start from scratch?")
    if (reload == true) {
      location.reload(true)
    }
  } else {
    newPatternOpen = true
    landingToggle()
  }
};

// UI Functions


// Grid Line Functions
function gridLineChange() {
  switch (gridLinesVisible) {

    case false:
      document.getElementById("gridLinesContainer").style.visibility = "visible"

      if (selectedStyle == 1) {
        document.getElementById("gridLinesBackContainer").style.visibility = "visible";
      }

      if (viewType == 1) {
        document.getElementById("previewGridLinesContainer").style.visibility = "visible"
        document.getElementById("previewGridLinesContainer").style.zIndex = 11
      }

      gridLinesVisible = true

      document.getElementById("gridView").style.backgroundColor = "#5fc66d"
      document.getElementById("gridViewPreview").style.backgroundColor = "#5fc66d"

      document.getElementById("gridView").innerHTML = 'Grid is On'
      document.getElementById("gridViewPreview").innerHTML = 'Grid is On'
      break;

    case true:
      document.getElementById("gridLinesContainer").style.visibility = "hidden"
      if (selectedStyle == 1) {
        document.getElementById("gridLinesBackContainer").style.visibility = "hidden";
      }
      if (viewType == 1) {
        document.getElementById("previewGridLinesContainer").style.zIndex = "-50"
        document.getElementById("previewGridLinesContainer").style.visibility = "hidden"
      }

      gridLinesVisible = false

      document.getElementById("gridView").style.backgroundColor = "#ff7fff"
      document.getElementById("gridViewPreview").style.backgroundColor = "#ff7fff"

      document.getElementById("gridView").innerHTML = 'Grid is Off'
      document.getElementById("gridViewPreview").innerHTML = 'Grid is Off'
      break;
  }
};

// Stitches
function drawStitchOverlay() {
  stitchesOverlay = document.getElementById("stitchesOverlay");
  previewStitchesOverlay = document.getElementById("previewStitches");
  stitchContainer = document.getElementById("stitchesOverlayContainer");
  previewStitchContainer = document.getElementById("previewStitchesContainer");
  stitchHolder = document.getElementById("stitchHolder");

  stitchCtx = stitchesOverlay.getContext("2d", { willReadFrequently: true });
  previewStitchCtx = previewStitches.getContext("2d", { willReadFrequently: true });
  previewTickingCtx = previewTicking.getContext("2d", { willReadFrequently: true });
  stitchHolderCtx = stitchHolder.getContext("2d", { willReadFrequently: true });

  graphWidth = (innerWidth * 8)
  graphHeight = (innerHeight * 8)

  stitchContainer.style.width = (graphWidth + "px")
  stitchContainer.style.height = (graphHeight + "px")

  previewStitchContainer.style.width = (graphWidth + "px")
  previewStitchContainer.style.height = (graphHeight + "px")

  stitchesOverlay.width = graphWidth
  stitchesOverlay.height = graphHeight

  previewStitchesOverlay.width = graphWidth
  previewStitchesOverlay.height = graphHeight

  stitchHolder.width = 8
  stitchHolder.height = 8

  stitchCtx.clearRect(0, 0, graphWidth, graphHeight)
  stitchHolderCtx.clearRect(0, 0, 8, 8)
  previewStitchCtx.clearRect(0, 0, graphWidth, graphHeight)

  switch (selectedStyle) {
    case 1:

      stitchesBack = document.getElementById("stitchesOverlayBackContainer");

      stitchHolderCtx.fillStyle = stColor3
      stitchHolderCtx.fillRect(0, 2, 1, 1);
      stitchHolderCtx.fillRect(0, 5, 1, 1);
      stitchHolderCtx.fillRect(1, 1, 1, 1);
      stitchHolderCtx.fillRect(1, 2, 1, 1);
      stitchHolderCtx.fillRect(1, 6, 1, 1);
      stitchHolderCtx.fillRect(2, 0, 1, 1);
      stitchHolderCtx.fillRect(2, 6, 1, 1);
      stitchHolderCtx.fillRect(2, 7, 1, 1);
      stitchHolderCtx.fillRect(3, 3, 1, 1);
      stitchHolderCtx.fillRect(3, 4, 1, 1);
      stitchHolderCtx.fillRect(4, 3, 1, 1);
      stitchHolderCtx.fillRect(4, 4, 1, 1);
      stitchHolderCtx.fillRect(5, 0, 1, 1);
      stitchHolderCtx.fillRect(5, 1, 1, 1);
      stitchHolderCtx.fillRect(5, 7, 1, 1);
      stitchHolderCtx.fillRect(6, 1, 1, 1);
      stitchHolderCtx.fillRect(6, 5, 1, 1);
      stitchHolderCtx.fillRect(6, 6, 1, 1);
      stitchHolderCtx.fillRect(7, 2, 1, 1);
      stitchHolderCtx.fillRect(7, 5, 1, 1);

      stitchHolderCtx.fillStyle = stColor4
      stitchHolderCtx.fillRect(0, 3, 1, 1);
      stitchHolderCtx.fillRect(1, 3, 1, 1);
      stitchHolderCtx.fillRect(1, 5, 1, 1);
      stitchHolderCtx.fillRect(2, 1, 1, 1);
      stitchHolderCtx.fillRect(2, 4, 1, 1);
      stitchHolderCtx.fillRect(3, 2, 1, 1);
      stitchHolderCtx.fillRect(3, 6, 1, 1);
      stitchHolderCtx.fillRect(3, 7, 1, 1);
      stitchHolderCtx.fillRect(4, 0, 1, 1);
      stitchHolderCtx.fillRect(4, 1, 1, 1);
      stitchHolderCtx.fillRect(4, 5, 1, 1);
      stitchHolderCtx.fillRect(5, 3, 1, 1);
      stitchHolderCtx.fillRect(5, 6, 1, 1);
      stitchHolderCtx.fillRect(6, 2, 1, 1);
      stitchHolderCtx.fillRect(6, 4, 1, 1);
      stitchHolderCtx.fillRect(7, 4, 1, 1);

      stitchHolderCtx.fillStyle = stColor5
      stitchHolderCtx.fillRect(0, 4, 1, 1);
      stitchHolderCtx.fillRect(1, 4, 1, 1);
      stitchHolderCtx.fillRect(2, 2, 1, 1);
      stitchHolderCtx.fillRect(2, 3, 1, 1);
      stitchHolderCtx.fillRect(2, 5, 1, 1);
      stitchHolderCtx.fillRect(3, 0, 1, 1);
      stitchHolderCtx.fillRect(3, 1, 1, 1);
      stitchHolderCtx.fillRect(3, 5, 1, 1);
      stitchHolderCtx.fillRect(4, 2, 1, 1);
      stitchHolderCtx.fillRect(4, 6, 1, 1);
      stitchHolderCtx.fillRect(4, 7, 1, 1);
      stitchHolderCtx.fillRect(5, 2, 1, 1);
      stitchHolderCtx.fillRect(5, 4, 1, 1);
      stitchHolderCtx.fillRect(5, 5, 1, 1);
      stitchHolderCtx.fillRect(6, 3, 1, 1);
      stitchHolderCtx.fillRect(7, 3, 1, 1);

      stitchHolderCtx.fillStyle = stColor2
      stitchHolderCtx.fillRect(0, 1, 1, 1);
      stitchHolderCtx.fillRect(0, 6, 1, 1);
      stitchHolderCtx.fillRect(1, 0, 1, 1);
      stitchHolderCtx.fillRect(1, 7, 1, 1);
      stitchHolderCtx.fillRect(6, 0, 1, 1);
      stitchHolderCtx.fillRect(6, 7, 1, 1);
      stitchHolderCtx.fillRect(7, 1, 1, 1);
      stitchHolderCtx.fillRect(7, 6, 1, 1);

      stitchHolderCtx.fillStyle = stColor1
      stitchHolderCtx.fillRect(0, 0, 1, 1);
      stitchHolderCtx.fillRect(0, 7, 1, 1);
      stitchHolderCtx.fillRect(7, 0, 1, 1);
      stitchHolderCtx.fillRect(7, 7, 1, 1);


      stitchCtxBack.clearRect(0, 0, graphWidth, graphHeight)

      for (x = 0; x <= innerWidth; x++) {
        for (y = 0; y <= innerHeight; y++) {
          stitchCtx.drawImage(stitchHolder, x * 8, y * 8);
          stitchCtxBack.drawImage(stitchHolder, x * 8, y * 8);
          previewStitchCtx.drawImage(stitchHolder, x * 8, y * 8);
        }
      }
      break;

    case 2:

      stitchHolderCtx.fillStyle = stColor3
      stitchHolderCtx.fillRect(0, 1, 1, 1);
      stitchHolderCtx.fillRect(0, 2, 1, 1);
      stitchHolderCtx.fillRect(0, 3, 1, 1);
      stitchHolderCtx.fillRect(1, 0, 1, 1);
      stitchHolderCtx.fillRect(1, 1, 1, 1);
      stitchHolderCtx.fillRect(1, 4, 1, 1);
      stitchHolderCtx.fillRect(1, 5, 1, 1);
      stitchHolderCtx.fillRect(2, 0, 1, 1);
      stitchHolderCtx.fillRect(2, 2, 1, 1);
      stitchHolderCtx.fillRect(2, 7, 1, 1);
      stitchHolderCtx.fillRect(3, 1, 1, 1);
      stitchHolderCtx.fillRect(3, 3, 1, 1);
      stitchHolderCtx.fillRect(3, 6, 1, 1);
      stitchHolderCtx.fillRect(3, 7, 1, 1);
      stitchHolderCtx.fillRect(4, 1, 1, 1);
      stitchHolderCtx.fillRect(4, 4, 1, 1);
      stitchHolderCtx.fillRect(4, 7, 1, 1);
      stitchHolderCtx.fillRect(5, 5, 1, 1);
      stitchHolderCtx.fillRect(6, 0, 1, 1);
      stitchHolderCtx.fillRect(6, 2, 1, 1);
      stitchHolderCtx.fillRect(6, 4, 1, 1);
      stitchHolderCtx.fillRect(6, 6, 1, 1);
      stitchHolderCtx.fillRect(7, 1, 1, 1);
      stitchHolderCtx.fillRect(7, 4, 1, 1);
      stitchHolderCtx.fillRect(7, 5, 1, 1);
      stitchHolderCtx.fillRect(7, 6, 1, 1);

      stitchHolderCtx.fillStyle = stColor5
      stitchHolderCtx.fillRect(0, 0, 1, 1);
      stitchHolderCtx.fillRect(1, 7, 1, 1);
      stitchHolderCtx.fillRect(2, 1, 1, 1);
      stitchHolderCtx.fillRect(2, 3, 1, 1);
      stitchHolderCtx.fillRect(2, 5, 1, 1);
      stitchHolderCtx.fillRect(2, 6, 1, 1);
      stitchHolderCtx.fillRect(3, 2, 1, 1);
      stitchHolderCtx.fillRect(3, 4, 1, 1);
      stitchHolderCtx.fillRect(4, 3, 1, 1);
      stitchHolderCtx.fillRect(4, 5, 1, 1);
      stitchHolderCtx.fillRect(5, 1, 1, 1);
      stitchHolderCtx.fillRect(5, 2, 1, 1);
      stitchHolderCtx.fillRect(5, 4, 1, 1);
      stitchHolderCtx.fillRect(5, 6, 1, 1);
      stitchHolderCtx.fillRect(6, 7, 1, 1);
      stitchHolderCtx.fillRect(7, 0, 1, 1);
      stitchHolderCtx.fillRect(7, 7, 1, 1);

      stitchHolderCtx.fillStyle = stColor4
      stitchHolderCtx.fillRect(1, 2, 1, 1);
      stitchHolderCtx.fillRect(1, 3, 1, 1);
      stitchHolderCtx.fillRect(2, 4, 1, 1);
      stitchHolderCtx.fillRect(3, 5, 1, 1);
      stitchHolderCtx.fillRect(4, 2, 1, 1);
      stitchHolderCtx.fillRect(4, 6, 1, 1);
      stitchHolderCtx.fillRect(5, 3, 1, 1);
      stitchHolderCtx.fillRect(5, 7, 1, 1);
      stitchHolderCtx.fillRect(6, 1, 1, 1);
      stitchHolderCtx.fillRect(6, 3, 1, 1);
      stitchHolderCtx.fillRect(6, 5, 1, 1);

      stitchHolderCtx.fillStyle = stColor1
      stitchHolderCtx.fillRect(0, 4, 1, 1);
      stitchHolderCtx.fillRect(0, 5, 1, 1);
      stitchHolderCtx.fillRect(0, 7, 1, 1);
      stitchHolderCtx.fillRect(1, 6, 1, 1);
      stitchHolderCtx.fillRect(4, 0, 1, 1);
      stitchHolderCtx.fillRect(7, 2, 1, 1);
      stitchHolderCtx.fillRect(7, 3, 1, 1);

      stitchHolderCtx.fillStyle = stColor2
      stitchHolderCtx.fillRect(0, 6, 1, 1);
      stitchHolderCtx.fillRect(3, 0, 1, 1);
      stitchHolderCtx.fillRect(5, 0, 1, 1);

      for (x = 0; x <= graphWidth; x++) {
        for (y = 0; y <= graphHeight; y++) {
          stitchCtx.drawImage(stitchHolder, x * 8, y * 8);
          previewStitchCtx.drawImage(stitchHolder, x * 8, y * 8);
        }
      }

      break;
  }

  stitchesLoaded = true
};

function stitchesChange() {

  var stitches = document.getElementById("stitchesOverlayContainer");
  switch (selectedStyle) {
    case 1:
      var stitchesBack = document.getElementById("stitchesOverlayBackContainer");
      break;
  }

  switch (stitchesLoaded) {
    case false:
      drawStitchOverlay()
      break;
  }

  switch (stitchesVisible) {
    case false:
      stitches.style.visibility = 'visible'
      switch (selectedStyle) {
        case 1:
          stitchesBack.style.visibility = 'visible'
          break;
      }
      switch (viewType) {
        case 1:
          document.getElementById("previewStitchesContainer").style.zIndex = "10"
          document.getElementById("previewStitchesContainer").style.visibility = 'visible'
          break;
      }

      stitchesVisible = true
      document.getElementById("stitchedView").style.backgroundColor = "#5fc66d"
      document.getElementById("stitchedViewPreview").style.backgroundColor = "#5fc66d"
      break;

    case true:
      stitches.style.visibility = 'hidden'
      switch (selectedStyle) {
        case 1:
          stitchesBack.style.visibility = 'hidden'
          break;
      }
      switch (viewType) {
        case 1:
          document.getElementById("previewStitchesContainer").style.zIndex = "-2"
          document.getElementById("previewStitchesContainer").style.visibility = 'hidden'
          break;
      }

      stitchesVisible = false
      document.getElementById("stitchedView").style.backgroundColor = "#ff7fff"
      document.getElementById("stitchedViewPreview").style.backgroundColor = "#ff7fff"
      break;
  }

  zoomGraph(document.getElementById('zoomSlider'))
};

// Unit Change Functions
function instUnitPick() {
  switch (unit) {
    case 0:
      unit = 1
      document.getElementById("centimeterPref").checked = true
      document.getElementById("inchPref").checked = false
      break;
    case 1:
      unit = 0
      document.getElementById("inchPref").checked = true
      document.getElementById("centimeterPref").checked = false
      break;
  }
  unitChange()
  drawKeyPage()

}

function unitPick() {
  switch (document.getElementById("inchPref").checked) {
    case true:
      unit = 0
      break;
    case false:
      unit = 1
      break;
  }
};

function unitToggleImp() {
  switch (unit) {
    case 0:
      document.getElementById("centimeterPref").checked = "checked"
      unit = 1
      break;
    case 1:
      document.getElementById("inchPref").checked = "checked"
      unit = 0
      break;
  }
}


// Symmetry
// Symmetry None
function symNone() {
  document.getElementById('symLineHorzContainer').style.visibility = 'hidden'
  document.getElementById('symLineVertContainer').style.visibility = 'hidden'

  document.getElementById("symButton").style.backgroundColor = "#ff7fff"
  document.getElementById("symButtonNone").style.backgroundColor = "#5fc66d"
  document.getElementById("symButtonHorz").style.backgroundColor = "#ff7fff"
  document.getElementById("symButtonVert").style.backgroundColor = "#ff7fff"
  document.getElementById("symButtonBoth").style.backgroundColor = "#ff7fff"

  switch (selectedStyle) {
    case 1:
      document.getElementById('symLineHorzBackContainer').style.visibility = 'hidden'
      document.getElementById('symLineVertBackContainer').style.visibility = 'hidden'
      break;
  }
  symmetry = 0
};

// Symmetry Horizontal
function symHorz() {
  document.getElementById('symLineHorzContainer').style.visibility = 'visible'
  document.getElementById('symLineVertContainer').style.visibility = 'hidden'

  document.getElementById("symButton").style.backgroundColor = "#5fc66d"
  document.getElementById("symButtonNone").style.backgroundColor = "#ff7fff"
  document.getElementById("symButtonHorz").style.backgroundColor = "#5fc66d"
  document.getElementById("symButtonVert").style.backgroundColor = "#ff7fff"
  document.getElementById("symButtonBoth").style.backgroundColor = "#ff7fff"

  switch (selectedStyle) {
    case 1:
      document.getElementById('symLineHorzBackContainer').style.visibility = 'visible'
      document.getElementById('symLineVertBackContainer').style.visibility = 'hidden'
      break;
  }
  symmetry = 1
};

// Symmetry Vertical
function symVert() {
  document.getElementById('symLineHorzContainer').style.visibility = 'hidden'
  document.getElementById('symLineVertContainer').style.visibility = 'visible'

  document.getElementById("symButton").style.backgroundColor = "#5fc66d"
  document.getElementById("symButtonNone").style.backgroundColor = "#ff7fff"
  document.getElementById("symButtonHorz").style.backgroundColor = "#ff7fff"
  document.getElementById("symButtonVert").style.backgroundColor = "#5fc66d"
  document.getElementById("symButtonBoth").style.backgroundColor = "#ff7fff"

  switch (selectedStyle) {
    case 1:
      document.getElementById('symLineHorzBackContainer').style.visibility = 'hidden'
      document.getElementById('symLineVertBackContainer').style.visibility = 'visible'
      break;
  }
  symmetry = 2
};

// Symmetry Both
function symBoth() {
  document.getElementById('symLineHorzContainer').style.visibility = 'visible'
  document.getElementById('symLineVertContainer').style.visibility = 'visible'

  document.getElementById("symButton").style.backgroundColor = "#5fc66d"
  document.getElementById("symButtonNone").style.backgroundColor = "#ff7fff"
  document.getElementById("symButtonHorz").style.backgroundColor = "#ff7fff"
  document.getElementById("symButtonVert").style.backgroundColor = "#ff7fff"
  document.getElementById("symButtonBoth").style.backgroundColor = "#5fc66d"


  switch (selectedStyle) {
    case 1:
      document.getElementById('symLineHorzBackContainer').style.visibility = 'visible'
      document.getElementById('symLineVertBackContainer').style.visibility = 'visible'
      break;
  }
  symmetry = 3
};

// Color Options

function toolOption() {
  if ((patternLoaded == true) && ((document.getElementById("ink1PickHeader").style.border != "") || (document.getElementById("ink2PickHeader").style.border != ""))) {
    if (toolOptionOpen == false) {
      if (toolPicked == 1) {
        changeToolToShade()
      }
      document.getElementById('toolOptions').style.visibility = "visible"
      document.getElementById('toolOptionDown').style.bottom = "-10px"
      document.getElementById('toolOptionDown').style.right = "161px"


      document.getElementById('toolOptionDown').style.transform = "rotate(90deg)"
      document.getElementById('toolOptionDown').style.zIndex = "10"
      document.getElementById('toolOptions').style.opacity = "100%"
      document.getElementById('toolOptions').style.zIndex = "9"

      toolMenuSizeChange()
      toolOptionOpen = true

    } else if (toolOptionOpen == true) {
      document.getElementById("shadingHatch").style.opacity = "100%"
      document.getElementById("shadingVert").style.opacity = "100%"
      document.getElementById("shadingHorz").style.opacity = "100%"
      document.getElementById("shadeOptionContainer").style.opacity = "100%"

      document.getElementById('toolOptions').style.visibility = "hidden"
      document.getElementById('toolOptionDown').style.bottom = "48px"
      document.getElementById('toolOptionDown').style.right = "0"
      document.getElementById('toolOptionDown').style.transform = "rotate(-90deg)"
      document.getElementById('toolOptions').style.opacity = "0%"
      document.getElementById('toolOptions').style.height = "0px"
      toolOptionOpen = false
    }
  }
};

async function presetColors() {
  await changeMainColorToInk1();
  await changeMainColorToInk2();
  await changeMainColorToInk1();

};

function changeToolDropdown() {
  ink1 = document.getElementById("ink1PickHeader").style.backgroundColor
  ink2 = document.getElementById("ink2PickHeader").style.backgroundColor

  switch (toolPicked) {
    case 0:
      switch (ink1Selected) {
        case true:
          document.getElementById("toolOptionDown").style.backgroundColor = ink1
          break;

        case false:
          document.getElementById("toolOptionDown").style.backgroundColor = ink2
          break;
      }
      break;

    case 1:

      switch (ink1Selected) {
        case true:
          document.getElementById("toolOptionDown").style.backgroundColor = ink1
          break;

        case false:
          document.getElementById("toolOptionDown").style.backgroundColor = ink2
          break;
      }


      switch (shadeType) {
        case 0:
          let hatchCanvas = document.getElementById("shadingHatch")
          document.getElementById("toolOptionDownInner").width = 45
          document.getElementById("toolOptionDownInner").height = 45

          document.getElementById("toolOptionDownInner").getContext("2d", { willReadFrequently: true }).drawImage(hatchCanvas, 0, 0)
          break;

        case 1:
          let vertCanvas = document.getElementById("shadingVert")

          document.getElementById("toolOptionDownInner").width = 45
          document.getElementById("toolOptionDownInner").height = 45

          document.getElementById("toolOptionDownInner").getContext("2d", { willReadFrequently: true }).drawImage(vertCanvas, 0, 0)
          break;

        case 2:
          let horzCanvas = document.getElementById("shadingHorz")

          document.getElementById("toolOptionDownInner").width = 45
          document.getElementById("toolOptionDownInner").height = 45

          document.getElementById("toolOptionDownInner").getContext("2d", { willReadFrequently: true }).drawImage(horzCanvas, 0, 0)
          break;
      }

      break;
  }
};

// Switch Colors
function switchColors() {

  for (x = 0; x <= graphWidth; x += 8) {
    for (y = 0; y <= graphHeight; y += 8) {

      cCell = ctx.getImageData(x, y, 1, 1).data;
      cCellColor = "rgb(" + cCell[0] + ", " + cCell[1] + ", " + cCell[2] + ")"

      switch (selectedStyle) {
        case 1:

          cCellBack = ctxOther.getImageData(x, y, 1, 1).data;
          cCellColorBack = "rgb(" + cCellBack[0] + ", " + cCellBack[1] + ", " + cCellBack[2] + ")"

          switch (cCellColor == ink1) {
            case true:
              ctx.fillStyle = ink2
              ctx.fillRect(x, y, 8, 8);
              break;

            case false:
              ctx.fillStyle = ink1
              ctx.fillRect(x, y, 8, 8);
              break;
          }

          switch (cCellColorBack == ink1) {
            case true:
              ctxOther.fillStyle = ink2
              ctxOther.fillRect(x, y, 8, 8);
              break;

            case false:
              ctxOther.fillStyle = ink1
              ctxOther.fillRect(x, y, 8, 8);
              break;
          }

          break;

        case 2:
          switch (cCellColor == ink1) {
            case true:
              ctx.fillStyle = ink2
              ctx.fillRect(x, y, 8, 8);
              break;

            case false:
              ctx.fillStyle = ink1
              ctx.fillRect(x, y, 8, 8);
              break;
          }
          break;
      }
    }
  }

  switch (firstColor) {
    case 2:
      document.getElementById('firstColorDropDown').selectedIndex = 1
      firstColor = 1
      break;
    case 1:
      document.getElementById('firstColorDropDown').selectedIndex = 2
      firstColor = 2
      break;
  }

  undoState = []
  undoNum = 0
  redoState = []
  redoNum = 0
};

// Window Size Functions
function footerChange() {

  if (smallScreen == true) {
    smallScreenInch = true;

    if (document.getElementById('pxSizeFooter').innerHTML.includes('Stitches:') ||
      document.getElementById('inchSizeFooter').innerHTML.includes('Inches:') ||
      document.getElementById('inchSizeFooter').innerHTML.includes('Centimeters:')) {

      var smallerCentimeterText = document.getElementById('inchSizeFooter').innerHTML.replace('Centimeters:', 'Cm:');
      var smallerInchText = document.getElementById('inchSizeFooter').innerHTML.replace('Inches:', 'In:');
      var smallerStsText = document.getElementById('pxSizeFooter').innerHTML.replace('Stitches:', 'STs:');
      if (unit == 0) {
        document.getElementById('inchSizeFooter').innerHTML = "" + smallerInchText;
      } else if (unit == 1) {
        document.getElementById('inchSizeFooter').innerHTML = "" + smallerCentimeterText;
      };
      document.getElementById('pxSizeFooter').innerHTML = "" + smallerStsText
    };


    document.getElementById('inchSizeFooter').style.position = "fixed";
    document.getElementById('inchSizeFooter').style.bottom = "0";
    document.getElementById('inchSizeFooter').style.right = "0";
    document.getElementById('inchSizeFooter').style.backgroundColor = "white";
    document.getElementById('inchSizeFooter').style.left = "";

    document.getElementById('inchSizeFooterContainer').style.position = "fixed";
    document.getElementById('inchSizeFooterContainer').style.bottom = "0";
    document.getElementById('inchSizeFooterContainer').style.right = "0";

    document.getElementById('undoButton').style.fontSize = "15px";
    document.getElementById('redoButton').style.fontSize = "15px";

    document.getElementById('inchSizeFooter').style.webkitBoxShadow = "inset 0 0 10px rgba(0,0,0,0.5)";
    document.getElementById('inchSizeFooter').style.border = "1px solid grey";
    document.getElementById('inchSizeFooter').style.width = "115px";

    document.getElementById('pxSizeFooter').style.webkitBoxShadow = "inset 0 0 10px rgba(0,0,0,0.25)";
    document.getElementById('pxSizeFooter').style.border = "1px solid grey";
    document.getElementById('pxSizeFooter').style.padding = "10px";
    document.getElementById('pxSizeFooter').style.width = "115px";

    document.getElementById('pxSizeFooter').style.position = "fixed";

    document.getElementById('pxSizeFooter').style.right = "0";
    document.getElementById('pxSizeFooter').style.bottom = "0";


    document.getElementById('inchSizeFooter').style.padding = "10px";


  } else {
    smallScreenInch = false;
    document.getElementById('inchSizeFooter').style.position = "relative";
    document.getElementById('inchSizeFooter').style.float = "right";
    document.getElementById('inchSizeFooter').style.right = "";
    document.getElementById('inchSizeFooter').style.padding = "0";

    document.getElementById('inchSizeFooter').style.webkitBoxShadow = "";
    document.getElementById('inchSizeFooter').style.border = "";
    document.getElementById('inchSizeFooter').style.bottom = "";
    document.getElementById('inchSizeFooter').style.opacity = "100%";

    document.getElementById('inchSizeFooter').style.width = "200px";

    document.getElementById('inchSizeFooterContainer').style.position = "relative";

    document.getElementById('undoButton').style.fontSize = "20px";
    document.getElementById('redoButton').style.fontSize = "20px";

    document.getElementById('pxSizeFooter').style.webkitBoxShadow = "";
    document.getElementById('pxSizeFooter').style.border = "";
    document.getElementById('pxSizeFooter').style.padding = "10px";
    document.getElementById('pxSizeFooter').style.opacity = "100%";

    document.getElementById('pxSizeFooter').style.width = "150px";
    document.getElementById('pxSizeFooter').style.position = "fixed";
    document.getElementById('pxSizeFooter').style.right = "0";
    document.getElementById('pxSizeFooter').style.bottom = "0";


  }
};

function showInch() {
  if (smallScreen == true) {
    if (smallScreenInch == false) {
      document.getElementById('inchSizeFooter').style.opacity = "100%";
      document.getElementById('pxSizeFooter').style.opacity = "0%";
      smallScreenInch = true;

    } else if (smallScreenInch == true) {
      document.getElementById('inchSizeFooter').style.opacity = "0%";
      document.getElementById('pxSizeFooter').style.opacity = "100%";
      smallScreenInch = false;
    }
  }
};

function instructionsChange() {
  if (smallScreen == true) {
    document.getElementById("instructions").style.width = "100%"
    document.getElementById("leftArrowPreview").style.right = "1%"
    document.getElementById("graphPreview").style.width = "0%"
    document.getElementById("keyPageContainer").style.width = "0%"
    document.getElementById("rightArrowPreview").style.left = "100%"
    instructionThin = true
    instructionGraphPosition = 2

  } else if (smallScreen == false) {
    document.getElementById("instructions").style.width = "49%"
    document.getElementById("leftArrowPreview").style.right = "53%"
    document.getElementById("graphPreview").style.width = "49%"
    document.getElementById("keyPageContainer").style.width = "49%"
    document.getElementById("keyPage").style.width = "97%"
    document.getElementById("rightArrowPreview").style.left = "53%"
    instructionGraphPosition = 1
    instructionThin = false
  }
};

function instructionsViewLeft() {
  if (instructionThin == false) {
    if (instructionGraphPosition == 1) {
      document.getElementById("instructions").style.width = "0%"
      document.getElementById("leftArrowPreview").style.right = "100%"
      document.getElementById("graphPreview").style.width = "100%"
      document.getElementById("keyPageContainer").style.width = "100%"
      document.getElementById("keyPage").style.width = "97%"
      document.getElementById("rightArrowPreview").style.left = "1%"
      instructionGraphPosition = 0

      if (viewType == 0) {
        if (overFrontGraph == true) {
          var cells = document.getElementById("cells").style;
        } else {
          var cells = document.getElementById("cellsBack").style;
        }
      } else if (viewType == 1) {
        var cells = document.getElementById("graphPreviewGraph").style;
      }

    } else if (instructionGraphPosition == 2) {
      document.getElementById("instructions").style.width = "49%"
      document.getElementById("leftArrowPreview").style.right = "53%"
      document.getElementById("graphPreview").style.width = "49%"
      document.getElementById("keyPageContainer").style.width = "49%"
      document.getElementById("keyPage").style.width = "97%"
      document.getElementById("rightArrowPreview").style.left = "53%"
      instructionGraphPosition = 1
    }

  } else {
    if (instructionGraphPosition == 2) {
      document.getElementById("instructions").style.width = "0%"
      document.getElementById("leftArrowPreview").style.right = "100%"
      document.getElementById("graphPreview").style.width = "100%"
      document.getElementById("keyPageContainer").style.width = "100%"
      document.getElementById("keyPage").style.width = "97%"
      document.getElementById("rightArrowPreview").style.left = "1%"
      instructionGraphPosition = 0
      if (viewType == 0) {
        if (overFrontGraph == true) {
          var cells = document.getElementById("cells").style;
        } else {
          var cells = document.getElementById("cellsBack").style;
        }
      } else if (viewType == 1) {
        var cells = document.getElementById("graphPreviewGraph").style;
      }
    }

  }
};

function instructionsViewRight() {
  if (instructionThin == false) {
    if (instructionGraphPosition == 0) {
      document.getElementById("instructions").style.width = "49%"
      document.getElementById("leftArrowPreview").style.right = "51%"
      document.getElementById("graphPreview").style.width = "49%"
      document.getElementById("keyPageContainer").style.width = "49%"
      document.getElementById("keyPage").style.width = "97%"
      document.getElementById("rightArrowPreview").style.left = "51%"

      instructionGraphPosition = 1

    } else if (instructionGraphPosition == 1) {
      document.getElementById("instructions").style.width = "100%"
      document.getElementById("leftArrowPreview").style.right = "1%"
      document.getElementById("graphPreview").style.width = "0%"
      document.getElementById("keyPageContainer").style.width = "0%"
      document.getElementById("rightArrowPreview").style.left = "100%"

      instructionGraphPosition = 2
      if (viewType == 0) {
        if (overFrontGraph == true) {
          var cells = document.getElementById("cells").style;
        } else {
          var cells = document.getElementById("cellsBack").style;
        }
      } else if (viewType == 1) {
        var cells = document.getElementById("graphPreviewGraph").style;
      }
    }
  } else {
    if (instructionGraphPosition == 0) {
      document.getElementById("instructions").style.width = "100%"
      document.getElementById("leftArrowPreview").style.right = "1%"
      document.getElementById("graphPreview").style.width = "0%"
      document.getElementById("keyPageContainer").style.width = "0%"
      document.getElementById("rightArrowPreview").style.left = "100%"
      instructionGraphPosition = 2
      if (viewType == 0) {
        if (overFrontGraph == true) {
          var cells = document.getElementById("cells").style;
        } else {
          var cells = document.getElementById("cellsBack").style;
        }
      } else if (viewType == 1) {
        var cells = document.getElementById("graphPreviewGraph").style;
      }
    }
  }
};

function graphViewLeft() {
  if (instructionThin == false) {
    if (graphGraphPosition == 1) {
      document.getElementById("graph").style.width = "0%"
      document.getElementById("leftArrowGraph").style.right = "100%"
      document.getElementById("graphBack").style.width = "100%"
      document.getElementById("rightArrowGraph").style.left = "1%"
      graphGraphPosition = 0
      setToBack()
      if (viewType == 0) {
        if (overFrontGraph == true) {
          var cells = document.getElementById("cells").style;
          document.getElementById('zoomBar').value = frontZoom
        } else {
          var cells = document.getElementById("cellsBack").style;
          document.getElementById('zoomBar').value = backZoom
        }
      } else if (viewType == 1) {
        var cells = document.getElementById("graphPreviewGraph").style;
      }


    } else if (graphGraphPosition == 2) {
      document.getElementById("graph").style.width = "49.75%"
      document.getElementById("leftArrowGraph").style.right = "51%"
      document.getElementById("graphBack").style.width = "49.75%"
      document.getElementById("rightArrowGraph").style.left = "51%"
      graphGraphPosition = 1
    }
  } else {
    if (graphGraphPosition == 2) {
      document.getElementById("graph").style.width = "0%"
      document.getElementById("leftArrowGraph").style.right = "100%"
      document.getElementById("graphBack").style.width = "100%"
      document.getElementById("rightArrowGraph").style.left = "1%"
      graphGraphPosition = 0
      setToBack()
      if (viewType == 0) {
        if (overFrontGraph == true) {
          var cells = document.getElementById("cells").style;
          document.getElementById('zoomBar').value = frontZoom
        } else {
          var cells = document.getElementById("cellsBack").style;
          document.getElementById('zoomBar').value = backZoom
        }
      } else if (viewType == 1) {
        var cells = document.getElementById("graphPreviewGraph").style;
      }
    }

  }
};

function graphViewRight() {
  if (instructionThin == false) {
    if (graphGraphPosition == 0) {
      document.getElementById("graph").style.width = "49.75%"
      document.getElementById("leftArrowGraph").style.right = "51%"
      document.getElementById("graphBack").style.width = "49.75%"
      document.getElementById("rightArrowGraph").style.left = "51%"

      graphGraphPosition = 1

    } else if (graphGraphPosition == 1) {
      document.getElementById("graph").style.width = "100%"
      document.getElementById("leftArrowGraph").style.right = "1%"
      document.getElementById("graphBack").style.width = "0%"
      document.getElementById("rightArrowGraph").style.left = "100%"

      graphGraphPosition = 2
      setToFront()
      if (viewType == 0) {
        if (overFrontGraph == true) {
          var cells = document.getElementById("cells").style;
          document.getElementById('zoomBar').value = frontZoom
        } else {
          var cells = document.getElementById("cellsBack").style;
          document.getElementById('zoomBar').value = backZoom
        }
      } else if (viewType == 1) {
        var cells = document.getElementById("graphPreviewGraph").style;
      }
      document.getElementById('zoomBar').value = cells.zoom * 10
    }
  } else {
    if (graphGraphPosition == 0) {
      document.getElementById("graph").style.width = "100%"
      document.getElementById("leftArrowGraph").style.right = "1%"
      document.getElementById("graphBack").style.width = "0%"
      document.getElementById("rightArrowGraph").style.left = "100%"
      graphGraphPosition = 2
      setToFront()
      if (viewType == 0) {
        if (overFrontGraph == true) {
          var cells = document.getElementById("cells").style;
          document.getElementById('zoomBar').value = frontZoom
        } else {
          var cells = document.getElementById("cellsBack").style;
          document.getElementById('zoomBar').value = backZoom
        }
      } else if (viewType == 1) {
        var cells = document.getElementById("graphPreviewGraph").style;
      }
    }
  }
};

// Size Functions


// Graph Functions

// Zoom Graph
function zoomGraph(_this) {
  console.log(_this.value)
  zoomSelection = _this.value / 10;

  var container = document.getElementById("canvasContainer");
  var stitchContainer = document.getElementById("stitchesOverlayContainer");
  var gridContainer = document.getElementById("gridLinesContainer");

  var containerPreview = document.getElementById("previewGraphContainer");
  var stitchContainerPreview = document.getElementById("previewStitchesContainer");
  var gridContainerPreview = document.getElementById("previewGridLinesContainer");
  var previewTickingContainer = document.getElementById("previewTickingContainer");

  var graphWidth = innerWidth * 8
  var graphHeight = innerHeight * 8

  frontZoom = _this.value

  container.style.width = graphWidth * zoomSelection + "px"
  container.style.height = graphHeight * zoomSelection + "px"

  graph = document.getElementById("cells")
  graph.style.width = graphWidth * zoomSelection + "px"
  graph.style.height = graphHeight * zoomSelection + "px"

  stitchContainer.style.width = graphWidth * zoomSelection + "px"
  stitchContainer.style.height = graphHeight * zoomSelection + "px"

  gridContainer.style.width = graphWidth * zoomSelection + "px"
  gridContainer.style.height = graphHeight * zoomSelection + "px"

  /////////////////////////////////////////////////////////
  containerPreview.style.width = graphWidth * zoomSelection + "px"
  containerPreview.style.height = graphHeight * zoomSelection + "px"

  stitchContainerPreview.style.width = graphWidth * zoomSelection + "px"
  stitchContainerPreview.style.height = graphHeight * zoomSelection + "px"

  gridContainerPreview.style.width = graphWidth * zoomSelection + "px"
  gridContainerPreview.style.height = graphHeight * zoomSelection + "px"

  previewTickingContainer.style.width = graphWidth * zoomSelection + "px"
  previewTickingContainer.style.height = graphHeight * zoomSelection + "px"

  //////////////////////////////////////////////////////////
  symLineHorzContainer.style.width = graphWidth * zoomSelection + "px"
  symLineHorzContainer.style.height = graphHeight * zoomSelection + "px"

  symLineVertContainer.style.width = graphWidth * zoomSelection + "px"
  symLineVertContainer.style.height = graphHeight * zoomSelection + "px"

  switch (selectedStyle) {
    case 1:
      var containerBack = document.getElementById("canvasBackContainer");
      var stitchContainerBack = document.getElementById("stitchesOverlayBackContainer");
      var gridContainerBack = document.getElementById("gridLinesBackContainer");
      var symLineHorzContainerBack = document.getElementById("symLineHorzBackContainer");
      var symLineVertContainerBack = document.getElementById("symLineVertBackContainer");

      containerBack.style.width = graphWidth * zoomSelection + "px"
      containerBack.style.height = graphHeight * zoomSelection + "px"

      stitchContainerBack.style.width = graphWidth * zoomSelection + "px"
      stitchContainerBack.style.height = graphHeight * zoomSelection + "px"

      gridContainerBack.style.width = graphWidth * zoomSelection + "px"
      gridContainerBack.style.height = graphHeight * zoomSelection + "px"

      symLineHorzContainerBack.style.width = graphWidth * zoomSelection + "px"
      symLineHorzContainerBack.style.height = graphHeight * zoomSelection + "px"

      symLineVertContainerBack.style.width = graphWidth * zoomSelection + "px"
      symLineVertContainerBack.style.height = graphHeight * zoomSelection + "px"

      backZoom = _this.value
      break;

  }
  // console.log(zoomSelection)
  drawRowMarkers()
};

// Side Menus

function graphSizeOpenClose() {
  if ((graphSizeChangeOpen == false) && (bugAlert() == true)) {
    if (patternLoaded == true) {
      document.getElementById("graphSizeChange").style.visibility = "visible"
      document.getElementById("graphSizeChange").style.width = "390px"
      document.getElementById("graphSizeChange").style.opacity = "100%"
      graphSizeChangeOpen = true

      document.getElementById("ogStitchesHeight").value = innerHeight
      document.getElementById("ogStitchesWidth").value = innerWidth
      document.getElementById("ogInchesHeight").value = hInch
      document.getElementById("ogInchesWidth").value = wInch

    } else {
      alert("You must load a pattern or make a graph to change its size!")
    }
  } else {
    document.getElementById("graphSizeChange").style.visibility = "hidden"
    document.getElementById("graphSizeChange").style.width = "0px"
    document.getElementById("graphSizeChange").style.opacity = "0%"
    graphSizeChangeOpen = false
  }
};

function exportOpenClose() {
  if (exportOpen == false) {
    if (patternLoaded == true) {

      document.getElementById("exportMenu").style.visibility = "visible"
      document.getElementById("exportMenu").style.width = "390px"
      document.getElementById("exportMenu").style.opacity = "100%"
      exportOpen = true

      drawExportOptions()

    } else {
      alert("You must load a pattern or make a graph to export!")
    }
  } else {
    document.getElementById("exportMenu").style.visibility = "hidden"
    document.getElementById("exportMenu").style.width = "0px"
    document.getElementById("exportMenu").style.opacity = "0%"
    exportOpen = false
  }
};

function drawExportOptions() {
  if (document.getElementById("imageGraphExport").checked) {
    document.getElementById("graphExportContainer").innerHTML = graphImgHtml
    exportCanvas = document.getElementById("exportCanvas");

    ctxExport = exportCanvas.getContext("2d", { willReadFrequently: true });

    exportCanvas.width = graphWidth
    exportCanvas.height = graphHeight
    ctxExport.drawImage(document.getElementById('cells'), 0, 0)

    switch (selectedStyle) {
      case 1:
        interlockingInstructions()

        document.getElementById("backExport").disabled = false
        document.getElementById("tickedExport").disabled = true

        document.getElementById("tickedExportContainer").style.display = "none"
        document.getElementById("frontBackExportOption").style.display = ""
        document.getElementById("stitchGridExportOption").style.height = "80px"
        break;
      case 2:
        mosaicTicking()
        getMosaicInstructions()
        document.getElementById("backExport").disabled = true
        document.getElementById("tickedExport").disabled = false

        document.getElementById("tickedExportContainer").style.display = ""
        document.getElementById("frontBackExportOption").style.display = "none"
        document.getElementById("stitchGridExportOption").style.height = "115px"
        break;
    }
  } else {
    document.getElementById("graphExportContainer").innerHTML = graphPdfHtml

    pdfGraphSplit()

    switch (selectedStyle) {
      case 1:
        interlockingInstructions()
        document.getElementById("backExport").disabled = false
        document.getElementById("tickedExport").disabled = true

        document.getElementById("tickedExportContainer").style.display = "none"
        document.getElementById("frontBackExportOption").style.display = ""
        document.getElementById("stitchGridExportOption").style.height = "80px"
        break;
      case 2:
        mosaicTicking()
        getMosaicInstructions()
        document.getElementById("backExport").disabled = true
        document.getElementById("tickedExport").disabled = false

        document.getElementById("tickedExportContainer").style.display = ""
        document.getElementById("frontBackExportOption").style.display = "none"
        document.getElementById("stitchGridExportOption").style.height = "115px"
        break;
    }
  }
}

function prefOpenClose() {
  if (prefOpen == false) {

    document.getElementById("prefMenu").style.visibility = "visible"
    document.getElementById("prefMenu").style.width = "390px"
    document.getElementById("prefMenu").style.opacity = "100%"
    document.getElementById("prefMenu").style.zIndex = "200001"

    prefOpen = true
  } else {
    document.getElementById("prefMenu").style.visibility = "hidden"
    document.getElementById("prefMenu").style.width = "0px"
    document.getElementById("prefMenu").style.opacity = "0%"
    document.getElementById("prefMenu").style.zIndex = "-200001"
    prefOpen = false
  }
};

// Arrows
// Top
function changeGraphTopUp() {
  document.getElementById("graphChangeTop").value++
  document.getElementById("graphChangeTop").value++
};

function changeGraphTopDown() {
  document.getElementById("graphChangeTop").value--
  document.getElementById("graphChangeTop").value--
};

// Bottom
function changeGraphBottomUp() {
  document.getElementById("graphChangeBottom").value++
  document.getElementById("graphChangeBottom").value++
};

function changeGraphBottomDown() {
  document.getElementById("graphChangeBottom").value--
  document.getElementById("graphChangeBottom").value--
};

// Left
function changeGraphLeftUp() {
  document.getElementById("graphChangeLeft").value++
  document.getElementById("graphChangeLeft").value++
};

function changeGraphLeftDown() {
  document.getElementById("graphChangeLeft").value--
  document.getElementById("graphChangeLeft").value--
};

// Right
function changeGraphRightUp() {
  document.getElementById("graphChangeRight").value++
  document.getElementById("graphChangeRight").value++
};

function changeGraphRightDown() {
  document.getElementById("graphChangeRight").value--
  document.getElementById("graphChangeRight").value--
};

// onInput Graph Change
function graphChangeInput() {

  topChange = Number(document.getElementById("graphChangeTop").value)
  bottomChange = Number(document.getElementById("graphChangeBottom").value)
  leftChange = Number(document.getElementById("graphChangeLeft").value)
  rightChange = Number(document.getElementById("graphChangeRight").value)

  newHeight = Number(topChange + bottomChange)
  newWidth = Number(leftChange + rightChange)

  var newHeightInput = Number(Number(document.getElementById('ogStitchesHeight').value) + newHeight)
  var newWidthInput = Number(Number(document.getElementById('ogStitchesWidth').value) + newWidth)

  var gauge = document.getElementById("gaugeDropDown").selectedIndex

  if (gauge == 1) {
    var newInchHeight = newHeightInput / 4
    var newInchWidth = newWidthInput / 4
  } else {
    var newInchHeight = newHeightInput / 5
    var newInchWidth = newWidthInput / 5
  }

  var newCmHeight = Math.round(newInchHeight * 2.54)
  var newCmWidth = Math.round(newInchWidth * 2.54)

  if ((newHeight) % 2 == 0) {
    document.getElementById("graphChangeTop").style.color = 'black'
    document.getElementById("graphChangeBottom").style.color = 'black'
    document.getElementById('newStitchesHeight').value = newHeightInput
    if (unit == 0) {
      document.getElementById('newInchesHeight').value = newInchHeight
    } else if (unit == 1) {
      document.getElementById('newInchesHeight').value = newCmHeight
    }
  } else {
    document.getElementById("graphChangeTop").style.color = 'red'
    document.getElementById("graphChangeBottom").style.color = 'red'
  }


  if ((newWidth) % 2 == 0) {
    document.getElementById("graphChangeLeft").style.color = 'black'
    document.getElementById("graphChangeRight").style.color = 'black'
    document.getElementById('newStitchesWidth').value = newWidthInput
    if (unit == 0) {
      document.getElementById('newInchesWidth').value = newInchWidth
    } else if (unit == 1) {
      document.getElementById('newInchesWidth').value = newCmWidth
    }
  } else {
    document.getElementById("graphChangeLeft").style.color = 'red'
    document.getElementById("graphChangeRight").style.color = 'red'
  }
};

// Drawing Graphs
function drawNewGraph() {


  uiClick()

  if (selectedStyle == 1) {
    document.getElementById('leftArrowGraph').style.visibility = "visible"
    document.getElementById('rightArrowGraph').style.visibility = "visible"

  } else if (selectedStyle == 2) {
    document.getElementById('leftArrowGraph').style.visibility = "hidden"
    document.getElementById('rightArrowGraph').style.visibility = "hidden"
    document.getElementById("graph").style.width = "100%"
    document.getElementById("leftArrowGraph").style.right = "1%"
    document.getElementById("graphBack").style.width = "0%"
    document.getElementById("rightArrowGraph").style.left = "100%"
    graphGraphPosition = 2

  }

  graphWidth = innerWidth * 8
  graphHeight = innerHeight * 8

  newPatternOpen = false

  nameElem()
  setElem()

  // Draw Graph
  if (selectedStyle == 1) {
    if ((firstColor == 1) && (interiorColor == 2)) {
      for (x = 0; x <= graphWidth; x += 8) {
        for (y = 0; y <= graphHeight; y += 8) {
          if ((x / 8 % 2 == 0) && (y / 8 % 2 == 0)) {
            ctx.fillStyle = ink1;
          } else {
            ctx.fillStyle = ink2;
          }

          if ((x / 8 == 2) || (x / 8 == (graphWidth / 8) - 3) || (y / 8 == 2) || (y / 8 == (graphHeight / 8) - 3)) {
            ctx.fillStyle = ink1;
          }

          if ((x / 8 == 1) || (x / 8 == (graphWidth / 8) - 2) || (y / 8 == 1) || (y / 8 == (graphHeight / 8) - 2)) {
            ctx.fillStyle = ink2;
          }

          if ((x / 8 == 0) || (x / 8 == (graphWidth / 8) - 1) || (y / 8 == 0) || (y / 8 == (graphHeight / 8) - 1)) {
            ctx.fillStyle = ink1;
          }

          if (((x / 8 == 1) && (y / 8 == 2)) || ((x / 8 == (graphWidth / 8) - 2) && (y / 8 == (graphHeight / 8) - 3)) || ((x / 8 == 1) && (y / 8 == (graphHeight / 8) - 3)) || ((x / 8 == (graphWidth / 8) - 2) && (y / 8 == 2))) {
            ctx.fillStyle = ink1;
          }

          ctx.fillRect(x, y, 8, 8);
        }
      }

    } else if ((firstColor == 1) && (interiorColor == 1)) {

      for (x = 0; x <= graphWidth; x += 8) {
        for (y = 0; y <= graphHeight; y += 8) {
          if ((x / 8 % 2 == 0) || (y / 8 % 2 == 0)) {
            ctx.fillStyle = ink1;
          } else {
            ctx.fillStyle = ink2;
          }

          if ((x / 8 == 2) || (x / 8 == (graphWidth / 8) - 3) || (y / 8 == 2) || (y / 8 == (graphHeight / 8) - 3)) {
            ctx.fillStyle = ink1;
          }

          if ((x / 8 == 1) || (x / 8 == (graphWidth / 8) - 2) || (y / 8 == 1) || (y / 8 == (graphHeight / 8) - 2)) {
            ctx.fillStyle = ink2;
          }

          if ((x / 8 == 0) || (x / 8 == (graphWidth / 8) - 1) || (y / 8 == 0) || (y / 8 == (graphHeight / 8) - 1)) {
            ctx.fillStyle = ink1;
          }

          if (((x / 8 == 1) && (y / 8 == 2)) || ((x / 8 == (graphWidth / 8) - 2) && (y / 8 == (graphHeight / 8) - 3)) || ((x / 8 == 1) && (y / 8 == (graphHeight / 8) - 3)) || ((x / 8 == (graphWidth / 8) - 2) && (y / 8 == 2))) {
            ctx.fillStyle = ink1;
          }

          ctx.fillRect(x, y, 8, 8);
        }
      }

    } else if ((firstColor == 2) && (interiorColor == 1)) {

      for (x = 0; x <= graphWidth; x += 8) {
        for (y = 0; y <= graphHeight; y += 8) {
          if ((x / 8 % 2 == 0) && (y / 8 % 2 == 0)) {
            ctx.fillStyle = ink2;
          } else {
            ctx.fillStyle = ink1;
          }

          if ((x / 8 == 2) || (x / 8 == (graphWidth / 8) - 3) || (y / 8 == 2) || (y / 8 == (graphHeight / 8) - 3)) {
            ctx.fillStyle = ink2;
          }

          if ((x / 8 == 1) || (x / 8 == (graphWidth / 8) - 2) || (y / 8 == 1) || (y / 8 == (graphHeight / 8) - 2)) {
            ctx.fillStyle = ink1;
          }

          if ((x / 8 == 0) || (x / 8 == (graphWidth / 8) - 1) || (y / 8 == 0) || (y / 8 == (graphHeight / 8) - 1)) {
            ctx.fillStyle = ink2;
          }

          if (((x / 8 == 1) && (y / 8 == 2)) || ((x / 8 == (graphWidth / 8) - 2) && (y / 8 == (graphHeight / 8) - 3)) || ((x / 8 == 1) && (y / 8 == (graphHeight / 8) - 3)) || ((x / 8 == (graphWidth / 8) - 2) && (y / 8 == 2))) {
            ctx.fillStyle = ink2;
          }

          ctx.fillRect(x, y, 8, 8);
        }
      }

    } else if ((firstColor == 2) && (interiorColor == 2)) {
      for (x = 0; x <= graphWidth; x += 8) {
        for (y = 0; y <= graphHeight; y += 8) {
          if ((x / 8 % 2 == 0) || (y / 8 % 2 == 0)) {
            ctx.fillStyle = ink2;
          } else {
            ctx.fillStyle = ink1;
          }

          if ((x / 8 == 2) || (x / 8 == (graphWidth / 8) - 3) || (y / 8 == 2) || (y / 8 == (graphHeight / 8) - 3)) {
            ctx.fillStyle = ink2;
          }

          if ((x / 8 == 1) || (x / 8 == (graphWidth / 8) - 2) || (y / 8 == 1) || (y / 8 == (graphHeight / 8) - 2)) {
            ctx.fillStyle = ink1;
          }

          if ((x / 8 == 0) || (x / 8 == (graphWidth / 8) - 1) || (y / 8 == 0) || (y / 8 == (graphHeight / 8) - 1)) {
            ctx.fillStyle = ink2;
          }

          if (((x / 8 == 1) && (y / 8 == 2)) || ((x / 8 == (graphWidth / 8) - 2) && (y / 8 == (graphHeight / 8) - 3)) || ((x / 8 == 1) && (y / 8 == (graphHeight / 8) - 3)) || ((x / 8 == (graphWidth / 8) - 2) && (y / 8 == 2))) {
            ctx.fillStyle = ink2;
          }

          ctx.fillRect(x, y, 8, 8);
        }
      }
    }


    drawReverseGraph()

  } else if (selectedStyle == 2) {

    if ((firstColor == 1) && (interiorColor == 2)) {
      for (x = 0; x <= graphWidth; x += 8) {
        for (y = 0; y <= graphHeight; y += 8) {

          ctx.fillStyle = ink2;

          if ((x / 8 == 2) || (x / 8 == (graphWidth / 8) - 3) || (y / 8 == 2) || (y / 8 == (graphHeight / 8) - 3)) {
            ctx.fillStyle = ink1;
          }

          if ((x / 8 == 1) || (x / 8 == (graphWidth / 8) - 2) || (y / 8 == 1) || (y / 8 == (graphHeight / 8) - 2)) {
            ctx.fillStyle = ink2;
          }

          if ((x / 8 == 0) || (x / 8 == (graphWidth / 8) - 1) || (y / 8 == 0) || (y / 8 == (graphHeight / 8) - 1)) {
            ctx.fillStyle = ink1;
          }

          ctx.fillRect(x, y, 8, 8);
        }
      }

    } else if ((firstColor == 1) && (interiorColor == 1)) {

      for (x = 0; x <= graphWidth; x += 8) {
        for (y = 0; y <= graphHeight; y += 8) {
          ctx.fillStyle = ink1;

          if ((x / 8 == 2) || (x / 8 == (graphWidth / 8) - 3) || (y / 8 == 2) || (y / 8 == (graphHeight / 8) - 3)) {
            ctx.fillStyle = ink1;
          }

          if ((x / 8 == 1) || (x / 8 == (graphWidth / 8) - 2) || (y / 8 == 1) || (y / 8 == (graphHeight / 8) - 2)) {
            ctx.fillStyle = ink2;
          }

          if ((x / 8 == 0) || (x / 8 == (graphWidth / 8) - 1) || (y / 8 == 0) || (y / 8 == (graphHeight / 8) - 1)) {
            ctx.fillStyle = ink1;
          }


          ctx.fillRect(x, y, 8, 8);
        }
      }

    } else if ((firstColor == 2) && (interiorColor == 1)) {

      for (x = 0; x <= graphWidth; x += 8) {
        for (y = 0; y <= graphHeight; y += 8) {

          ctx.fillStyle = ink1;

          if ((x / 8 == 2) || (x / 8 == (graphWidth / 8) - 3) || (y / 8 == 2) || (y / 8 == (graphHeight / 8) - 3)) {
            ctx.fillStyle = ink2;
          }

          if ((x / 8 == 1) || (x / 8 == (graphWidth / 8) - 2) || (y / 8 == 1) || (y / 8 == (graphHeight / 8) - 2)) {
            ctx.fillStyle = ink1;
          }

          if ((x / 8 == 0) || (x / 8 == (graphWidth / 8) - 1) || (y / 8 == 0) || (y / 8 == (graphHeight / 8) - 1)) {
            ctx.fillStyle = ink2;
          }

          ctx.fillRect(x, y, 8, 8);
        }
      }

    } else if ((firstColor == 2) && (interiorColor == 2)) {
      for (x = 0; x <= graphWidth; x += 8) {
        for (y = 0; y <= graphHeight; y += 8) {

          ctx.fillStyle = ink2;


          if ((x / 8 == 2) || (x / 8 == (graphWidth / 8) - 3) || (y / 8 == 2) || (y / 8 == (graphHeight / 8) - 3)) {
            ctx.fillStyle = ink2;
          }

          if ((x / 8 == 1) || (x / 8 == (graphWidth / 8) - 2) || (y / 8 == 1) || (y / 8 == (graphHeight / 8) - 2)) {
            ctx.fillStyle = ink1;
          }

          if ((x / 8 == 0) || (x / 8 == (graphWidth / 8) - 1) || (y / 8 == 0) || (y / 8 == (graphHeight / 8) - 1)) {
            ctx.fillStyle = ink2;
          }

          ctx.fillRect(x, y, 8, 8);
        }
      }
    }

  }

  drawGrids()
  drawSymmetry()
  getPatternArray()
  drawThumbnailGraph()
  drawStitchOverlay()
  document.getElementById("saveLanding").disabled = false
  document.getElementById("continueLanding").disabled = false


  document.getElementById("cells").addEventListener("mousedown", function () { overFrontGraph = true; startMarking(event) });
  document.getElementById("cells").addEventListener("mouseup", stopMarking);
  patternLoaded = true
};

function drawReverseGraph() {
  if (selectedStyle != 1) {
    return
  }

  var fc
  var sc
  var cCell

  if (firstColor == 1) {
    fc = "" + ink1
    sc = "" + ink2
  } else if (firstColor == 2) {
    sc = "" + ink1
    fc = "" + ink2
  }

  alertOK = true

  for (x = graphWidth; x >= 0; x -= 8) {

    for (y = graphHeight; y >= 0; y -= 8) {

      cCell = ctx.getImageData(x, y, 1, 1).data;
      cCellColor = "rgb(" + cCell[0] + ', ' + cCell[1] + ', ' + cCell[2] + ")";

      if ((cCellColor == fc) && ((x / 8) % 2 == 1) && ((y / 8) % 2 == 0)) {
        ctxOther.fillStyle = sc
        ctxOther.fillRect(graphWidth - x, y, -8, 8);
      }
      if ((cCellColor == fc) && ((x / 8) % 2 == 0) && ((y / 8) % 2 == 1)) {
        ctxOther.fillStyle = sc
        ctxOther.fillRect(graphWidth - x, y, -8, 8);
      }

      if ((cCellColor == sc) && ((x / 8) % 2 == 1) && ((y / 8) % 2 == 0)) {
        ctxOther.fillStyle = fc
        ctxOther.fillRect(graphWidth - x, y, -8, 8);
      }
      if ((cCellColor == sc) && ((x / 8) % 2 == 0) && ((y / 8) % 2 == 1)) {
        ctxOther.fillStyle = fc
        ctxOther.fillRect(graphWidth - x, y, -8, 8);
      }

      if (((x / 8) % 2 == 0) && ((y / 8) % 2 == 0)) {
        ctxOther.fillStyle = fc
        ctxOther.fillRect(graphWidth - x, y, -8, 8);
      }
      if (((x / 8) % 2 == 1) && ((y / 8) % 2 == 1)) {
        ctxOther.fillStyle = sc
        ctxOther.fillRect(graphWidth - x, y, -8, 8);
      }
      if ((y / 8 == 0) || (x / 8 == 0) || (y / 8 == innerHeight - 1) || (x / 8 == innerWidth - 1)) {
        ctxOther.fillStyle = fc
        ctxOther.fillRect(graphWidth - x, y, -8, 8);
      }


    }
  }
  for (x = 0; x <= graphWidth; x += 8) {
    gridCtxBack.fillStyle = "rgb(127,127,127)"
    gridCtxBack.fillRect(x, 0, 1, graphHeight);
  }

  for (y = 0; y <= graphHeight; y += 8) {
    gridCtxBack.fillStyle = "rgb(127,127,127)"
    gridCtxBack.fillRect(0, y, graphWidth, 1);
  }
};

function drawPreviewGraph() {

  previewGraphCtx.drawImage(document.getElementById('cells'), 0, 0)

  // Draw Preview Grid
  for (x = 0; x <= graphWidth; x += 8) {
    previewGridCtx.fillStyle = "rgba(127,127,127,.75)"
    previewGridCtx.fillRect(x, 0, 1, graphHeight);
  }
  for (y = 0; y <= graphHeight; y += 8) {
    previewGridCtx.fillStyle = "rgba(127,127,127,.75)"
    previewGridCtx.fillRect(0, y, graphWidth, 1);
  }

  drawRowMarkers()

};

function previewGraphToggle() {
  graphThumb = document.getElementById("graphThumbnail");
  graphThumbButton = document.getElementById("previewGraphButton");
  switch (graphPreviewVisible) {
    case false:
      graphThumb.style.right = "30px"
      graphPreviewVisible = true
      graphThumbButton.style.backgroundColor = "#5fc66d"
      break;
    case true:
      graphThumb.style.right = "-33vw"
      graphPreviewVisible = false
      graphThumbButton.style.backgroundColor = "#ff7fff"

      break;
  }
};

function drawThumbnailGraph() {
  ctxThumb.clearRect(0, 0, ctxThumb.width, ctxThumb.height);
  let row = 0
  graphThumb = document.getElementById("graphThumbnail");
  ctxThumb = graphThumb.getContext("2d", { willReadFrequently: true });

  for (let x = 0; x <= patternArray.length - 1; x++) {
    for (let y = 0; y <= innerHeight - 1; y++, x++) {
      cCell = Number(patternArray[x])
      switch (cCell) {
        case 1:
          ctxThumb.fillStyle = ink1
          ctxThumb.fillRect(row, y, 1, 1)
          break;
        case 2:
          ctxThumb.fillStyle = greyColor
          ctxThumb.fillRect(row, y, 1, 1)
          break;
        case 0:
          ctxThumb.fillStyle = ink2
          ctxThumb.fillRect(row, y, 1, 1)
          break;
      }
    }
    row++
  }
};

// Overlays
function drawGrids() {
  gridLines = document.getElementById("gridLines");
  previewGridLines = document.getElementById("previewGridLines");
  gridContainer = document.getElementById("gridLinesContainer");
  previewGridContainer = document.getElementById("previewGridLinesContainer");

  gridCtx = gridLines.getContext("2d", { willReadFrequently: true });
  previewGridCtx = previewGridLines.getContext("2d", { willReadFrequently: true });

  gridContainer.style.width = (graphWidth + "px")
  gridContainer.style.height = (graphHeight + "px")

  previewGridContainer.style.width = (graphWidth + "px")
  previewGridContainer.style.height = (graphHeight + "px")

  gridLines.width = graphWidth
  gridLines.height = graphHeight

  previewGridLines.width = graphWidth
  previewGridLines.height = graphHeight

  gridCtx.clearRect(0, 0, graphWidth, graphHeight);

  switch (selectedStyle) {
    case 1:
      gridCtxBack.clearRect(0, 0, graphWidth, graphHeight);
      for (x = 0; x <= graphWidth; x += 8) {
        gridCtx.fillStyle = "rgba(127,127,127,.5)"
        gridCtx.fillRect(x, 0, 1, graphHeight);
        gridCtxBack.fillStyle = "rgba(127,127,127,.5)"
        gridCtxBack.fillRect(x, 0, 1, graphHeight);
      }

      for (y = 0; y <= graphHeight; y += 8) {
        gridCtx.fillStyle = "rgba(127,127,127,.5)"
        gridCtx.fillRect(0, y, graphWidth, 1);
        gridCtxBack.fillStyle = "rgba(127,127,127,.5)"
        gridCtxBack.fillRect(0, y, graphWidth, 1);
      }
      break;
    case 2:
      for (x = 0; x <= graphWidth; x += 8) {
        gridCtx.fillStyle = "rgba(127,127,127,.5)"
        gridCtx.fillRect(x, 0, 1, graphHeight);
      }

      for (y = 0; y <= graphHeight; y += 8) {
        gridCtx.fillStyle = "rgba(127,127,127,.5)"
        gridCtx.fillRect(0, y, graphWidth, 1);
      }
      break;
  }
};

function drawSymmetry() {

  const symLineHorz = document.getElementById("symLineHorz");
  const symLineVert = document.getElementById("symLineVert");

  const symLineHorzContainer = document.getElementById("symLineHorzContainer");
  const symLineVertContainer = document.getElementById("symLineVertContainer");

  symLineHorz.width = graphWidth;
  symLineHorz.height = graphHeight;

  symLineVert.width = graphWidth;
  symLineVert.height = graphHeight;

  symLineVertContainer.style.width = graphWidth + "px"
  symLineVertContainer.style.height = graphHeight + "px"

  symLineHorzContainer.style.width = graphWidth + "px"
  symLineHorzContainer.style.height = graphHeight + "px"

  const symHorzCtx = symLineHorz.getContext("2d", { willReadFrequently: true });
  const symVertCtx = symLineVert.getContext("2d", { willReadFrequently: true });

  var horzLine = (graphWidth / 2)
  var vertLine = (graphHeight / 2)

  symVertCtx.fillStyle = "rgba(255, 0, 0";
  symHorzCtx.fillStyle = "rgba(255, 0, 0";

  symHorzCtx.clearRect(0, 0, graphWidth, graphHeight)

  symHorzCtx.fillRect(horzLine, 0, 1, graphHeight);
  symVertCtx.fillRect(0, vertLine, graphWidth, 1);

  switch (selectedStyle) {
    case 1:
      const symLineHorzBack = document.getElementById("symLineHorzBack");
      const symLineVertBack = document.getElementById("symLineVertBack");

      const symLineHorzBackContainer = document.getElementById("symLineHorzBackContainer");
      const symLineVertBackContainer = document.getElementById("symLineVertBackContainer");

      symLineHorzBack.setAttribute('width', graphWidth);
      symLineVertBack.setAttribute('height', graphHeight);

      symLineHorzBackContainer.style.width = graphWidth + "px"
      symLineHorzBackContainer.style.height = graphHeight + "px"

      symLineVertBackContainer.style.width = graphWidth + "px"
      symLineVertBackContainer.style.height = graphHeight + "px"

      const symHorzCtxBack = symLineHorzBack.getContext("2d", { willReadFrequently: true });
      const symVertCtxBack = symLineVertBack.getContext("2d", { willReadFrequently: true });

      var horzLineBack = (symLineHorzBack.width / 2)
      var vertLineBack = (symLineVertBack.height / 2)

      symHorzCtxBack.fillStyle = "rgba(255, 0, 0";
      symVertCtxBack.fillStyle = "rgba(255, 0, 0";

      symHorzCtxBack.fillRect(horzLine, 0, 1, graphHeight);
      symVertCtxBack.fillRect(0, vertLine, graphWidth, 1);
      break;
  }
};

// Resized Graph
function drawResizedGraph() {

  removeResizeBorders()


  if ((topChange != 0) || (bottomChange != 0)) {
    drawResizedGraphTopBottom()
  }
  if ((leftChange != 0) || (rightChange != 0)) {
    drawResizedGraphLeftRight()
  }

  redrawResizeBorders()
  resetResizedGraphChange()

  // nameElem();
  // setElem();

  switch (selectedStyle) {
    case 1:
      getPatternArray()
      getPatternArrayBack()
      correctInterlocking()
      drawReverseGraph()

      break;
  }

  drawGrids();
  drawSymmetry();
  getPatternArray();
  drawThumbnailGraph();
  drawStitchOverlay();



  undoState = []
  undoNum = 0
  redoState = []
  redoNum = 0
};

function drawResizedGraphTopBottom() {
  getPatternArray();
  fillColor = ink2;
  let column = 0;

  graph = document.getElementById("cells");
  ctx = graph.getContext("2d", { willReadFrequently: true });

  innerHeight = document.getElementById('newStitchesHeight').value;
  innerWidth = document.getElementById('newStitchesWidth').value;

  graphHeight = innerHeight * 8;
  graphWidth = innerWidth * 8;

  graph.width = graphWidth;
  graph.height = graphHeight;

  container.style.width = (graphWidth + "px");
  container.style.height = (graphHeight + "px");

  switch (selectedStyle) {
    case 2:
      for (let x = 0; x <= (patternArray.length - 1), column <= innerWidth; x++, column++) {

        for (let y = 0; y <= innerHeight - 1; y++) {

          if ((topChange < 0) && (y == 0)) {
            x -= topChange
          }

          if ((bottomChange < 0) && (y == innerHeight - 1)) {
            x -= bottomChange
          }

          if ((y >= topChange) && (y <= innerHeight - bottomChange - 1)) {

            cCell = Number(patternArray[x])

            switch (cCell) {
              case 1:
                ctx.fillStyle = ink1
                ctx.fillRect(column * 8, y * 8, 8, 8)
                break;
              case 2:
                ctx.fillStyle = greyColor
                ctx.fillRect(column * 8, y * 8, 8, 8)
                break;
              case 0:
                ctx.fillStyle = ink2
                ctx.fillRect(column * 8, y * 8, 8, 8)
                break;
            }

            x++

          } else if (y < topChange) {
            ctx.fillStyle = ink2
            ctx.fillRect(column * 8, y * 8, 8, (topChange) * 8)
            y = topChange - 1

          } else if (y > innerHeight - bottomChange - 1) {
            ctx.fillStyle = ink2
            ctx.fillRect(column * 8, y * 8, 8, (bottomChange) * 8)
            y += bottomChange
          }
        }
      }
      break;

    case 1:

      for (let x = 0; x <= innerWidth; x++) {
        for (let y = 0; y <= innerHeight; y++) {
          if ((x % 2 == 0) && (y % 2 == 0)) {
            ctx.fillStyle = ink1
          } else {
            ctx.fillStyle = ink2
          }
          ctx.fillRect(x * 8, y * 8, 8, 8)
        }
      }

      for (let x = 0; x <= (patternArray.length - 1), column <= innerWidth; x++, column++) {

        for (let y = 0; y <= innerHeight - 1; y++) {

          if ((topChange < 0) && (y == 0)) {
            x -= topChange
          }

          if ((bottomChange < 0) && (y == innerHeight - 1)) {
            x -= bottomChange
          }

          if ((y >= topChange) && (y <= innerHeight - bottomChange - 1)) {

            cCell = Number(patternArray[x])

            switch (cCell) {
              case 1:
                ctx.fillStyle = ink1
                ctx.fillRect(column * 8, y * 8, 8, 8)
                break;
              case 2:
                ctx.fillStyle = greyColor
                ctx.fillRect(column * 8, y * 8, 8, 8)
                break;
              case 0:
                ctx.fillStyle = ink2
                ctx.fillRect(column * 8, y * 8, 8, 8)
                break;
            }

            x++

          } else if (y < topChange) {
            y = topChange - 1

          } else if (y > innerHeight - bottomChange - 1) {
            y += bottomChange
          }
        }
      }
      break;
  }
};

function drawResizedGraphLeftRight() {
  getPatternArray();
  fillColor = ink2;
  let column = 0;

  graph = document.getElementById("cells");
  ctx = graph.getContext("2d", { willReadFrequently: true });

  innerHeight = document.getElementById('newStitchesHeight').value;
  innerWidth = document.getElementById('newStitchesWidth').value;

  graphHeight = innerHeight * 8;
  graphWidth = innerWidth * 8;

  graph.width = graphWidth;
  graph.height = graphHeight;

  container.style.width = (graphWidth + "px");
  container.style.height = (graphHeight + "px");

  switch (selectedStyle) {
    case 2:
      for (let x = 0; x <= (patternArray.length - 1), column <= innerWidth; x++, column++) {

        if ((column < leftChange) && (column == 0)) {

          ctx.fillStyle = ink2
          ctx.fillRect(0, 0, leftChange * 8, graphHeight)
          column += leftChange
        }

        if ((leftChange < 0) && (column == 0)) {
          x += (innerHeight) * (- leftChange) - leftChange
        }

        for (let y = 0; y <= innerHeight - 1; y++) {

          cCell = Number(patternArray[x])

          switch (cCell) {
            case 1:
              ctx.fillStyle = ink1
              ctx.fillRect(column * 8, y * 8, 8, 8)
              break;
            case 2:
              ctx.fillStyle = greyColor
              ctx.fillRect(column * 8, y * 8, 8, 8)
              break;
            case 0:
              ctx.fillStyle = ink2
              ctx.fillRect(column * 8, y * 8, 8, 8)
              break;
          }
          x++
        }
      }
      break;

    case 1:
      for (let x = 0; x <= innerWidth; x++) {
        for (let y = 0; y <= innerHeight; y++) {
          if ((x % 2 == 0) && (y % 2 == 0)) {
            ctx.fillStyle = ink1
          } else {
            ctx.fillStyle = ink2
          }
          ctx.fillRect(x * 8, y * 8, 8, 8)
        }
      }

      for (let x = 0; x <= (patternArray.length - 1), column <= innerWidth; x++, column++) {

        if ((column < leftChange) && (column == 0)) {
          column += leftChange
        }

        if ((leftChange < 0) && (column == 0)) {
          x += (innerHeight) * (- leftChange) - leftChange
        }

        for (let y = 0; y <= innerHeight - 1; y++) {

          cCell = Number(patternArray[x])

          switch (cCell) {
            case 1:
              ctx.fillStyle = ink1
              ctx.fillRect(column * 8, y * 8, 8, 8)
              break;
            case 2:
              ctx.fillStyle = greyColor
              ctx.fillRect(column * 8, y * 8, 8, 8)
              break;
            case 0:
              ctx.fillStyle = ink2
              ctx.fillRect(column * 8, y * 8, 8, 8)
              break;
          }
          x++
        }
      }
      break;
  }
  ctx.fillStyle = ink2
  ctx.fillRect(graphWidth, 0, rightChange * -8, graphHeight)
};

function resetResizedGraphChange() {

  graphChangeInput()
  graphSizeOpenClose()
  getInches()
  zoomGraph(document.getElementById('zoomSlider'))

  document.getElementById("graphChangeTop").value = 0
  document.getElementById("graphChangeBottom").value = 0
  document.getElementById("graphChangeLeft").value = 0
  document.getElementById("graphChangeRight").value = 0
};

function removeResizeBorders() {
  ctx.fillStyle = ink2

  ctx.fillRect(0, 0, graphWidth, 24)
  ctx.fillRect(0, graphHeight, graphWidth, -24)

  ctx.fillRect(0, 0, 24, graphHeight)
  ctx.fillRect(graphWidth, 0, -24, graphHeight)
};

function redrawResizeBorders() {
  switch (selectedStyle) {
    case 2:
      switch (firstColor) {
        case 1:
          ctx.fillStyle = ink1

          ctx.fillRect(0, 0, graphWidth, 24)
          ctx.fillRect(0, graphHeight, graphWidth, -24)

          ctx.fillRect(0, 0, 24, graphHeight)
          ctx.fillRect(graphWidth, 0, -24, graphHeight)

          ctx.fillStyle = ink2

          ctx.fillRect(8, 8, graphWidth - 16, 8)
          ctx.fillRect(8, graphHeight - 8, graphWidth - 16, -8)

          ctx.fillRect(8, 8, 8, graphHeight - 16)
          ctx.fillRect(graphWidth - 8, 8, -8, graphHeight - 16)


          break;

        case 2:
          ctx.fillStyle = ink2

          ctx.fillRect(0, 0, graphWidth, 24)
          ctx.fillRect(0, graphHeight, graphWidth, -24)

          ctx.fillRect(0, 0, 24, graphHeight)
          ctx.fillRect(graphWidth, 0, -24, graphHeight)

          ctx.fillStyle = ink1

          ctx.fillRect(8, 8, graphWidth - 16, 8)
          ctx.fillRect(8, graphHeight - 8, graphWidth - 16, -8)

          ctx.fillRect(8, 8, 8, graphHeight - 16)
          ctx.fillRect(graphWidth - 8, 8, -8, graphHeight - 16)
          break;
      }
      break;
    case 1:
      switch (firstColor) {
        case 1:
          ctx.fillStyle = ink1

          ctx.fillRect(0, 0, graphWidth, 24)
          ctx.fillRect(0, graphHeight, graphWidth, -24)

          ctx.fillRect(0, 0, 24, graphHeight)
          ctx.fillRect(graphWidth, 0, -24, graphHeight)

          ctx.fillStyle = ink2

          ctx.fillRect(8, 8, graphWidth - 16, 8)
          ctx.fillRect(8, graphHeight - 8, graphWidth - 16, -8)

          ctx.fillRect(8, 8, 8, graphHeight - 16)
          ctx.fillRect(graphWidth - 8, 8, -8, graphHeight - 16)

          ctx.fillStyle = ink1
          ctx.fillRect(8, 16, 8, 8)
          ctx.fillRect(graphWidth - 8, 16, -8, 8)
          ctx.fillRect(8, graphHeight - 16, 8, -8)
          ctx.fillRect(graphWidth - 8, graphHeight - 16, -8, -8)


          break;

        case 2:
          ctx.fillStyle = ink2

          ctx.fillRect(0, 0, graphWidth, 24)
          ctx.fillRect(0, graphHeight, graphWidth, -24)

          ctx.fillRect(0, 0, 24, graphHeight)
          ctx.fillRect(graphWidth, 0, -24, graphHeight)

          ctx.fillStyle = ink1

          ctx.fillRect(8, 8, graphWidth - 16, 8)
          ctx.fillRect(8, graphHeight - 8, graphWidth - 16, -8)

          ctx.fillRect(8, 8, 8, graphHeight - 16)
          ctx.fillRect(graphWidth - 8, 8, -8, graphHeight - 16)

          ctx.fillStyle = ink2
          ctx.fillRect(8, 16, 8, 8)
          ctx.fillRect(graphWidth - 8, 16, -8, 8)
          ctx.fillRect(8, graphHeight - 16, 8, -8)
          ctx.fillRect(graphWidth - 8, graphHeight - 16, -8, -8)
          break;
      }

      break;
  }
};

function resetGraphSizeValues() {
  ///////////////////////////////////////////////////
  container.style.width = (graphWidth + "px")
  container.style.height = (graphHeight + "px")

  gridContainer.style.width = (graphWidth + "px")
  gridContainer.style.height = (graphHeight + "px")

  stitchContainer.style.width = (graphWidth + "px")
  stitchContainer.style.height = (graphHeight + "px")

  //////////////////////////////////////////////////
  previewGraphContainer.style.width = (graphWidth + "px")
  previewGraphContainer.style.height = (graphHeight + "px")

  previewGridContainer.style.width = (graphWidth + "px")
  previewGridContainer.style.height = (graphHeight + "px")

  previewStitchContainer.style.width = (graphWidth + "px")
  previewStitchContainer.style.height = (graphHeight + "px")

  previewTickingContainer.style.width = (graphWidth + "px")
  previewTickingContainer.style.height = (graphHeight + "px")

  ///////////////////////////////////////////////////
  graph.width = graphWidth
  graph.height = graphHeight

  gridLines.width = graphWidth
  gridLines.height = graphHeight

  stitchesOverlay.width = graphWidth
  stitchesOverlay.height = graphHeight

  ///////////////////////////////////////////////////
  previewGraph.width = graphWidth
  previewGraph.height = graphHeight

  previewGridLines.width = graphWidth
  previewGridLines.height = graphHeight

  previewStitchesOverlay.width = graphWidth
  previewStitchesOverlay.height = graphHeight

  previewTicking.width = graphWidth
  previewTicking.height = graphHeight

  switch (selectedStyle) {
    case 1:
      containerBack.style.width = (graphWidth + "px")
      containerBack.style.height = (graphHeight + "px")

      gridContainerBack.style.width = (graphWidth + "px")
      gridContainerBack.style.height = (graphHeight + "px")

      stitchContainerBack.style.width = (graphWidth + "px")
      stitchContainerBack.style.height = (graphHeight + "px")

      graphBack.width = graphWidth
      graphBack.height = graphHeight

      gridLinesBack.width = graphWidth
      gridLinesBack.height = graphHeight

      stitchesOverlayBack.width = graphWidth
      stitchesOverlayBack.height = graphHeight
      break;
  }
};

// Change Styles
async function changeStyle() {

  overFrontGraph = false;
  ctx = graph.getContext("2d", { willReadFrequently: true });
  getPatternArray();

  switch (selectedStyle) {
    case 1:
      if (removeDots == true) {
        await mosaicFills();
      }
      selectedStyle = 2;

      document.getElementById('leftArrowGraph').style.visibility = "hidden";
      document.getElementById('rightArrowGraph').style.visibility = "hidden";
      document.getElementById("graph").style.width = "100%";
      document.getElementById("leftArrowGraph").style.right = "1%";
      document.getElementById("graphBack").style.width = "0%";
      document.getElementById("rightArrowGraph").style.left = "100%";
      graphGraphPosition = 2;

      break;

    case 2:
      selectedStyle = 1;

      document.getElementById('leftArrowGraph').style.visibility = "visible";
      document.getElementById('rightArrowGraph').style.visibility = "visible";

      await correctInterlocking();
      // resetGraphSizeValues();
      await nameElem();
      containerBack.style.width = (graphWidth + "px")
      containerBack.style.height = (graphHeight + "px")

      gridContainerBack.style.width = (graphWidth + "px")
      gridContainerBack.style.height = (graphHeight + "px")

      stitchContainerBack.style.width = (graphWidth + "px")
      stitchContainerBack.style.height = (graphHeight + "px")

      graphBack.width = graphWidth
      graphBack.height = graphHeight

      gridLinesBack.width = graphWidth
      gridLinesBack.height = graphHeight

      stitchesOverlayBack.width = graphWidth
      stitchesOverlayBack.height = graphHeight
      await drawReverseGraph()
      await gridLineChange()
      await gridLineChange()


      break;

  }
  await drawGrids()
  await drawSymmetry()
  await getPatternArray()
  await drawThumbnailGraph()
  await drawStitchOverlay()
  await drawPreviewGraph()
  await zoomGraph(document.getElementById('zoomSlider'))
  await toolMenuSizeChange()
  undoState = []
  undoNum = 0
  redoState = []
  redoNum = 0
}

function correctInterlocking() {
  switch (firstColor) {
    case 1:
      for (let x = 0; x <= innerWidth; x++) {
        for (let y = 0; y <= innerHeight; y++) {

          if ((x % 2 == 0) && (y % 2 == 0)) {
            ctx.fillStyle = ink1;
            ctx.fillRect(x * 8, y * 8, 8, 8);

          }
          if ((x % 2 == 1) && (y % 2 == 1)) {
            ctx.fillStyle = ink2;
            ctx.fillRect(x * 8, y * 8, 8, 8);
          }

        }
      }
      break;
    case 2:
      for (let x = 0; x <= innerWidth; x++) {
        for (let y = 0; y <= innerHeight; y++) {

          if ((x % 2 == 0) && (y % 2 == 0)) {
            ctx.fillStyle = ink2;
            ctx.fillRect(x * 8, y * 8, 8, 8);

          }
          if ((x % 2 == 1) && (y % 2 == 1)) {
            ctx.fillStyle = ink1;
            ctx.fillRect(x * 8, y * 8, 8, 8);
          }

        }
      }
      break;
  }
};

function mosaicFills() {
  for (let x = 16; x < graphWidth; x += 8) {
    for (let y = 16; y < graphHeight; y += 8) {

      cCell = ctx.getImageData(x, y, 1, 1).data;
      lCell = ctx.getImageData(x, y - 8, 1, 1).data;
      rCell = ctx.getImageData(x, y + 8, 1, 1).data;
      uCell = ctx.getImageData(x - 8, y, 1, 1).data;
      dCell = ctx.getImageData(x + 8, y, 1, 1).data;

      cCellColor = "rgb(" + cCell[0] + ", " + cCell[1] + ", " + cCell[2] + ")";
      lCellColor = "rgb(" + lCell[0] + ", " + lCell[1] + ", " + lCell[2] + ")";
      rCellColor = "rgb(" + rCell[0] + ", " + rCell[1] + ", " + rCell[2] + ")";
      uCellColor = "rgb(" + uCell[0] + ", " + uCell[1] + ", " + uCell[2] + ")";
      dCellColor = "rgb(" + dCell[0] + ", " + dCell[1] + ", " + dCell[2] + ")";

      if ((lCellColor == ink1) && (rCellColor == ink1) && (uCellColor == ink1) && (dCellColor == ink1) && (cCellColor == ink2)) {
        ctx.fillStyle = ink1;
        ctx.fillRect(x, y, 8, 8);
      } else if ((lCellColor == ink2) && (rCellColor == ink2) && (uCellColor == ink2) && (dCellColor == ink2) && (cCellColor == ink1)) {
        ctx.fillStyle = ink2;
        ctx.fillRect(x, y, 8, 8);
      }

    }
  }
};

// Color Functions
async function hueChange() {

  ogink1 = "" + document.getElementById("ink1PickHeader").style.backgroundColor
  ogink2 = "" + document.getElementById("ink2PickHeader").style.backgroundColor

  hueEl = document.getElementById('hueSlider')
  hueVal = hueEl.value

  satEl = document.getElementById('saturationSlider')
  satVal = satEl.value

  lightEl = document.getElementById('lightnessSlider')
  lightVal = lightEl.value

  ink1Background = document.getElementById("ink1PickHeader").style.backgroundColor
  ink2Background = document.getElementById("ink2PickHeader").style.backgroundColor

  hueBackground = "linear-gradient(90deg, hsl(  0, " + satVal + "%, " + lightVal + "%) 0%, hsl( 10, " + satVal + "%, " + lightVal + "%), hsl( 20, " + satVal + "%, " + lightVal + "%), hsl( 30, " + satVal + "%, " + lightVal + "%), hsl( 40, " + satVal + "%, " + lightVal + "%), hsl( 50, " + satVal + "%, " + lightVal + "%), hsl( 60, " + satVal + "%, " + lightVal + "%), hsl( 70, " + satVal + "%, " + lightVal + "%),hsl( 80, " + satVal + "%, " + lightVal + "%), hsl( 90, " + satVal + "%, " + lightVal + "%), hsl(100, " + satVal + "%, " + lightVal + "%), hsl(110, " + satVal + "%, " + lightVal + "%), hsl(120, " + satVal + "%, " + lightVal + "%), hsl(130, " + satVal + "%, " + lightVal + "%), hsl(140, " + satVal + "%, " + lightVal + "%), hsl(150, " + satVal + "%, " + lightVal + "%), hsl(160, " + satVal + "%, " + lightVal + "%), hsl(170, " + satVal + "%, " + lightVal + "%), hsl(180, " + satVal + "%, " + lightVal + "%), hsl(190, " + satVal + "%, " + lightVal + "%), hsl(200, " + satVal + "%, " + lightVal + "%), hsl(210, " + satVal + "%, " + lightVal + "%), hsl(220, " + satVal + "%, " + lightVal + "%), hsl(230, " + satVal + "%, " + lightVal + "%), hsl(240, " + satVal + "%, " + lightVal + "%), hsl(250, " + satVal + "%, " + lightVal + "%), hsl(260, " + satVal + "%, " + lightVal + "%), hsl(270, " + satVal + "%, " + lightVal + "%), hsl(280, " + satVal + "%, " + lightVal + "%), hsl(290, " + satVal + "%, " + lightVal + "%), hsl(300, " + satVal + "%, " + lightVal + "%), hsl(310, " + satVal + "%, " + lightVal + "%), hsl(320, " + satVal + "%, " + lightVal + "%), hsl(330, " + satVal + "%, " + lightVal + "%), hsl(340, " + satVal + "%, " + lightVal + "%), hsl(350, " + satVal + "%, " + lightVal + "%), hsl(360, " + satVal + "%, " + lightVal + "%) 100%)"

  satBackground = "linear-gradient(90deg, hsl(" + hueVal + ", 0%, " + lightVal + "%) 0%, hsl(" + hueVal + ", 50%, " + lightVal + "%), hsl(" + hueVal + ", 100%, " + lightVal + "%) 100%)"
  lightBackground = "linear-gradient(90deg, hsl(" + hueVal + ", " + satVal + "%, 0%) 0%, hsl(" + hueVal + ", " + satVal + "%, 50%), hsl(" + hueVal + ", " + satVal + "%, 100%) 100%)"

  pickedColor = "hsl(" + hueVal + ", " + satVal + "%, " + lightVal + "%)"
  // saturationBarColor = "hsl("+hueVal+", 100%, "+lightVal+"%)"
  // lightnessBarColor = "hsl("+hueVal+", "+satVal+"%, 90%)"

  document.getElementById('saturationSlider').style.backgroundImage = satBackground
  document.getElementById('lightnessSlider').style.backgroundImage = lightBackground
  document.getElementById('hueSlider').style.backgroundImage = hueBackground

  if ((hslToRGB(hueVal / 360, satVal / 360, lightVal / 100) != ink1Background) && (hslToRGB(hueVal / 360, satVal / 360, lightVal / 100) != ink2Background)) {
    switch (ink1Selected) {
      case true:
        document.getElementById("ink1PickHeader").style.backgroundColor = pickedColor;
        break;

      case false:
        document.getElementById("ink2PickHeader").style.backgroundColor = pickedColor;
        break;
    }

    ink1String = document.getElementById("ink1PickHeader").style.backgroundColor;
    ink2String = document.getElementById("ink2PickHeader").style.backgroundColor;

    ink1 = document.getElementById("ink1PickHeader").style.backgroundColor
    ink2 = document.getElementById("ink2PickHeader").style.backgroundColor

    ink1RGB = ink1String.substring(
      ink1String.indexOf('(') + 1,
      ink1String.lastIndexOf(')')
    ).split(/,\s*/);

    redDark = Number(ink1RGB[0]);
    greenDark = Number(ink1RGB[1]);
    blueDark = Number(ink1RGB[2]);

    ink2RGB = ink2String.substring(
      ink2String.indexOf('(') + 1,
      ink2String.lastIndexOf(')')
    ).split(/,\s*/);

    redLight = Number(ink2RGB[0]);
    greenLight = Number(ink2RGB[1]);
    blueLight = Number(ink2RGB[2]);

    switch (ink1Selected) {
      case true:
        hueDarkSliderVal = hueVal;
        satDarkSliderVal = satVal;
        lightDarkSliderVal = lightVal;
        break;

      case false:
        hueLightSliderVal = hueVal;
        satLightSliderVal = satVal;
        lightLightSliderVal = lightVal;
        break;
    }

    graphColorChange()

    drawToolButtons()
    changeToolDropdown()
  }
};

function graphColorChange() {

  switch (selectedStyle) {
    case 1:
      for (x = 0; x <= graphWidth; x += 8) {
        for (y = 0; y <= graphHeight; y += 8) {

          cCell = ctx.getImageData(x, y, 1, 1).data;
          cCellBack = ctxOther.getImageData(x, y, 1, 1).data;

          cCellColor = "rgb(" + cCell[0] + ", " + cCell[1] + ", " + cCell[2] + ")"
          cCellColorBack = "rgb(" + cCellBack[0] + ", " + cCellBack[1] + ", " + cCellBack[2] + ")"

          switch (ink1Selected) {
            case true:
              if (cCellColor == ogink1) {
                ctx.fillStyle = ink1
                ctx.fillRect(x, y, 8, 8);
                ctxThumb.fillStyle = ink1
                ctxThumb.fillRect(x / 8, y / 8, 1, 1);
              }
              if (cCellColorBack == ogink1) {
                ctxOther.fillStyle = ink1
                ctxOther.fillRect(x, y, 8, 8);
              }
              break;

            case false:
              if (cCellColor == ogink2) {
                ctx.fillStyle = ink2
                ctx.fillRect(x, y, 8, 8);
                ctxThumb.fillStyle = ink2
                ctxThumb.fillRect(x / 8, y / 8, 1, 1);
              }
              if (cCellColorBack == ogink2) {
                ctxOther.fillStyle = ink2
                ctxOther.fillRect(x, y, 8, 8);
              }
              break;
          }
        }
      }
      break;

    case 2:
      for (x = 0; x <= graphWidth; x += 8) {
        for (y = 0; y <= graphHeight; y += 8) {

          cCell = ctx.getImageData(x, y, 1, 1).data;
          cCellColor = "rgb(" + cCell[0] + ", " + cCell[1] + ", " + cCell[2] + ")"

          switch (ink1Selected) {
            case true:
              if (cCellColor == ogink1) {
                ctx.fillStyle = ink1
                ctx.fillRect(x, y, 8, 8);
                ctxThumb.fillStyle = ink1
                ctxThumb.fillRect(x / 8, y / 8, 1, 1);
              }
              break;
            case false:
              if (cCellColor == ogink2) {
                ctx.fillStyle = ink2
                ctx.fillRect(x, y, 8, 8);
                ctxThumb.fillStyle = ink2
                ctxThumb.fillRect(x / 8, y / 8, 1, 1);
              }
              break;
          }

        }
      }
      break;
  }
};

function drawToolButtons() {
  switch (ink1Selected) {
    case true:
      document.getElementById("solidTool").style.backgroundColor = ink1
      // document.getElementById("fillTool").style.backgroundColor = ink1
      document.getElementById("shadeTool").style.backgroundImage = "linear-gradient(180deg, " + ink1 + " 0%, " + ink2 + "100%)"
      // document.getElementById("markerSizeInner1").style.backgroundColor = ink1
      // document.getElementById("markerSizeInner3").style.backgroundColor = ink1
      // document.getElementById("markerSizeInner5").style.backgroundColor = ink1
      // document.getElementById("markerSizeInner7").style.backgroundColor = ink1
      break;
    case false:
      document.getElementById("solidTool").style.backgroundColor = ink2
      // document.getElementById("fillTool").style.backgroundColor = ink2
      document.getElementById("shadeTool").style.backgroundImage = "linear-gradient(0deg, " + ink1 + " 0%, " + ink2 + "100%)"
      // document.getElementById("markerSizeInner1").style.backgroundColor = ink2
      // document.getElementById("markerSizeInner3").style.backgroundColor = ink2
      // document.getElementById("markerSizeInner5").style.backgroundColor = ink2
      // document.getElementById("markerSizeInner7").style.backgroundColor = ink2
      break;
  }

  switch (shadeType) {
    case 0:
      switch (ink1Selected) {
        case true:
          document.getElementById("shadingHatch").style.border = "medium dashed " + ink1;
          document.getElementById('shadePicked').innerHTML = '<label>Hatching</label>'
          break;
        case false:
          document.getElementById("shadingHatch").style.border = "medium dashed " + ink2;
          document.getElementById('shadePicked').innerHTML = '<label>Hatching</label>'
          break;
      }
      break;

    case 1:
      switch (ink1Selected) {
        case true:
          document.getElementById("shadingHorz").style.border = "medium dashed " + ink1;
          document.getElementById('shadePicked').innerHTML = '<label>Horizontal</label>'
          break;
        case false:
          document.getElementById("shadingHorz").style.border = "medium dashed " + ink2;
          document.getElementById('shadePicked').innerHTML = '<label>Horizontal</label>'
          break;
      }
      break;

    case 2:
      switch (ink1Selected) {
        case true:
          document.getElementById("shadingVert").style.border = "medium dashed " + ink1;
          document.getElementById('shadePicked').innerHTML = '<label>Vertical</label>'
          break;
        case false:
          document.getElementById("shadingVert").style.border = "medium dashed " + ink2;
          document.getElementById('shadePicked').innerHTML = '<label>Vertical</label>'
          break;
      }
      break;
  }

  hatch = document.getElementById("shadingHatch");
  ctxHatch = hatch.getContext("2d", { willReadFrequently: true });
  hatch.width = 50
  hatch.height = 50
  hatchLoaded = true

  vert = document.getElementById("shadingVert");
  ctxVert = vert.getContext("2d", { willReadFrequently: true });
  vert.width = 50
  vert.height = 50

  horz = document.getElementById("shadingHorz");
  ctxHorz = horz.getContext("2d", { willReadFrequently: true });
  horz.width = 50
  horz.height = 50

  // Draw Buttons
  switch (ink1Selected) {
    case false:
      ctxHatch.fillStyle = ink1
      ctxHatch.fillRect(0, 0, 50, 50);
      ctxHatch.fillStyle = ink2

      ctxVert.fillStyle = ink1
      ctxVert.fillRect(0, 0, 50, 50);
      ctxVert.fillStyle = ink2

      ctxHorz.fillStyle = ink1
      ctxHorz.fillRect(0, 0, 50, 50);
      ctxHorz.fillStyle = ink2
      break;
    case true:
      ctxHatch.fillStyle = ink2
      ctxHatch.fillRect(0, 0, 50, 50);
      ctxHatch.fillStyle = ink1

      ctxVert.fillStyle = ink2
      ctxVert.fillRect(0, 0, 50, 50);
      ctxVert.fillStyle = ink1

      ctxHorz.fillStyle = ink2
      ctxHorz.fillRect(0, 0, 50, 50);
      ctxHorz.fillStyle = ink1
      break;
  }

  //Vert Fills
  ctxHatch.fillRect(5, 0, 5, 50);
  ctxHatch.fillRect(15, 0, 5, 40);
  ctxHatch.fillRect(25, 0, 5, 30);
  ctxHatch.fillRect(35, 0, 5, 20);
  ctxHatch.fillRect(45, 0, 5, 10);

  ctxVert.fillRect(5, 0, 5, 50);
  ctxVert.fillRect(15, 0, 5, 50);
  ctxVert.fillRect(25, 0, 5, 50);
  ctxVert.fillRect(35, 0, 5, 50);
  ctxVert.fillRect(45, 0, 5, 50);

  // Horz Fills
  ctxHatch.fillRect(0, 5, 50, 5);
  ctxHatch.fillRect(0, 15, 40, 5);
  ctxHatch.fillRect(0, 25, 30, 5);
  ctxHatch.fillRect(0, 35, 20, 5);
  ctxHatch.fillRect(0, 45, 10, 5);

  ctxHorz.fillRect(0, 5, 50, 5);
  ctxHorz.fillRect(0, 15, 50, 5);
  ctxHorz.fillRect(0, 25, 50, 5);
  ctxHorz.fillRect(0, 35, 50, 5);
  ctxHorz.fillRect(0, 45, 50, 5);

  // Square Fills
  ctxHatch.fillRect(15, 45, 5, 5);

  ctxHatch.fillRect(25, 35, 5, 5);
  ctxHatch.fillRect(25, 45, 5, 5);

  ctxHatch.fillRect(35, 25, 5, 5);
  ctxHatch.fillRect(35, 35, 5, 5);
  ctxHatch.fillRect(35, 45, 5, 5);

  ctxHatch.fillRect(45, 15, 5, 5);
  ctxHatch.fillRect(45, 25, 5, 5);
  ctxHatch.fillRect(45, 35, 5, 5);
  ctxHatch.fillRect(45, 45, 5, 5);
};

function toolMenuSizeChange() {
  switch (toolPicked) {
    case 1:
      switch (selectedStyle) {
        case 2:
          document.getElementById("shadingHatch").style.opacity = "100%"
          document.getElementById("shadingHatch").style.display = ""
          document.getElementById("shadingHatch").disabled = false

          document.getElementById("shadingHorz").style.opacity = "100%"
          document.getElementById("shadingHorz").style.display = ""
          document.getElementById("shadingHorz").style.marginRight = "10px"

          document.getElementById("shadingVert").style.opacity = "100%"
          document.getElementById("shadingVert").style.display = ""

          document.getElementById("shadeOptionContainer").style.opacity = "100%"
          document.getElementById("shadeOptionContainer").style.display = ""

          document.getElementById("markSizeOptionContainer").style.bottom = "0px"
          document.getElementById("toolOptionsDivider").style.bottom = "0px"
          document.getElementById('toolOptions').style.height = "370px"
          // document.getElementById('toolOptionsBottom').style.height = "425px"
          break;


        case 1:
          document.getElementById("shadingHatch").style.opacity = "0%"
          document.getElementById("shadingHatch").style.display = "none"

          document.getElementById("shadingHorz").style.opacity = "100%"
          document.getElementById("shadingHorz").style.display = ""
          document.getElementById("shadingHorz").style.marginRight = "0px"

          document.getElementById("shadingVert").style.opacity = "100%"
          document.getElementById("shadingVert").style.display = ""

          document.getElementById("shadeOptionContainer").style.opacity = "100%"
          document.getElementById("shadeOptionContainer").style.display = ""

          // document.getElementById("markSizeOptionContainer").style.bottom="55px"
          document.getElementById("toolOptionsDivider").style.bottom = "0px"
          document.getElementById('toolOptions').style.height = "370px"
          // document.getElementById('toolOptionsBottom').style.height = "350px"

          if (shadeType == 0) {
            shadingHorzClick()
          }
          break;
      }
      break;

    case 0:
      document.getElementById("shadeOptionContainer").style.opacity = "0%"
      document.getElementById("shadeOptionContainer").style.display = "none"

      document.getElementById("shadingHatch").style.opacity = "0%"
      document.getElementById("shadingHatch").style.display = "none"

      document.getElementById("shadingHorz").style.opacity = "0%"
      document.getElementById("shadingHorz").style.display = "none"

      document.getElementById("shadingVert").style.opacity = "0%"
      document.getElementById("shadingVert").style.display = "none"

      document.getElementById("markSizeOptionContainer").style.bottom = "255px"
      document.getElementById('toolOptions').style.height = "255px"
      document.getElementById('toolOptionsBottom').style.height = "125px"
      break;
  }
};

async function changeMainColorToInk1() {
  if (ink1Selected) {
    toolOption()
    return
  } else {
    ink1Selected = true;

    if (document.getElementById("solidTool").style.border != "") {
      document.getElementById("solidTool").style.border = "medium dashed " + ink2;
    }
    document.getElementById("ink1PickHeader").style.border = "medium dashed " + ink2;
    document.getElementById("ink2PickHeader").style.border = "";
    
    
    document.getElementById('hueSlider').value = hueDarkSliderVal
    document.getElementById('saturationSlider').value = satDarkSliderVal
    document.getElementById('lightnessSlider').value = lightDarkSliderVal
    
    document.getElementById("solidTool").style.backgroundColor = ink1
    document.getElementById("shadeTool").style.backgroundImage = "linear-gradient(180deg, " + ink1 + " 0%, " + ink2 + "100%)"
    
    await hueChange()
    await drawToolButtons()
    await changeToolDropdown()
  }
};

async function changeMainColorToInk2() {
  if (ink1Selected == false) {
    toolOption();
    return;
  } else {
    ink1Selected = false;
    
    if (document.getElementById("solidTool").style.border != "") {
      document.getElementById("solidTool").style.border = "medium dashed " + ink1;
    }

    document.getElementById("ink2PickHeader").style.border = "medium dashed " + ink1;
    document.getElementById("ink1PickHeader").style.border = "";
    
    document.getElementById('hueSlider').value = hueLightSliderVal
    document.getElementById('saturationSlider').value = satLightSliderVal
    document.getElementById('lightnessSlider').value = lightLightSliderVal
    
    
    document.getElementById("solidTool").style.backgroundColor = ink2
    document.getElementById("shadeTool").style.backgroundImage = "linear-gradient(0deg, " + ink1 + " 0%, " + ink2 + "100%)"
    
    await hueChange()
    await drawToolButtons()
    await changeToolDropdown()
  };
};

async function changeToolToShade() {
  if ((document.getElementById("ink2PickHeader").style.border != "") || (document.getElementById("ink1PickHeader").style.border != "")) {

    toolPicked = 1

    toolMenuSizeChange()

    document.getElementById("shadeTool").style.border = "medium dashed black";
    document.getElementById("solidTool").style.border = ""

    await drawToolButtons()
    await changeToolDropdown()
  }
};

async function changeToolToSolid() {
  if ((document.getElementById("ink2PickHeader").style.border != "") || (document.getElementById("ink1PickHeader").style.border != "")) {
    toolPicked = 0

    if (document.getElementById("ink2PickHeader").style.border != "") {
      document.getElementById("solidTool").style.border = "medium dashed black";

    } else if (document.getElementById("ink1PickHeader").style.border != "") {
      document.getElementById("solidTool").style.border = "medium dashed white";
    }

    document.getElementById("shadeTool").style.border = "";

    await toolMenuSizeChange()

    document.getElementById("toolOptionDownInner").getContext("2d", { willReadFrequently: true }).clearRect(0, 0, 50, 50)

    await changeToolDropdown()

  }
};

function shadingVertClick() {
  document.getElementById("shadingHorz").style.border = "0px dashed rgba(0,0,0,0)";
  document.getElementById("shadingHatch").style.border = "0px dashed rgba(0,0,0,0)";

  shadeType = 2
  changeToolDropdown()
  drawToolButtons()
};

function shadingHorzClick() {
  document.getElementById("shadingVert").style.border = "0px dashed rgba(0,0,0,0)";
  document.getElementById("shadingHatch").style.border = "0px dashed rgba(0,0,0,0)";

  shadeType = 1
  changeToolDropdown()
  drawToolButtons()
};

function shadingHatchClick() {
  document.getElementById("shadingHorz").style.border = "0px dashed rgba(0,0,0,0)";
  document.getElementById("shadingVert").style.border = "0px dashed rgba(0,0,0,0)";

  shadeType = 0
  changeToolDropdown()
  drawToolButtons()
};

// Written Functions

// Instructions / Graph Button
function graphColorDetection() {
  graphColorArray = []
  for (let x = 0; x <= innerHeight - 1; x++) {
    for (let y = 0; y <= innerWidth - 1; y++) {
      imPixel = ctx.getImageData(y, x, 1, 1).data;
      imPixelColor = "rgb(" + imPixel[0] + ', ' + imPixel[1] + ', ' + imPixel[2] + ")"

      if (!graphColorArray.includes(imPixelColor)) {
        graphColorArray.push(imPixelColor);
      }
      if (graphColorArray.length >= 3) break;
    }
    if (graphColorArray.length >= 3) break;
  }
};

function instructionsGraph() {
  graphColorDetection()
  if (graphColorArray.length <= 2) {
    switch (viewType) {
      case 0:

        switch (selectedStyle) {
          case 2:
            drawPreviewGraph()
            document.getElementById("instructions").style.zIndex = "10"
            document.getElementById("instructions").style.visibility = "visible"

            document.getElementById("instructionsBack").style.zIndex = "10"
            document.getElementById("instructionsBack").style.visibility = "visible"
            document.getElementById("graphPreview").style.zIndex = "10"
            document.getElementById("graphPreview").style.visibility = "visible"

            document.getElementById("previewTicking").style.zIndex = "10"
            document.getElementById("previewTicking").style.visibility = "visible"

            document.getElementById("mosTypeOption").style.display = ''
            document.getElementById("mosDSOption").style.display = ''
            document.getElementById("instructionsViewButton").style.display = 'none'

            if (gridLinesVisible == true) {
              document.getElementById("previewGridLinesContainer").style.zIndex = "11"
              document.getElementById("previewGridLinesContainer").style.visibility = "visible"
            } else {
              document.getElementById("previewGridLinesContainer").style.zIndex = "-50"
              document.getElementById("previewGridLinesContainer").style.visibility = "hidden"
            }

            if (stitchesVisible == true) {
              document.getElementById("previewStitchesContainer").style.zIndex = "10"
              document.getElementById("previewStitchesContainer").style.visibility = "visible"
            } else {
              document.getElementById("previewStitchesContainer").style.zIndex = "-50"
              document.getElementById("previewStitchesContainer").style.visibility = "hidden"
            }

            document.getElementById("instructionsViewButton").style.visibility = "hidden"

            mosaicTicking()
            getMosaicInstructions()
            document.getElementById("headerBar").style.visibility = "hidden"

            viewType = 1
            break;

          case 1:
            interlockingInstructions()
            document.getElementById("instructions").style.zIndex = "10"
            document.getElementById("instructions").style.visibility = "visible"

            document.getElementById("instructionsBack").style.zIndex = "10"
            document.getElementById("instructionsBack").style.visibility = "visible"

            document.getElementById("graphPreview").style.zIndex = "10"
            document.getElementById("graphPreview").style.visibility = "visible"

            document.getElementById("mosTypeOption").style.display = 'none'
            document.getElementById("mosDSOption").style.display = 'none'
            document.getElementById("instructionsViewButton").style.display = ''

            if (gridLinesVisible == true) {
              document.getElementById("previewGridLinesContainer").style.zIndex = "11"
              document.getElementById("previewGridLinesContainer").style.visibility = "visible"
            } else {
              document.getElementById("previewGridLinesContainer").style.zIndex = "-50"
              document.getElementById("previewGridLinesContainer").style.visibility = "hidden"
            }

            if (stitchesVisible == true) {
              document.getElementById("previewStitchesContainer").style.zIndex = "10"
              document.getElementById("previewStitchesContainer").style.visibility = "visible"
            } else {
              document.getElementById("previewStitchesContainer").style.zIndex = "-50"
              document.getElementById("previewStitchesContainer").style.visibility = "hidden"
            }

            document.getElementById("instructionsViewButton").style.visibility = "visible"

            drawPreviewGraph()
            document.getElementById("headerBar").style.visibility = "hidden"



            viewType = 1
            break;
        }

        break;

      case 1:
        document.getElementById("instructions").style.zIndex = "-50"
        document.getElementById("instructions").style.visibility = "hidden"

        document.getElementById("instructionsBack").style.zIndex = "-50"
        document.getElementById("instructionsBack").style.visibility = "hidden"

        document.getElementById("graphPreview").style.zIndex = "-50"
        document.getElementById("graphPreview").style.visibility = "hidden"

        document.getElementById("previewStitchesContainer").style.zIndex = "-50"
        document.getElementById("previewStitchesContainer").style.visibility = "hidden"

        document.getElementById("previewGridLinesContainer").style.zIndex = "-50"
        document.getElementById("previewGridLinesContainer").style.visibility = "hidden"

        document.getElementById("previewTicking").style.zIndex = "-50"
        document.getElementById("previewTicking").style.visibility = "hidden"
        tickingLoaded = false

        document.getElementById("instructions").innerHTML = ""

        document.getElementById("headerBar").style.visibility = "visible"
        viewType = 0
        break;
    }
    // drawRowMarkers()
  } else {
    window.alert("Instructions not available with more than two colors on the graph.")
  }
};

function getInstructions() {
  switch (selectedStyle) {
    case 1:
      interlockingInstructions()
      break;

    case 2:
      getMosaicInstructions()
      break;
  }
};

// Interlocking Instructions Type Change
function instructionsViewOption() {
  switch (instructionsView) {
    case 0:
      instructionsView = 1
      mosaicTicking()
      getMosaicInstructions()
      selectedStyle = 2
      document.getElementById("previewTicking").style.zIndex = "10"
      document.getElementById("previewTicking").style.visibility = "visible"
      document.getElementById("instructionsViewButton").innerHTML = "<a href='#''>See Interlocking</a>"

      stitchesLoaded = false
      // stitchesChange()

      break;

    case 1:
      instructionsView = 0
      interlockingInstructions()
      selectedStyle = 1
      document.getElementById("previewTicking").style.zIndex = "-50"
      document.getElementById("previewTicking").style.visibility = "hidden"
      document.getElementById("instructionsViewButton").innerHTML = "<a href='#''>See Ilosaic</a>"

      stitchesLoaded = false
      // stitchesChange()

      break;
  }
};

// Interlocking Instructions
function interlockingInstructions() {
  var WriL = []
  var WriLs
  var Wri = ""
  var rowColour
  var textColor

  var Colour
  var Colour2

  document.getElementById("instructions").innerHTML = ""
  xc = Number(innerHeight - 1)
  yc = Number(innerWidth - 1)

  switch (firstColor) {
    case 1:
      RowColour = "DKC"
      Colour = ink1
      Colour2 = ink2
      rowColour = ink1
      textColor = ink2
      break;
    case 2:
      RowColour = "LC"
      Colour2 = ink1
      Colour = ink2
      rowColour = ink2
      textColor = ink1
      break;
  }

  RowChange = 0

  // Graph Row #
  var X = Number(xc - 1)
  // Graph Column #
  var Y = Number(yc)

  evenDC = Number(Math.floor((yc / 2)))
  oddDC = Number(yc - evenDC) + 1

  minEven = 0
  minOdd = 1

  FC = ((oddDC) * 2) + 3
  SC = FC - 2

  maxOdd = oddDC - 2
  maxEven = evenDC - 2

  currentCoord.x = Y * 8;
  currentCoord.y = X * 8;

  thisCoordData = ctx.getImageData(currentCoord.x, currentCoord.y, 1, 1).data;
  thisCoordColor = "rgb(" + thisCoordData[0] + ', ' + thisCoordData[1] + ', ' + thisCoordData[2] + ")";

  var FBMarker = ""

  // ' Crochet to Back Counter
  counterB = 0
  // ' Crochet to Front Counter
  counterF = 0

  // ' Row Counter
  Row = 4

  // ' First Color


  // ' Front or back of work
  FBMarker = "FW"

  // ' Starting position on graph
  X -= 2
  Row = 3

  // ' Row 1
  Wri = "<span style='font-weight: bold; background-color: " + rowColour + "; border: 1px solid grey; border-radius: 10px; color: " + textColor + "'>&nbsp;&#9679;&nbsp;&nbsp;&nbsp;&nbsp;Startup 1 || " + RowColour + " Foundation Trellis&nbsp;&nbsp;&nbsp;&nbsp;&#9679;&nbsp;</span><br>"
  Wri += "<span style = 'font-weight: bold;font-family: cooper-light;'>Chain " + FC + " -or- (Chainless Foundation) " + oddDC + " DC's</span></br>"

  patternString += "Startup 1 || " + RowColour + " Foundation Trellis\nChain " + FC + " -or- (Chainless Foundation) " + oddDC + " DC's\n"

  if (firstColor == "1") {
    RowColour = "LC"
    rowColour = ink2
    textColor = ink1
  }

  if (firstColor == "2") {
    RowColour = "DKC"
    rowColour = ink1
    textColor = ink2
  }

  document.getElementById("instructions").innerHTML += "" + Wri + ""
  Wri = ""

  // ' Row 2
  Wri += "<span style='font-weight: bold; background-color: " + rowColour + "; border: 1px solid grey; border-radius: 10px; color: " + textColor + "'>&nbsp;&#9679;&nbsp;&nbsp;&nbsp;&nbsp;Startup 2 -- " + RowColour + " Foundation Chain&nbsp;&nbsp;&nbsp;&nbsp;&#9679;&nbsp;</span><br>"
  Wri += "<span style = 'font-weight: bold;font-family: cooper-light;'>Chain " + SC + "</span>\n\n"

  patternString += "Startup 2 -- " + RowColour + " Foundation Chain\nChain " + SC + "\n\n"

  document.getElementById("instructions").innerHTML += "" + Wri + "<br>"
  Wri = ""

  // ' Row 3

  Wri += "<span style='font-weight: bold; background-color: " + rowColour + "; border: 1px solid grey; border-radius: 10px; color: " + textColor + "'>&nbsp;&#9679;&nbsp;&nbsp;&nbsp;&nbsp;Row " + Row + " " + FBMarker + " -- " + RowColour + "&nbsp;&nbsp;&nbsp;&nbsp;&#9679;&nbsp;</span><br>"

  patternString += "Row " + Row + " " + FBMarker + " -- " + RowColour + "\n"

  Wri += "<span style = 'font-weight: bold;font-family: cooper-light;'>SB"
  Wri += ", "

  Wri += "B" + (oddDC - 3)
  Wri += ", "
  Wri += "SB</span>\n\n"

  patternString += "SB, B" + (oddDC - 3) + ", SB\n\n"

  document.getElementById("instructions").innerHTML += "<br>" + Wri + ""
  Wri = ""

  FBMarker = "BW"

  if (firstColor == "1") {
    RowColour = "DKC"
    rowColour = ink1
    textColor = ink2
  } else if (firstColor == "2") {
    RowColour = "LC"
    rowColour = ink2
    textColor = ink1
  }

  Row = Row + 1
  document.getElementById("instructions").innerHTML += "<br>" + Wri + "<br>"
  Wri = ""

  // ' Row 4 Marker
  Wri += "<span style='font-weight: bold; background-color: " + rowColour + "; border: 1px solid grey; border-radius: 10px; color: " + textColor + "'>&nbsp;&#9679;&nbsp;&nbsp;&nbsp;&nbsp;Row " + Row + " " + FBMarker + " || " + RowColour + "&nbsp;&nbsp;&nbsp;&nbsp;&#9679;&nbsp;</span><br>"

  Wri += "<span style = 'font-weight: bold;font-family: cooper-light;'>WB"
  Wri += ", "

  Wri += "OS"
  Wri += ", "

  patternString += "Row " + Row + " " + FBMarker + " || " + RowColour + "\nWB, OS, "

  Write: for (Row == 4; Row != (xc + 1); Row++) {
    if (Row % 2 == 0) {
      if (Row != 4) {
        document.getElementById("instructions").innerHTML += "<br>"
        patternString += "\n"

        if (firstColor == "1") {
          RowColour = "DKC";
          rowColour = ink1
          textColor = ink2
        } else if (firstColor == "2") {
          RowColour = "LC";
          rowColour = ink2
          textColor = ink1
        }

        if (FBMarker == "FW") {
          FBMarker = "BoW";
        } else if (FBMarker == "BW") {
          FBMarker = "FoW";
        }

        if (FBMarker == "FoW") {
          FBMarker = "FW";
        } else if (FBMarker == "BoW") {
          FBMarker = "BW";
        }
      }

    } else {
      if (firstColor == "1") {
        RowColour = "LC";
        rowColour = ink2
        textColor = ink1
      }
      if (firstColor == "2") {
        RowColour = "DKC";
        rowColour = ink1
        textColor = ink2
      }
    }

    // ' (SC) Odd Row and FW
    if (FBMarker == "FW") {
      if (Row % 2 == 1) {
        if (RowChange == 1) {
          Wri += "<span style='font-weight: bold; background-color: " + rowColour + "; border: 1px solid grey; border-radius: 10px; color: " + textColor + "'>&nbsp;&#9679;&nbsp;&nbsp;&nbsp;&nbsp;Row " + Row + " " + FBMarker + " -- " + RowColour + "&nbsp;&nbsp;&nbsp;&nbsp;&#9679;&nbsp;</span><br>"
          patternString += "Row " + Row + " " + FBMarker + " -- " + RowColour + "\n"

          if (Row == xc - 2 || Row == xc - 1) {
            Wri += "<span style = 'font-weight: bold;font-family: cooper-light;'>SB"
            patternString += "SB"
          } else {
            Wri += "<span style = 'font-weight: bold;font-family: cooper-light;'>SF"
            patternString += "SF"
          }
          Wri += ", "
          patternString += ", "
          RowChange = 0
        }
        Y = yc - 3

        // ' (FC) Even Row and FW
      } else if (Row % 2 == 0) {
        if (RowChange == 1) {
          Wri += "<span style='font-weight: bold; background-color: " + rowColour + "; border: 1px solid grey; border-radius: 10px; color: " + textColor + "'>&nbsp;&#9679;&nbsp;&nbsp;&nbsp;&nbsp;Row " + Row + " " + FBMarker + " || " + RowColour + "&nbsp;&nbsp;&nbsp;&nbsp;&#9679;&nbsp;</span><br>"
          patternString += "Row " + Row + " " + FBMarker + " || " + RowColour + "\n"

          if (Row == xc - 2) {
            Wri += "<span style = 'font-weight: bold;font-family: cooper-light;'>WB"
            patternString += "WB"
          } else {
            Wri += "<span style = 'font-weight: bold;font-family: cooper-light;'>WF"
            patternString += "WF"
          }

          Wri += ", OS, "

          patternString += ", OS, "

          RowChange = 0
        }
        Y = yc - 2
      }
    }

    // ' (SC) Odd Row and BW
    if (FBMarker == "BW") {
      if (Row % 2 == 1) {
        if (RowChange == 1) {
          Wri += "<span style='font-weight: bold; background-color: " + rowColour + "; border: 1px solid grey; border-radius: 10px; color: " + textColor + "'>&nbsp;&#9679;&nbsp;&nbsp;&nbsp;&nbsp;Row " + Row + " " + FBMarker + " -- " + RowColour + "&nbsp;&nbsp;&nbsp;&nbsp;&#9679;&nbsp;</span><br>"

          Wri += "<span style = 'font-weight: bold;font-family: cooper-light;'>SB, "

          patternString += "Row " + Row + " " + FBMarker + " -- " + RowColour + "\n" + "SB, "

          RowChange = 0

        }
        Y = 3
        // ' (FC) Even Row and BW
      } else if (Row % 2 == 0) {
        if (RowChange == 1) {
          Wri += "<span style='font-weight: bold; background-color: " + rowColour + "; border: 1px solid grey; border-radius: 10px; color: " + textColor + "'>&nbsp;&#9679;&nbsp;&nbsp;&nbsp;&nbsp;Row " + Row + " " + FBMarker + " || " + RowColour + "&nbsp;&nbsp;&nbsp;&nbsp;&#9679;&nbsp;</span><br>"

          patternString += "Row " + Row + " " + FBMarker + " || " + RowColour + "\n"

          if (Row == xc - 2) {
            Wri += "<span style = 'font-weight: bold;font-family: cooper-light;'>WF"
            patternString += "WF"
          } else {
            Wri += "<span style = 'font-weight: bold;font-family: cooper-light;'>WB"
            patternString += "WB"
          }

          Wri += ", OS, "
          patternString += ", OS, "

          RowChange = 0

        }
        Y = 2
      }
    }




    // ''''''''''''         ''''''''         ''''                 ''''
    // ''''''''''''       ''''''''''''       ''''                 ''''
    // '''''              '''''''''''''      ''''                 ''''
    // '''''             '''''    ''''''     ''''                 ''''
    // '''''             ''''      '''''     ''''                 ''''
    // ''''''''''        ''''      '''''     ''''                 ''''
    // ''''''''''        ''''      '''''     ''''                 ''''
    // '''''             ''''      '''''     ''''       ''''      ''''
    // '''''             '''''    ''''''     ''''      ''''''     ''''
    // '''''              '''''''''''''      '''''    ''''''''   '''''
    // '''''               '''''''''''         '''''''''' ''''''''''
    // '''''                 '''''''              ''''      ''''''


    // ''     --------------------------------------    ''
    // ' --------------- (FC) ROW AND FOW --------------- '
    // ''     --------------------------------------    ''
    currentCoord.x = Y * 8;
    currentCoord.y = X * 8;

    thisCoordData = ctx.getImageData(currentCoord.x, currentCoord.y, 1, 1).data;
    thisCoordColor = "rgb(" + thisCoordData[0] + ', ' + thisCoordData[1] + ', ' + thisCoordData[2] + ")";
    FOW: do {
      if (FBMarker == "BW") {
        break FOW
      }
      // ' (FC) Even Row and FOW ----- F
      FEF: do {

        if ((Row % 2 == 0) && (FBMarker == "FW")) {
          // ' (FC) Even Row and FOW ----- Add to Front Counter

          if (thisCoordColor == Colour) {
            counterF = counterF + 1;
            if (Y != minEven) {
              Y = Y - 2;
              currentCoord.x = Y * 8;
              currentCoord.y = X * 8;

              thisCoordData = ctx.getImageData(currentCoord.x, currentCoord.y, 1, 1).data;
              thisCoordColor = "rgb(" + thisCoordData[0] + ', ' + thisCoordData[1] + ', ' + thisCoordData[2] + ")";
            } else {
              if (Y == minEven) {
                counterF = counterF - 1
                if (counterF == 0) {
                  break FOW
                }
              }
              if (counterF > maxOdd) {
                counterF = maxOdd
              }
              Wri += "F" + counterF
              Wri += ", "
              patternString += "F" + counterF + ", "
              counterF = 0
            }

            // ' (FC)Even Row and FOW ----- Post Front Counter in Cell if More Than 0
          } else if (counterF > 0) {
            if (Y == minEven) {
              counterF = counterF - 1
              if (counterF == 0) {
                break FOW
              }
            }
            if (counterF > maxOdd) {
              counterF = maxOdd
            }
            Wri += "F" + counterF
            Wri += ", "
            patternString += "F" + counterF + ", "
            counterF = 0
          }
        }
      } while (counterF != 0)

      // ' (SC) Even Row and FOW ----- B
      FEB: do {
        // ' (FC) Even Row and FOW ----- Add to Back Counter
        if ((Row % 2 == 0) && (FBMarker == "FW")) {
          if (thisCoordColor != Colour) {
            counterB = counterB + 1
            if (Y != minEven) {
              Y = Y - 2
              currentCoord.x = Y * 8;
              currentCoord.y = X * 8;

              thisCoordData = ctx.getImageData(currentCoord.x, currentCoord.y, 1, 1).data;
              thisCoordColor = "rgb(" + thisCoordData[0] + ', ' + thisCoordData[1] + ', ' + thisCoordData[2] + ")";
            } else {
              if ((Y == minEven) && (counterB != maxOdd)) {
                counterB = counterB - 1
                if (counterB == 0) {
                  break FOW
                }
              }
              if (counterB > maxOdd) {
                counterB = maxOdd
              }
              Wri += "B" + counterB
              Wri += ", "
              patternString += "B" + counterB + ", "
              counterB = 0
              if (Y == minEven) {
                break FOW
              }
              break FEB
            }

            // ' (FC) Even Row and FOW ----- Post Back Counter in Cell if More Than 0
          } else if (counterB > 0) {
            if ((Y == 0) && (counterB != maxOdd)) {
              counterB = counterB - 1
              if (counterB == 0) {
                break FOW
              }
            }
            if (counterB > maxOdd) {
              counterB = maxOdd
            }
            Wri += "B" + counterB
            Wri += ", "
            patternString += "B" + counterB + ", "
            counterB = 0
            if (Y == 0) {
              break FOW
            }
            break FEB
          }
        }
      } while (counterB != 0)


      // ''     --------------------------------------     ''
      // ' --------------- (SC) ODD ROW AND FOW --------------- '
      // ''     --------------------------------------     ''

      // ' (SC) Odd Row and FOW ----- F
      if ((Row % 2 == 1) && (FBMarker == "FW")) {
        FOF: do {
          // ' (SC) Odd Row and FOW ----- Add to Front Counter
          if (thisCoordColor == Colour2) {
            counterF = counterF + 1
            if (Y != minOdd) {
              Y = Y - 2
              currentCoord.x = Y * 8;
              currentCoord.y = X * 8;

              thisCoordData = ctx.getImageData(currentCoord.x, currentCoord.y, 1, 1).data;
              thisCoordColor = "rgb(" + thisCoordData[0] + ', ' + thisCoordData[1] + ', ' + thisCoordData[2] + ")";
            } else {
              if (Y == 1 && counterF != 1) {
                counterF = counterF - 1
                if (counterF == 0) {
                  break FOW
                }
              }
              if (counterF > maxEven) {
                counterF = maxEven
              }
              Wri += "F" + counterF
              Wri += ", "
              patternString += "F" + counterF + ", "
              counterF = 0
              if (Y == 1) {
                break FOW
              }
            }

            // ' (SC) Odd Row and FOW ----- Post Front Counter in Cell if More Than 0
          } else if (counterF > 0) {
            if (Y == minOdd && counterF != 1) {
              counterF = counterF - 1
              if (counterF == 0) {
                break FOW
              }
            }
            if (counterF > maxEven) {
              counterF = maxEven
            }
            Wri += "F" + counterF
            Wri += ", "
            patternString += "F" + counterF + ", "
            counterF = 0

            if (Y == 1) {
              break FOW
            }
          }
        } while (counterF != 0)

        // ' (SC) Odd Row and FOW ----- B
        FOB: do {
          if (thisCoordColor != Colour2) {
            counterB = counterB + 1
            if (Y != minOdd) {
              Y = Y - 2
              currentCoord.x = Y * 8;
              currentCoord.y = X * 8;

              thisCoordData = ctx.getImageData(currentCoord.x, currentCoord.y, 1, 1).data;
              thisCoordColor = "rgb(" + thisCoordData[0] + ', ' + thisCoordData[1] + ', ' + thisCoordData[2] + ")";
            } else {
              if (counterB == 0) {
                break FOW
              }
              if (counterB > maxEven) {
                counterB = maxEven
              }
              Wri += "B" + counterB
              Wri += ", "
              patternString += "B" + counterB + ", "
              counterB = 0
              if (Y == minOdd) {
                break FOW
              }
              break FOB
            }

            // ' (SC) Odd Row and FOW ----- Post Back Counter in Cell if More Than 0
          } else if (counterB > 0) {

            if (counterB == 0) {
              break FOW
            }
            if (counterB > maxEven) {
              counterB = maxEven
            }
            Wri += "B" + counterB
            Wri += ", "
            patternString += "B" + counterB + ", "
            counterB = 0
            if (Y == 1) {
              break FOW
            }
            break FOB
          }
        } while (counterB != 0)
      }
    } while (Y != minEven && Y != minOdd)


    // ''''''''''            ''''''         ''''                 ''''
    // ''''''''''''        ''''''''''       ''''                 ''''
    // '''''   '''''      ''''''''''''      ''''                 ''''
    // '''''   '''''     '''''    '''''     ''''                 ''''
    // '''''   '''       ''''      ''''     ''''                 ''''
    // ''''''''''        ''''      ''''     ''''                 ''''
    // ''''''''''''      ''''      ''''     ''''                 ''''
    // '''''    ''''     ''''      ''''     ''''       ''''      ''''
    // '''''    ''''     '''''    '''''     ''''      ''''''     ''''
    // '''''''''''''      ''''''''''''      '''''    ''''''''   '''''
    // ''''''''''''        ''''''''''         '''''''''' ''''''''''
    // ''''''''''            ''''''              ''''      ''''''


    // ''     --------------------------------------    ''
    // ' --------------- SC AND BOW --------------- '
    // ''     --------------------------------------    ''
    currentCoord.x = Y * 8;
    currentCoord.y = X * 8;

    thisCoordData = ctx.getImageData(currentCoord.x, currentCoord.y, 1, 1).data;
    thisCoordColor = "rgb(" + thisCoordData[0] + ', ' + thisCoordData[1] + ', ' + thisCoordData[2] + ")";

    BOW: do {
      if (FBMarker == "FW") {
        break BOW
      }

      // ' (SC) Odd Row and BOW ----- B
      if (Row % 2 == 1 && FBMarker == "BW") {

        BOB: do {

          // ' (SC) Odd Row and BOW ----- Add to Front Counter
          if (thisCoordColor != Colour) {

            counterB = counterB + 1
            if (Y != yc - 1) {
              Y = Y + 2
              currentCoord.x = Y * 8;
              currentCoord.y = X * 8;

              thisCoordData = ctx.getImageData(currentCoord.x, currentCoord.y, 1, 1).data;
              thisCoordColor = "rgb(" + thisCoordData[0] + ', ' + thisCoordData[1] + ', ' + thisCoordData[2] + ")";
            } else {
              if (Y == yc - 1) {
                if ((counterB != 1)) {
                  counterB = counterB - 1

                  if (counterB == 0) {
                    break BOW
                  }
                }
                if (counterB == 0) {
                  break BOB
                }
              }
              if (counterB > maxOdd) {
                counterB = maxOdd
              }
              Wri += "B" + counterB
              Wri += ", "
              patternString += "B" + counterB + ", "
              counterB = 0
              if (Y == yc - 1) {
                break BOW
              }
            }

            // ' (SC) Odd Row and BOW ----- Post Front Counter in Cell if More Than 0
          } else if (counterB > 0) {
            if (Y == yc - 1) {
              if ((counterB != 1) && (counterB == maxOdd)) {
                counterB = counterB - 1
                if (counterB == 0) {
                  break BOW
                }
              }
            }
            if (counterB > maxOdd) {
              counterB = maxOdd
            }
            Wri += "B" + counterB
            Wri += ", "
            patternString += "B" + counterB + ", "
            counterB = 0
            if (Y == yc - 1) {
              break BOW
            }
          }
        } while (counterB != 0)

        // ' (SC) Odd Row and BOW ----- F
        BOF: do {
          if (thisCoordColor == Colour) {
            counterF = counterF + 1
            if (Y != yc - 1) {
              Y = Y + 2
              currentCoord.x = Y * 8;
              currentCoord.y = X * 8;

              thisCoordData = ctx.getImageData(currentCoord.x, currentCoord.y, 1, 1).data;
              thisCoordColor = "rgb(" + thisCoordData[0] + ', ' + thisCoordData[1] + ', ' + thisCoordData[2] + ")";
            } else if (Y == yc - 1) {
              if ((counterF != 1) && (counterF == maxOdd)) {
                counterF = counterF - 1
                if (counterF == 0) {
                  break BOW
                }
              }
              if (counterF > maxOdd) {
                counterF = maxOdd
              }
              Wri += "F" + counterF
              Wri += ", "
              patternString += "F" + counterF + ", "
              counterF = 0
              if (Y == yc - 1) {
                break BOW
              }
              break BOF
            }



            // ' (SC) Odd Row and BOW ----- Post Back Counter in Cell if More Than 0
          } else if (counterF > 0) {
            if (counterF > maxOdd) {
              counterF = maxOdd
            }
            Wri += "F" + counterF
            Wri += ", "
            patternString += "F" + counterF + ", "
            counterF = 0
            if (Y == yc - 1) {
              break BOW
            }
            break BOF
          }
        } while (counterF != 0)
      }


      // ''     --------------------------------------     ''
      // ' --------------- FC AND BOW --------------- '
      // ''     --------------------------------------     ''

      // ' (FC) Even Row and BOW ----- F
      if ((Row % 2 == 0) && (FBMarker == "BW")) {
        BEF: do {
          // ' (FC) Even Row and BOW ----- Add  to Front Counter
          if (thisCoordColor != Colour) {
            counterF = counterF + 1
            if (Y != yc - 2) {
              Y = Y + 2
              currentCoord.x = Y * 8;
              currentCoord.y = X * 8;

              thisCoordData = ctx.getImageData(currentCoord.x, currentCoord.y, 1, 1).data;
              thisCoordColor = "rgb(" + thisCoordData[0] + ', ' + thisCoordData[1] + ', ' + thisCoordData[2] + ")";
            } else {
              if ((Y == yc - 2) && (counterF != 1) && (counterF == maxOdd)) {
                counterF = counterF - 1
                if (counterF == 0) {
                  break BOW
                }
              }
              if (counterF > maxEven) {
                counterF = maxEven
              }
              Wri += "F" + counterF
              Wri += ", "
              patternString += "F" + counterF + ", "
              counterF = 0
              if (Y == yc - 2) {
                break BOW
              }
            }
            // ' (FC) Even Row and BOW ----- Post Front Counter in Cell if More Than 0
          } else if (counterF > 0) {
            if ((Y == yc - 2) && (counterF != 1) && (counterF == maxOdd)) {
              counterF = counterF - 1
              if (counterF == 0) {
                break BOW
              }
            }
            if (counterF > maxEven) {
              counterF = maxEven
            }
            Wri += "F" + counterF
            Wri += ", "
            patternString += "F" + counterF + ", "
            counterF = 0
            if (Y == yc) {
              break BOW
            }
          }
        } while (counterF != 0)

        // ' (FC) Even Row and BOW ----- B
        BEB: do {
          if (thisCoordColor == Colour) {
            counterB = counterB + 1
            if (Y != yc - 2) {
              Y = Y + 2
              currentCoord.x = Y * 8;
              currentCoord.y = X * 8;

              thisCoordData = ctx.getImageData(currentCoord.x, currentCoord.y, 1, 1).data;
              thisCoordColor = "rgb(" + thisCoordData[0] + ', ' + thisCoordData[1] + ', ' + thisCoordData[2] + ")";
            } else {
              if (Y == yc - 2 && counterB != 1 && counterB == maxOdd) {
                counterB = counterB - 1
                if (counterB == 0) {
                  break BOW
                }
              }
              if (counterB > maxOdd) {
                counterB = maxOdd
              }
              Wri += "B" + counterB
              Wri += ", "
              patternString += "B" + counterB + ", "
              counterB = 0
              if (Y == yc - 2) {
                break BOW
              }
              break BEB
            }
            // ' (FC) Even Row and BOW ----- Post Back Counter in Cell if More Than 0
          } else if (counterB > 0) {

            if ((Y == yc - 2) && (counterB != 1) && (counterB == maxOdd)) {
              counterB = counterB - 1
              if (counterB == 0) {
                break BOW
              }
            }
            if (counterB > maxOdd) {
              counterB = maxOdd
            }
            Wri += "B" + counterB
            Wri += ", "
            patternString += "B" + counterB + ", "
            counterB = 0
            if (Y == yc - 2) {
              break BOW
            }
            break BEB
          }
        } while (counterB != 0)
      }
    }
    while ((Y != yc - 1) && (Y != yc - 2))
    currentCoord.x = Y * 8;
    currentCoord.y = X * 8;

    thisCoordData = ctx.getImageData(currentCoord.x, currentCoord.y, 1, 1).data;
    thisCoordColor = "rgb(" + thisCoordData[0] + ', ' + thisCoordData[1] + ', ' + thisCoordData[2] + ")";



    NewRow:

    if ((Y == 0) || (Y == yc - 1) || (Y == yc - 2) || (Y == 1)) {
      if ((Y == yc - 2) || (Y == 0)) {
        Wri += "OS"
        patternString += "OS\n"
      }

      if ((Y == yc - 1) || (Y == 1)) {

        if ((Row == xc) || (Row == xc - 2) || (Row == xc - 1)) {
          Wri += "SB"
          patternString += "SB\n"
        } else {
          if (FBMarker == "FW") {
            Wri += "SF"
            patternString += "SF\n"
          } else {
            Wri += "SB"
            patternString += "SB\n"
          }
        }
      }

      WriL.push(Wri)
      document.getElementById("instructions").innerHTML += "" + Wri + "</span><br>"
      Wri = ""


      RowChange = 1
      X = X - 1
      Wri += "\n"

      currentCoord.x = Y * 8;
      currentCoord.y = X * 8;

      thisCoordData = ctx.getImageData(currentCoord.x, currentCoord.y, 1, 1).data;
      thisCoordColor = "rgb(" + thisCoordData[0] + ', ' + thisCoordData[1] + ', ' + thisCoordData[2] + ")";
    }


    // ' Function Killer
    if (Row == xc + 1) {
      break Write
    }

    // ''' End Process
    if (X == 0) {
      break Write
    }

  }
};

// Mosaic Ticking
function mosaicTicking() {
  previewTickingCtx.clearRect(0, 0, previewTicking.width, previewTicking.height);
  tickingArray = []

  var cCell = previewGraphCtx.getImageData(y, x, 1, 1).data;
  cCellColor = "rgb(" + cCell[0] + ', ' + cCell[1] + ', ' + cCell[2] + ")";

  var cCellUnder = previewGraphCtx.getImageData(y, x + 8, 1, 1).data;
  cCellUnderColor = "rgb(" + cCellUnder[0] + ', ' + cCellUnder[1] + ', ' + cCellUnder[2] + ")";

  switch (firstColor) {
    case 1:
      Colour = ink1
      Colour2 = ink2
      textColor = ink1
      textColor2 = ink2
      break;
    case 2:
      Colour2 = ink1
      Colour = ink2
      textColor2 = ink1
      textColor = ink2
      break;
  }

  // ' Start Loop
  for (let x = graphHeight - 8; x >= 0; x -= 8) {
    for (let y = graphWidth - 8; y >= 0; y -= 8) {
      cCell = previewGraphCtx.getImageData(y, x, 1, 1).data;
      cCellColor = "rgb(" + cCell[0] + ', ' + cCell[1] + ', ' + cCell[2] + ")";

      cCellUnder = previewGraphCtx.getImageData(y, x + 8, 1, 1).data;
      cCellUnderColor = "rgb(" + cCellUnder[0] + ', ' + cCellUnder[1] + ', ' + cCellUnder[2] + ")";

      // '' Ticking First Color
      if (x / 8 > (innerHeight - 2)) {
        tickingArray.push("O")
      } else {
        switch ((x / 8) % 2) {
          case 0:
            if ((cCellColor == Colour) && (cCellUnderColor == Colour)) {
              previewTickingCtx.strokeStyle = Colour2;
              drawTick(x, y);
              drawTick(x, y);
              tickingArray.push("X");
            } else {
              tickingArray.push("O");
            }
            break;

          // '' Ticking Second Color
          case 1:
            if ((cCellColor == Colour2) && (cCellUnderColor == Colour2)) {
              previewTickingCtx.strokeStyle = Colour;
              drawTick(x, y);
              drawTick(x, y);
              tickingArray.push("X");
            } else {
              tickingArray.push("O");
            }
            break;
        }
      }
    } tickingArray.push("\n")
  }

  tickingLoaded = true
};

function drawTick(x, y) {
  previewTickingCtx.beginPath();
  previewTickingCtx.moveTo(y + 2, x + 2);
  previewTickingCtx.lineTo(y + 7, x + 8);
  previewTickingCtx.stroke();
  previewTickingCtx.beginPath();
  previewTickingCtx.moveTo(y + 7, x + 2);
  previewTickingCtx.lineTo(y + 1, x + 8);
  previewTickingCtx.stroke();
};

// Mosaic Instructions
function getMosaicInstructions() {
  switch (mosDS) {
    case true:
      switch (textInstructions) {
        case true:
          mosaicInstructionsTextDS()
          break;
        case false:
          mosaicInstructionsBlockDS()
          break;
      }
      break;
    case false:
      switch (textInstructions) {
        case true:
          mosaicInstructionsText()
          break;
        case false:
          mosaicInstructionsBlock()
          break;
      }
      break;
  }
};

function mosaicInstructionsToggle() {
  switch (mosDS) {
    case true:
      mosDS = false
      document.getElementById("mosDSOption").innerHTML = '<a href = "#">With DS</a>'
      break;
    case false:
      mosDS = true
      document.getElementById("mosDSOption").innerHTML = '<a href = "#">No DS</a>'
      break;
  };
};

function instructionsTypeToggle() {
  switch (textInstructions) {
    case true:
      textInstructions = false
      document.getElementById("mosTypeOption").innerHTML = '<a href = "#">Text</a>'
      break;
    case false:
      textInstructions = true
      document.getElementById("mosTypeOption").innerHTML = '<a href = "#">Block</a>'
      break;
  };
};

function mosaicInstructionsText() {
  var RowColour = ""
  var rowSymbol = ""

  counterS = 0
  counterD = 0
  counterDS = 0

  rowColour = "#F7DDEB"
  rowColour2 = "#FFFFFF"

  instructions = ""
  patternString = ""
  row = 0

  // ' Row 1
  for (let x = 0; x <= tickingArray.length - 1; x++) {
    row++

    switch (firstColor) {
      case 1:
        switch (row % 2 == 0) {
          case false:
            RowColour = "DKC"
            rowColour = ink1
            rowColour2 = ink2

            rowSymbol = " || "

            break;

          case true:
            RowColour = "LC"
            rowColour = ink2
            rowColour2 = ink1
            rowSymbol = " -- "
            break;
        }
        break;

      case 2:
        switch (row % 2 == 0) {
          case false:
            RowColour = "LC"
            rowColour = ink2
            rowColour2 = ink1
            rowSymbol = " -- "
            break;

          case true:
            RowColour = "DKC"
            rowColour = ink1
            rowColour2 = ink2
            rowSymbol = " || "
            break;
        }
        break;
    }

    instructions += "<span style='font-weight: normal;font-family: cooper; background-color: " + rowColour + "; color: " + rowColour2 + "; border: 1px solid grey; border-radius: 10px'>&nbsp;&#9679;&nbsp;&nbsp;&nbsp;&nbsp;Row " + row
    patternString += "Row  " + row

    instructions += rowSymbol + RowColour + "&nbsp;&nbsp;&nbsp;&nbsp;&#9679;&nbsp</span><br>"
    patternString += rowSymbol + RowColour + "\n"

    instructions += "<span style='font-weight: bold;font-family: cooper-light;'>BS, "
    patternString += "BS, "

    for (let y = 0; y < innerWidth; y++, x++) {
      cCell = tickingArray[x]

      switch (cCell) {
        case "X":
          if (counterS > 0) {
            instructions += "S" + counterS + ", "
            patternString += "S" + counterS + ", "
            counterS = 0
          }
          counterD++
          break;

        case "O":
          if (counterD > 0) {
            instructions += "D" + counterD + ", "
            patternString += "D" + counterD + ", "
            counterD = 0
          }
          counterS++
          break;
      }
    }

    if (counterS > 0) {
      instructions += "S" + counterS + ", "
      patternString += "S" + counterS + ", "
      counterS = 0
    }
    if (counterD > 0) {
      instructions += "D" + counterD + ", "
      patternString += "D" + counterD + ", "
      counterD = 0
    }

    instructions += "BS</span><br><br>"
    patternString += "BS\n\n"
  }

  document.getElementById("instructions").innerHTML = instructions
};

function mosaicInstructionsTextDS() {
  var RowColour = ""
  var rowSymbol = ""

  counterS = 0
  counterD = 0
  counterDS = 0

  rowColour = "#F7DDEB"
  rowColour2 = "#FFFFFF"

  instructions = ""
  patternString = ""
  row = 0

  // ' Row 1
  for (let x = 0; x <= tickingArray.length - 1; x++) {
    row++

    switch (firstColor) {
      case 1:
        switch (row % 2 == 0) {
          case false:
            RowColour = "DKC"
            rowColour = ink1
            rowColour2 = ink2
            rowSymbol = " || "

            break;

          case true:
            RowColour = "LC"
            rowColour = ink2
            rowColour2 = ink1
            rowSymbol = " -- "
            break;
        }
        break;

      case 2:
        switch (row % 2 == 0) {
          case false:
            RowColour = "LC"
            rowColour = ink2
            rowColour2 = ink1
            rowSymbol = " -- "
            break;

          case true:
            RowColour = "DKC"
            rowColour = ink1
            rowColour2 = ink2
            rowSymbol = " || "
            break;
        }
        break;
    }

    instructions += "<span style='font-weight: normal;font-family: cooper; background-color: " + rowColour + "; color: " + rowColour2 + "; border: 1px solid grey; border-radius: 10px'>&nbsp;&#9679;&nbsp;&nbsp;&nbsp;&nbsp;Row " + row
    patternString += "Row  " + row

    instructions += rowSymbol + RowColour + "&nbsp;&nbsp;&nbsp;&nbsp;&#9679;&nbsp</span><br>"
    patternString += rowSymbol + RowColour + "\n"

    instructions += "<span style='font-weight: bold;font-family: cooper-light;'>BS, "
    patternString += "BS, "

    for (let y = 0; y < innerWidth; y++, x++) {
      cCell = tickingArray[x]
      cCellNext = tickingArray[x + 1]
      cCell2Next = tickingArray[x + 2]
      cCellPrev = tickingArray[x - 1]

      switch (cCell) {
        case "X":
          if ((cCellNext == "O") && (cCell2Next != "O")) {
            if (cCellPrev == "X") {
              if (counterD > 0) {
                instructions += "D" + counterD + ", "
                patternString += "D" + counterD + ", "
                counterD = 0
              }
            } else if (cCellPrev == "O") {
              if (counterS > 0) {
                instructions += "S" + counterS + ", "
                patternString += "S" + counterS + ", "
                counterS = 0
              }
            }

            counterDS++
            x++
            y++

          } else {

            if (counterDS > 0) {
              instructions += "DS" + counterDS + ", "
              patternString += "DS" + counterDS + ", "
              counterDS = 0
            }

            if (counterS > 0) {
              instructions += "S" + counterS + ", "
              patternString += "S" + counterS + ", "
              counterS = 0
            }
            counterD++
          }

          break;

        case "O":
          if (counterDS > 0) {
            instructions += "DS" + counterDS + ", "
            patternString += "DS" + counterDS + ", "
            counterDS = 0
          }

          if (counterD > 0) {
            instructions += "D" + counterD + ", "
            patternString += "D" + counterD + ", "
            counterD = 0
          }
          counterS++
          break;
      }
    }
    if (counterDS > 0) {
      instructions += "DS" + counterDS + ", "
      patternString += "DS" + counterDS + ", "
      counterDS = 0
    }
    if (counterS > 0) {
      instructions += "S" + counterS + ", "
      patternString += "S" + counterS + ", "
      counterS = 0
    }
    if (counterD > 0) {
      instructions += "D" + counterD + ", "
      patternString += "D" + counterD + ", "
      counterD = 0
    }

    instructions += "BS</span><br><br>"
    patternString += "BS\n\n"
  }
  document.getElementById("instructions").innerHTML = instructions
}

function mosaicInstructionsBlock() {
  dcColour = "#DDEBF7"
  scColour = "#FFFFFF"

  bsColour = "#EBF7DD"

  rowColour = "#F7DDEB"
  rowColour2 = "#FFFFFF"

  counterS = 0
  counterD = 0
  counterDS = 0

  instructions = ""
  row = 0

  for (let x = 0; x <= tickingArray.length - 1; x++) {
    row++
    instructions += "<section id = 'mosaicInstructions' class='mosaicInstructions' style = 'margin-bottom: 25px;display: block;margin-top: 10px;align-content: center;text-align: center;align-self: center;margin: auto auto;'>"
    switch (x % 2 == 0) {
      case true:
        instructions += "<div class = 'mosRow' style='background-color:" + rowColour + ";width: 100%;max-height: 20px;min-height: 20px;position: relative;border: 1px solid rgba(132, 130, 131, 0.75);float: bottom;display: block;margin-top: 15px;'>Row " + row + "</div><br><br>"
        break;

      case false:
        instructions += "<div class = 'mosRow' style='background-color:" + rowColour2 + ";width: 100%;max-height: 20px;min-height: 20px;position: relative;border: 1px solid rgba(132, 130, 131, 0.75);float: bottom;display: block;margin-top: 15px;'>Row " + row + "</div><br><br>"
        break;
    }

    instructions += "<div id='mosaicChunk'><div class = 'mosCell' style='background-color:" + bsColour + ";float: left;display: block;width: 60px;max-width: 60px;min-width: 50px;height: 20px;max-height: 20px;min-height: 20px;border: 1px solid rgba(132, 130, 131, 0.75);text-align: center;border-spacing: 0;border-collapse: collapse;position: relative;float: left;display: block;'>BS</div>"

    for (let y = 0; y < innerWidth; y++, x++) {
      cCell = tickingArray[x]

      switch (cCell) {
        case "X":
          if (counterS > 0) {
            instructions += "<div class = 'mosCell' style='background-color:" + scColour + ";float: left;display: block;;width: 60px;max-width: 60px;min-width: 50px;height: 20px;max-height: 20px;min-height: 20px;border: 1px solid rgba(132, 130, 131, 0.75);text-align: center;border-spacing: 0;border-collapse: collapse;position: relative;float: left;display: block;'>S" + counterS + "</div>"
            counterS = 0
          }
          counterD++
          break;

        case "O":
          if (counterD > 0) {
            instructions += "<div class = 'mosCell' style='background-color:" + dcColour + ";float: left;display: block;;width: 60px;max-width: 60px;min-width: 50px;height: 20px;max-height: 20px;min-height: 20px;border: 1px solid rgba(132, 130, 131, 0.75);text-align: center;border-spacing: 0;border-collapse: collapse;position: relative;float: left;display: block;'>D" + counterD + "</div>"
            counterD = 0
          }
          counterS++
          break;
      }
    }

    if (counterS > 0) {
      instructions += "<div class = 'mosCell' style='background-color:" + scColour + ";float: left;display: block;;width: 60px;max-width: 60px;min-width: 50px;height: 20px;max-height: 20px;min-height: 20px;border: 1px solid rgba(132, 130, 131, 0.75);text-align: center;border-spacing: 0;border-collapse: collapse;position: relative;float: left;display: block;'>S" + counterS + "</div>"
      counterS = 0
    }
    if (counterD > 0) {
      instructions += "<div class = 'mosCell' style='background-color:" + dcColour + ";float: left;display: block;;width: 60px;max-width: 60px;min-width: 50px;height: 20px;max-height: 20px;min-height: 20px;border: 1px solid rgba(132, 130, 131, 0.75);text-align: center;border-spacing: 0;border-collapse: collapse;position: relative;float: left;display: block;'>D" + counterD + "</div>"
      counterD = 0
    }
    instructions += "<div class = 'mosCell' style='background-color:" + bsColour + ";float: left;display: block;;width: 60px;max-width: 60px;min-width: 50px;height: 20px;max-height: 20px;min-height: 20px;border: 1px solid rgba(132, 130, 131, 0.75);text-align: center;border-spacing: 0;border-collapse: collapse;position: relative;float: left;display: block;'>BS</div></section></div><br><br>"
  }

  document.getElementById("instructions").innerHTML = instructions
};

function mosaicInstructionsBlockDS() {

  dcColour = "#DDEBF7"
  scColour = "#FFFFFF"

  bsColour = "#EBF7DD"

  rowColour = "#F7DDEB"
  rowColour2 = "#FFFFFF"

  counterS = 0
  counterD = 0
  counterDS = 0

  instructions = ""
  row = 0

  for (let x = 0; x <= tickingArray.length - 1; x++) {
    row++
    instructions += "<section id = 'mosaicInstructions' class='mosaicInstructions' style = 'margin-bottom: 25px;display: block;margin-top: 10px;align-content: center;text-align: center;align-self: center;margin: auto auto;'>"
    switch (x % 2 == 0) {
      case true:
        instructions += "<div class = 'mosRow' style='background-color:" + rowColour + ";width: 100%;max-height: 20px;min-height: 20px;position: relative;border: 1px solid rgba(132, 130, 131, 0.75);float: left;display: block;margin-top: 15px;'>Row " + row + "</div><br><br>"
        break;

      case false:
        instructions += "<div class = 'mosRow' style='background-color:" + rowColour2 + ";width: 100%;max-height: 20px;min-height: 20px;position: relative;border: 1px solid rgba(132, 130, 131, 0.75);float: left;display: block;margin-top: 15px;'>Row " + row + "</div><br><br>"
        break;
    }

    instructions += "<div id='mosaicChunk'><div class = 'mosCell' style='background-color:" + bsColour + ";float: left;display: block;width: 60px;max-width: 60px;min-width: 50px;height: 20px;max-height: 20px;min-height: 20px;border: 1px solid rgba(132, 130, 131, 0.75);text-align: center;border-spacing: 0;border-collapse: collapse;position: relative;float: left;display: block;'>BS</div>"

    for (let y = 0; y < innerWidth; y++, x++) {
      cCell = tickingArray[x]
      cCellNext = tickingArray[x + 1]
      cCellPrev = tickingArray[x - 1]

      switch (cCell) {
        case "X":
          if (cCellNext == "X") {
            if (counterDS > 0) {
              instructions += "<div class = 'mosCell' style='background-color:#99FFCC;float: left;display: block;width: 60px;max-width: 60px;min-width: 50px;height: 20px;max-height: 20px;min-height: 20px;border: 1px solid rgba(132, 130, 131, 0.75);text-align: center;border-spacing: 0;border-collapse: collapse;position: relative;float: left;display: block;'>DS" + counterDS + "</div>"
              counterDS = 0
            }

            if (counterS > 0) {
              instructions += "<div class = 'mosCell' style='background-color:" + scColour + ";float: left;display: block;;width: 60px;max-width: 60px;min-width: 50px;height: 20px;max-height: 20px;min-height: 20px;border: 1px solid rgba(132, 130, 131, 0.75);text-align: center;border-spacing: 0;border-collapse: collapse;position: relative;float: left;display: block;'>S" + counterS + "</div>"
              counterS = 0
            }
            counterD++

          } else if (((cCellNext == "O") && (cCell2Next != "O"))) {
            if (cCellPrev == "X") {
              if (counterD > 0) {
                instructions += "<div class = 'mosCell' style='background-color:" + dcColour + ";float: left;display: block;width: 60px;max-width: 60px;min-width: 50px;height: 20px;max-height: 20px;min-height: 20px;border: 1px solid rgba(132, 130, 131, 0.75);text-align: center;border-spacing: 0;border-collapse: collapse;position: relative;float: left;display: block;'>D" + counterD + "</div>"
                counterD = 0
              }
            } else if (cCellPrev == "O") {
              if (counterS > 0) {
                instructions += "<div class = 'mosCell' style='background-color:" + scColour + ";float: left;display: block;;width: 60px;max-width: 60px;min-width: 50px;height: 20px;max-height: 20px;min-height: 20px;border: 1px solid rgba(132, 130, 131, 0.75);text-align: center;border-spacing: 0;border-collapse: collapse;position: relative;float: left;display: block;'>S" + counterS + "</div>"
                counterS = 0
              }
            }

            counterDS++
            x++
            y++

          } else if (y == innerWidth - 1) {
            if (counterDS > 0) {
              instructions += "<div class = 'mosCell' style='background-color:#99FFCC;float: left;display: block;width: 60px;max-width: 60px;min-width: 50px;height: 20px;max-height: 20px;min-height: 20px;border: 1px solid rgba(132, 130, 131, 0.75);text-align: center;border-spacing: 0;border-collapse: collapse;position: relative;float: left;display: block;'>DS" + counterDS + "</div>"
              counterDS = 0
            }

            if (counterS > 0) {
              instructions += "<div class = 'mosCell' style='background-color:" + scColour + ";float: left;display: block;;width: 60px;max-width: 60px;min-width: 50px;height: 20px;max-height: 20px;min-height: 20px;border: 1px solid rgba(132, 130, 131, 0.75);text-align: center;border-spacing: 0;border-collapse: collapse;position: relative;float: left;display: block;'>S" + counterS + "</div>"
              counterS = 0
            }
            counterD++
          }

          break;

        case "O":
          if (counterDS > 0) {
            instructions += "<div class = 'mosCell' style='background-color:#99FFCC;float: left;display: block;width: 60px;max-width: 60px;min-width: 50px;height: 20px;max-height: 20px;min-height: 20px;border: 1px solid rgba(132, 130, 131, 0.75);text-align: center;border-spacing: 0;border-collapse: collapse;position: relative;float: left;display: block;'>DS" + counterDS + "</div>"
            counterDS = 0
          }

          if (counterD > 0) {
            instructions += "<div class = 'mosCell' style='background-color:" + dcColour + ";float: left;display: block;width: 60px;max-width: 60px;min-width: 50px;height: 20px;max-height: 20px;min-height: 20px;border: 1px solid rgba(132, 130, 131, 0.75);text-align: center;border-spacing: 0;border-collapse: collapse;position: relative;float: left;display: block;'>D" + counterD + "</div>"
            counterD = 0
          }

          counterS++
          break;
      }
    }

    if (counterDS > 0) {
      instructions += "<div class = 'mosCell' style='background-color:#99FFCC;float: left;display: block;width: 60px;max-width: 60px;min-width: 50px;height: 20px;max-height: 20px;min-height: 20px;border: 1px solid rgba(132, 130, 131, 0.75);text-align: center;border-spacing: 0;border-collapse: collapse;position: relative;float: left;display: block;'>DS" + counterDS + "</div>"
      counterDS = 0
    }

    if (counterS > 0) {
      instructions += "<div class = 'mosCell' style='background-color:" + scColour + ";float: left;display: block;;width: 60px;max-width: 60px;min-width: 50px;height: 20px;max-height: 20px;min-height: 20px;border: 1px solid rgba(132, 130, 131, 0.75);text-align: center;border-spacing: 0;border-collapse: collapse;position: relative;float: left;display: block;'>S" + counterS + "</div>"
      counterS = 0
    }

    if (counterD > 0) {
      instructions += "<div class = 'mosCell' style='background-color:" + dcColour + ";float: left;display: block;;width: 60px;max-width: 60px;min-width: 50px;height: 20px;max-height: 20px;min-height: 20px;border: 1px solid rgba(132, 130, 131, 0.75);text-align: center;border-spacing: 0;border-collapse: collapse;position: relative;float: left;display: block;'>D" + counterD + "</div>"
      counterD = 0
    }


    instructions += "<div class = 'mosCell' style='background-color:" + bsColour + ";float: left;display: block;;width: 60px;max-width: 60px;min-width: 50px;height: 20px;max-height: 20px;min-height: 20px;border: 1px solid rgba(132, 130, 131, 0.75);text-align: center;border-spacing: 0;border-collapse: collapse;position: relative;float: left;display: block;'>BS</div></section></div><br><br>"
  }

  document.getElementById("instructions").innerHTML = instructions
};

// Key Page
function drawKeyPages() {
  drawMosKeyPage()
  drawIntKeyPage()
}

function drawIntKeyPage() {
  var key_int_canvas = document.getElementById('keyPageIntHold');
  var key_int_ctx = key_int_canvas.getContext('2d')

  key_int_canvas.width = "2552"
  key_int_canvas.height = "3300"

  // Back Color (White)
  key_int_ctx.fillStyle = "rgb(255,255,255)"
  key_int_ctx.fillRect(0, 0, 2552, 3300)

  // Things to Remember Color
  key_int_ctx.fillStyle = "rgb(159,208,128)"
  key_int_ctx.fillRect(0, 2803, 2552, 80)

  //Bottom Color
  key_int_ctx.fillStyle = "rgb(228,158,198)"
  key_int_ctx.fillRect(0, 3161, 2552, 200)

  // Abbreviation Key Colors
  key_int_ctx.fillStyle = "rgb(200,200,230)"
  key_int_ctx.fillRect(90, 360, 988, 70)
  key_int_ctx.fillRect(90, 500, 988, 70)
  key_int_ctx.fillRect(90, 640, 988, 70)
  key_int_ctx.fillRect(90, 780, 988, 70)
  key_int_ctx.fillRect(90, 918, 988, 70)
  key_int_ctx.fillRect(90, 1057, 988, 70)
  key_int_ctx.fillRect(90, 1196, 988, 70)

  // Drawing Lines
  key_int_ctx.fillStyle = "rgb(0,0,0)"

  // Outside
  key_int_ctx.fillRect(0, 0, 2552, 3)
  key_int_ctx.fillRect(0, 0, 3, 3300)
  key_int_ctx.fillRect(0, 3297, 2552, 3)
  key_int_ctx.fillRect(2549, 0, 3, 3300)

  // Center Line
  key_int_ctx.fillRect(1168, 0, 5, 2800)

  // Right Side Horz Lines
  key_int_ctx.fillRect(1170, 1150, 2000, 5)
  key_int_ctx.fillRect(1170, 1565, 2000, 5)
  key_int_ctx.fillRect(1170, 2380, 2000, 5)

  // Left Side Horz Line
  key_int_ctx.fillRect(0, 1315, 1168, 5)

  // Top Horz Line
  key_int_ctx.fillRect(0, 240, 2552, 5)

  // Bottom Horz Lines
  key_int_ctx.fillRect(0, 2800, 2552, 5)
  key_int_ctx.fillRect(0, 2882, 2552, 5)
  key_int_ctx.fillRect(0, 3160, 2552, 5)

  // Abbreviation Horz Lines
  key_int_ctx.fillRect(88, 291, 988, 5)
  key_int_ctx.fillRect(88, 360, 988, 5)
  key_int_ctx.fillRect(88, 430, 988, 5)
  key_int_ctx.fillRect(88, 500, 988, 5)
  key_int_ctx.fillRect(88, 570, 988, 5)
  key_int_ctx.fillRect(88, 640, 988, 5)
  key_int_ctx.fillRect(88, 710, 988, 5)
  key_int_ctx.fillRect(88, 780, 988, 5)
  key_int_ctx.fillRect(88, 849, 988, 5)
  key_int_ctx.fillRect(88, 918, 988, 5)
  key_int_ctx.fillRect(88, 987, 988, 5)
  key_int_ctx.fillRect(88, 1057, 988, 5)
  key_int_ctx.fillRect(88, 1127, 988, 5)
  key_int_ctx.fillRect(88, 1196, 988, 5)
  key_int_ctx.fillRect(88, 1266, 988, 5)

  // Abbreviation Vert Lines
  key_int_ctx.fillRect(88, 291, 5, 979)
  key_int_ctx.fillRect(240, 291, 5, 979)
  key_int_ctx.fillRect(1073, 291, 5, 979)

  // Pattern Specific Details and Bottom
  // DKC Box
  key_int_ctx.fillRect(275, 2692, 227, 3)
  key_int_ctx.fillRect(275, 2692, 3, 65)
  key_int_ctx.fillRect(275, 2755, 227, 3)
  key_int_ctx.fillRect(500, 2692, 3, 65)
  // LC Box
  key_int_ctx.fillRect(660, 2692, 227, 3)
  key_int_ctx.fillRect(660, 2692, 3, 65)
  key_int_ctx.fillRect(660, 2755, 227, 3)
  key_int_ctx.fillRect(886, 2692, 3, 65)

  key_int_ctx.font = "80px Cooper"
  key_int_ctx.fillText("Interlocking Filet Crochet", 60, 100)
  key_int_ctx.fillText("Abbreviation Key", 245, 190)
  key_int_ctx.fillText("Foundation Rows with Chain", 1264, 150)
  key_int_ctx.fillText("Pattern Specific Details", 105, 1429)

  key_int_ctx.font = "65px Cooper"
  key_int_ctx.fillText("First Color - Startup 1", 1482, 336)
  key_int_ctx.fillText("Second Color - Startup 2", 1442, 1252)
  key_int_ctx.fillText("Row 3 (Refer to pattern for F's and B's)", 1230, 1663)
  key_int_ctx.fillText("Notes", 1739, 2460)

  key_int_ctx.fillText("Things to Remember", 965, 2862)

  key_int_ctx.font = "85px Cooper"
  key_int_ctx.fillText("Be sure to backup this pattern somewhere!", 370, 3260)

  key_int_ctx.font = "Bold 55px Comic Sans MS"
  key_int_ctx.fillText("DKC", 115, 347)
  key_int_ctx.fillText("Dark Color", 500, 347)

  key_int_ctx.fillText("LC", 135, 416)
  key_int_ctx.fillText("Light Color", 495, 416)

  key_int_ctx.fillText("CH", 130, 486)
  key_int_ctx.fillText("Chain", 570, 486)

  key_int_ctx.fillText("DC", 130, 556)
  key_int_ctx.fillText("Double Crochet", 430, 556)

  key_int_ctx.fillText("F", 150, 625)
  key_int_ctx.fillText("Double Crochet to Front", 330, 625)

  key_int_ctx.fillText("B", 150, 695)
  key_int_ctx.fillText("Double Crochet to Back", 340, 695)

  key_int_ctx.fillText("OS", 125, 766)
  key_int_ctx.fillText("Outside Stitch", 435, 766)

  key_int_ctx.fillText("SF", 130, 835)
  key_int_ctx.fillText("Inside Front Stitch", 340, 835)

  key_int_ctx.fillText("SB", 130, 905)
  key_int_ctx.fillText("Inside Back Stitch", 355, 905)

  key_int_ctx.fillText("SK", 130, 975)
  key_int_ctx.fillText("Skip Stitch", 480, 975)

  key_int_ctx.fillText("FW", 120, 1043)
  key_int_ctx.fillText("Front of Work", 445, 1043)

  key_int_ctx.fillText("BW", 120, 1113)
  key_int_ctx.fillText("Back of Work", 455, 1113)

  key_int_ctx.fillText("WF", 120, 1183)
  key_int_ctx.fillText("Second Color to Front", 335, 1183)

  key_int_ctx.fillText("WB", 120, 1252)
  key_int_ctx.fillText("Second Color to Back", 340, 1252)

  key_int_ctx.font = "Bold 55px Cooper"

  key_int_ctx.fillText("Type", 100, 1525)
  key_int_ctx.fillText("\u2022", 240, 1590)

  key_int_ctx.fillText("Amount of Yarn Needed", 100, 1705)
  key_int_ctx.fillText("\u2022", 240, 1770)

  key_int_ctx.fillText("Suggested Weight of Yarn*", 100, 1885)
  key_int_ctx.fillText("\u2022", 240, 1950)

  key_int_ctx.fillText("Finished Size*", 100, 2065)
  key_int_ctx.fillText("\u2022", 240, 2130)

  key_int_ctx.fillText("Gauge*", 100, 2245)
  key_int_ctx.fillText("\u2022", 240, 2310)

  key_int_ctx.fillText("Stitch Counts", 399, 2550)
  key_int_ctx.fillText("DKC", 330, 2677)
  key_int_ctx.fillText("LC", 740, 2677)

  key_int_ctx.font = "Italic 35px Cooper"
  key_int_ctx.fillText("* Size is dependent on hook size, weight of yarn, as well as", 60, 2373)
  key_int_ctx.fillText("your own personal tension while crocheting. Size shown is", 55, 2421)
  key_int_ctx.fillText("roughly how large it will be at the gauge and weight specified.", 30, 2469)

  key_int_ctx.font = "Italic Bold 35px Comic Sans MS"
  key_int_ctx.fillText("(Includes DCs, SFs, SBs, and OSs)", 250, 2600)

  // Right Side Text
  // Bolds
  key_int_ctx.font = "42px Cooper"

  // Startup 1
  key_int_ctx.fillText("1. CH ", 1260, 435)
  key_int_ctx.fillText("STs ", 1690, 435)

  key_int_ctx.fillText("2. DC ", 1260, 495)
  key_int_ctx.fillText("6th CHST ", 1565, 495)

  key_int_ctx.fillText("3. DC ", 1260, 675)
  key_int_ctx.fillText("CHST ", 2010, 675)

  key_int_ctx.font = "45px Cooper"
  key_int_ctx.fillText("The last DC should be crocheted into the last First", 1280, 950)

  key_int_ctx.fillText("Color CHST. To double check your work, count the", 1280, 1000)

  key_int_ctx.fillText("columns in the trellis made; it should equal the First", 1280, 1050)

  key_int_ctx.fillText("Color stitch number specified in the pattern.", 1280, 1100)
  key_int_ctx.font = "42px Cooper"

  // Startup 2
  key_int_ctx.fillText("CH", 1760, 1330)

  // Row 3
  key_int_ctx.fillText("1. DC ", 1260, 1745)
  key_int_ctx.fillText("6th CHST ", 1565, 1745)

  key_int_ctx.fillText("2. DC ", 1260, 1855)
  key_int_ctx.fillText("CH1", 1480, 1855)
  key_int_ctx.fillText("CHST,", 1930, 1855)

  key_int_ctx.font = "45px Cooper"
  key_int_ctx.fillText("The last DC should be crocheted into the last Second", 1260, 2125)

  key_int_ctx.fillText("Color CHST. To double check your work, count the", 1260, 2185)

  key_int_ctx.fillText("columns in the trellis made; it should equal the Second", 1260, 2245)

  key_int_ctx.fillText("Color stitch number specified in the pattern.", 1260, 2300)
  key_int_ctx.font = "42px Cooper"

  // Things to Remember
  key_int_ctx.fillText("DC", 1490, 2945)

  key_int_ctx.fillText("DKCs", 675, 3065)
  key_int_ctx.fillText("DKCs", 1200, 3065)
  key_int_ctx.fillText("LCs", 1495, 3065)
  key_int_ctx.fillText("LCs", 1940, 3065)

  key_int_ctx.fillText("BW,", 555, 3125)
  key_int_ctx.fillText("FW,", 1365, 3125)

  // Bold Italic
  key_int_ctx.font = "Italic 42px Cooper"
  key_int_ctx.fillText("DC's", 2090, 555)

  key_int_ctx.fillText("DC", 1310, 615)
  key_int_ctx.fillText("7th CHST", 1570, 615)

  // Italics
  key_int_ctx.font = "Italic Bold 40px Comic Sans MS"
  // Startup 1
  key_int_ctx.fillText("(if you have too many chains, but your", 1310, 555)
  key_int_ctx.fillText("are okay,", 2210, 555)

  key_int_ctx.fillText("into the", 1400, 615)
  key_int_ctx.fillText("from the hook.)", 1795, 615)

  key_int_ctx.fillText("** DC1, CH1, SK1 CHST, DC1, CH1, SK1 CHST...", 1330, 795)

  key_int_ctx.fillText("(Repeat from **until end of First Color Foundation CH)", 1330, 855)

  // Row 3
  key_int_ctx.fillText("** DC1, CH1, SK1 CHST, DC1, CH1, SK1 CHST...", 1330, 1965)

  key_int_ctx.fillText("(Repeat from **until end of First Color Foundation CH)", 1330, 2020)

  // Notes
  key_int_ctx.fillText("Working threads for second Color and First Color should", 1300, 2540)
  key_int_ctx.fillText("end up on the same side of work after completion of Row 3.", 1270, 2600)
  key_int_ctx.fillText("**Pattern can be made with a chain-less foundation", 1330, 2680)
  key_int_ctx.fillText("and a single crochet joinging all edges.", 1330, 2740)

  // Normal
  key_int_ctx.font = "Bold 40px Comic Sans MS"

  // Startup 1
  key_int_ctx.fillText("the number of ", 1390, 435)
  key_int_ctx.fillText("indicated in startup 1.", 1800, 435)

  key_int_ctx.fillText("into the ", 1390, 495)
  key_int_ctx.fillText("from the hook.", 1790, 495)

  key_int_ctx.fillText("and chain one into every other", 1390, 675)
  key_int_ctx.fillText("in your", 2150, 675)
  key_int_ctx.fillText("foundation chain.", 1310, 735)

  // Startup 2
  key_int_ctx.fillText("Pull your second color", 1325, 1330)
  key_int_ctx.fillText("through the back of the", 1840, 1330)

  key_int_ctx.fillText("far-right window of the First Color trellis from the ", 1325, 1390)

  key_int_ctx.fillText("tail, lining up the length of the Second Color chain", 1325, 1450)

  key_int_ctx.fillText("down the middle of the First Color trellis.", 1325, 1510)

  // Row 3
  key_int_ctx.fillText("into the", 1390, 1745)
  key_int_ctx.fillText("from the hook through the back", 1790, 1745)

  key_int_ctx.fillText("of the 2nd window from the right.", 1310, 1800)

  key_int_ctx.fillText("and", 1390, 1855)
  key_int_ctx.fillText("into every other", 1590, 1855)
  key_int_ctx.fillText("lining them up with", 2090, 1855)

  key_int_ctx.fillText("each window along the First Color trellis.", 1310, 1910)


  // Things to Remember
  key_int_ctx.fillText("\u2022 Chain 1 after every", 1040, 2945)

  key_int_ctx.fillText("\u2022 Chain 3 at the end of every row", 950, 3005)

  key_int_ctx.fillText("\u2022 All", 560, 3065)
  key_int_ctx.fillText("are crocheted into", 820, 3065)
  key_int_ctx.fillText("and all", 1345, 3065)
  key_int_ctx.fillText("are crochet into", 1600, 3065)

  key_int_ctx.fillText("\u2022 On", 440, 3125)
  key_int_ctx.fillText("the back of work is facing you; on", 660, 3125)
  key_int_ctx.fillText("the front of work is facing you.", 1470, 3125)
}

function drawMosKeyPage() {
  var key_int_canvas = document.getElementById('keyPageMosHold');
  var key_int_ctx = key_int_canvas.getContext('2d')

  key_int_canvas.width = "2552"
  key_int_canvas.height = "3300"

  // Back Color (White)
  key_int_ctx.fillStyle = "rgb(255,255,255)"
  key_int_ctx.fillRect(0, 0, 2552, 3300)

  // Things to Remember Color
  key_int_ctx.fillStyle = "rgb(159,208,128)"
  key_int_ctx.fillRect(0, 2920, 2552, 80)

  // Bottom Color
  key_int_ctx.fillStyle = "rgb(228,158,198)"
  key_int_ctx.fillRect(0, 3208, 2552, 200)

  // Abbreviation Key Colors
  key_int_ctx.fillStyle = "rgb(200,200,230)"
  key_int_ctx.fillRect(90, 360, 988, 70)
  key_int_ctx.fillRect(90, 500, 988, 70)
  key_int_ctx.fillRect(90, 640, 988, 70)
  key_int_ctx.fillRect(90, 780, 988, 70)

  // Drawing Lines
  key_int_ctx.fillStyle = "rgb(0,0,0)"

  // Outside
  key_int_ctx.fillRect(0, 0, 2552, 3)
  key_int_ctx.fillRect(0, 0, 3, 3300)
  key_int_ctx.fillRect(0, 3297, 2552, 3)
  key_int_ctx.fillRect(2549, 0, 3, 3300)

  // Center Line
  key_int_ctx.fillRect(1168, 0, 5, 2920)

  // Right Side Horz Lines
  key_int_ctx.fillRect(1170, 1092, 2000, 5)
  key_int_ctx.fillRect(1170, 1959, 2000, 5)

  // Left Side Horz Lines
  key_int_ctx.fillRect(0, 900, 1168, 5)
  key_int_ctx.fillRect(0, 2420, 1168, 5)

  // Top Horz Line
  key_int_ctx.fillRect(0, 240, 2552, 5)

  // Bottom Horz Lines
  key_int_ctx.fillRect(0, 2917, 2552, 5)
  key_int_ctx.fillRect(0, 2998, 2552, 5)
  key_int_ctx.fillRect(0, 3209, 2552, 5)

  // Abbreviation Horz Lines
  key_int_ctx.fillRect(88, 291, 988, 5)
  key_int_ctx.fillRect(88, 360, 988, 5)
  key_int_ctx.fillRect(88, 430, 988, 5)
  key_int_ctx.fillRect(88, 500, 988, 5)
  key_int_ctx.fillRect(88, 570, 988, 5)
  key_int_ctx.fillRect(88, 640, 988, 5)
  key_int_ctx.fillRect(88, 710, 988, 5)
  key_int_ctx.fillRect(88, 780, 988, 5)
  key_int_ctx.fillRect(88, 849, 988, 5)

  // Abbreviation Vert Lines
  key_int_ctx.fillRect(88, 291, 5, 563)
  key_int_ctx.fillRect(295, 291, 5, 563)
  key_int_ctx.fillRect(1073, 291, 5, 563)

  // Pattern Specific Details and Bottom
  // STs Wide Box
  key_int_ctx.fillRect(275, 2300, 227, 3)
  key_int_ctx.fillRect(275, 2300, 3, 65)
  key_int_ctx.fillRect(275, 2365, 227, 3)
  key_int_ctx.fillRect(500, 2300, 3, 65)
  // STs Tall Box
  key_int_ctx.fillRect(660, 2300, 227, 3)
  key_int_ctx.fillRect(660, 2300, 3, 65)
  key_int_ctx.fillRect(660, 2365, 227, 3)
  key_int_ctx.fillRect(886, 2300, 3, 65)

  key_int_ctx.font = "75px Cooper"
  key_int_ctx.fillText("Interlocking Mosaic Crochet", 50, 100)
  key_int_ctx.fillText("Abbreviation Key", 245, 190)

  key_int_ctx.font = "67px Cooper"
  key_int_ctx.fillText("How to Work-Up an Interdimensional", 1225, 100)
  key_int_ctx.fillText("(Overlay) Mosaic Pattern", 1450, 190)
  key_int_ctx.font = "75px Cooper"

  key_int_ctx.fillText("Pattern Specific Details", 105, 1020)

  key_int_ctx.font = "65px Cooper"
  key_int_ctx.fillText("Startup 1", 1725, 335)
  key_int_ctx.fillText("For a thicker bottom border", 1400, 400)

  key_int_ctx.fillText("Startup 1", 1725, 795)
  key_int_ctx.fillText("For a thinner bottom border", 1400, 860)

  key_int_ctx.fillText("BSs (Border Stitches)", 1500, 1200)
  key_int_ctx.fillText("Working the Start of Row BSs", 1370, 1560)
  key_int_ctx.fillText("Working the End of Row BSs", 1395, 1780)

  key_int_ctx.fillText("Working DC STs", 1600, 2050)
  key_int_ctx.fillText("Working SC STs", 1600, 2390)
  key_int_ctx.fillText("Working DSs", 1650, 2725)

  key_int_ctx.fillText("Tips", 500, 2520)

  key_int_ctx.fillText("Things to Remember", 965, 2980)

  key_int_ctx.font = "80px Cooper"
  key_int_ctx.fillText("Be sure to backup this pattern somewhere!", 410, 3280)

  key_int_ctx.font = "Bold 55px Comic Sans MS"
  key_int_ctx.fillText("CH", 160, 347)
  key_int_ctx.fillText("Chain", 600, 347)

  key_int_ctx.fillText("ST", 160, 416)
  key_int_ctx.fillText("Stitch", 580, 416)

  key_int_ctx.fillText("DC/D", 130, 486)
  key_int_ctx.fillText("Double Crochet", 460, 486)

  key_int_ctx.fillText("SC/S", 130, 556)
  key_int_ctx.fillText("Single Crochet", 460, 556)

  key_int_ctx.fillText("DS", 160, 625)
  key_int_ctx.fillText("D1, S1", 580, 625)

  key_int_ctx.fillText("FL", 160, 695)
  key_int_ctx.fillText("Front Loop", 520, 695)

  key_int_ctx.fillText("BL", 160, 766)
  key_int_ctx.fillText("Back Loop", 540, 766)

  key_int_ctx.fillText("SF", 160, 835)
  key_int_ctx.fillText("Inside Front Stitch", 370, 835)

  key_int_ctx.font = "55px Cooper"

  key_int_ctx.fillText("Type", 100, 1100)
  key_int_ctx.fillText("\u2022", 240, 1170)

  key_int_ctx.fillText("Amount of Yarn Needed", 100, 1270)
  key_int_ctx.fillText("\u2022", 240, 1340)

  key_int_ctx.fillText("Suggested Weight of Yarn*", 100, 1440)
  key_int_ctx.fillText("\u2022", 240, 1510)

  key_int_ctx.fillText("Finished Size*", 100, 1610)
  key_int_ctx.fillText("\u2022", 240, 1680)

  key_int_ctx.fillText("Gauge*", 100, 1780)
  key_int_ctx.fillText("\u2022", 240, 1850)

  key_int_ctx.fillText("Stitch Counts", 399, 2110)
  key_int_ctx.fillText("STs Wide", 260, 2260)
  key_int_ctx.fillText("STs Tall", 660, 2260)

  key_int_ctx.font = "Italic 35px Cooper"
  key_int_ctx.fillText("* Size is dependent on hook size, weight of yarn, as well as", 60, 1910)
  key_int_ctx.fillText("your own personal tension while crocheting. Size shown is", 55, 1965)
  key_int_ctx.fillText("roughly how large it will be at the gauge and weight specified.", 30, 2020)

  key_int_ctx.font = "Italic Bold 35px Comic Sans MS"
  key_int_ctx.fillText("(Includes BSs)", 425, 2170)

  // Right Side Text

  // Bold
  key_int_ctx.font = "42px Cooper"

  //Startup 1 Thick
  key_int_ctx.fillText("1. CH", 1280, 470)
  key_int_ctx.fillText("STs Wide", 1710, 470)
  key_int_ctx.fillText("Stitch", 2260, 470)

  key_int_ctx.fillText("Counts", 1330, 530)
  key_int_ctx.fillText("+ 1.", 1750, 530)

  key_int_ctx.fillText("2. Turn", 1280, 590)
  key_int_ctx.fillText("2nd ST", 1850, 590)

  key_int_ctx.fillText("1 SC in each CH ST", 1330, 650)

  key_int_ctx.fillText("3. Cut.", 1280, 710)

  //Startup 1 Thin
  key_int_ctx.fillText("1. CH", 1280, 930)
  key_int_ctx.fillText("STs Wide", 1710, 930)
  key_int_ctx.fillText("Stitch", 2260, 930)

  key_int_ctx.fillText("Counts", 1330, 990)

  key_int_ctx.fillText("2. Cut.", 1280, 1050)

  //BS's
  key_int_ctx.fillText('"BS"', 2320, 1260)

  key_int_ctx.fillText("Border Stitch. BSs", 1510, 1310)

  key_int_ctx.fillText("double border", 1815, 1410)

  // Start BS's
  key_int_ctx.fillText("FL", 1775, 1620)
  key_int_ctx.fillText("BL", 1940, 1620)
  key_int_ctx.fillText("1st ST,", 2160, 1620)

  key_int_ctx.fillText("SC", 1720, 1670)

  // End BS's
  key_int_ctx.fillText("FL", 1755, 1840)
  key_int_ctx.fillText("BL", 1920, 1840)
  key_int_ctx.fillText("Last ST,", 2140, 1840)

  key_int_ctx.fillText("SC", 1720, 1890)

  // Working DC's
  key_int_ctx.fillText("DC STs", 1585, 2120)
  key_int_ctx.fillText("FL", 1930, 2120)
  key_int_ctx.fillText("ST", 2250, 2120)

  key_int_ctx.fillText("\u2022 DC's", 1350, 2220)
  key_int_ctx.fillText("blue square", 1880, 2220)

  key_int_ctx.fillText("ticked square", 1760, 2270)

  // Working SC's
  key_int_ctx.fillText("SC STs", 1590, 2460)
  key_int_ctx.fillText("BL", 1930, 2460)
  key_int_ctx.fillText("ST", 2250, 2460)

  key_int_ctx.fillText("\u2022 DC's", 1330, 2560)
  key_int_ctx.fillText("white square", 1855, 2560)

  key_int_ctx.fillText("blank square", 1740, 2610)

  // Bold Italic
  key_int_ctx.font = "Italic 42px Cooper"

  // Italic
  key_int_ctx.font = "Bold Italic 40px Comic Sans MS"

  // Regular
  key_int_ctx.font = "Bold 40px Comic Sans MS"

  // Startup 1 Thick
  key_int_ctx.fillText("the number of", 1410, 470)
  key_int_ctx.fillText("indicated in the", 1930, 470)
  key_int_ctx.fillText("on this page", 1500, 530)

  key_int_ctx.fillText("and starting in the", 1460, 590)
  key_int_ctx.fillText("from the hook, work", 2020, 590)
  key_int_ctx.fillText("across until the end.", 1740, 650)

  //Startup 1 Thin
  key_int_ctx.fillText("the number of", 1410, 930)
  key_int_ctx.fillText("indicated in the", 1930, 930)
  key_int_ctx.fillText("on this page.", 1500, 990)

  // BS's
  key_int_ctx.fillText("At the beginning and end of every row, there is a", 1320, 1260)

  key_int_ctx.fillText("indicating a", 1270, 1310)
  key_int_ctx.fillText("are not part of the design;", 1930, 1310)

  key_int_ctx.fillText("they are to anchor and complete each row. They also give", 1290, 1360)

  key_int_ctx.fillText("you a nice place to work a", 1280, 1410)
  key_int_ctx.fillText("to hide your cut", 2135, 1410)

  key_int_ctx.fillText("ends (if you choose not to sew/weave them in.)", 1410, 1460)

  // Start BS's
  key_int_ctx.fillText("Pull yarn through the", 1340, 1620)
  key_int_ctx.fillText("and", 1850, 1620)
  key_int_ctx.fillText("of the", 2020, 1620)
  key_int_ctx.fillText("then", 2320, 1620)

  key_int_ctx.fillText("work a", 1570, 1670)
  key_int_ctx.fillText("into the same stitch.", 1795, 1670)

  // End BS's
  key_int_ctx.fillText("Pull yarn through the", 1320, 1840)
  key_int_ctx.fillText("and", 1830, 1840)
  key_int_ctx.fillText("of the", 2000, 1840)
  key_int_ctx.fillText("then", 2320, 1840)

  key_int_ctx.fillText("work a", 1570, 1890)
  key_int_ctx.fillText("into the same stitch.", 1795, 1890)

  // Working DC's
  key_int_ctx.fillText("Work all", 1400, 2120)
  key_int_ctx.fillText("into the", 1760, 2120)
  key_int_ctx.fillText("of the next", 2000, 2120)

  key_int_ctx.fillText("on the previous row worked.", 1610, 2170)

  key_int_ctx.fillText("are indicated by a", 1500, 2220)
  key_int_ctx.fillText("in the block", 2145, 2220)

  key_int_ctx.fillText("instructions and a", 1390, 2270)
  key_int_ctx.fillText("on the graph.", 2070, 2270)

  // Working SC's
  key_int_ctx.fillText("Work all", 1400, 2460)
  key_int_ctx.fillText("into the", 1760, 2460)
  key_int_ctx.fillText("of the next", 2000, 2460)

  key_int_ctx.fillText("on the row you are working.", 1600, 2510)

  key_int_ctx.fillText("are indicated by a", 1480, 2560)
  key_int_ctx.fillText("in the block", 2155, 2560)

  key_int_ctx.fillText("instructions and a", 1370, 2610)
  key_int_ctx.fillText("on the graph.", 2040, 2610)

  // Working DSs
  key_int_ctx.fillText("DS1 is the same as D1, S1.", 1590, 2800)
  key_int_ctx.fillText("(DS3 = D1, S1, D1, S1, D1, S1)", 1530, 2850)

  // Tips
  key_int_ctx.fillText("\u2022 It is better to leave a longer tail when you", 120, 2600)
  key_int_ctx.fillText("start and finish each row.", 160, 2650)

  key_int_ctx.fillText("\u2022 Tie together (square knot) every 2 pieces", 120, 2750)
  key_int_ctx.fillText("of your cut ends on your rows to guarantee", 160, 2800)
  key_int_ctx.fillText("they will be secure.", 160, 2850)

  // Things to Remember
  key_int_ctx.fillText("\u2022 Unlike Interlocking Filet Crochet, you do NOT turn your work in Overlay Mosaic Crochet", 400, 3065)
  key_int_ctx.fillText("\u2022 The back of your work in mosaic will always be striped", 700, 3122)
  key_int_ctx.fillText("\u2022 Do not CH1 after DC STs (for those working a lot of interlocking too)", 560, 3180)
}

function getKeyPage() {
  if (!keyPageVisible) {

    drawKeyPage()

    document.getElementById("previewGraphContainer").hidden = true
    document.getElementById("previewStitchesContainer").hidden = true
    document.getElementById("previewTickingContainer").hidden = true
    document.getElementById("previewGridLinesContainer").hidden = true
    document.getElementById("previewRowContainer").hidden = true
    document.getElementById("previewColumnContainer").hidden = true
    document.getElementById("keyPageContainer").hidden = false
    keyPageVisible = true
    document.getElementById("instKeyGraphButton").innerHTML = "See Graph"
  } else {

    drawKeyPage()

    document.getElementById("previewGraphContainer").hidden = false
    document.getElementById("previewStitchesContainer").hidden = false
    document.getElementById("previewTickingContainer").hidden = false
    document.getElementById("previewGridLinesContainer").hidden = false
    document.getElementById("previewRowContainer").hidden = false
    document.getElementById("previewColumnContainer").hidden = false
    document.getElementById("keyPageContainer").hidden = true
    keyPageVisible = false
    document.getElementById("instKeyGraphButton").innerHTML = "See Key"
  }
}

function drawKeyPage() {
  var key_canvas = document.getElementById('keyPage');
  var key_ctx = key_canvas.getContext('2d')
  var graphArea = innerWidth * innerHeight

  key_canvas.width = "2552"
  key_canvas.height = "3300"

  if (selectedStyle == 1) {
    var yarn = Math.ceil((graphArea * 5.55555555555556E-02) / 2) - (Math.ceil((graphArea * 5.55555555555556E-02) / 2) % 50)
    if (yarn <= 5) {
      yarn = "less than 50"
    }

    key_ctx.drawImage(document.getElementById("keyPageIntHold"), 0, 0);

    if (size = "" || "NaN") {
      size = "Custom"
    }

    key_ctx.font = "Bold 50px Comic Sans MS"
    key_ctx.fillText(size, 285, 1590)
    key_ctx.fillText(yarn + " yards each color", 285, 1770)

    switch (unit) {
      case 0:
        key_ctx.fillText(wInch + '" x ' + hInch + '"', 285, 2130)
        break;

      case 1:
        key_ctx.fillText(wCM + 'cm x ' + hCM + 'cm', 285, 2130)
        break;

    }
    switch (firstColor) {
      case 1:
        var DKCwide = Math.ceil(innerWidth / 2)
        var LCwide = Math.floor(innerWidth / 2)
        break;

      case 2:
        var DKCwide = Math.floor(innerWidth / 2)
        var LCwide = Math.ceil(innerWidth / 2)
        break;
    }



    if (gauge == "1") {
      key_ctx.fillText("Worsted Weight", 285, 1950)
      key_ctx.fillText("4 x 4 STs in 1 Inch", 285, 2305)

    } else if (gauge == "2" || 2) {
      key_ctx.fillText("DK Weight", 285, 1950)
      key_ctx.fillText("5 x 5 STs in 1 Inch", 285, 2305)
    }

    key_ctx.textAlign = 'center'

    key_ctx.fillText(DKCwide, 390, 2745)
    key_ctx.fillText(LCwide, 775, 2745)

  } else {
    var yarn = Math.ceil((graphArea * 5.55555555555556E-02) / 2) - (Math.ceil((graphArea * 5.55555555555556E-02) / 2) % 50)
    yarn += yarn * 0.1
    if (yarn <= 5) {
      yarn = "Less than 50"
    }

    key_ctx.drawImage(document.getElementById("keyPageMosHold"), 0, 0);

    if (size = "" || "NaN") {
      size = "Custom"
    }

    key_ctx.font = "Bold 50px Comic Sans MS"
    key_ctx.fillText(size, 280, 1170)
    key_ctx.fillText(yarn + " yards each color", 280, 1340)



    switch (unit) {
      case 0:
        key_ctx.fillText(wInch + '" x ' + hInch + '"', 280, 1680)
        break;

      case 1:
        key_ctx.fillText(wCM + 'cm x ' + hCM + 'cm', 280, 1680)
        break;
    }

    if (gauge == "1") {
      key_ctx.fillText("Worsted Weight", 280, 1510)
      key_ctx.fillText("4 x 4 STs in 1 Inch", 280, 1850)

    } else if (gauge == "2" || 2) {
      key_ctx.fillText("DK Weight", 280, 1510)
      key_ctx.fillText("5 x 5 STs in 1 Inch", 280, 1850)
    }

    var STswide = Number(innerWidth) + 2
    var STstall = innerHeight

    key_ctx.textAlign = 'center'
    key_ctx.fillText(STswide, 395, 2350)
    key_ctx.fillText(STstall, 780, 2350)
  }
}

function drawRowMarkers() {
  graphWidth = (innerWidth * 8) * zoomSelection
  graphHeight = (innerHeight * 8) * zoomSelection

  previewRowContainer.style.height = (graphHeight + 50) + "px"
  previewRow.height = graphHeight + 50

  previewRowContainer.style.width = "50px"
  previewRow.width = 50

  previewColumnContainer.style.width = (graphWidth + 50) + "px"
  previewColumn.width = graphWidth + 50

  previewColumnContainer.style.height = "50px"
  previewColumn.height = 50

  previewColumnContainer.style.zIndex = 12
  previewRowContainer.style.zIndex = 12

  var topScroll = document.getElementById('graphPreview').scrollTop
  var leftScroll = document.getElementById('graphPreview').scrollLeft

  document.getElementById('previewGraphBar').style.top = topScroll - 50 + "px"
  document.getElementById('previewGraphBar').style.left = leftScroll + "px"
  document.getElementById('previewGraphBar').style.zIndex = 13


  // Scroll Rows and Columns with window
  previewRowContainer.style.left = leftScroll + "px"

  if (graphHeight + 50 < window.outerHeight - 243 + topScroll) {
    previewColumnContainer.style.top = (graphHeight + 50) + "px";

  } else if (graphHeight > window.outerHeight - 243) {
    previewColumnContainer.style.top = window.outerHeight - 243 + topScroll + "px";

  } else {
    previewColumnContainer.style.top = (graphHeight + 50) + topScroll + "px";
  }

  previewRowCtx = previewRow.getContext("2d", { willReadFrequently: true });
  previewColumnCtx = previewColumn.getContext("2d", { willReadFrequently: true });


  // Draw Borders
  previewRowCtx.fillStyle = 'rgb(0,0,0)';
  previewColumnCtx.fillStyle = 'rgb(0,0,0)';
  previewRowCtx.fillRect(48, 0, 2, (graphHeight + 33));
  previewColumnCtx.fillRect(0, 0, (graphWidth), 2);

  // Draw Backgrounds
  previewRowCtx.fillStyle = "rgba(255,240,240,.75)";
  previewColumnCtx.fillStyle = "rgba(255,240,240,.75)";
  previewRowCtx.fillRect(0, 0, 48, (graphHeight + 33));
  previewColumnCtx.fillRect(0, 2, (graphWidth), 33);

  // Draw Bottom Right Triangle
  previewColumnCtx.strokeStyle = "rgba(255,240,240,.75 )"
  previewColumnCtx.beginPath();
  previewColumnCtx.moveTo(graphWidth, 0);
  previewColumnCtx.lineTo(graphWidth, 33);
  previewColumnCtx.lineTo(graphWidth + 33, 33);
  previewColumnCtx.closePath()
  previewColumnCtx.fill()
  previewColumnCtx.stroke();

  previewColumnCtx.strokeStyle = "rgba(0,0,0,1)"
  previewRowCtx.fillStyle = 'rgb(0,0,0)';
  previewRowCtx.font = "Bold " + (7 * zoomSelection) + 'px Comic Sans MS';
  previewRowCtx.textAlign = 'center';

  var zoomMultiplier

  if (zoomSelection >= 2.0) {
    zoomMultiplier = 1
  } else if (zoomSelection >= 1.5) {
    zoomMultiplier = 2
  } else if (zoomSelection >= 1) {
    zoomMultiplier = 3
  } else if (zoomSelection >= .5) {
    zoomMultiplier = 4
  }

  previewRowCtx.fillStyle = 'rgb(0,0,0)';
  previewRowCtx.font = "Bold " + (zoomMultiplier * 6 * zoomSelection) + 'px Comic Sans MS';
  previewRowCtx.textAlign = 'center';

  for (y = 0; y <= (innerHeight); y += zoomMultiplier) {
    previewRowCtx.fillRect(0, y * 8 * zoomSelection, 50, 2);
    previewRowCtx.fillText(innerHeight - y + 1, 24, (y * 8 * zoomSelection) - (3), 45)
  }

  previewColumnCtx.lineWidth = 2
  previewColumnCtx.fillStyle = 'rgb(0,0,0)';
  previewColumnCtx.font = "Bold " + (zoomMultiplier * 4.2 * zoomSelection) + 'px Comic Sans MS';
  previewColumnCtx.textAlign = 'left';

  previewColumnCtx.beginPath();
  previewColumnCtx.moveTo(0, 0);
  previewColumnCtx.lineTo(0, 50);
  previewColumnCtx.stroke();

  for (x = 0; x <= (innerWidth); x += zoomMultiplier) {
    previewColumnCtx.beginPath();
    previewColumnCtx.moveTo(x * 8 * zoomSelection, 0);
    previewColumnCtx.lineTo((x * 8 * zoomSelection) + (35.355), 35.355);
    previewColumnCtx.stroke();

    if (innerWidth - x != 0) {
      previewColumnCtx.setTransform(1, 1, -1, 1, 12, 10)
      previewColumnCtx.fillText(innerWidth - x, (x * 8 * zoomSelection) / 2, (-x * 8 * zoomSelection) / 2, 45)
      previewColumnCtx.setTransform(1, 0, 0, 1, 0, 0)
    }
  }
  graphWidth = (innerWidth * 8)
  graphHeight = (innerHeight * 8)
}

// Export Functions
function imageExport() {

  if (patternName == "") {
    alert("Enter your pattern name")
  } else {

    switch (document.getElementById("frontExport").checked) {
      case true:
        switch (document.getElementById("smallExport").checked) {
          case false:

            previewGraph.width = graphWidth
            previewGraph.height = graphHeight
            previewGraphCtx.drawImage(document.getElementById('cells'), 0, 0)
            if (document.getElementById("stitchesExport").checked) {
              if (stitchesLoaded == false) {
                stitchesChange()
              }
              previewGraphCtx.drawImage(document.getElementById('previewStitches'), 0, 0)
            }
            if (document.getElementById("gridExport").checked) {
              previewGraphCtx.drawImage(document.getElementById('previewGridLines'), 0, 0)
            }
            if (document.getElementById("tickedExport").checked) {
              previewGraphCtx.drawImage(document.getElementById('previewTicking'), 0, 0)
            }

            var anchor = document.getElementById('imageExportButton');
            anchor.href = document.getElementById("previewGraph").toDataURL();
            anchor.download = patternName + ".png";

            previewGraph.width = graphWidth
            previewGraph.height = graphHeight
            previewGraphCtx.drawImage(document.getElementById('cells'), 0, 0)


            getPatternArray()
            drawThumbnailGraph()

            break;

          case true:
            getPatternArray()
            drawThumbnailGraph()

            var anchor = document.getElementById('imageExportButton');
            anchor.href = document.getElementById("graphThumbnail").toDataURL();
            anchor.download = patternName + " Small.png";
            previewGraphCtx.drawImage(document.getElementById('cells'), 0, 0)
            break;
        }
        break;

      case false:
        switch (document.getElementById("smallExport").checked) {
          case false:
            previewGraphCtx.drawImage(document.getElementById("cellsBack"), 0, 0)

            if (document.getElementById("stitchesExport").checked) {
              if (stitchesLoaded == false) {
                stitchesChange()
              }
              previewGraphCtx.drawImage(document.getElementById('previewStitches'), 0, 0)
            }
            if (document.getElementById("gridExport").checked) {
              previewGraphCtx.drawImage(document.getElementById('previewGridLines'), 0, 0)
            }

            getPatternArray()
            drawThumbnailGraph()

            var anchor = document.getElementById('imageExportButton');
            anchor.href = document.getElementById("previewGraph").toDataURL();
            anchor.download = patternName + " Back.png";
            previewGraphCtx.drawImage(document.getElementById('cells'), 0, 0)
            break;

          case true:
            getPatternArrayBack()
            drawThumbnailGraph()

            var anchor = document.getElementById('imageExportButton');
            anchor.href = document.getElementById("graphThumbnail").toDataURL();
            anchor.download = patternName + " Small Back.png";
            previewGraphCtx.drawImage(document.getElementById('cells'), 0, 0)
            break;
        }
        break;
    }
  }
  getPatternArray()
  drawThumbnailGraph()
};

function pdfGraphSplit() {
  if (document.getElementById("graphSizePageInput").value > 100) {
    document.getElementById("graphSizePageInput").value = 100
  } else if (document.getElementById("graphSizePageInput").value < 10) {
    document.getElementById("graphSizePageInput").value = 10
  }
  var x_split = document.getElementById("graphSizePageInput").value

  var max_width = 2700
  var pixelSize = Math.floor(max_width / x_split)
  var max_height = 1952

  var y_split = Math.floor(x_split * (max_height / max_width))

  var pages_wide = Math.ceil(innerWidth / x_split)
  var pages_tall = Math.ceil(innerHeight / y_split)

  var x_page = -1
  var y_page = 0

  pages = pages_wide * pages_tall

  exportCanvas = document.getElementById("exportCanvas");
  ctxExport = exportCanvas.getContext("2d", { willReadFrequently: true });
  exportCanvas.width = 3300
  exportCanvas.height = 2552



  var graph_width = pixelSize * x_split
  var graph_height = pixelSize * y_split

  var graph_margin_wide = Math.floor(3300 - max_width) / 2
  var graph_margin_high = Math.floor(2552 - max_height) / 2

  getPatternArray()
  drawThumbnailGraph()

  graphThumb = document.getElementById("graphThumbnail");
  ctxThumb = graphThumb.getContext("2d", { willReadFrequently: true });

  document.getElementById("exportGraphPage").innerHTML = "of " + pages

  ctxExport.lineWidth = 10
  ctxExport.strokeStyle = "rgba(122,122,122,1)"

  for (var p = 0; p <= pages - 1; p++) {
    ctxExport.fillStyle = "rgb(255,255,255)"
    ctxExport.fillRect(0, 0, 3300, 2552)
    if (x_page == pages_wide - 1) {
      y_page++
      x_page = 0
    } else {
      x_page++
    }

    for (var y = y_page * y_split, yc = 0; y <= ((y_page + 1) * y_split) - 1, y < innerHeight, (yc * pixelSize) + pixelSize <= max_height; y++, yc++) {

      if (innerHeight - y > 0) {
        ctxExport.fillStyle = "rgb(0,0,0)"
        ctxExport.textAlign = 'center'
        ctxExport.font = (pixelSize * .8) + "px Cooper"
        ctxExport.fillText((innerHeight - y), graph_margin_wide / 2, graph_margin_high + (yc * pixelSize) + pixelSize * .8)

        if ((pages - p) % pages_wide == 1) {
          graph_width = pixelSize * (innerWidth % x_split)
        }
        ctxExport.fillText((innerHeight - y), graph_margin_wide + graph_width + (graph_margin_wide / 2), graph_margin_high + (yc * pixelSize) + pixelSize * .8)
        graph_width = pixelSize * x_split
      }

      for (var x = x_page * x_split, xc = 0; x <= ((x_page + 1) * x_split) - 1, x < innerWidth, (xc * pixelSize) + pixelSize <= max_width; x++, xc++) {
        cCell = ctxThumb.getImageData(x, y, 1, 1).data;
        cCellColor = "rgb(" + cCell[0] + ', ' + cCell[1] + ', ' + cCell[2] + ")";

        if (innerWidth - x > 0) {
          ctxExport.fillStyle = "rgb(0,0,0)"
          ctxExport.textAlign = 'center'
          ctxExport.font = (pixelSize * .5) + "px Cooper"

          ctxExport.setTransform(1, 1, -1, 1, graph_margin_wide - pixelSize * .3, graph_margin_high - (pixelSize * .4))

          ctxExport.fillText((innerHeight - x), (xc * pixelSize) / 2, -(xc * pixelSize) / 2, pixelSize * .8)

          if ((pages - p <= pages_wide) && (innerHeight % y_split != 0)) {
            graph_height = pixelSize * (innerHeight % y_split)
          }

          ctxExport.setTransform(1, 1, -1, 1, graph_margin_wide + pixelSize, graph_margin_high + (pixelSize * .75) + graph_height)

          ctxExport.fillText((innerHeight - x), (xc * pixelSize) / 2, -(xc * pixelSize) / 2, pixelSize * .8)

          graph_height = pixelSize * y_split

          ctxExport.setTransform(1, 0, 0, 1, 0, 0)
        }

        switch (cCellColor) {
          case ink1:
            ctxExport.fillStyle = ink1
            ctxExport.fillRect(graph_margin_wide + (xc * pixelSize), graph_margin_high + (yc * pixelSize), pixelSize, pixelSize)
            break;
          case ink2:
            ctxExport.fillStyle = ink2
            ctxExport.fillRect(graph_margin_wide + (xc * pixelSize), graph_margin_high + (yc * pixelSize), pixelSize, pixelSize)
            break;
        }

      }
    }

    // console.log((pages-p) % 3)

    if (((pages - p) % pages_wide == 1) && (innerWidth % x_split != 0)) {
      graph_width = pixelSize * (innerWidth % x_split)
      x_split = innerWidth % x_split
    }

    if ((pages - p <= pages_wide) && (innerHeight % y_split != 0)) {
      graph_height = pixelSize * (innerHeight % y_split)
      y_split = innerHeight % y_split
    }

    for (var x = 0; x <= x_split; x++) {
      ctxExport.beginPath();
      ctxExport.moveTo(x * pixelSize + graph_margin_wide, graph_margin_high);
      ctxExport.lineTo(x * pixelSize + graph_margin_wide, graph_height + graph_margin_high);
      ctxExport.stroke();

      ctxExport.beginPath();
      ctxExport.moveTo(x * pixelSize + graph_margin_wide, graph_margin_high);
      ctxExport.lineTo(x * pixelSize + pixelSize, graph_margin_high - pixelSize);
      ctxExport.stroke();

      ctxExport.beginPath();
      ctxExport.moveTo(x * pixelSize + graph_margin_wide, graph_height + graph_margin_high);
      ctxExport.lineTo(x * pixelSize + graph_margin_wide + pixelSize, graph_height + graph_margin_high + pixelSize);
      ctxExport.stroke();
    }

    for (var y = 0; y <= y_split; y++) {
      ctxExport.beginPath();
      ctxExport.moveTo(0, y * pixelSize + graph_margin_high);
      ctxExport.lineTo(graph_width + (graph_margin_wide * 2), y * pixelSize + graph_margin_high);
      ctxExport.stroke();
    }

    x_split = document.getElementById("graphSizePageInput").value
    y_split = Math.floor(x_split * (1952 / 2700))

    graph_width = pixelSize * x_split
    graph_height = pixelSize * y_split

    pdfSplitArray[p] = new Image()
    pdfSplitArray[p].src = document.getElementById("exportCanvas").toDataURL();
  }
  drawExportPageView()
}

function pdfGraphExport() {
  if (bugAlert() == true) {
    printWindow = window.open("", "", "width=800, height=600");
    var htmlHold = "<style>@media print {html, body, img {height: 100vh; margin: 0 !important; padding: 0 !important; size: letter landscape !important; }}@page {margin: 0 !important; size: letter landscape !important;}</style><body>"

    for (var i = pdfSplitArray.length - 1; i >= 0; i--) {
      htmlHold += "<img height='815pt' src='" + pdfSplitArray[i].src + "'>"
    }

    htmlHold += "</body>"
    printWindow.document.write(htmlHold);

    printWindow.print();
    printWindow.close();
  }
}

function exportPageUp() {
  if (pageView != pages) {
    pageView++
    document.getElementById("graphPageInput").value = pageView
  }
  drawExportPageView()
}

function exportPageDown() {
  if (pageView != 1) {
    pageView--
    document.getElementById("graphPageInput").value = pageView
  }
  drawExportPageView()
}

function exportMaxStitchUp() {
  if (document.getElementById("graphSizePageInput").value != 100) {
    document.getElementById("graphSizePageInput").value++
  }
  pdfGraphSplit(); drawExportPageView()
}

function exportMaxStitchDown() {
  if (document.getElementById("graphSizePageInput").value != 10) {
    document.getElementById("graphSizePageInput").value--
  }
  pdfGraphSplit(); drawExportPageView()
}

function drawExportPageView() {
  pageView = document.getElementById("graphPageInput").value

  if (pageView > pages) {
    pageView = pages
    document.getElementById("graphPageInput").value = pages
  }

  exportCanvas = document.getElementById("exportCanvas");
  ctxExport = exportCanvas.getContext("2d", { willReadFrequently: true });
  ctxExport.drawImage(pdfSplitArray[pages - pageView], 0, 0)
}

function getPatternArray() {
  graph = document.getElementById("cells");
  ctx = graph.getContext("2d", { willReadFrequently: true });

  graphThumb = document.getElementById("graphThumbnail");
  graphThumb.width = innerWidth
  graphThumb.height = innerHeight
  ctxThumb = graphThumb.getContext("2d", { willReadFrequently: true });

  patternArray = []

  for (let x = 0; x <= innerWidth; x++) {
    for (let y = 0; y <= innerHeight; y++) {

      cCell = ctx.getImageData(x * 8, y * 8, 8, 8).data;
      cCellColor = "rgb(" + cCell[0] + ', ' + cCell[1] + ', ' + cCell[2] + ")";
      switch (cCellColor) {
        case ink1:
          patternArray.push(1);
          break;
        case ink2:
          patternArray.push(0);
          break;
        case greyColor:
          patternArray.push(2);
          break;
        case "rgb(0, 0, 0)":
          patternArray.push(1);
          break;
      }

    }
  }
};

function getPatternArrayBack() {
  graph = document.getElementById("cellsBack");
  ctxBack = graph.getContext("2d", { willReadFrequently: true });

  patternArray = []

  for (let x = 0; x <= innerWidth; x++) {
    for (let y = 0; y <= innerHeight; y++) {

      cCell = ctxBack.getImageData(x * 8, y * 8, 8, 8).data;
      cCellColor = "rgb(" + cCell[0] + ', ' + cCell[1] + ', ' + cCell[2] + ")";
      switch (cCellColor) {
        case ink1:
          patternArray.push(1);
          break;
        case ink2:
          patternArray.push(0);
          break;
        case greyColor:
          patternArray.push(2);
          break;
        case "rgb(0, 0, 0)":
          patternArray.push(1);
          break;
      }

    }
  }
};

function exportInstructions() {
  if (document.getElementById('pdfExport').checked) {
    if (bugAlert() == true) {
      printWindow = window.open("", "", "width=800, height=600");
      printWindow.document.write("<style> @media print {.page-header { display: none !important; } html, body, img {font-size:15px; height:100vh; margin: 5mm !important; padding: 0 !important; size: letter portrait !important; }}@page {margin: 5mm !important; size: letter portrait !important;}</style>" + document.getElementById("instructions").innerHTML);
      delay(1000).then(function () { printWindow.print(); printWindow.close() });
      ;
    }
  } else if (document.getElementById('txtExport').checked) {
    saveAs(patternString, patternName + ".txt")
  }
};

async function exportKeyPage() {

  if (bugAlert() == true) {
    var key = document.getElementById("keyPage");
    var ctxKey = key.getContext("2d", { willReadFrequently: true });
    var key_image = new Image()
    key_image.src = key.toDataURL();


    if (document.getElementById("imgExportKey").checked) {

      var anchor = document.getElementById("keyPageExportButton");
      anchor.href = document.getElementById("keyPage").toDataURL();
      anchor.download = patternName + " Key Page.png";
      ctxKey.drawImage(document.getElementById("keyPage"), 0, 0)
      // anchor.href = "#";
    } else {
      document.getElementById("keyPageExportButton").href = "#"

      printWindow = window.open("", "", "width=800, height=600");
      // printWindow.document.open();
      printWindow.document.write("<style>@media print {html, body, img {height:100vh; margin: 0 !important; padding: 0 !important;overflow: hidden; size: letter portrait !important;}}@page {margin: 0 !important; size: letter portrait !important;}</style><img width='100%' src='" + key_image.src + "'/>");
      // $(printWindow).on('load', function() {
      printWindow.print();
      printWindow.close();
      // });
    }
  }
};

function setPatternName(_this) {
  patternName = _this.value
  document.getElementById("patternNameExport").value = patternName
};


// Preferences Functions
function cornerMarksPref() {

  switch (document.getElementById("yesCornerPref").checked) {
    case true:
      switch (firstColor) {
        case 1:
          ctx.fillStyle = ink1
          markCorners()
          
          break;
        case 2:
          ctx.fillStyle = ink2
          markCorners()
          break;
      }
      break;
    case false:
      switch (firstColor) {
        case 1:
          ctx.fillStyle = ink2
          markCorners()
          break;
        case 2:
          ctx.fillStyle = ink1
          markCorners()
          break;
      }
      break;
  }
};

function markCorners() {
  ctx.fillRect(8, 16, 8, 8)
  ctx.fillRect(graphWidth - 16, 16, 8, 8)
  ctx.fillRect(8, graphHeight - 24, 8, 8)
  ctx.fillRect(graphWidth - 16, graphHeight - 24, 8, 8)
}

function colorChangePref() {
  switch (document.getElementById("instantColorPref").checked) {
    case true:
      hueSlider.changeListener("wait","remove");
      satSlider.changeListener("wait", "remove");
      lightSlider.changeListener("wait", "remove");

      hueSlider.changeListener("instant","add");
      satSlider.changeListener("instant", "add");
      lightSlider.changeListener("instant", "add");
      break;

    case false:
      hueSlider.changeListener("instant","remove");
      satSlider.changeListener("instant", "remove");
      lightSlider.changeListener("instant", "remove");

      hueSlider.changeListener("wait","add");
      satSlider.changeListener("wait", "add");
      lightSlider.changeListener("wait", "add");
      break;
  }
  hueChange()
};

function styleChangePref() {
  switch (document.getElementById("removeDotsStylePref").checked) {
    case true:
      removeDots = true
      break;

    case false:
      removeDots = false
      break;
  }
};

function shadePref() {
  switch (document.getElementById("selectedShadePref").checked) {
    case true:
      bothShadePref = false
      break;

    case false:
      bothShadePref = true
      break;
  }
};

async function colorScroll(_this, event) {
  if (event.deltaY > 0) {
    _this.value--
  } else if (event.deltaY < 0) {
    _this.value++
  }
  await hueChange()
  await drawToolButtons()
  await changeToolDropdown()
};

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
};

function toggleSaveAsMenu() {
  if (patternLoaded) {
    
    if (document.getElementById('saveAsMenu').style.display != 'none') {
      document.getElementById('saveAsMenu').style.display = 'none'
    } else {
      checkSaveAsText();
      document.getElementById('saveAsMenu').style.display = 'block'
    }
  } else {
    return;
  };
};

function checkSaveAsText() {
  var thisField = document.getElementById('patternNameSaveAs');
  if (thisField.value == ""){
    thisField.style.animation = 'red_glow 5s infinite';
  } else {
    thisField.style.animation = "";
  }
}

function saveAsSteps() {
  setPatternName(document.getElementById('patternNameSaveAs')); saveGraph();
  toggleSaveAsMenu();
};

