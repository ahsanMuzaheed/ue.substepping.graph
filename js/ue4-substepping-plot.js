function SubstepPlot(containerID, canvasWidth, canvasHeight)
{
  this.margin = 20;
  this.minFPS = 10;
  this.maxSubsteps = 4;

  this.colorSubsteps = "#a00";
  this.colorDT       = "#0a0";

  this.formsize = 5;

  var container = document.querySelector("#" + containerID);
  var formContainer = document.createElement("div");
  container.appendChild(formContainer);

  this.canvas = document.createElement("canvas");
  this.canvas.width = canvasWidth;
  this.canvas.height = canvasHeight;
  container.appendChild(this.canvas);

  this.canvasWidth = canvasWidth;
  this.canvasHeight = canvasHeight;

  this.WriteForm(formContainer);

  this.MinFPSChanged();

  this.Update();
}

SubstepPlot.prototype.WriteForm = function(container) {
  container.innerHTML =
    "<table width='" + this.canvasWidth + "'><tr>" +
      "<td><b>Max Substeps</b></td><td><input type='text' name='maxSubsteps' id='maxSubsteps' value='" + this.maxSubsteps + "' size='" + this.formsize + "' onchange='Plot.MaxSubstepsChanged()'/></td>" +
      "<td><b>Max dt (ms)</b></td><td><input type='text' name='maxDT' id='maxDT' value='" + (1000 / this.minFPS / this.maxSubsteps) + "' size='" + this.formsize + "' onchange='Plot.MaxDTChanged()'/></td>" +      
      "<td align='right'><b>Scale (fps)</b> " +
      "<input type='radio' name='graphScale' value='30' checked onchange='Plot.Update()'> 30 "+
      "<input type='radio' name='graphScale' value='60' checked onchange='Plot.Update()'> 60 "+
      "<input type='radio' name='graphScale' value='120' onchange='Plot.Update()'> 120" +
      "</td>" + 
      "</tr><tr>" +      
      "<td><b>Limit FPS</b></td><td><input type='text' name='minFPS' id='minFPS' value='" + this.minFPS + "' size='" + this.formsize + "' onchange='Plot.MinFPSChanged()'/></td>" +      
      "<td><b>Target FPS</b></td><td><input type='text' name='maxFPS' id='maxFPS' value='" + this.minFPS + "' size='" + this.formsize + "' onchange='Plot.MaxFPSChanged()'/></td>" +
      "<td width='40%' align='right'><input type='checkbox' checked id='enableSubsteps' onchange='Plot.CheckboxesChanged()'> <span style='border-bottom: 4px solid " + this.colorSubsteps + "'>N Substeps</span> &nbsp;" + 
      "<input type='checkbox' checked='checked' id='enableDT' onchange='Plot.CheckboxesChanged()'> <span style='border-bottom: 4px solid " + this.colorDT + "'>Substep DeltaTime</span></td>" +
      "</tr>" +      
    "</table>";
}

SubstepPlot.prototype.checkRanges = function() {
  var minFPS = document.querySelector("#minFPS");
  var maxFPS = document.querySelector("#maxFPS");
  var maxDT = document.querySelector("#maxDT");
  var maxSubsteps = document.querySelector("#maxSubsteps");

  var changed = false;

  if(minFPS.value < 3)  { minFPS.value = 3;  changed = true; }
  if(minFPS.value > 60) { minFPS.value = 60; changed = true; }

  if(maxSubsteps.value > 16) { maxSubsteps.value = 16; changed = true; }
  if(maxSubsteps.value < 2)  { maxSubsteps.value = 2;  changed = true; }

  if(changed) {
    maxDT.value  = 1000 / minFPS.value / maxSubsteps.value;
    maxFPS.value = minFPS.value * maxSubsteps.value;
  }
}

SubstepPlot.prototype.MinFPSChanged = function() {
  var minFPS = document.querySelector("#minFPS");
  var maxFPS = document.querySelector("#maxFPS");
  var maxDT = document.querySelector("#maxDT");
  var maxSubsteps = document.querySelector("#maxSubsteps");

  maxDT.value = 1000 / minFPS.value / maxSubsteps.value;
  maxFPS.value = minFPS.value * maxSubsteps.value;

  this.Update();
}

SubstepPlot.prototype.MaxFPSChanged = function() {
  var minFPS = document.querySelector("#minFPS");
  var maxFPS = document.querySelector("#maxFPS");
  var maxDT = document.querySelector("#maxDT");
  var maxSubsteps = document.querySelector("#maxSubsteps");

  maxDT.value = 1000 / maxFPS.value;
  minFPS.value = maxFPS.value / maxSubsteps.value;

  this.Update();
}

SubstepPlot.prototype.MaxDTChanged = function() {
  var minFPS = document.querySelector("#minFPS");
  var maxFPS = document.querySelector("#maxFPS");
  var maxDT = document.querySelector("#maxDT");
  var maxSubsteps = document.querySelector("#maxSubsteps");

  minFPS.value = 1000 / maxDT.value / maxSubsteps.value;
  maxFPS.value = 1000 / maxDT.value;

  this.Update();
}

SubstepPlot.prototype.MaxSubstepsChanged = function() {
  this.MaxDTChanged();
}

SubstepPlot.prototype.CheckboxesChanged = function() {
  var enableSubsteps = document.querySelector("#enableSubsteps");
  var enableDT = document.querySelector("#enableDT");

  if(!enableSubsteps.checked && !enableDT.checked)
    enableSubsteps.checked = true;

  this.Update();
}

SubstepPlot.prototype.Update = function() {
  this.checkRanges();
  this.DrawPlot();
}

SubstepPlot.prototype.DrawFunctionPlot = function(cx, ox, oy, w, h, steps, maxValue, func, color, strokeSize) {
  cx.strokeStyle = color;
  cx.lineWidth = strokeSize;

  cx.beginPath();

  for(i=0; i<w; i++) {
  	var x0 = ox + i;
  	var x1 = ox + (i + 1);
  	cx.moveTo(x0, oy - func(i / w * steps) * h / maxValue);
  	cx.lineTo(x1, oy - func((i+1) / w * steps) * h / maxValue);
  }

  cx.closePath();
  cx.stroke();
}

SubstepPlot.prototype.DrawPlot = function() {
  var minFPS = document.querySelector("#minFPS").value;
  var maxFPS = document.querySelector("#maxFPS").value;
  var maxDT  = document.querySelector("#maxDT").value;
  var maxSubsteps = document.querySelector("#maxSubsteps").value;
  var graphScale = document.querySelector('input[name = "graphScale"]:checked').value;

  var cx = this.canvas.getContext("2d");
  
  var margin = this.margin;
  var xSteps = graphScale;

  var enableSubsteps = document.querySelector("#enableSubsteps");
  var enableDT = document.querySelector("#enableDT");

  // Clear plot
  cx.fillStyle = "white";
  cx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

  cx.lineWidth = 1;

  // Draw Plot Axes  
  var graphX = margin + 0.5;
  var graphY = this.canvasHeight - margin - 10 + 0.5;
  var graphW = this.canvasWidth - margin * 2;
  var graphH = this.canvasHeight - margin * 2 - 10 - 0.5;

  // Draw min,max FPS lines
  cx.strokeStyle = "#bbb";
  cx.beginPath();
  
  cx.moveTo(graphX + minFPS * graphW / xSteps, graphY);
  cx.lineTo(graphX + minFPS * graphW / xSteps, graphY - graphH);

  cx.moveTo(graphX + maxFPS * graphW / xSteps, graphY);
  cx.lineTo(graphX + maxFPS * graphW / xSteps, graphY - graphH);

  cx.closePath();
  cx.stroke();

  cx.strokeStyle = "#888";
  cx.beginPath();

  // Draw x axis
  cx.moveTo(graphX, graphY);
  if(enableDT.checked && enableSubsteps.checked)
    cx.lineTo(graphX + graphW, graphY);
  else
    cx.lineTo(graphX + graphW + margin, graphY);

  var fontSize = 10;
  cx.font = fontSize + "px Verdana";
  cx.fillStyle = "#333";

  for(i=0; i<=xSteps; i++) {
  	var x = graphX + i * graphW / xSteps;
  	cx.moveTo(x, graphY);
  	cx.lineTo(x, graphY + (i%5 == 0 ? 10 : 5));
  	if(i%5 == 0) {
  		cx.fillText("" + i, x - cx.measureText("" + i).width * 0.5, graphY + 10 + fontSize);
  	}
  }

  if(enableDT.checked && enableSubsteps.checked)
    cx.fillText("FPS", graphX + graphW - cx.measureText("FPS").width - 5, graphY - fontSize * 0.5);
  else
    cx.fillText("FPS", graphX + graphW - cx.measureText("FPS").width - 5 + margin, graphY - fontSize * 0.5);

  // Draw substeps y axis
  cx.moveTo(graphX, graphY - graphH - margin);
  cx.lineTo(graphX, graphY);

  cx.closePath();
  cx.stroke();

  if(enableSubsteps.checked) {
    fontSize = 10;
    cx.font = fontSize + "px Verdana";
    cx.fillStyle = "#333";

    for(i=0; i<=maxSubsteps; i++) {
    	var y = graphY - i * graphH / maxSubsteps;
    	cx.moveTo(graphX - 5, y);
    	cx.lineTo(graphX, y);

      cx.moveTo(graphX, y);
      cx.lineTo(graphX + graphW, y);

    	cx.fillText("" + i, graphX - cx.measureText("" + i).width - 8, y + fontSize * 0.3);
    }

    cx.fillText("N Substeps", graphX + 5, graphY - graphH + fontSize - margin);
  }

  cx.closePath();
  cx.stroke();

  // Draw dt y axis
  if(enableDT.checked) {
    var dtx = graphX;
    var dtside = 1;

    cx.beginPath();  

    if(enableSubsteps.checked) {
      dtx = graphX + graphW;
      dtside = -1;

      cx.moveTo(dtx, graphY - graphH - margin);
      cx.lineTo(dtx, graphY);
    }

    fontSize = 10;
    cx.font = fontSize + "px Verdana";
    cx.fillStyle = "#333";

    var step = Math.ceil(maxDT / 10.0);

    for(i=0; i<=maxDT; i+= step) {
      var y = graphY - i * graphH / maxDT;

      cx.moveTo(dtx - 5 * dtside, y);
      cx.lineTo(dtx, y);

      if(!enableSubsteps.checked && enableDT.checked) {
        cx.moveTo(graphX, y);
        cx.lineTo(graphX + graphW, y);
      }

      if(dtside == 1)
        cx.fillText("" + i, dtx - cx.measureText("" + i).width - 8, y + fontSize * 0.3);
      else
        cx.fillText("" + i, dtx + 6, y + fontSize * 0.3);
    } 

    cx.closePath();
    cx.stroke();

    var substepLabel = "Substep DeltaTime (ms)";
    if(!enableSubsteps.checked)
      cx.fillText(substepLabel, graphX + 5, graphY - graphH + fontSize - margin);
    else
      cx.fillText(substepLabel, graphX + graphW - cx.measureText(substepLabel).width - 5, graphY - graphH + fontSize - margin);
  }

  // Drawing Plots
  var substepContinous = function(fps) {
    if(fps < minFPS) return maxSubsteps;
    else return maxSubsteps * minFPS / fps;
  }

  var substepQuantized = function(fps) {
    return Math.ceil(substepContinous(fps));
  }

  var substepDeltatime = function(fps) {
    if(fps < minFPS) return 1 / minFPS / maxSubsteps;
    else return 1 / fps / substepQuantized(fps);
  }

  // Draw deltatime
  if(enableDT.checked)
    this.DrawFunctionPlot(cx, graphX, graphY, graphW, graphH, xSteps, 1 / maxSubsteps / minFPS, substepDeltatime, this.colorDT, 2);

  // Draw substeps continous
  //this.DrawFunctionPlot(cx, graphX, graphY, graphW, graphH, xSteps, maxSubsteps, substepContinous, "#0a0", 2);

  // Draw substeps quantized
  if(enableSubsteps.checked)
    this.DrawFunctionPlot(cx, graphX, graphY, graphW, graphH, xSteps, maxSubsteps, substepQuantized, this.colorSubsteps, 2);
}