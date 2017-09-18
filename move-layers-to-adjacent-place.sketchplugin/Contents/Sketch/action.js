var pluginId = "com.onthehead.move-layers-adjacent-place"; // Plugin ID
var pluginName = "Move Layers to Adjacent Place Setting"; // Plugin Name
var posiXTextField, posiYTextField, eachRadioButton;
var NUD = NSUserDefaults.alloc().initWithSuiteName(pluginId);
var prefPosiX = "posiXKey";
var prefPosiY = "posiYKey";
var prefEach = "eachKey";
var addValues = {}
	addValues.x = getTextValue(NUD, prefPosiX, "0");
	addValues.y = getTextValue(NUD, prefPosiY, "0");
var eachValue   = getTextValue(NUD, prefEach, "0");

function moveTop(context){
	moveLayers(context, "t", false);
}

function moveRight(context){
	moveLayers(context, "r", false);
}

function moveBottom(context){
	moveLayers(context, "b", false);
}

function moveLeft(context){
	moveLayers(context, "l", false);
}

function duplicateTop(context){
	moveLayers(context, "t", true);
}

function duplicateRight(context){
	moveLayers(context, "r", true);
}

function duplicateBottom(context){
	moveLayers(context, "b", true);
}

function duplicateLeft(context){
	moveLayers(context, "l", true);
}

function moveLayers(context, drc, dup){
	var doc = context.document;
	var sels = context.selection;
	var selDists;
	if (dup === true){
		if (eachValue == 1){
			selDists = false;
		} else {
			selDists = getDefBounds(sels);
		}
		for (var i = 0; i < sels.count(); i++){
			var tar = sels[i].duplicate();
			doMove(tar, addValues, drc, selDists);
			sels[i].select_byExpandingSelection(false, true);
			tar.select_byExpandingSelection(true, true);
		}
	} else {
		if (eachValue == 1){
			selDists = false;
		} else {
			selDists = getDefBounds(sels);
		}
		for (var i = 0; i < sels.count(); i++){
			doMove(sels[i], addValues, drc, selDists);
		}
	}
}

function doMove(tar, addValues, drc, selDists){
	var tX, tY, sX, sY;
	if (selDists == false){
		tX = tar.frame().width();
		tY = tar.frame().height();
		sX = 0;
		sY = 0;
	} else {
		tX = 0;
		tY = 0;
		sX = selDists.x;
		sY = selDists.y;
	}
	if (drc === "r"){
		tar.frame().left = tar.frame().left() + tX + sX + Number(addValues.x);
	} else if (drc === "l"){
		tar.frame().left = tar.frame().left() + (tX + sX + Number(addValues.x)) * -1;
	} else if (drc === "b"){
		tar.frame().top = tar.frame().top() + tY + sY + Number(addValues.y);
	} else if (drc === "t"){
		tar.frame().top = tar.frame().top() + (tY + sY + Number(addValues.y)) * -1;
	}
}


function setting(context){
	var res = addDialog(context).runModal();
	if (res === 1000){
		var posXlInput = posiXTextField.stringValue();
		NUD.setObject_forKey(changeFullToHalf(posXlInput), prefPosiX);
		var posYlInput = posiYTextField.stringValue();
		NUD.setObject_forKey(changeFullToHalf(posYlInput), prefPosiY);
		//context.document.showMessage("a");
		var eachInput = eachRadioButton.cells().indexOfObject(eachRadioButton.selectedCell());
		//context.document.showMessage(eachInput);
		NUD.setObject_forKey(eachInput, prefEach);
		
		NUD.synchronize(); // save
		
		return true;
	} else {
		return false;
	}
}

function addDialog(context){ //Add Dialog
	var mainViewW = 300; // Main View Width
	var mainViewH = 110; // Main View Height
	var dialog = COSAlertWindow.new();
	dialog.setMessageText(pluginName);

	// Add Main View
	var mainView = NSView.alloc().initWithFrame(NSMakeRect(0, 0, mainViewW, mainViewH));
	dialog.addAccessoryView(mainView);
	
	// Add Info
	var infoLabel = addStactText([17, 85, 300, 20], "Input and Save Additional Value.", 0);
	mainView.addSubview(infoLabel);
	
	// Add RadioButton
	var setEachRadioButton = NSButtonCell.alloc().init();
	setEachRadioButton.setButtonType(NSRadioButton);
	eachRadioButton = addRadioButton(setEachRadioButton, [20, 35, 300, 40], ["All", "Each"], [100, 25], eachValue);
	
	mainView.addSubview(eachRadioButton);
	// Add labels
	var posXLabel = addStactText([0, 20, 60, 20], "Add X: ", 1);
	var posYLabel = addStactText([155, 20, 60, 20], "Add Y: ", 1);
	
	mainView.addSubview(posXLabel);
	mainView.addSubview(posYLabel);

	// Add TextFields
	posiXTextField = NSTextField.alloc().initWithFrame(NSMakeRect(65, 20, 95, 24));
	posiXTextField.setStringValue(addValues.x);
	posiYTextField = NSTextField.alloc().initWithFrame(NSMakeRect(220, 20, 95, 24));
	posiYTextField.setStringValue(addValues.y);

	// Tab Focus
	posiXTextField.setNextKeyView(posiYTextField);
	posiYTextField.setNextKeyView(posiXTextField);
	dialog.alert().window().setInitialFirstResponder(posiXTextField);

	mainView.addSubview(posiXTextField);
	mainView.addSubview(posiYTextField);
	
	
	// Add Buttons
	dialog.addButtonWithTitle("Save");
	dialog.addButtonWithTitle("Cancel");

	return dialog;
}

function getTextValue(NUD, keyName, def){ //Get pluginId Value
	var val = NUD.objectForKey(keyName);
	if (val != undefined){
		return val.toString();
	} else {
		return def;
	}
}

function changeFullToHalf(s){
	var str = s.replace(/[！-～]/g, function (tmpStr){
		return String.fromCharCode(tmpStr.charCodeAt(0) - 0xFEE0);
	});
  return str;
}

function addStactText(rect, text, align){ //Add Statc Text
	var tar = NSTextField.alloc().initWithFrame(NSMakeRect(rect[0], rect[1], rect[2], rect[3]));
	tar.setStringValue(text);
	tar.setSelectable(true);
	tar.setEditable(false);
	tar.setBezeled(false);
	tar.setDrawsBackground(false);
	tar.setAlignment(align);
	return tar;
}

function addRadioButton(tar, rect, arr, size, sel){
	var matrix = NSMatrix.alloc().initWithFrame_mode_prototype_numberOfRows_numberOfColumns(NSMakeRect(rect[0], rect[1], rect[2], rect[3]), NSRadioModeMatrix, tar, 1, arr.length);
	var radioButtons = matrix.cells();
	for (var i = 0; i < arr.length; i++){
		radioButtons.objectAtIndex(i).setTitle(arr[i]);
	}
	matrix.selectCellAtRow_column(0, sel);
	return matrix;
}

function getDefBounds(arr){
	var arrX = [];
	var arrY = [];
	var arrW = [];
	var arrH = [];
	for (var i = 0; i < arr.count(); i++) {
		var x = arr[i].frame().left();
		var w = x + arr[i].frame().width();
		var y = arr[i].frame().top();
		var h = y + arr[i].frame().height();
		arrX.push(x);
		arrW.push(w);
		arrY.push(y);
		arrH.push(h);
	}
	
	var numX = Math.min.apply(null, arrX);
	var numW = Math.max.apply(null, arrW);
	var numY = Math.min.apply(null, arrY);
	var numH = Math.max.apply(null, arrH);
	var obj = {}
		obj.x = numW - numX;
		obj.y = numH - numY;
	return obj;
}