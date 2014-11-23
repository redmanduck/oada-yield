/**
 * Represents a generic control button.
 * @constructor
 * @param {string} text - button text
 * @param {function} action - callback function
 * @param {div} controlDiv - div to be filled
 * @param {googlemap} map - map object
 */

var UIManager = {
  control_count : 0
}
function Control(text, action, controlDiv, map) {
  controlDiv.style.padding = '5px';

  // Set CSS for the control border
  var controlUI = document.createElement('div');
  controlUI.style.backgroundColor = 'white';
  controlUI.style.borderStyle = 'solid';
  controlUI.style.borderWidth = '1px';
  controlUI.style.paddingTop = '2px';
  controlUI.style.cursor = 'pointer';
  controlUI.style.textAlign = 'center';
  controlUI.title = 'OADA provider..';
  controlDiv.appendChild(controlUI);

  var id = "control_" + ++UIManager.control_count;
  // Set CSS for the control interior
  var controlText = document.createElement('div');
  controlText.style.fontFamily = 'sans-serif';
  controlText.style.fontSize = '11px';
  controlText.style.paddingLeft = '4px';
  controlText.style.paddingRight = '4px';
  controlText.innerHTML = "<span id='" + id + "'>" +  text + "</span>";
  controlUI.appendChild(controlText);


  google.maps.event.addDomListener(controlUI, 'click', function() {
    action()
  });

}
