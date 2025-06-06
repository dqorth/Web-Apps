var clicked = false;
var hover = false;
var touched = false
var clicked = 0;

var instantColorChange = true;
var removeDots = true;

var zoomSelection = 1

var textInstructions = true
var hueDarkSliderVal
var satDarkSliderVal
var lightDarkSliderVal = 0

var hueLightSliderVal
var satLightSliderVal
var lightLightSliderVal = 100

var bothShadePref = true

var landingOpen = true

var pageView = 1
var pages

var gauge = 0

var exportPageImage

var ogink1
var ogink2

var smallScreen = false
var smallScreenInch = false

var graphPreviewVisible = false

var hatchLoaded = false
var vertLoaded = false
var horzLoaded = false

var selectedStyle = 0
var selectedStyleNew = 0

var size = ""

var innerWidth = 0
var innerHeight = 0
var innerWidthNew = 0
var innerHeightNew = 0

var graphWidthNew = 0
var graphHeightNew = 0

var firstColor = 1
var interiorColor = 2

var firstColorNew = 1
var interiorColorNew = 2

let ink1 = 'rgb(0, 0, 0)'
let ink2 = 'rgb(255, 255, 255)'
let greyColor = 'rgb(127, 127, 127)'

let stColor1 = 'rgba(0, 0, 0, .25)'
let stColor2 = 'rgba(63, 63, 63, .25)'
let stColor3 = 'rgba(127, 127, 127, .25)'
let stColor4 = 'rgba(191, 191, 191, .25)'
let stColor5 = 'rgba(255, 255, 255, .25)'

const previewRowContainer = document.getElementById("previewRowContainer")
const previewRow = document.getElementById("previewRow")
const previewColumnContainer = document.getElementById("previewColumnContainer")
const previewColumn = document.getElementById("previewColumn")

const graphImgHtml = '<canvas id    = "exportCanvas" style = "max-width: 300px;border: inset grey 2px;margin-bottom: 25px;"></canvas><br><div id="stitchGridExportOption" style = "padding-left: 125px;padding-right: 115px; display: block; height: 115px;"><label class = "exportContainer noSelect" style = "float: right;"> Stitched <input id    = "stitchesExport" type  = "checkbox" style = "float: left;"><span class = "checkmark noSelect"></span></label><br><label class = "exportContainer noSelect"style = "float: right;"> Grid <input id    = "gridExport" type  = "checkbox" style = "float: left;"><span class = "checkmark noSelect"></span></label><br><label id = "tickedExportContainer" class = "exportContainer noSelect" style = "float: right;"> Ticked <input id    = "tickedExport"type  = "checkbox" style = "float: left;" ><span class = "checkmark noSelect"></span></label></div><div class = "horzDivider"></div><div style = "position: relative;display: block;margin-bottom: 25px; padding-left: 35px; margin-top: 10px"><label class = "exportContainer noSelect"> Small <input id   = "smallExport" name = "exportSize"type = "radio" ><span class ="checkmark noSelect"></span></label><label class = "exportContainer noSelect" style = "margin-left: 10px;"> Large<input id      = "largeExport"name    = "exportSize"type    = "radio" checked = "checked"><span class = "checkmark noSelect"></span></label></div><br><div id="frontBackExportOption" style = "display: block;margin-bottom: 25px;padding-left: 35px;"><label class = "exportContainer noSelect"> Front <input id      = "frontExport" name    = "exportFrontBack" type    = "radio" checked = "checked"><span class="checkmark noSelect"></span></label><label class = "exportContainer noSelect" style = "margin-left: 10px;">Back<input id   = "backExport" name = "exportFrontBack"type = "radio"><span class = "checkmark noSelect"></span></label></div><a id   = "imageExportButton"href = "#"><button id      = "imageExportButtonButton"onclick = "imageExport()">Download Graph Image</button></a>'

const graphPdfHtml = '<canvas id    = "exportCanvas" style = "max-width: 300px;border: inset grey 2px;margin-bottom: 10px;"></canvas><br><img id      = "leftArrowGraphPage"class   = "noSelect arrow"src     = "s/IDScribeLeftArrow.webp" alt     = "Next Page"onclick = "exportPageDown()"><label style="position: relative; bottom: 18px;"><label >Page</label><input  id    = "graphPageInput"type  = "number"title = "Choose which page to preview"value = "1"min   = "1"max   = "50"onfocusout="drawExportPageView()" ><label id="exportGraphPage"></label></label></label><img id      = "rightArrowGraphPage"class   = "noSelect arrow"src     = "s/IDScribeRightArrow.webp" alt     = "Previous Page"onclick = "exportPageUp()"><br><label style="font-size: 20px;margin-bottom: 10px;">Stitches Per Page</label><br><img id      = "leftArrowGraphMaxWide"class   = "noSelect arrow"src     = "s/IDScribeLeftArrow.webp" alt     = "Minus 1 Stitch" onclick = "exportMaxStitchDown()"><input  id    = "graphSizePageInput"type  = "number"title = "Choose which page to preview"value = "20"min   = "10"max   = "100"onfocusout="pdfGraphSplit();drawExportPageView()" style="position: relative; bottom: 18px;"><img id      = "rightArrowGraphMaxHigh"class   = "noSelect arrow"src     = "s/IDScribeRightArrow.webp" alt     = "Plus 1 Stitch"onclick = "exportMaxStitchUp()"><br><div class = "horzDivider"></div><br><div id="stitchGridExportOption" style = "padding-left: 125px;padding-right: 115px; display: block; height: 115px;"><label class = "exportContainer noSelect" style = "float: right;"> Stitched <input id    = "stitchesExport"type  = "checkbox"style = "float: left;"><span class = "checkmark noSelect"></span></label><br><label class = "exportContainer noSelect"style = "float: right;"> Grid <input id    = "gridExport"type  = "checkbox"style = "float: left;"><span class = "checkmark noSelect"></span></label><div id = "expBreak"><br><br></div><label id = "tickedExportContainer"class = "exportContainer noSelect"  style = "float: right;"> Ticked<input id    = "tickedExport"type  = "checkbox"style = "float: left;" ><span class = "checkmark noSelect"></span></label></div><div class = "horzDivider"></div><a id   = "imageExportButton"href = "#"><button id      = "imageExportButtonButton"onclick = "pdfGraphExport()">Download / Print PDF</button></a>'

var pdfSplitArray = []

var ink1Selected

var uiOpen = true
var newPatternOpen = false

var unit = 0
var symmetry = 0

var hueEl
var hueVal

var satEl
var satVal

var lightEl
var lightVal

var ink1Background
var ink2Background

var ink1String
var ink2String

var patternLoaded = false
var instructionsLoaded = false

var mosDS = true

var viewType = 0

var instructionGraphPosition = 1
var graphGraphPosition = 2
var instructionThin = false

var toolOptionOpen = false

var graphSizeChangeOpen = false
var exportOpen = false
var prefOpen = false
var importOpen = false

var gridLinesVisible = true
var stitchesVisible = false
var stitchesLoaded = false

var keyPageVisible = false

var markSize = 1

var frontZoom = 10
var backZoom = 10
var graphPreviewZoom = 10

// Which Graph is being marked?
  // 1 = front || 2 = back
var overFrontGraph = true

var newString = [] 

var undoState = [];

var redoState = [];

var undoStateColorDark = []
var undoStateColorLight = []

var redoStateColorDark = []
var redoStateColorLight = []

var undoLength = []

var undoStateBack = []
var redoStateBack = []

var tickingArray = []
var patternArray = []
var tickingLoaded = false

var thisArray = []

var graphColorArray = []

// Import Variables
  var impColorArray = []
  var impColorArrayR = []
  var impColorArrayG = []
  var impColorArrayB = [] 
  var impGreyArray = []

  var imageImport
  var importCanvas
  var ctxImport

  var importOpen = false
  var importShade = false
    // 1 = Horz || 2 = Vert
  var importShadeOption = 1

  var impRatio = .5
  var impRatioKeep = true

  var oldHeight
  var oldWidth
  var impRatioWidth
  var impRatioHeight

  var impLoaded = 0

var hatch
var ctxHatch

var undoNum = 0
var redoNum = 0

var undoNumBack = 0
var redoNumBack = 0

// 0 = interlocking | 1 = ilosaic
var instructionsView = 0

// 0 = Solid | 1 = Shade
var toolPicked = 0

// 0 = dark hatching | 1 = horz | 2 = vert | 3 = light hatching
var shadeType = 2

var graph
var graphThumb
var graphBack

var container
var containerBack

var ctx
var ctxThumb
var ctxOther

var gridLines
var stitchesOverlay
var previewGraph
var previewGridLines
var previewStitchesOverlay

var gridContainer
var stitchContainer
var previewGraphContainer
var previewGridContainer
var previewStitchContainer

var gridCtx
var stitchCtx
var previewGraphCtx
var previewGridCtx
var previewStitchCtx

var previewRowCtx
var previewColumnCtx

var graphWidth
var graphHeight

let currentCoord = { x: 0, y: 0 };

let thisDownMark = { x: 0, y: 0 };
let thisUpMark = { x: 0, y: 0 };

let thisMark = { x: 0, y: 0 };

let horzMark = { x: 0, y: 0 };
let vertMark = { x: 0, y: 0 };

let bothMark = { x: 0, y: 0 };

let thisMarkOther = { x: 0, y: 0 };

let horzMarkOther = { x: 0, y: 0 };
let vertMarkOther = { x: 0, y: 0 };

let bothMarkOther = { x: 0, y: 0 };

let horzUpMark = { x: 0, y: 0 };
let vertUpMark = { x: 0, y: 0 };
let bothUpMark = { x: 0, y: 0 };

let horzDownMark = { x: 0, y: 0 };
let vertDownMark = { x: 0, y: 0 };
let bothDownMark = { x: 0, y: 0 };

let coord = { x: 0, y: 0 };

let bothCoordZero
let bothCoordOne

let unmarkable
let coordHasOne
let coordHasZero
let overBorder

let thisUpMarkColor
let thisDownMarkColor

let thisUpMarkData
let thisDownMarkData

let patternName = ""
let patternString = ""

var wInch
var hInch
var wCM
var hCM

var topChange
var bottomChange
var leftChange
var rightChange

var newHeight
var newWidth

var showLoad = false

var color1
var color2
var color3

const txtReader = new FileReader()