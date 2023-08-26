const svg = document.getElementById('mySvg');
let panStartCoords = { x: 0, y: 0 };
let isPanning=false;
let viewBox = svg.getAttribute('viewBox').split(' ').map(Number);
let isOverRect = false;
const miniMap = document.getElementById('miniMap');
const viewBoxRect = document.getElementById('viewBoxRect');


 
function pan(svg){
svg.addEventListener('mousedown', startPan);
svg.addEventListener('mousemove', doPan); 
svg.addEventListener('mouseup', endPan);
svg.addEventListener('mouseleave', endPan);

function startPan(event) {
    if (event.button === 0 && !isOverRect ) {
        
        isPanning = true;
        panStartCoords = { x: event.clientX, y: event.clientY };
        svg.style.cursor = 'grabbing';
    }else {
        event.stopPropagation(); 
    }
}

function doPan(event) {
    console.log(isPanning,'r')
    if (isPanning) {
      
        const dx = event.clientX - panStartCoords.x;
        const dy = event.clientY - panStartCoords.y;
        panStartCoords = { x: event.clientX, y: event.clientY };
        viewBox[0] -= dx;
        viewBox[1] -= dy;
        svg.setAttribute('viewBox', viewBox.join(' '));
    }
}

function endPan(event) {
    if (isPanning) {
        isPanning = false;
        svg.style.cursor = 'grab';
    }
}
}

    pan(svg)




svg.addEventListener('wheel', zoom);

function zoom(event) {
    event.preventDefault();
    const zoomFactor = event.deltaY > 0 ? 1.2 : 1 / 1.2;
    const zoomCenter = { x: event.clientX, y: event.clientY };
    const oldViewBox = viewBox.slice();
    viewBox[2] /= zoomFactor;
    viewBox[3] /= zoomFactor;

    const zoomedWidth = oldViewBox[2] - viewBox[2];
    const zoomedHeight = oldViewBox[3] - viewBox[3];

    viewBox[0] += (zoomCenter.x - viewBox[0]) * (1 - zoomFactor) / viewBox[2];
    viewBox[1] += (zoomCenter.y - viewBox[1]) * (1 - zoomFactor) / viewBox[3];

    svg.setAttribute('viewBox', viewBox.join(' '));
}



function makeDraggable(svgElement) {
    let selectedElement = null;
    let offset;

    svgElement.addEventListener('mousedown', startDrag);
    svgElement.addEventListener('mousemove', drag);
    svgElement.addEventListener('mouseup', endDrag);
    svgElement.addEventListener('mouseover', function(event) {
        if (event.target.classList.contains('draggable')) {
            isOverRect = true;
        }
    });

    svgElement.addEventListener('mouseout', function(event) {
        if (event.target.classList.contains('draggable')) {
            isOverRect = false;
        }
    });
    svgElement.addEventListener('mousedown', function(event) {
        if (event.target.classList.contains('draggable')) {
            event.stopPropagation(); 
        }
    });


    function startDrag(event) {
        if (event.target.classList.contains('draggable')) {
            
            selectedElement = event.target;
            offset = getMousePosition(event);
            offset.x -= parseFloat(selectedElement.getAttributeNS(null, 'x'));
            offset.y -= parseFloat(selectedElement.getAttributeNS(null, 'y'));
            svgElement.style.cursor='pointer'
        }
    }

    function drag(event) {
        if (selectedElement) {
            event.preventDefault();
            let coord = getMousePosition(event);
            selectedElement.setAttributeNS(null, 'x', coord.x - offset.x);
            selectedElement.setAttributeNS(null, 'y', coord.y - offset.y);
        }
    }

    function endDrag() {
        selectedElement = null;
    }

    function getMousePosition(event) {
        const CTM = svgElement.getScreenCTM();
        return {
            x: (event.clientX - CTM.e) / CTM.a,
            y: (event.clientY - CTM.f) / CTM.d
        };
    }
}



svg.addEventListener('contextmenu', function(event) {
    event.preventDefault();
    
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.classList.add('draggable'); 
    rect.setAttribute('x', '30');
    rect.setAttribute('y', '30');
    rect.setAttribute('width', '80');
    rect.setAttribute('height', '80');
    rect.setAttribute('fill', 'blue');
    
    const miniMapRect = rect.cloneNode(true);
    miniMapRect.classList.add('minimap-rect');
    miniMap.appendChild(miniMapRect);
    

    svg.appendChild(rect);
    makeDraggable(rect);
    
});

function updateMiniMapRects() {
    const scale = miniMap.viewBox.baseVal.width / svg.viewBox.baseVal.width;

    const mainRects = svg.querySelectorAll('.draggable');
    const miniMapRects = miniMap.querySelectorAll('.minimap-rect');

    mainRects.forEach((mainRect, index) => {
        const rectX = parseFloat(mainRect.getAttributeNS(null, 'x')) * scale;
        const rectY = parseFloat(mainRect.getAttributeNS(null, 'y')) * scale;
        const rectWidth = parseFloat(mainRect.getAttributeNS(null, 'width')) * scale;
        const rectHeight = parseFloat(mainRect.getAttributeNS(null, 'height')) * scale;

        const miniMapRect = miniMapRects[index];
        miniMapRect.setAttribute('x', rectX);
        miniMapRect.setAttribute('y', rectY);
        miniMapRect.setAttribute('width', rectWidth);
        miniMapRect.setAttribute('height', rectHeight);
    });
}



updateMiniMapRects();

function updateMiniMap() {
    const svgWidth = svg.viewBox.baseVal.width;
    const svgHeight = svg.viewBox.baseVal.height; 
    miniMap.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
    updateViewBoxRect();
}
function updateViewBoxRect() {
    const scale = miniMap.viewBox.baseVal.width / svg.viewBox.baseVal.width;
    
    const rectX = -viewBox[0] * scale;
    const rectY = -viewBox[1] * scale;
    const rectWidth = svg.getAttribute('width') * scale;
    const rectHeight = svg.getAttribute('height') * scale;
    
    viewBoxRect.setAttribute('x', rectX);
    viewBoxRect.setAttribute('y', rectY);
    viewBoxRect.setAttribute('width', rectWidth);
    viewBoxRect.setAttribute('height', rectHeight);

    updateMiniMapRects();
}

function updateMiniMapOnPanZoom() {
    updateViewBoxRect();
    updateMiniMapRects();
    updateMinimapViewBox()
}

svg.addEventListener('mousemove', updateMiniMapOnPanZoom);
svg.addEventListener('wheel', updateMiniMapOnPanZoom);

function updateMinimapViewBox() {
    const scale = miniMap.viewBox.baseVal.width / svg.viewBox.baseVal.width;
    
    const mainSvgX = viewBox[0] * scale;
    const mainSvgY = viewBox[1] * scale;
    const mainSvgWidth = svg.viewBox.baseVal.width * scale;
    const mainSvgHeight = svg.viewBox.baseVal.height * scale;

    miniMap.setAttribute('viewBox', `${mainSvgX} ${mainSvgY} ${mainSvgWidth} ${mainSvgHeight}`);
}


















































``
updateMiniMap();