class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

export class Line {
    constructor(fromPoint = null, toPoint = null, zigZagged = false) {
        this.from = fromPoint;
        this.to = toPoint;
        this.dashed = false;
        this.zigZagged = zigZagged;

        this.prepareZigZag();
    }

    setFrom(point) { this.from = point;}

    setTo(point) { this.to = toPoint;}

    getFrom() { return this.from; }

    getTo() { return this.to}

    prepareZigZag() {
        // Get the radian angle of the line
        this.lineRadians = Math.atan2(this.to.y - this.from.y, this.to.x - this.from.x);

        // Get the length of the line
        const a = this.from.x - this.to.x;
        const b = this.from.y - this.to.y;
        this.lineLength = Math.sqrt( a * a + b * b );

        // 10 pixels between each zig zag "wave"
        this.zigzagSpacing = 10;

        // Length of one zig zag line - will in reality be doubled see below usage
        this.oneZigZagLength = 10;

        //Length of the last straight bit - so we do not zig zag all the line
        this.straightLengthWhenZigZag = 30

        // The length of the zig zag lines
        this.zigZagLength = this.lineLength - this.straightLengthWhenZigZag;
    }


    draw(ctx, color = '#000', lineWidth = 2.0) {
        // if (this.dashed) {
        //     ctx.setLineDash([4, 2]);
        // } else {
        //     ctx.setLineDash([]);
        // }

        if (this.zigZagged) {
            this.drawZigZagged(ctx);
        } else {
            ctx.beginPath();
            ctx.moveTo(this.from.x, this.from.y);
            ctx.lineTo(this.to.x, this.to.y);
        }
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = color;
        ctx.stroke();

    }

    drawZigZagged(ctx) {
        // Save the current drawing state
        ctx.save();

        // Begin the new path
        ctx.beginPath();

        //Set the new 0, 0
        ctx.translate(this.from.x, this.from.y);

        // Rotate the canvas so we can treat it like straight
        ctx.rotate(this.lineRadians);

        // Begin from 0, 0 (ie this.from.x, this.from.y)
        ctx.moveTo(0,0);
        let zx = 0;
        // Create zig zag lines
        for (let n = 0; zx < this.zigZagLength; n++) {
            // The new zig zag x position
            zx = ((n + 1) * this.zigzagSpacing);

            // The new zig zag y position - each and other time up and down
            const  zy = (n % 2 == 0) ? -this.oneZigZagLength : this.oneZigZagLength;

            // Draw the an actual line of the zig zag line
            ctx.lineTo(zx, zy);
        }
        // Back to the center vertically
        ctx.lineTo(this.lineLength - (this.straightLengthWhenZigZag / 2), 0);

        // Draw the last bit straight
        ctx.lineTo(this.lineLength, 0);

        // Restore the previous drawing state
        ctx.restore();
    }

    setDashed(enable) {
        this.dashed = enable;
    }

    setZigZagged(enable){
        this.zigZagged = enable
    }
}


