const prepareZigZag = (startX, startY, endX, endY) => {
    const c =10;
    const d = 10;
    const length = Math.sqrt((endX-startX)**2+(endY-startY)**2)
    const points = []
    for (let x=startX; x<length;x++) {
        let a = calcA(x, c, d)
        let b = calcB(x, c, d)
        let point = [x, calcY(x,a,b,c, d)]
        points.push(point)
        ctx.beginPath()
        ctx.moveTo(startX,startY)
        ctx.lineTo(...point)
        ctx.stroke()
    }
}

const calcB = (x, c, d) => {
    return -c * Math.floor(d*x) % 2
}
const calcA = (x, c, d) => {
    return c*(-1 + 2 * Math.floor(d*x) % 2)
}
const calcY = (x, a, b, c, d) => {
    return (d*x - Math.floor(d*x))*a + b + c/2
}

const drawNormalPath = (startX, startY, endX, endY, weight) => {
    const dx = endX-startX
    const dy = endY-startY
    const path = `m ${startX} ${startY} l ${dx} ${dy}`
    const pathObject = new Path2D(path)
    ctx.save()
    ctx.stroke(pathObject);

}
const drawZigZagPath = (startX , startY , endX, endY, weight) => {
    const dx = endX-startX
    const dy = endY-startY
    const length = Math.sqrt((dx)**2+(dy)**2)
    const angle = Math.atan(dy/dx)
    const howManyZigZags = length/(weight*2)
    const oneZigZag = ` l ${weight} ${weight} l ${weight} ${-weight} `
    let path = `m ${startX} ${startY}`
    for (let i=0; i<howManyZigZags;i++) {
        path += oneZigZag
    }
    const pathObject = new Path2D(path);
    // ctx.moveTo(100, 100)
    // ctx.lineTo(300, 100)
    ctx.save()
    ctx.rotate(angle)
    ctx.stroke(pathObject)
    ctx.restore()
    // ctx.moveTo(200, 200)
    // ctx.lineTo(300, 200)
    ctx.stroke()
}

const drawArrowPath = (startX, startY, endX, endY, weight) => {
    const dx = endX-startX
    const dy = endY-startY
    const length = Math.sqrt((dx)**2+(dy)**2)
    const angle = Math.atan(dy/dx)
    let path = `m ${startX} ${startY} l ${length} 0`
    const arrow =  ` l 0 ${weight} ${weight} ${-weight} ${-weight} ${-weight} 0 ${weight}`
    path += arrow
    const pathObject = new Path2D(path);
    ctx.fill(pathObject)
    ctx.save()
    // ctx.rotate()
    ctx.stroke(pathObject)
}

const drawDashedPath = (startX, startY, endX, endY, weight) => {
    const dx = endX - startX
    const dy = endY - startY
    const length = Math.sqrt((dx) ** 2 + (dy) ** 2)
    const angle = Math.atan(dy / dx)
    let path = `m ${startX} ${startY} `
    const oneDash = ` l ${weight} 0 m ${weight} 0 `
    const howManyDashes = length/(weight*2)
    for (let i=0 ;i<howManyDashes;i++) {
        path+=oneDash
    }
    const pathObject = new Path2D(path);
    ctx.save()

    // ctx.rotate()
    ctx.stroke(pathObject)
}

const drawLadderLine = (startX, startY, endX, endY, weight) => {
     const dx = endX - startX
    const dy = endY - startY
    const length = Math.sqrt((dx) ** 2 + (dy) ** 2)
    const angle = Math.atan(dy / dx)
    let path = `m ${startX} ${startY} m 0 ${-weight/2} `
    const oneLadder = ` v ${weight} h ${weight} v ${-weight} h ${-weight} m ${weight} 0 `
    const howManyLadders = length/(weight)
    for (let i=0 ;i<howManyLadders;i++) {
        path+=oneLadder
    }
    const pathObject = new Path2D(path);
    ctx.save()

    // ctx.rotate()
    ctx.stroke(pathObject)
}
let coords = []
//
// import * as iconsvg1 from '../img/icon1.svg'
// import * as iconsvg2 from '../img/icon2.svg'
// import * as iconsvg3 from '../img/icon3.svg'
const types = ['normal', 'dashed', 'zigzag', 'arrow', 'ladder']

// const icons = [iconsvg1, iconsvg2, iconsvg3]
const icons = ['icon1', 'icon2', 'icon3']

let lineType = 'normal'
let iconType = 'icon1'


import * as L from './Leaflet';
	var renderer = new L.Canvas;
	var map = L.map('map', {
		crs: L.CRS.Simple,
        preferCanvas: false,
        tap: false,
        dragging: true,
        center: [500,500],
        zoom: 1,
        renderer: renderer
    });

document.addEventListener('DOMContentLoaded', () => {
        for (let type of types) {
            document.getElementById(type).addEventListener('click', () => {
                lineType = type;
                map.off('click');
                map.on('click', (e) => {
                    if (coords.length === 0) {
                        coords.push(e.latlng)
                    } else if (coords.length === 1) {
                        if (lineType !== 'dashed')
                            L.polyline([[coords[0].lat, coords[0].lng], [e.latlng.lat, e.latlng.lng]], {
                                color: 'black',
                                lineType: lineType,
                                noClip: true
                            }).addTo(map);
                        else {
                            L.polyline([[coords[0].lat, coords[0].lng], [e.latlng.lat, e.latlng.lng]], {
                                color: 'black',
                                dashArray: [5, 5],
                                noClip: true
                            }).addTo(map);

                        }
                          coords = []
                    }
                })
            })
        }
        for (let icon of icons) {

            document.getElementById(icon).addEventListener('click', (e) => {
                var iconUrl = `../${icon}.svg`;
                map.off('click')
                map.on('click', (e) => {
                    const iconL = L.Icon.extend({options: {iconUrl: iconUrl, iconRetinaUrl: iconUrl, iconSize: [30,30]}});
                    L.marker([e.latlng.lat, e.latlng.lng], {icon: new iconL}).addTo(map);
                })
            })
        }
    })



    var bounds = [[0,0], [1000,1000]];

	L.imageOverlay('https://image.shutterstock.com/image-photo/little-grey-kitten-walking-yard-260nw-288913778.jpg', bounds).addTo(map)

    // L.polyline([[100,100],[400,600]], {color: 'red', lineType: 'ladder' , noClip: true}).addTo(map);


    L.polyline([[500,500],[588,580],[400,900], [300,300]], {color: 'black', lineType: 'ladder', weight: 4}).addTo(map);




// var marker = L.marker([500, 500]).addTo(map);
